import api from './api';

export const journalService = {
  /** Tạo nhật ký mới + tự động trừ kho. */
  create: async (data) => {
    const response = await api.post('/journals', data);
    return response.data;
  },

  /** Lấy danh sách nhật ký, phân trang. */
  getAll: async (page = 0, size = 10) => {
    const response = await api.get('/journals', { params: { page, size } });
    return response.data;
  },

  /** Lấy chi tiết 1 nhật ký. */
  getById: async (id) => {
    const response = await api.get(`/journals/${id}`);
    return response.data;
  },

  /** Xóa nhật ký (không hoàn nguyên kho). */
  delete: async (id) => {
    const response = await api.delete(`/journals/${id}`);
    return response.data;
  },

  /** Cập nhật nhật ký. */
  update: async (id, data) => {
    const response = await api.put(`/journals/${id}`, data);
    return response.data;
  },

  /** Upload ảnh cho nhật ký. */
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/journals/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
