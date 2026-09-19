import { useEffect } from 'react';
import {
  AlertTriangle, Trash2, X, RefreshCw,
  ShieldCheck, UserCheck, Utensils, MessageSquare,
  Package, BookOpen
} from 'lucide-react';
import s from '../../styles/components/admin/DeleteUserModal.module.css';

export default function DeleteUserModal({
  isOpen,
  user,
  isLoading = false,
  onConfirm,
  onClose,
}) {
  // ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !user) return null;

  const displayName = user.displayName || user.username || 'Người dùng';
  const username = user.username || '';
  const initial = (displayName || username || 'U')[0].toUpperCase();
  const isAdmin = user.role === 'ADMIN';

  return (
    <div
      className={s.overlay}
      onClick={isLoading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-modal-title"
    >
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Danger Accent Line */}
        <div className={s.dangerStripe} />

        {/* Modal Header */}
        <div className={s.header}>
          <div className={s.iconWrap}>
            <Trash2 size={24} />
          </div>

          <div className={s.headerText}>
            <h3 id="delete-user-modal-title" className={s.title}>
              Xác nhận xóa tài khoản
            </h3>
            <p className={s.subtitle}>
              <AlertTriangle size={13} />
              Hành động nguy hiểm · Không thể hoàn tác
            </p>
          </div>

          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            title="Đóng hộp thoại"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={s.body}>
          {/* Target User Info Card */}
          <div className={s.userCard}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={username} className={s.avatar} />
            ) : (
              <div className={s.avatarFallback}>{initial}</div>
            )}

            <div className={s.userMeta}>
              <span className={s.displayName}>{displayName}</span>
              <div className={s.usernameRow}>
                <span className={s.username}>@{username}</span>
                <span className={s.userId}>ID: #{user.id}</span>
                <span className={`${s.roleBadge} ${isAdmin ? s.roleAdmin : s.roleUser}`}>
                  {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
                  {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>
          </div>

          {/* Cascade Consequences Explanation */}
          <div className={s.warningBox}>
            <div className={s.warningHeader}>
              <AlertTriangle size={14} />
              <span>Dữ liệu liên quan sẽ bị xóa vĩnh viễn (Cascade):</span>
            </div>

            <ul className={s.consequencesList}>
              <li className={s.consequenceItem}>
                <span className={s.bullet}>•</span>
                <span>
                  <strong>Công thức & Bộ sưu tập:</strong> Toàn bộ công thức do người dùng tạo và liên kết clone.
                </span>
              </li>
              <li className={s.consequenceItem}>
                <span className={s.bullet}>•</span>
                <span>
                  <strong>Tương tác & Xã hội:</strong> Mọi bình luận, lượt thích và danh sách theo dõi (followers/following).
                </span>
              </li>
              <li className={s.consequenceItem}>
                <span className={s.bullet}>•</span>
                <span>
                  <strong>Kho & Đi chợ:</strong> Tủ nguyên liệu (pantry) và các danh sách đi chợ đã lưu.
                </span>
              </li>
              <li className={s.consequenceItem}>
                <span className={s.bullet}>•</span>
                <span>
                  <strong>Nhật ký:</strong> Lịch sử nấu ăn thực tế và nhật ký trao đổi với Trợ lý AI.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={s.footer}>
          <button
            type="button"
            className={s.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
            autoFocus
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            className={s.deleteBtn}
            onClick={() => onConfirm(user)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={15} className={s.spin} />
                <span>Đang xóa toàn bộ...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Xác nhận xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
