import React from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, ChefHat, Play, X, AlertTriangle, ArrowRight, Package } from 'lucide-react';

const MissingIngredientsModal = ({
  isOpen,
  onClose,
  recipeTitle,
  missingIngredients = [],
  onGoShopping,
  onProceedCook,
  onSwitchPractice,
  isAddingToGrocery = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#fdfbf9] rounded-3xl shadow-2xl border border-[#ede3da] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-[#fff7f2] to-[#faefe8] border-b border-[#ebdcd1]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#3d271d] font-heading leading-tight">
                Chưa đủ nguyên liệu trong tủ
              </h3>
              <p className="text-xs text-[#8c6b58] line-clamp-1 mt-0.5">
                Món: <span className="font-semibold text-[#a13923]">{recipeTitle}</span>
              </p>
            </div>
          </div>

          <div className="mt-2 text-[13px] text-[#6d5043] leading-relaxed">
            Tủ lạnh của bạn hiện đang thiếu <span className="font-bold text-[#a13923]">{missingIngredients.length}</span> nguyên liệu cần thiết. Để món ăn đúng vị, bạn nên bổ sung trước khi nấu!
          </div>
        </div>

        {/* Missing Ingredients List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#8c6b58] uppercase tracking-wider px-1">
            <span>Nguyên liệu</span>
            <span>Cần / Còn thiếu</span>
          </div>

          <div className="space-y-2">
            {missingIngredients.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#f0e4da] shadow-sm hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#faf4f0] flex items-center justify-center text-[#a13923] shrink-0">
                    <Package size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 leading-snug">
                      {item.ingredientName}
                    </h4>
                    <span className="text-[11px] text-gray-400">
                      Trong tủ: {item.available > 0 ? `${item.available} ${item.unit}` : 'Chưa có'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-700">
                    Cần: {item.amount} {item.unit}
                  </span>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mt-1">
                    Thiếu {item.missing} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gradient-to-b from-[#fdfbf9] to-[#f7f2ed] border-t border-[#ede3da] space-y-3">
          {/* Primary Action: Go Shopping */}
          <button
            onClick={onGoShopping}
            disabled={isAddingToGrocery}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-[#a13923] to-[#b84229] hover:from-[#8b311e] hover:to-[#a13923] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#a13923]/25 transition-all transform active:scale-[0.99] disabled:opacity-70"
          >
            <ShoppingCart size={18} />
            <span>{isAddingToGrocery ? 'Đang soạn giỏ hàng...' : 'Đi chợ ngay (Mở chế độ siêu thị)'}</span>
            <ArrowRight size={16} className="ml-1 opacity-80" />
          </button>

          {/* Secondary Options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onSwitchPractice}
              className="py-2.5 px-3 bg-white hover:bg-[#fcf5f1] border border-[#d8c3b5] text-[#5e4336] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <ChefHat size={15} className="text-[#a13923]" />
              <span>Chuyển sang Nấu thử</span>
            </button>

            <button
              type="button"
              onClick={onProceedCook}
              className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play size={14} className="text-gray-400" />
              <span>Vẫn nấu thật (Trừ sẵn có)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MissingIngredientsModal;
