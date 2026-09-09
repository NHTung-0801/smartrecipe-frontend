import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, X, ArrowRight, UserPlus } from 'lucide-react';
import useAuthPromptStore from '../../store/useAuthPromptStore';

export default function AuthRequiredModal() {
  const navigate = useNavigate();
  const { isOpen, featureName, redirectUrl, closeModal } = useAuthPromptStore();

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleConfirmLogin = () => {
    closeModal();
    navigate(redirectUrl || '/login');
  };

  const handleGoRegister = () => {
    closeModal();
    navigate('/register');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay mờ kính */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-300"
        onClick={closeModal}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-md bg-[#fffaf7] rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 60px -15px rgba(61, 39, 29, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Nút đóng góc phải */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#a13923] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <Lock size={28} strokeWidth={2.2} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-[#fffaf7] flex items-center justify-center text-amber-900 shadow-sm">
              <Sparkles size={13} />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#3d271d] tracking-tight mb-2 font-[family-name:var(--sr-font-heading)]">
            Yêu cầu đăng nhập
          </h3>

          <p className="text-sm sm:text-base text-[#6b5548] leading-relaxed mb-6">
            {featureName ? (
              <>
                Tính năng <span className="font-bold text-[#a13923]">"{featureName}"</span> chỉ dành cho thành viên của Smart Recipe.
              </>
            ) : (
              'Tính năng này yêu cầu tài khoản thành viên của Smart Recipe.'
            )}
            <br />
            <span className="text-xs sm:text-sm text-gray-500 mt-1 block">
              Đăng nhập để lưu công thức yêu thích, quản lý tủ lạnh thông minh và trải nghiệm trợ lý AI nhé!
            </span>
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 active:scale-98 transition-all shadow-sm"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleConfirmLogin}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#a13923] to-[#c24b31] hover:brightness-105 active:scale-98 transition-all shadow-md shadow-orange-900/20 flex items-center justify-center gap-1.5"
            >
              Đăng nhập ngay
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Sub-action: Register link */}
          <div className="mt-5 pt-4 border-t border-[#f0e4da] w-full text-center text-xs text-gray-500">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={handleGoRegister}
              className="font-bold text-[#a13923] hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
            >
              <UserPlus size={12} />
              Đăng ký miễn phí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
