import api from './api';

/**
 * Gói API cho Trợ lý AI — khớp với AiController (/api/v1/ai).
 *
 * Mọi hàm trả về nguyên wrapper ApiResponse ({ success, message, data, errorCode })
 * giống pantryService/recipeService, để trang còn đọc được `errorCode` khi lỗi.
 */
export const aiService = {
  /**
   * Zero-Waste: backend tự lấy nguyên liệu trong tủ, ưu tiên món sắp hết hạn.
   * Không có body — danh sách nguyên liệu do server đọc từ pantry.
   * Lỗi thường gặp: 400 BAD_REQUEST khi tủ trống, 429 khi hết lượt.
   */
  suggestFromPantry: async () => {
    const response = await api.get('/ai/suggest/pantry');
    return response.data;
  },

  /**
   * Custom Input: user tự nhập danh sách nguyên liệu dạng text.
   * Backend nhận `AiSuggestRequest { ingredients: string[] }` và ghép thành prompt,
   * nên phần tử là chuỗi tự do — không cần tồn tại trong bảng ingredients.
   */
  suggestFromInput: async (ingredients) => {
    const response = await api.post('/ai/suggest/custom', { ingredients });
    return response.data;
  },

  /**
   * Lưu gợi ý thành công thức thật. Backend đọc lại JSON trong ai_suggestion_logs
   * và tự khớp ingredientName -> ingredientId (tạo mới nếu chưa có),
   * nên frontend chỉ cần gửi logId.
   */
  saveAiRecipe: async (logId) => {
    const response = await api.post(`/ai/save/${logId}`);
    return response.data;
  },

  /** Số lượt còn lại hôm nay: { used, dailyLimit, remaining } */
  getRemaining: async () => {
    const response = await api.get('/ai/remaining');
    return response.data;
  },

  /** Lịch sử gợi ý, mới nhất trước. */
  getHistory: async () => {
    const response = await api.get('/ai/history');
    return response.data;
  },
};
