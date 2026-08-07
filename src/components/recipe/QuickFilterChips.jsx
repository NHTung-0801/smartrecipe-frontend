import React from 'react';
import { 
  Beef, Shell, Drumstick, Salad, 
  Soup, Flame, Leaf, Coffee, IceCream, Utensils
} from 'lucide-react';

const FILTER_ITEMS = [
  { key: 'all', label: 'Tất cả', icon: <Utensils size={14} /> },
  { key: 'thit_bo', label: 'Thịt bò', icon: <Beef size={14} /> },
  { key: 'ga', label: 'Thịt gà', icon: <Drumstick size={14} /> },
  { key: 'hai_san', label: 'Hải sản', icon: <Shell size={14} /> },
  { key: 'salad', label: 'Salad', icon: <Salad size={14} /> },
  { key: 'canh', label: 'Món nước', icon: <Soup size={14} /> },
  { key: 'chay', label: 'Món chay', icon: <Leaf size={14} /> },
  { key: 'an_vat', label: 'Ăn vặt', icon: <Flame size={14} /> },
  { key: 'bua_sang', label: 'Bữa sáng', icon: <Coffee size={14} /> },
  { key: 'trang_mieng', label: 'Tráng miệng', icon: <IceCream size={14} /> },
];

const QuickFilterChips = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex overflow-x-auto gap-2.5 py-4 px-2 [&::-webkit-scrollbar]:hidden snap-x">
      {FILTER_ITEMS.map((item) => {
        const isActive = activeFilter === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-300 ease-out
                        ${isActive
                          ? 'bg-[var(--sr-primary)] text-white shadow-lg shadow-orange-900/25 scale-105'
                          : 'bg-white/60 backdrop-blur-md border border-[var(--sr-outline-variant)] text-[var(--sr-on-surface-variant)] hover:bg-white hover:border-[var(--sr-primary)] hover:text-[var(--sr-primary)] hover:shadow-md'
                        }
                        font-[family-name:var(--sr-font-body)] snap-center shrink-0`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default QuickFilterChips;