import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  
  changePassword: async (data) => {
    const response = await api.put('/users/me/password', data);
    return response.data;
  },
  
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
