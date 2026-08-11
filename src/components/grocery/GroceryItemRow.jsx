import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import styles from './GroceryItemRow.module.css';

const GroceryItemRow = ({ item, onToggle, onEdit, onRemove }) => {
  const handleToggle = () => {
    onToggle && onToggle(item);
  };

  const handleEdit = () => {
    onEdit && onEdit(item);
  };

  const handleRemove = () => {
    onRemove && onRemove(item);
  };

  return (
    <div className={`${styles.row} ${item.isBought ? styles.purchased : ''}`}>
      {/* Checkbox */}
      <button
        className={`${styles.checkbox} ${item.isBought ? styles.checked : ''}`}
        onClick={handleToggle}
        aria-label={item.isBought ? 'Đánh dấu chưa mua' : 'Đánh dấu đã mua'}
      >
        {item.isBought && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Thông tin chính */}
      <div className={styles.info}>
        <span className={styles.name}>{item.ingredient?.name || 'Không tên'}</span>
        <span className={styles.quantity}>
          {item.finalToBuy != null ? item.finalToBuy : item.totalNeeded} {item.unit || ''}
        </span>
      </div>

      {/* Badge Aisle */}
      {item.aisleName && (
        <span className={styles.aisleBadge}>{item.aisleName}</span>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.editBtn}
          onClick={handleEdit}
          aria-label="Sửa"
          title="Sửa"
        >
          <Pencil size={14} />
        </button>
        <button
          className={styles.removeBtn}
          onClick={handleRemove}
          aria-label="Xóa"
          title="Xóa"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default GroceryItemRow;