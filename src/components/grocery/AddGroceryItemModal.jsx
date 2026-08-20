import React, { useState, useEffect } from 'react';
import { PackagePlus, Save, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import IngredientAutocomplete from '../ui/IngredientAutocomplete';
import UnitAutocomplete from '../ui/UnitAutocomplete';
import { aisleService, ingredientService } from '../../services/ingredientService';
import s from '../../styles/pages/PantryPage.module.css';

const emptyForm = { ingredient: null, quantity: '', unit: '', aisleId: '' };

const AddGroceryItemModal = ({ isOpen, onClose, onSubmit, listId, editingItem = null }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const aislesQuery = useQuery({
    queryKey: ['aisles'],
    queryFn: () => aisleService.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });
  const aisles = aislesQuery.data?.data || [];

  useEffect(() => {
    if (editingItem) {
      setForm({
        ingredient: { id: editingItem.ingredientId, name: editingItem.ingredient?.name || editingItem.ingredientName },
        quantity: editingItem.totalNeeded || editingItem.quantity || '',
        unit: editingItem.unit || '',
        aisleId: editingItem.ingredient?.aisle?.id || editingItem.ingredient?.aisleId || ''
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingItem, isOpen]);

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
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Số lượng phải lớn hơn 0.');
    setError('');
    
    try {
      setLoading(true);
      let finalIngredientId = form.ingredient?.id;
      let finalUnit = form.unit || form.ingredient?.baseUnit || 'g';
      
      // Auto-create ingredient if not exists
      if (!finalIngredientId && ingredientName?.trim()) {
         const newIng = {
           name: ingredientName.trim(),
           baseUnit: finalUnit,
           caloriesPer100g: 0,
           protein: 0,
           fat: 0,
           carbs: 0,
           aisleId: form.aisleId ? Number(form.aisleId) : null
         };
         const response = await ingredientService.create(newIng);
         // extract ID from ApiResponse wrapper if needed
         finalIngredientId = response.data?.id || response.id; 
      }
      
      const data = {
        ingredientId: finalIngredientId,
        quantity: Number(form.quantity),
        unit: finalUnit
      };
      
      await onSubmit(data);
      onClose();
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
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="grocery-modal-title">
        <header className={s.modalHeader}>
          <div className={s.modalTitleIcon}><PackagePlus size={23} /></div>
          <div><span>{editingItem ? 'Cập nhật danh sách' : 'Thêm vào danh sách'}</span><h2 id="grocery-modal-title">{editingItem ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}</h2></div>
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
              key={editingItem?.id || 'new'} 
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
            />
          </div>

          {/* Số lượng */}
          <div className={s.formRow}>
            <div className={s.formGroup}>
              <label>Số lượng <b>*</b></label>
              <div className={s.inputWithUnit}>
                <input type="number" min="0.01" step="any" value={form.quantity} onChange={update('quantity')} placeholder="VD: 500" />
                <UnitAutocomplete value={form.unit || form.ingredient?.baseUnit} onChange={(unit) => setForm(c => ({...c, unit}))} inputClassName={s.unitInput} />
              </div>
            </div>
            {/* Cột ẩn để cân bằng formRow */}
            <div className={s.formGroup} style={{ visibility: 'hidden', height: 0, padding: 0 }}></div>
          </div>

          {error && <p className={s.formError}>{error}</p>}
          <footer className={s.modalFooter}>
            <button type="button" className={s.cancelButton} onClick={onClose}>Hủy</button>
            <button type="submit" className={s.saveButton} disabled={loading}>
              <Save size={18} /> {loading ? 'Đang lưu...' : editingItem ? 'Lưu thay đổi' : 'Thêm vào danh sách'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddGroceryItemModal;