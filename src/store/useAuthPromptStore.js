import { create } from 'zustand';

/**
 * Store quản lý hiển thị Modal yêu cầu đăng nhập khi khách vãng lai
 * bấm vào bất kỳ tính năng nào cần tài khoản thành viên.
 */
const useAuthPromptStore = create((set) => ({
  isOpen: false,
  featureName: '',
  redirectUrl: '/login',

  /**
   * Mở modal thông báo yêu cầu đăng nhập
   * @param {string} featureName - Tên tính năng người dùng vừa bấm (vd: 'Tủ nguyên liệu', 'Tạo công thức')
   * @param {string} redirectUrl - URL chuyển đến khi bấm Đồng ý (mặc định '/login')
   */
  openModal: (featureName = '', redirectUrl = '/login') => {
    set({
      isOpen: true,
      featureName,
      redirectUrl,
    });
  },

  /**
   * Đóng modal (khi bấm Hủy hoặc nền mờ)
   */
  closeModal: () => {
    set({
      isOpen: false,
      featureName: '',
      redirectUrl: '/login',
    });
  },
}));

export default useAuthPromptStore;
