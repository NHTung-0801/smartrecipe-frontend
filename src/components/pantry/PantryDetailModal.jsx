import { useEffect, useState } from 'react';
import { CalendarDays, Gauge, Hash, Package, Save, Trash2, X } from 'lucide-react';
import s from '../../styles/pages/PantryPage.module.css';
import ConfirmModal from '../ui/ConfirmModal';

const icons = ['🥬', '🥕', '🍅', '🥩', '🥛', '🧀', '🌾', '🫙'];
const formatDate = (date) => date
  ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
  : 'Không giới hạn';

const statusConfig = {
  EXPIRED: { color: '#cf4940', bg: '#fde4df', text: 'Đã hết hạn' },
  EXPIRING_SOON: { color: '#93620a', bg: '#fff1c9', text: 'Sắp hết hạn' },
  FRESH: { color: '#397347', bg: '#e8f4e9', text: 'Còn tươi' },
};

export default function PantryDetailModal({ isOpen, item, onClose, onSave, onDelete, isSaving, isDeleting }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ quantityAvailable: '', lowStockThreshold: '' });

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;
    setForm({
      quantityAvailable: item.quantityAvailable ?? '',
      lowStockThreshold: item.lowStockThreshold ?? '',
    });
    setEditing(false);
    setShowConfirm(false);
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen || showConfirm) return undefined;
    const closeOnEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = ''; };
  }, [isOpen, showConfirm, onClose]);

  if (!isOpen || !item) return null;

  const ingredient = item.ingredient || {};
  const unit = ingredient.baseUnit || 'đơn vị';
  const status = item.status || 'FRESH';
  const sc = statusConfig[status] || statusConfig.FRESH;
  const isLow = item.lowStockThreshold != null && Number(item.quantityAvailable) <= Number(item.lowStockThreshold);
  const icon = icons[(ingredient.id || 0) % icons.length];
  const aisleName = item.aisleName || ingredient.aisle?.name || 'Chưa phân loại';

  const handleSave = () => {
    onSave({
      ingredientId: ingredient.id,
      quantityAvailable: Number(form.quantityAvailable),
      lowStockThreshold: form.lowStockThreshold === '' ? null : Number(form.lowStockThreshold),
      expiryDate: item.expiryDate || null,
    });
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item);
  };

  return (
    <div className={s.modalOverlay} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.detailModal} role="dialog" aria-modal="true">
        {/* Header */}
        <header className={s.detailHeader}>
          <div className={s.detailIconWrap}>{icon}</div>
          <div className={s.detailHeaderInfo}>
            <h2>{ingredient.name || 'Nguyên liệu'}</h2>
            <span className={s.detailAisleTag}>{aisleName}</span>
          </div>
          <button type="button" className={s.modalClose} onClick={onClose} aria-label="Đóng"><X size={21} /></button>
        </header>

        {/* Body */}
        <div className={s.detailBody}>
          {/* Status */}
          <div className={s.detailStatusRow} style={{ borderColor: sc.color + '30' }}>
            <span className={s.detailStatusDot} style={{ background: sc.color }} />
            <span className={s.detailStatusText} style={{ color: sc.color }}>
              {sc.text}
              {status === 'EXPIRING_SOON' && item.daysUntilExpiry != null && ` — còn ${item.daysUntilExpiry} ngày`}
              {status === 'EXPIRED' && item.daysUntilExpiry != null && ` — quá ${Math.abs(item.daysUntilExpiry)} ngày`}
            </span>
            {isLow && <span className={s.detailAisleTag} style={{ background: '#fae7dd', color: '#ad5431', marginLeft: 'auto' }}>Sắp hết</span>}
          </div>

          {/* Fields */}
          <div className={s.detailGrid}>
            {/* Số lượng */}
            <div className={s.detailField}>
              <div className={s.detailFieldLabel}><Package size={14} /> Số lượng</div>
              {editing ? (
                <input
                  type="number" min="0.01" step="0.01"
                  className={s.detailFieldInput}
                  value={form.quantityAvailable}
                  onChange={(e) => setForm(f => ({ ...f, quantityAvailable: e.target.value }))}
                  autoFocus
                />
              ) : (
                <div className={s.detailFieldValue}>
                  {Number(item.quantityAvailable).toLocaleString('vi-VN')} <small>{unit}</small>
                </div>
              )}
            </div>

            {/* Ngưỡng cảnh báo */}
            <div className={s.detailField}>
              <div className={s.detailFieldLabel}><Gauge size={14} /> Ngưỡng cảnh báo</div>
              {editing ? (
                <input
                  type="number" min="0" step="0.01"
                  className={s.detailFieldInput}
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                  placeholder="Không đặt"
                />
              ) : (
                <div className={s.detailFieldValue}>
                  {item.lowStockThreshold != null
                    ? <>{Number(item.lowStockThreshold).toLocaleString('vi-VN')} <small>{unit}</small></>
                    : <span style={{ color: 'var(--sr-outline)', fontWeight: 500, fontSize: '.85rem' }}>Không đặt</span>
                  }
                </div>
              )}
            </div>

            {/* Đơn vị */}
            <div className={s.detailField}>
              <div className={s.detailFieldLabel}><Hash size={14} /> Đơn vị</div>
              <div className={s.detailFieldValue}>{unit}</div>
            </div>

            {/* Ngày hết hạn */}
            <div className={s.detailField}>
              <div className={s.detailFieldLabel}><CalendarDays size={14} /> Hạn sử dụng</div>
              <div className={s.detailFieldValue} style={{ fontSize: '.9rem' }}>{formatDate(item.expiryDate)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={s.detailFooter}>
          <button type="button" className={s.detailDeleteBtn} onClick={handleDeleteClick} disabled={isDeleting}>
            <Trash2 size={16} /> {isDeleting ? 'Đang xóa...' : 'Xóa khỏi tủ'}
          </button>
          <div className={s.detailActions}>
            {editing ? (
              <>
                <button type="button" className={s.detailCancelBtn} onClick={() => setEditing(false)}>Hủy</button>
                <button type="button" className={s.detailSaveBtn} onClick={handleSave} disabled={isSaving}>
                  <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </>
            ) : (
              <button type="button" className={s.detailSaveBtn} onClick={() => setEditing(true)}>
                Chỉnh sửa
              </button>
            )}
          </div>
        </footer>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Xóa nguyên liệu"
        message={`Bạn có chắc chắn muốn xóa "${ingredient.name}" khỏi tủ nguyên liệu?`}
        confirmText="Xóa khỏi tủ"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
