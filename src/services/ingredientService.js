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
  }
};