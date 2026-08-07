import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import s from './ConfirmModal.module.css';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', isDestructive = true, isLoading = false }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (e) => e.key === 'Escape' && !isLoading && onCancel();
    document.addEventListener('keydown', closeOnEscape);
    // document.body.style.overflow = 'hidden'; // Don't enforce here in case it's nested in another modal
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      // document.body.style.overflow = ''; 
    };
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  return (
    <div className={s.modalOverlay} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !isLoading && onCancel()}>
      <div className={s.confirmModal} role="dialog" aria-modal="true">
        <header className={s.modalHeader}>
          <div className={`${s.iconWrap} ${isDestructive ? s.iconDestructive : s.iconPrimary}`}>
            <AlertTriangle size={24} />
          </div>
          <button type="button" className={s.closeBtn} onClick={onCancel} disabled={isLoading} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <div className={s.modalBody}>
          <h2 className={s.title}>{title}</h2>
          <p className={s.message}>{message}</p>
        </div>

        <footer className={s.modalFooter}>
          <button type="button" className={s.cancelBtn} onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`${s.confirmBtn} ${isDestructive ? s.btnDestructive : s.btnPrimary}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}
