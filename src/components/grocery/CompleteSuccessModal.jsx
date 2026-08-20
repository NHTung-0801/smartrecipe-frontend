import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CompleteSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-variant/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-on-surface">Đi chợ hoàn tất!</h3>
          <p className="text-on-surface-variant text-base leading-relaxed">
            Danh sách mua sắm của bạn đã được lưu lại. Các nguyên liệu đã mua đã được tự động cập nhật số lượng vào Tủ nguyên liệu.
          </p>
        </div>

        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteSuccessModal;
