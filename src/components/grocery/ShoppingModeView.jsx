import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, CheckCircle2, Pencil, Check, X, Plus, Lightbulb,
  Beef, LeafyGreen, Wheat, UtensilsCrossed, Egg,
  Snowflake, CupSoda, Cookie, Archive, Package
} from 'lucide-react';

import styles from '../../styles/pages/GroceryPage.module.css';

/* ── Aisle icon & color mapping (Flexible) ── */
const getAisleStyle = (aisleName) => {
  const name = aisleName.toLowerCase();
  if (name.includes('rau') || name.includes('trái cây') || name.includes('củ')) return { icon: LeafyGreen, color: 'bg-green-50 text-green-600' };
  if (name.includes('thịt') || name.includes('hải sản') || name.includes('cá')) return { icon: Beef, color: 'bg-red-50 text-red-600' };
  if (name.includes('khô') || name.includes('gạo') || name.includes('mì')) return { icon: Wheat, color: 'bg-orange-50 text-orange-600' };
  if (name.includes('gia vị') || name.includes('nước chấm') || name.includes('sốt')) return { icon: UtensilsCrossed, color: 'bg-amber-50 text-amber-600' };
  if (name.includes('sữa') || name.includes('trứng') || name.includes('bơ')) return { icon: Egg, color: 'bg-yellow-50 text-yellow-600' };
  if (name.includes('đông lạnh')) return { icon: Snowflake, color: 'bg-cyan-50 text-cyan-600' };
  if (name.includes('uống') || name.includes('nước')) return { icon: CupSoda, color: 'bg-blue-50 text-blue-600' };
  if (name.includes('bánh') || name.includes('kẹo') || name.includes('snack')) return { icon: Cookie, color: 'bg-pink-50 text-pink-600' };
  if (name.includes('hộp')) return { icon: Archive, color: 'bg-gray-50 text-gray-600' };
  return { icon: Package, color: 'bg-slate-50 text-slate-600' };
};

const ShoppingModeView = ({
  groceryList,
  items,
  listName,
  onToggleItem,
  onComplete,
  onUpdateName,
  onBack,
  onCancel,
}) => {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(listName);

  /* ── Grouped items by aisle ── */
  const grouped = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const aisle = item.aisleName || 'Khác';
      if (!map[aisle]) map[aisle] = [];
      map[aisle].push(item);
    });
    return map;
  }, [items]);

  const sortedAisles = Object.keys(grouped).sort((a, b) => {
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b);
  });

  const boughtCount = items.filter(i => i.isBought).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  /* ── Title editing ── */
  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== listName) {
      onUpdateName && onUpdateName(trimmed);
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setNameInput(listName);
    setEditing(false);
  };

  return (
    <div className="md:px-12 max-w-[1100px] mx-auto pb-32 pt-6">
      {/* ── Header ── */}
      <header
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
        style={{ animation: 'sr-slideUpFade 0.4s ease-out' }}
      >
        <div className="flex-1">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <ShoppingCart size={14} />
              Đang đi chợ
            </span>
          </div>

          {/* Editable title */}
          <div className="flex items-center gap-3 mb-4">
            {editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="text-3xl font-bold text-on-surface bg-transparent border-b-2 border-primary outline-none flex-1 py-1"
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setNameInput(listName); setEditing(true); }}>
                <h1 className="text-3xl font-bold text-on-surface">{listName}</h1>
                <Pencil size={18} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="w-full max-w-[400px] h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant shrink-0">
              <span className="text-primary text-lg">{boughtCount}</span>
              <span>/</span>
              <span>{totalCount} món</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 bg-white text-on-surface font-bold rounded-xl shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onBack}
            className="py-2.5 px-5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Lưu tạm & Thoát
          </button>
        </div>
      </header>

      {/* ── Main Layout: Grid & Tips ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Column: Ingredients & Add Input */}
        <div className="lg:col-span-8 space-y-6">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ animation: 'sr-slideUpFade 0.5s ease-out 0.1s both' }}
          >
            {sortedAisles.map(aisle => {
          const style = getAisleStyle(aisle);
          const IconComponent = style.icon;
          const aisleItems = grouped[aisle];
          const aisleBought = aisleItems.filter(i => i.isBought).length;

          return (
            <div
              key={aisle}
              className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow"
            >
              {/* Aisle header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary`}>
                    <IconComponent size={16} />
                  </div>
                  <h3 className="font-bold text-on-surface text-sm md:text-base">{aisle}</h3>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                  {aisleBought}/{aisleItems.length} món
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {aisleItems.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 py-2 px-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                      item.isBought
                        ? 'bg-primary/5 opacity-70'
                        : 'hover:bg-surface-container/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isBought}
                      onChange={() => onToggleItem(item)}
                      className={`w-6 h-6 rounded-md border-2 border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer flex-shrink-0 ${styles.customCheckbox}`}
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block text-sm font-semibold transition-all ${
                          item.isBought
                            ? 'line-through text-on-surface-variant/60'
                            : 'text-on-surface'
                        }`}
                      >
                        {item.ingredient?.name || 'Không tên'}
                      </span>
                      {item.isManual && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-secondary/10 text-secondary rounded">
                          Nguyên liệu thêm
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-surface-container rounded-lg text-on-surface-variant whitespace-nowrap">
                      {item.finalToBuy != null ? item.finalToBuy : item.totalNeeded}
                      {item.unit ? ` ${item.unit}` : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
          </div>

        </div>

        {/* Right Column: Tips */}
        <div className="lg:col-span-4 space-y-4" style={{ animation: 'sr-slideUpFade 0.5s ease-out 0.2s both' }}>
          <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" /> Mẹo đi chợ
          </h3>
          
          <div className="bg-amber-50/80 border border-amber-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-amber-800 mb-1 text-sm">Kiểm tra tủ lạnh</h4>
            <p className="text-amber-700/80 text-xs leading-relaxed">Luôn nhìn lại tủ lạnh trước khi thanh toán để tránh mua trùng đồ đã có.</p>
          </div>
          
          <div className="bg-blue-50/80 border border-blue-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-blue-800 mb-1 text-sm">Mua đồ tươi sống sau cùng</h4>
            <p className="text-blue-700/80 text-xs leading-relaxed">Hãy nhặt các món thịt, cá đông lạnh ở cuối chu trình để giữ độ tươi ngon.</p>
          </div>
          
          <div className="bg-green-50/80 border border-green-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-green-800 mb-1 text-sm">Tuân thủ danh sách</h4>
            <p className="text-green-700/80 text-xs leading-relaxed">Chỉ mua những thứ có trong danh sách để tiết kiệm chi phí và tránh lãng phí.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingModeView;
