import { Archive, CircleAlert, Clock3, Gauge } from 'lucide-react';
import s from '../../styles/pages/PantryPage.module.css';

const stats = [
  ['totalItems', 'Tổng nguyên liệu', Archive, 'ALL', 'total'],
  ['expiringSoonCount', 'Sắp hết hạn', Clock3, 'EXPIRING_SOON', 'warning'],
  ['expiredCount', 'Đã hết hạn', CircleAlert, 'EXPIRED', 'danger'],
  ['lowStockCount', 'Sắp hết', Gauge, 'LOW_STOCK', 'low'],
];

export default function PantrySummaryBar({ summary = {}, activeFilter, onFilterChange }) {
  return <section className={s.summaryBar} aria-label="Tổng quan tủ nguyên liệu">
    {stats.map(([key, label, Icon, filter, tone]) => <button type="button" key={key}
      className={`${s.summaryItem} ${s[tone]} ${activeFilter === filter ? s.summaryActive : ''}`}
      onClick={() => onFilterChange(filter)}>
      <span className={s.summaryIcon}><Icon size={20} /></span>
      <span><strong>{summary[key] ?? 0}</strong><small>{label}</small></span>
    </button>)}
  </section>;
}