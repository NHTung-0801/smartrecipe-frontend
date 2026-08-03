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
  },
  
  getPublicProfile: async (id) => {
    const response = await api.get(`/users/${id}/profile`);
    return response.data;
  },
  
  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },
  
  unfollowUser: async (id) => {
    const response = await api.delete(`/users/${id}/follow`);
    return response.data;
  },
  
  getFollowers: async (id, page = 0, size = 10) => {
    const response = await api.get(`/users/${id}/followers`, { params: { page, size } });
    return response.data;
  },
  
  getFollowing: async (id, page = 0, size = 10) => {
    const response = await api.get(`/users/${id}/following`, { params: { page, size } });
    return response.data;
  }
};
