import { AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import s from '../../styles/pages/PantryPage.module.css';

export default function ExpiryAlertBanner({ summary, onCleanup, isCleaning }) {
  const expired = summary?.expiredCount ?? 0;
  const expiring = summary?.expiringSoonCount ?? 0;
  if (!expired && !expiring) return null;

  return (
    <section className={`${s.alertBanner} ${expired ? s.alertDanger : s.alertWarning}`}>
      <div className={s.alertMark}><AlertTriangle size={25} /></div>
      <div className={s.alertContent}>
        <span className={s.eyebrow}><Sparkles size={13} /> Nhắc nhở thông minh</span>
        <h2>Tủ nguyên liệu của bạn cần chú ý</h2>
        <p>
          {expired > 0 && <span><b>{expired}</b> nguyên liệu đã hết hạn</span>}
          {expired > 0 && expiring > 0 && <i>•</i>}
          {expiring > 0 && <span><b>{expiring}</b> nguyên liệu sắp hết hạn</span>}
        </p>
      </div>
      {expired > 0 && (
        <button type="button" className={s.cleanupButton} onClick={onCleanup} disabled={isCleaning}>
          <Trash2 size={17} /> {isCleaning ? 'Đang dọn...' : 'Dọn tủ ngay'}
        </button>
      )}
    </section>
  );
}