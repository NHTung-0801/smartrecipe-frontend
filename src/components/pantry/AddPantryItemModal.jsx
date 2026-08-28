import { useEffect, useState } from 'react';
import { CalendarDays, PackagePlus, Save, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import IngredientAutocomplete from '../ui/IngredientAutocomplete';
import UnitAutocomplete from '../ui/UnitAutocomplete';
import { aisleService, ingredientService } from '../../services/ingredientService';
import s from '../../styles/pages/PantryPage.module.css';

const emptyForm = { ingredient: null, quantityAvailable: '', lowStockThreshold: '0', expiryDate: '', unit: '', aisleId: '' };

export default function AddPantryItemModal({ isOpen, item, onClose, onSubmit, aisles }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const aislesQuery = useQuery({
    queryKey: ['aisles'],
    queryFn: () => aisleService.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen && !aisles,
  });
  const actualAisles = aisles || aislesQuery.data?.data || [];

  useEffect(() => {
    if (!isOpen) return;
    setForm(item ? { 
      ingredient: item.ingredient, 
      quantityAvailable: item.quantityAvailable ?? '', 
      lowStockThreshold: item.lowStockThreshold ?? '0', 
      expiryDate: item.expiryDate ?? '',
      unit: item.unit || item.ingredient?.baseUnit || '',
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
  const submit = async (event) => {
    event.preventDefault();
    const ingredientName = form.ingredient?.name || searchTerm;
    if (!form.ingredient?.id && !ingredientName?.trim()) return setError('Vui lòng chọn hoặc nhập tên nguyên liệu.');
    if (!form.quantityAvailable || Number(form.quantityAvailable) <= 0) return setError('Số lượng phải lớn hơn 0.');
    setError('');
    
    try {
      setLoading(true);
      let finalIngredientId = form.ingredient?.id;
      let finalUnit = form.unit || form.ingredient?.baseUnit || 'g';

      if (!finalIngredientId && ingredientName?.trim()) {
         // Nguyên liệu chưa có trong hệ thống: chỉ gửi tên + kệ hàng.
         // Backend đặt baseUnit = 'g' và dinh dưỡng = 0, nên phải dùng lại đơn vị
         // do backend trả về — giữ đơn vị user chọn (vd "quả") sẽ làm bước quy đổi
         // sang đơn vị cơ bản thất bại vì chưa có tỉ lệ chuyển đổi.
         const response = await ingredientService.createQuick({
           name: ingredientName.trim(),
           aisleId: form.aisleId ? Number(form.aisleId) : null
         });
         const created = response.data || response;
         finalIngredientId = created.id;
         finalUnit = created.baseUnit || 'g';
      }

      await onSubmit({ 
        ingredientId: finalIngredientId, 
        quantityAvailable: Number(form.quantityAvailable), 
        lowStockThreshold: form.lowStockThreshold === '' ? null : Number(form.lowStockThreshold), 
        expiryDate: form.expiryDate || null,
        unit: finalUnit
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi, vui lòng thử lại';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          <div className={s.formGroup}>
            <label>Loại</label>
            <select
              className={s.categorySelect}
              value={form.aisleId}
              onChange={(e) => setForm(f => ({ ...f, aisleId: e.target.value }))}
            >
              <option value="">— Tất cả loại —</option>
              {actualAisles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <small>Chọn loại để lọc nhanh danh sách nguyên liệu.</small>
          </div>

          <div className={s.formGroup}>
            <label>Nguyên liệu <b>*</b></label>
            <IngredientAutocomplete 
              key={item?.id || 'new'} 
              defaultValue={form.ingredient} 
              onSelect={(ingredient) => setForm((current) => ({ 
                ...current, 
                ingredient: ingredient || null, 
                unit: ingredient?.baseUnit || current.unit,
                aisleId: ingredient?.aisle?.id ?? current.aisleId 
              }))} 
              onInputChange={(val) => setSearchTerm(val)}
              placeholder="Gõ tên nguyên liệu..." 
              selectedAisleId={form.aisleId}
              selectedUnit={form.unit}
            />
          </div>

          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Số lượng <b>*</b></label>
              <div className={s.inputWithUnit}>
                <input type="number" min="0.01" step="0.01" value={form.quantityAvailable} onChange={update('quantityAvailable')} placeholder="0" />
                <UnitAutocomplete value={form.unit || form.ingredient?.baseUnit} onChange={(unit) => setForm(c => ({...c, unit}))} inputClassName={s.unitInput} />
              </div>
            </div>
            <div className={s.formGroup}>
              <label>Ngưỡng cảnh báo</label>
              <div className={s.inputWithUnit}>
                <input type="number" min="0" step="0.01" value={form.lowStockThreshold} onChange={update('lowStockThreshold')} placeholder="Tùy chọn" />
                <UnitAutocomplete value={form.unit || form.ingredient?.baseUnit} onChange={(unit) => setForm(c => ({...c, unit}))} inputClassName={s.unitInput} />
              </div>
            </div>
          </div>

          <div className={s.formGroup}>
            <label>Hạn sử dụng</label>
            <div className={s.dateInput}>
              <CalendarDays size={18} />
              <input type="date" value={form.expiryDate} onChange={update('expiryDate')} />
            </div>
            <small>Để trống với nguyên liệu không có hạn sử dụng.</small>
          </div>

          {error && <p className={s.formError}>{error}</p>}
          <footer className={s.modalFooter}>
            <button type="button" className={s.cancelButton} onClick={onClose}>Hủy</button>
            <button type="submit" className={s.saveButton} disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : item ? 'Lưu thay đổi' : 'Thêm vào tủ'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}