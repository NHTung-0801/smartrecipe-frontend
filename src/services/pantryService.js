import api from './api';

export const pantryService = {
  getPantry: async (filter = 'ALL') => {
    const response = await api.get('/pantry', { params: { filter } });
    return response.data;
  },

  addItem: async (data) => {
    const response = await api.post('/pantry', data);
    return response.data;
  },

  updateItem: async (id, data) => {
    const response = await api.put(`/pantry/${id}`, data);
    return response.data;
  },

  removeItem: async (id) => {
    const response = await api.delete(`/pantry/${id}`);
    return response.data;
  },

  getExpiringSoon: async (days = 7) => {
    const response = await api.get('/pantry/expiring-soon', { params: { days } });
    return response.data;
  },

  deleteAllExpired: async () => {
    const response = await api.delete('/pantry/expired');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/pantry/summary');
    return response.data;
  },
};