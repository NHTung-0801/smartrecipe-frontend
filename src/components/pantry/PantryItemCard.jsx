import { CalendarDays, Eye, PackageOpen } from 'lucide-react';
import s from '../../styles/pages/PantryPage.module.css';

const icons = ['🥬', '🥕', '🍅', '🥩', '🥛', '🧀', '🌾', '🫙'];
const formatDate = (date) => date
  ? new Intl.DateTimeFormat('vi-VN').format(new Date(`${date}T00:00:00`))
  : 'Không giới hạn';

export default function PantryItemCard({ item, onViewDetail, index = 0 }) {
  const isLow = item.lowStockThreshold != null && Number(item.quantityAvailable) <= Number(item.lowStockThreshold);
  const status = item.status || 'FRESH';
  const unit = item.ingredient?.baseUnit || 'đơn vị';
  const statusText = status === 'EXPIRED'
    ? `Quá hạn ${Math.abs(item.daysUntilExpiry || 0)} ngày`
    : status === 'EXPIRING_SOON'
      ? item.daysUntilExpiry === 0 ? 'Hết hạn hôm nay' : `Còn ${item.daysUntilExpiry} ngày`
      : isLow ? 'Sắp hết' : 'Còn tươi';

  return (
    <article
      className={`${s.itemCard} ${s[`card${status}`]} ${isLow ? s.cardLow : ''}`}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={() => onViewDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewDetail(item)}
    >
      <div className={s.cardTop}>
        <span className={s.ingredientIcon}>{icons[(item.ingredient?.id || 0) % icons.length]}</span>
        <span className={`${s.statusBadge} ${s[`badge${status}`]} ${isLow && status === 'FRESH' ? s.badgeLow : ''}`}><span />{statusText}</span>
      </div>
      <div className={s.cardBody}>
        <h3>{item.ingredient?.name || 'Nguyên liệu'}</h3>
        <div className={s.quantity}><strong>{Number(item.quantityAvailable).toLocaleString('vi-VN')}</strong> <span>{unit}</span></div>
        <div className={s.expiry}><CalendarDays size={15} /> Hạn dùng: {formatDate(item.expiryDate)}</div>
        {item.lowStockThreshold != null && <div className={s.stockTrack} title={`Ngưỡng cảnh báo: ${item.lowStockThreshold} ${unit}`}><span style={{ width: `${Math.min(100, Number(item.quantityAvailable) / Math.max(Number(item.lowStockThreshold), 1) * 50)}%` }} /></div>}
      </div>
      <div className={s.cardActions}>
        <button type="button" className={s.viewDetailBtn} onClick={(e) => { e.stopPropagation(); onViewDetail(item); }}><Eye size={16} /> Xem chi tiết</button>
      </div>
      <PackageOpen className={s.cardWatermark} size={65} />
    </article>
  );
}