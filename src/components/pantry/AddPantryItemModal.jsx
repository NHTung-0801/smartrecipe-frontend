import { useEffect, useState } from 'react';
import { CalendarDays, PackagePlus, Save, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import IngredientAutocomplete from '../ui/IngredientAutocomplete';
import UnitAutocomplete from '../ui/UnitAutocomplete';
import { aisleService } from '../../services/ingredientService';
import s from '../../styles/pages/PantryPage.module.css';

const emptyForm = { ingredient: null, quantityAvailable: '', lowStockThreshold: '', expiryDate: '', unit: '', aisleId: '' };

export default function AddPantryItemModal({ isOpen, item, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const aislesQuery = useQuery({
    queryKey: ['aisles'],
    queryFn: () => aisleService.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });
  const aisles = aislesQuery.data?.data || [];

  useEffect(() => {
    if (!isOpen) return;
    setForm(item ? { 
      ingredient: item.ingredient, 
      quantityAvailable: item.quantityAvailable ?? '', 
      lowStockThreshold: item.lowStockThreshold ?? '', 
      expiryDate: item.expiryDate ?? '',
      unit: item.ingredient?.baseUnit || '',
      aisleId: item.ingredient?.aisle?.id ?? '',
    } : emptyForm);
    setError('');
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.ingredient?.id) return setError('Vui lòng chọn một nguyên liệu trong danh sách.');
    if (!form.quantityAvailable || Number(form.quantityAvailable) <= 0) return setError('Số lượng phải lớn hơn 0.');
    setError('');
    onSubmit({ 
      ingredientId: form.ingredient.id, 
      quantityAvailable: Number(form.quantityAvailable), 
      lowStockThreshold: form.lowStockThreshold === '' ? null : Number(form.lowStockThreshold), 
      expiryDate: form.expiryDate || null,
      unit: form.unit || form.ingredient.baseUnit
    });
  };

  return (
    <div className={s.modalOverlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="pantry-modal-title">
        <header className={s.modalHeader}>
          <div className={s.modalTitleIcon}><PackagePlus size={23} /></div>
          <div><span>{item ? 'Cập nhật tồn kho' : 'Nạp vào tủ'}</span><h2 id="pantry-modal-title">{item ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}</h2></div>
          <button type="button" className={s.modalClose} onClick={onClose} aria-label="Đóng"><X size={21} /></button>
        </header>
        <form onSubmit={submit} className={s.modalForm}>
          {/* Loại (Aisle) */}
          <div className={s.formGroup}>
            <label>Loại</label>
            <select
              className={s.categorySelect}
              value={form.aisleId}
              onChange={(e) => setForm(f => ({ ...f, aisleId: e.target.value }))}
            >
              <option value="">— Tất cả loại —</option>
              {aisles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <small>Chọn loại để lọc nhanh danh sách nguyên liệu.</small>
          </div>

          {/* Nguyên liệu */}
          <div className={s.formGroup}>
            <label>Nguyên liệu <b>*</b></label>
            <IngredientAutocomplete 
              key={item?.id || 'new'} 
              defaultValue={form.ingredient} 
              onSelect={(ingredient) => setForm((current) => ({ 
                ...current, 
                ingredient, 
                unit: ingredient.baseUnit,
                aisleId: ingredient.aisle?.id ?? current.aisleId 
              }))} 
              placeholder="Gõ tên nguyên liệu..." 
            />
          </div>

          {/* Số lượng + Ngưỡng */}
          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Số lượng <b>*</b></label>
              <div className={s.inputWithUnit}>
                <input type="number" min="0.01" step="0.01" value={form.quantityAvailable} onChange={update('quantityAvailable')} placeholder="0" />
                <UnitAutocomplete value={form.unit || form.ingredient?.baseUnit} onChange={(unit) => setForm(c => ({...c, unit}))} />
              </div>
            </div>
            <div className={s.formGroup}>
              <label>Ngưỡng cảnh báo</label>
              <div className={s.inputWithUnit}>
                <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={update('lowStockThreshold')} placeholder="Tùy chọn" />
                <UnitAutocomplete value={form.unit || form.ingredient?.baseUnit} onChange={(unit) => setForm(c => ({...c, unit}))} />
              </div>
            </div>
          </div>

          {/* Hạn sử dụng */}
          <div className={s.formGroup}>
            <label>Hạn sử dụng</label>
            <div className={s.dateInput}>
              <CalendarDays size={18} />
              <input type="date" value={form.expiryDate} onChange={update('expiryDate')} />
            </div>
            <small>Để trống với nguyên liệu không có hạn sử dụng.</small>
          </div>

          {error && <p className={s.formError}>{error}</p>}
          <footer className={s.modalFooter}><button type="button" className={s.cancelButton} onClick={onClose}>Hủy</button><button type="submit" className={s.saveButton} disabled={isSaving}><Save size={18} /> {isSaving ? 'Đang lưu...' : item ? 'Lưu thay đổi' : 'Thêm vào tủ'}</button></footer>
        </form>
      </div>
    </div>
  );
}