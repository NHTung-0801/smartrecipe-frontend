import api from './api';

export const recipeService = {
  // ==================== CRUD ====================

  create: async (data) => {
    const response = await api.post('/recipes', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  changeStatus: async (id, status) => {
    const response = await api.patch(`/recipes/${id}/status?status=${status}`);
    return response.data;
  },

  exportToWord: async (id) => {
    const response = await api.get(`/recipes/${id}/export/word`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== LISTING & SEARCH ====================

  getMyRecipes: async (page = 0, size = 10) => {
    const response = await api.get(`/recipes/my?page=${page}&size=${size}`);
    return response.data;
  },

  getPublicRecipes: async (page = 0, size = 10) => {
    const response = await api.get(`/recipes/public?page=${page}&size=${size}`);
    return response.data;
  },

  search: async (keyword, page = 0, size = 10) => {
    const response = await api.get(
      `/recipes/search?keyword=${encodeURIComponent(keyword || '')}&page=${page}&size=${size}`
    );
    return response.data;
  },

  getUserPublicRecipes: async (userId, page = 0, size = 10) => {
    const response = await api.get(`/recipes/user/${userId}?page=${page}&size=${size}`);
    return response.data;
  },

  // ==================== CLONE ====================

  clone: async (id) => {
    const response = await api.post(`/recipes/${id}/clone`);
    return response.data;
  },

  // ==================== LIKE / UNLIKE ====================

  like: async (id) => {
    const response = await api.post(`/recipes/${id}/like`);
    return response.data;
  },

  unlike: async (id) => {
    const response = await api.delete(`/recipes/${id}/like`);
    return response.data;
  },

  // ==================== UPLOAD IMAGE ====================

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/recipes/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
