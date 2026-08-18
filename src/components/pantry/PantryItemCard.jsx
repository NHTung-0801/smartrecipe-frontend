import { CalendarDays, Eye, PackageOpen } from 'lucide-react';
import s from '../../styles/pages/PantryPage.module.css';

const formatDate = (date) => date
  ? new Intl.DateTimeFormat('vi-VN').format(new Date(`${date}T00:00:00`))
  : 'Không giới hạn';

export function getIngredientIcon(name, aisleName) {
  if (!name) return '📦';
  const n = name.toLowerCase();
  
  if (n.includes('cà chua')) return '🍅';
  if (n.includes('cà rốt')) return '🥕';
  if (n.includes('hành') || n.includes('tỏi')) return '🧄';
  if (n.includes('ớt')) return '🌶️';
  if (n.includes('rau') || n.includes('cải') || n.includes('súp lơ')) return '🥬';
  if (n.includes('nấm')) return '🍄';
  if (n.includes('khoai')) return '🥔';
  
  if (n.includes('bò') || n.includes('heo') || n.includes('lợn') || n.includes('thịt')) return '🥩';
  if (n.includes('gà') || n.includes('vịt')) return '🍗';
  if (n.includes('cá') || n.includes('hồi')) return '🐟';
  if (n.includes('tôm')) return '🦐';
  if (n.includes('mực')) return '🦑';
  
  if (n.includes('trứng')) return '🥚';
  if (n.includes('sữa') || n.includes('bơ')) return '🥛';
  if (n.includes('phô mai')) return '🧀';
  
  if (n.includes('gạo') || n.includes('cơm')) return '🍚';
  if (n.includes('bánh mì') || n.includes('phở') || n.includes('bún')) return '🍜';
  if (n.includes('muối') || n.includes('tiêu') || n.includes('đường')) return '🧂';
  if (n.includes('dầu')) return '🫒';
  if (n.includes('nước mắm') || n.includes('tương')) return '🫙';

  // Fallback to aisle icon
  if (aisleName) {
    const a = aisleName.toLowerCase();
    if (a.includes('thịt') || a.includes('hải sản')) return '🍖';
    if (a.includes('rau củ') || a.includes('trái cây')) return '🍎';
    if (a.includes('gia vị') || a.includes('đồ khô')) return '🌾';
    if (a.includes('sữa') || a.includes('trứng')) return '🥛';
  }

  return '📦';
}

export default function PantryItemCard({ item, onViewDetail, index = 0, variant = 'default' }) {
  const isLow = item.lowStockThreshold != null && Number(item.quantityAvailable) <= Number(item.lowStockThreshold);
  const status = item.status || 'FRESH';
  const unit = item.ingredient?.baseUnit || 'đơn vị';
  const statusText = status === 'EXPIRED'
    ? `Quá hạn ${Math.abs(item.daysUntilExpiry || 0)} ngày`
    : status === 'EXPIRING_SOON'
      ? item.daysUntilExpiry === 0 ? 'Hết hạn hôm nay' : `Còn ${item.daysUntilExpiry} ngày`
      : isLow ? 'Sắp hết' : 'Còn tươi';

  const icon = getIngredientIcon(item.ingredient?.name, item.aisleName);

  return (
    <article
      className={`${s.itemCard} ${s[`card${status}`]} ${isLow ? s.cardLow : ''} ${variant === 'tile' ? s.tileCard : variant === 'list' ? s.listCard : ''}`}
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={() => onViewDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewDetail(item)}
    >
      {variant === 'tile' ? (
        <>
          <div className={s.tileIcon}>{icon}</div>
          <h3 className={s.tileTitle}>{item.ingredient?.name || 'Nguyên liệu'}</h3>
          <div className={`${s.tileStatus} ${s[`tileStatus${status}`]} ${isLow && status === 'FRESH' ? s.tileStatusLow : ''}`}>
            <span className={s.dot} />
            {Number(item.quantityAvailable) === 0 ? 'Hết hàng' : `${Number(item.quantityAvailable).toLocaleString('vi-VN')} ${unit}`}
          </div>
        </>
      ) : variant === 'list' ? (
        <>
          <div className={s.listIcon}>{icon}</div>
          <span className={s.listTitleName}>{item.ingredient?.name || 'Nguyên liệu'}</span>
          <span className={s.listQuantity}><strong>{Number(item.quantityAvailable).toLocaleString('vi-VN')}</strong> {unit}</span>
          <div className={s.listExpiry}><CalendarDays size={14} /> {formatDate(item.expiryDate)}</div>
          <button type="button" className={s.viewDetailBtn} onClick={(e) => { e.stopPropagation(); onViewDetail(item); }}><Eye size={16} /></button>
        </>
      ) : (
        <>
          <div className={s.cardTop}>
            <span className={s.ingredientIcon}>{icon}</span>
            <span className={`${s.statusBadge} ${s[`badge${status}`]} ${isLow && status === 'FRESH' ? s.badgeLow : ''}`}><span />{statusText}</span>
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h3>{item.ingredient?.name || 'Nguyên liệu'}</h3>
              <div className={s.quantity}><strong>{Number(item.quantityAvailable).toLocaleString('vi-VN')}</strong> <span>{unit}</span></div>
            </div>
            <div className={s.expiry}><CalendarDays size={15} /> Hạn dùng: {formatDate(item.expiryDate)}</div>
            {item.lowStockThreshold != null && <div className={s.stockTrack} title={`Ngưỡng cảnh báo: ${item.lowStockThreshold} ${unit}`}><span style={{ width: `${Math.min(100, Number(item.quantityAvailable) / Math.max(Number(item.lowStockThreshold), 1) * 50)}%` }} /></div>}
          </div>
          <div className={s.cardActions}>
            <button type="button" className={s.viewDetailBtn} onClick={(e) => { e.stopPropagation(); onViewDetail(item); }}><Eye size={16} /> <span>Xem chi tiết</span></button>
          </div>
          <PackageOpen className={s.cardWatermark} size={65} />
        </>
      )}
    </article>
  );
}