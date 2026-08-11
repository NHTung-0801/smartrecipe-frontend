import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import IngredientAutocomplete from '../ui/IngredientAutocomplete';
import styles from './AddGroceryItemModal.module.css';

const AddGroceryItemModal = ({ isOpen, onClose, onSubmit, listId, editingItem = null }) => {
  const [ingredientId, setIngredientId] = useState(null);
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setIngredientId(editingItem.ingredientId);
      setIngredientName(editingItem.ingredientName);
      setQuantity(editingItem.finalToBuy != null ? editingItem.finalToBuy : editingItem.quantity);
      setUnit(editingItem.unit || '');
    } else {
      resetForm();
    }
  }, [editingItem, isOpen]);

  const resetForm = () => {
    setIngredientId(null);
    setIngredientName('');
    setQuantity('');
    setUnit('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectIngredient = (ingredient) => {
    if (ingredient) {
      setIngredientId(ingredient.id);
      setIngredientName(ingredient.name);
      setUnit(ingredient.baseUnit || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!ingredientId) {
      setError('Vui lòng chọn nguyên liệu');
      return;
    }

    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    if (!unit.trim()) {
      setError('Vui lòng nhập đơn vị');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ingredientId,
        quantity: qty,
        unit: unit.trim(),
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            {editingItem ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
          </h3>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Ingredient Autocomplete */}
          <div className={styles.field}>
            <label className={styles.label}>Nguyên liệu</label>
            <IngredientAutocomplete
              onSelect={handleSelectIngredient}
              placeholder="Tìm kiếm nguyên liệu..."
              defaultValue={editingItem ? { id: editingItem.ingredientId, name: editingItem.ingredientName } : null}
            />
          </div>

          {/* Quantity & Unit */}
          <div className={styles.row}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Số lượng</label>
              <input
                type="number"
                className={styles.input}
                placeholder="VD: 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Đơn vị</label>
              <input
                type="text"
                className={styles.input}
                placeholder="VD: g, ml, quả..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className={styles.spin} />
                  Đang xử lý...
                </>
              ) : editingItem ? (
                'Cập nhật'
              ) : (
                'Thêm'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroceryItemModal;