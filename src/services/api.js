import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ thử refresh khi:
    // 1. Đang có accessToken (user đã đăng nhập, không phải khách vãng lai)
    // 2. Lỗi 401/403
    // 3. Chưa retry lần nào
    // 4. Không phải endpoint login/refresh
    const hasToken = !!localStorage.getItem('accessToken');
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

    if (hasToken && isAuthError && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → session hết hạn → xóa thông tin đăng nhập
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        
        // Chỉ chuyển hướng về /login nếu đang ở các trang yêu cầu đăng nhập.
        // Nếu đang ở trang công khai (/, /features, /recipes/:id, /users/:id) thì giữ nguyên để trải nghiệm khách không bị gián đoạn.
        const path = window.location.pathname;
        const isPublicPage = path === '/' || path === '/features' || path.startsWith('/recipes/') || path.startsWith('/users/');
        if (!isPublicPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Khách vãng lai gọi public API bị 401 → reject bình thường, không redirect
    return Promise.reject(error);
  }
);


export default api;
