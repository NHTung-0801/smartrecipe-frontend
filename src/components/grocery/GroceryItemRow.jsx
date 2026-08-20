import React from 'react';
import { Trash2 } from 'lucide-react';
import styles from '../../styles/pages/GroceryPage.module.css';

const GroceryItemRow = ({ item, onToggle, onEdit, onRemove }) => {
  const handleToggle = () => onToggle && onToggle(item);
  const handleEdit = () => onEdit && onEdit(item);
  const handleRemove = () => onRemove && onRemove(item);

  return (
    <div className="group flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all">
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <input
          type="checkbox"
          checked={item.isBought}
          onChange={handleToggle}
          className={`w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer flex-shrink-0 ${styles.customCheckbox}`}
        />
        <div className="min-w-0 flex-1 cursor-pointer" onClick={handleEdit}>
          <p className={`text-base font-semibold truncate transition-colors ${item.isBought ? 'line-through text-on-surface-variant/60' : 'text-on-surface'}`}>
            {item.ingredient?.name || 'Không tên'}
          </p>
          {/* Note or Subtext if needed. Using aisleName or static text for now if empty */}
          <div className="flex items-center gap-2 mt-0.5">
            {item.pantryDeducted > 0 && (
              <p className="text-[11px] text-on-surface-variant truncate">
                (Đã có {item.pantryDeducted} trong tủ)
              </p>
            )}
            {item.isManual && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-secondary/10 text-secondary rounded">
                Nguyên liệu thêm
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <span className="text-xs font-bold px-3 py-1 bg-primary/10 rounded-full text-primary whitespace-nowrap">
          {item.finalToBuy != null ? item.finalToBuy : item.totalNeeded} {item.unit || ''}
        </span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={handleRemove}
            className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10"
            title="Xóa"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryItemRow;