import api from './api';

export const notificationService = {
  // Lấy danh sách thông báo (mặc định 20 cái gần nhất)
  getNotifications: async (page = 0, size = 20) => {
    const response = await api.get('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data?.unreadCount ?? 0;
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
  },
};
