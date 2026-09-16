import { useState, useEffect } from 'react';
import { Package, RefreshCw, CheckCircle, X, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { aisleService } from '../../services/ingredientService';
import s from '../../styles/components/admin/ReviewModal.module.css';

export default function ReviewModal({ ingredient, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: ingredient.name,
    baseUnit: ingredient.baseUnit,
    caloriesPer100g: ingredient.caloriesPer100g ?? 0,
    protein: ingredient.protein ?? 0,
    fat: ingredient.fat ?? 0,
    carbs: ingredient.carbs ?? 0,
    aisleId: ingredient.aisleId ?? '',
  });
  const [aisles, setAisles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    aisleService.getAll()
      .then((res) => {
        const list = res?.data || res || [];
        setAisles(list);
      })
      .catch(() => {
        // silently fallback if error
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateIngredient(ingredient.id, {
        caloriesPer100g: parseFloat(form.caloriesPer100g) || 0,
        protein: parseFloat(form.protein) || 0,
        fat: parseFloat(form.fat) || 0,
        carbs: parseFloat(form.carbs) || 0,
        aisleId: form.aisleId ? Number(form.aisleId) : null,
      });
      toast.success(`Đã cập nhật dinh dưỡng & kệ hàng cho "${ingredient.name}"`);
      onSaved();
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div className={s.headerTitleWrap}>
            <span className={s.headerBadge}>Admin Phê Duyệt</span>
            <h3>Bổ sung dinh dưỡng & Kệ hàng</h3>
          </div>
          <button onClick={onClose} className={s.modalClose}><X size={20} /></button>
        </div>

        <div className={s.modalBody}>
          <div className={s.ingredientTag}>
            <Package size={16} /> <strong>{ingredient.name}</strong>
            <span className={s.tagUnit}>Đơn vị gốc: 100{ingredient.baseUnit}</span>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.formLabel}><Layers size={15} /> Kệ hàng siêu thị (Aisle)</label>
            <select
              name="aisleId"
              value={form.aisleId}
              onChange={handleChange}
              className={s.formSelect}
            >
              <option value="">-- Chọn kệ hàng phù hợp --</option>
              {aisles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className={s.formGrid}>
            {[
              { name: 'caloriesPer100g', label: 'Calories (kcal)' },
              { name: 'protein',         label: 'Protein (g)' },
              { name: 'fat',             label: 'Chất béo (g)' },
              { name: 'carbs',           label: 'Tinh bột (g)' },
            ].map(({ name, label }) => (
              <div key={name} className={s.formField}>
                <label className={s.formLabel}>{label}</label>
                <input
                  type="number"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={s.formInput}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Hủy</button>
          <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={16} className={s.spin} /> : <CheckCircle size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu & Phê duyệt'}
          </button>
        </div>
      </div>
    </div>
  );
}
