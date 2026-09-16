import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, accessToken, refreshToken) => {
        // Token được lưu qua Zustand persist → localStorage key "auth-storage"
        // Đồng thời lưu riêng để api.js interceptor đọc được trực tiếp
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (userData) => {
        // Merge thay vì replace — bảo toàn các trường hiện có (đặc biệt là role) nếu API không trả về
        set((state) => {
          const current = state.user || {};
          const merged = { ...current, ...userData };
          // Bảo vệ role: nếu dữ liệu mới không có role nhưng store đã có, giữ nguyên role cũ
          if (!merged.role && current.role) {
            merged.role = current.role;
          }
          // Dự phòng cho tài khoản quản trị viên mặc định admin123
          if ((merged.username === 'admin123' || current.username === 'admin123') && !merged.role) {
            merged.role = 'ADMIN';
          }
          return { user: merged };
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist user & isAuthenticated, không persist token (đã lưu riêng)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
