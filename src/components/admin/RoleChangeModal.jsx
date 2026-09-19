import { useEffect } from 'react';
import { ShieldCheck, UserCheck, X, RefreshCw, AlertCircle } from 'lucide-react';
import s from '../../styles/components/admin/RoleChangeModal.module.css';

export default function RoleChangeModal({
  isOpen,
  user,
  targetRole,
  isLoading = false,
  onConfirm,
  onClose,
}) {
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

  if (!isOpen || !user || !targetRole) return null;

  const isPromote = targetRole === 'ADMIN';
  const displayName = user.displayName || user.username || 'Người dùng';
  const username = user.username || '';
  const initial = (displayName || username || 'U')[0].toUpperCase();

  return (
    <div
      className={s.overlay}
      onClick={isLoading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-change-modal-title"
    >
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Accent Stripe */}
        <div className={isPromote ? s.stripeAdmin : s.stripeUser} />

        {/* Header */}
        <div className={s.header}>
          <div className={isPromote ? s.iconWrapAdmin : s.iconWrapUser}>
            {isPromote ? <ShieldCheck size={24} /> : <UserCheck size={24} />}
          </div>

          <div className={s.headerText}>
            <h3 id="role-change-modal-title" className={s.title}>
              {isPromote ? 'Cấp quyền Quản trị viên' : 'Hạ quyền Thành viên'}
            </h3>
            <p className={s.subtitle}>
              {isPromote
                ? 'Thăng cấp tài khoản lên quyền Quản trị hệ thống (ADMIN)'
                : 'Chuyển tài khoản về nhóm Thành viên tiêu chuẩn (USER)'}
            </p>
          </div>

          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            title="Đóng"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
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
                <span className={`${s.roleBadge} ${user.role === 'ADMIN' ? s.roleAdmin : s.roleUser}`}>
                  {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>
          </div>

          {isPromote ? (
            <div className={s.infoBoxAdmin}>
              <strong>Lưu ý quyền hạn:</strong> Sau khi được cấp quyền <strong>ADMIN</strong>, người dùng này có thể xem toàn bộ số liệu thống kê, duyệt công thức, quản lý nguyên liệu và thực hiện các thao tác quản trị trên toàn hệ thống.
            </div>
          ) : (
            <div className={s.infoBoxUser}>
              <strong>Lưu ý quyền hạn:</strong> Sau khi bị hạ quyền xuống <strong>USER</strong>, tài khoản này sẽ mất toàn bộ quyền truy cập vào cổng quản trị và các chức năng kiểm duyệt.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button
            type="button"
            className={s.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
            autoFocus
          >
            Hủy
          </button>

          <button
            type="button"
            className={isPromote ? s.submitBtnAdmin : s.submitBtnUser}
            onClick={() => onConfirm({ id: user.id, role: targetRole })}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={15} className={s.spin} />
                <span>Đang xử lý...</span>
              </>
            ) : isPromote ? (
              <>
                <ShieldCheck size={15} />
                <span>Xác nhận thăng quyền</span>
              </>
            ) : (
              <>
                <UserCheck size={15} />
                <span>Xác nhận hạ quyền</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
