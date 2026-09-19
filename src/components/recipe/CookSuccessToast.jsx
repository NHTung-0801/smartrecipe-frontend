import React from 'react';
import { Sparkles, ArrowRight, BookOpen, PackageCheck } from 'lucide-react';
import s from '../../styles/components/CookSuccessToast.module.css';

const getIngredientEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('bò') || n.includes('thịt') || n.includes('heo') || n.includes('gà') || n.includes('vịt')) return '🥩';
  if (n.includes('cá') || n.includes('tôm') || n.includes('mực') || n.includes('bạch tuộc') || n.includes('cua')) return '🦐';
  if (n.includes('bún') || n.includes('gạo') || n.includes('mì') || n.includes('bột') || n.includes('phở')) return '🌾';
  if (n.includes('hành') || n.includes('cà') || n.includes('rau') || n.includes('cải') || n.includes('nấm') || n.includes('ớt') || n.includes('tỏi') || n.includes('gừng')) return '🥬';
  if (n.includes('dầu') || n.includes('mỡ') || n.includes('bơ')) return '🫒';
  if (n.includes('trứng') || n.includes('sữa') || n.includes('phô mai')) return '🥛';
  if (n.includes('mắm') || n.includes('đường') || n.includes('muối') || n.includes('nêm') || n.includes('tiêu') || n.includes('ngọt') || n.includes('tương') || n.includes('giấm')) return '🫙';
  if (n.includes('hạt') || n.includes('đậu') || n.includes('mè') || n.includes('lạc')) return '🥜';
  if (n.includes('chuối') || n.includes('cam') || n.includes('chanh') || n.includes('táo') || n.includes('bưởi')) return '🍎';
  return '🥄';
};

export default function CookSuccessToast({ recipeTitle, deductions = [], onNavigatePantry, onNavigateJournal }) {
  return (
    <div className={s.container}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.iconWrap}>
          <span>🎉</span>
        </div>
        <div className={s.titleArea}>
          <h4 className={s.mainTitle}>
            Nấu ăn hoàn thành! <Sparkles size={14} className="text-amber-500 inline" />
          </h4>
          {recipeTitle && <span className={s.recipeName}>{recipeTitle}</span>}
        </div>
      </div>

      {/* Deductions Box */}
      {deductions.length > 0 ? (
        <div className={s.deductionBox}>
          <div className={s.deductionHeader}>
            <span className="flex items-center gap-1.5">
              <PackageCheck size={14} className="text-[#a13923]" />
              <span>Đã tự động trừ khỏi tủ (FEFO):</span>
            </span>
            <span className={s.deductionBadge}>{deductions.length} mục</span>
          </div>

          <div className={s.list}>
            {deductions.map((d, index) => (
              <div key={index} className={s.itemRow}>
                <div className={s.itemNameArea}>
                  <span className={s.itemIcon}>{getIngredientEmoji(d.ingredientName)}</span>
                  <span className={s.itemName}>{d.ingredientName}</span>
                </div>
                <span className={s.itemDeducted}>
                  -{d.deductedAmount} {d.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[0.78rem] text-[#57423d] bg-[rgba(246,236,229,0.55)] p-2.5 rounded-xl border border-[rgba(222,192,185,0.6)]">
          ✨ Buổi nấu này đã được lưu vào sổ tay nấu ăn cá nhân của bạn.
        </div>
      )}

      {/* Action Footer */}
      <div className={s.footer}>
        {onNavigatePantry ? (
          <button
            type="button"
            className={s.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onNavigatePantry();
            }}
          >
            <span>Tủ nguyên liệu</span>
            <ArrowRight size={13} />
          </button>
        ) : null}

        {onNavigateJournal ? (
          <button
            type="button"
            className={`${s.actionBtn} ${s.journalBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateJournal();
            }}
          >
            <BookOpen size={13} />
            <span>Nhật ký nấu ăn</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
