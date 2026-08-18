import React from 'react';
import { 
  Beef, LeafyGreen, Wheat, UtensilsCrossed, Egg, 
  Snowflake, CupSoda, Cookie, Archive, Package, ClipboardList
} from 'lucide-react';

const getAisleStyle = (name) => {
  const lower = name.toLowerCase();
  
  if (lower.includes('thịt') || lower.includes('cá') || lower.includes('hải sản') || lower.includes('bò') || lower.includes('gà')) {
    return { icon: Beef };
  }
  if (lower.includes('rau') || lower.includes('củ') || lower.includes('quả') || lower.includes('trái cây')) {
    return { icon: LeafyGreen };
  }
  if (lower.includes('khô') || lower.includes('gạo') || lower.includes('mì')) {
    return { icon: Wheat };
  }
  if (lower.includes('gia vị') || lower.includes('nước chấm')) {
    return { icon: UtensilsCrossed };
  }
  if (lower.includes('sữa') || lower.includes('trứng') || lower.includes('bơ')) {
    return { icon: Egg };
  }
  if (lower.includes('đông lạnh')) {
    return { icon: Snowflake };
  }
  if (lower.includes('uống') || lower.includes('nước')) {
    return { icon: CupSoda };
  }
  if (lower.includes('bánh') || lower.includes('kẹo') || lower.includes('snack')) {
    return { icon: Cookie };
  }
  if (lower.includes('hộp')) {
    return { icon: Archive };
  }
  if (lower.includes('khác') || lower.includes('chung')) {
    return { icon: ClipboardList };
  }
  
  return { icon: Package };
};

const AisleGroupHeader = ({ name, itemCount, boughtCount }) => {
  const style = getAisleStyle(name);
  const IconComponent = style.icon;
  
  return (
    <div className="flex items-center justify-between mb-4 border-b border-outline-variant/30 pb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary`}>
          <IconComponent size={20} />
        </div>
        <h4 className="font-bold text-sm md:text-base text-on-surface">{name}</h4>
      </div>
      <span className="text-xs font-bold text-on-surface-variant">
        {itemCount} sản phẩm
      </span>
    </div>
  );
};

export default AisleGroupHeader;