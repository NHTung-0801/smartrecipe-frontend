import api from './api';

export const ingredientService = {
  getAll: async (page = 0, size = 20) => {
    const response = await api.get(`/ingredients?page=${page}&size=${size}`);
    return response.data;
  },
  search: async (keyword) => {
    const response = await api.get(`/ingredients/search?q=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  getByAisle: async (aisleId) => {
    const response = await api.get(`/ingredients/aisle/${aisleId}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
  },
  create: async (ingredientData) => {
    const response = await api.post('/ingredients', ingredientData);
    return response.data;
  },
  // Thêm nhanh cho user thường: chỉ gửi tên + kệ hàng.
  // Backend tự đặt baseUnit = 'g' và dinh dưỡng = 0 (chờ admin kiểm duyệt).
  // POST /ingredients (đầy đủ dinh dưỡng) giờ chỉ ADMIN gọi được.
  createQuick: async ({ name, aisleId }) => {
    const response = await api.post('/ingredients/quick', { name, aisleId });
    return response.data;
  },
  updateAisle: async (id, aisleId) => {
    const response = await api.patch(`/ingredients/${id}/aisle`, { aisleId });
    return response.data;
  },
};

export const aisleService = {
  getAll: async () => {
    const response = await api.get('/aisles');
    return response.data;
  },
};

export const tagService = {
  getAll: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
  create: async (name) => {
    const response = await api.post('/tags', { name });
    return response.data;
  },
  update: async (id, name) => {
    const response = await api.put(`/tags/${id}`, { name });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  }
};