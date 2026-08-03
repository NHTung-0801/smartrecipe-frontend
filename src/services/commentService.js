import api from './api';

export const commentService = {
  // Lấy tất cả bình luận của recipe (dạng cây)
  getByRecipeId: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}/comments`);
    return response.data;
  },

  // Tạo bình luận mới (hoặc reply)
  create: async (recipeId, data) => {
    const response = await api.post(`/recipes/${recipeId}/comments`, data);
    return response.data;
  },

  // Cập nhật nội dung bình luận
  update: async (commentId, data) => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // Xóa bình luận
  delete: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};