import React from 'react';
import {
  Beef, LeafyGreen, Wheat, UtensilsCrossed, Egg,
  Snowflake, CupSoda, Cookie, Archive, Package, ClipboardList,
  Apple, Droplet, Nut, Fish
} from 'lucide-react';

/**
 * Tách tên kệ thành các từ rời để so khớp theo TỪ, không theo chuỗi con.
 *
 * Trước đây hàm dùng name.includes('cá') nên "Các loại Hạt" bị bắt bởi chuỗi
 * con 'cá' trong "Các" -> nhận icon Beef. Dùng \p{L} với cờ u để tách đúng
 * tiếng Việt có dấu (\b của JS chỉ hiểu ASCII nên không dùng được).
 */
const words = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const hasWord = (list, ...targets) => targets.some((t) => list.includes(t));

const hasPhrase = (text, ...phrases) =>
  phrases.some((p) => text.toLowerCase().includes(p));

/**
 * Thứ tự các luật có ý nghĩa: luật hẹp phải đứng trước luật rộng.
 * "Các loại Hạt" phải được xét trước luật thịt/cá, "Dầu mỡ & Chất béo" phải
 * đứng trước luật rau củ (vì 'mỡ' không đụng nhưng để nhất quán nhóm mới).
 */
const getAisleStyle = (name) => {
  const w = words(name);

  // --- 3 kệ mới (id 7/8/9), xét trước để không bị luật cũ cướp ---
  if (hasPhrase(name, 'các loại hạt') || hasWord(w, 'hạt')) {
    return { icon: Nut };
  }
  if (hasWord(w, 'dầu', 'mỡ') || hasPhrase(name, 'chất béo')) {
    return { icon: Droplet };
  }
  if (hasPhrase(name, 'trái cây') || hasWord(w, 'quả')) {
    return { icon: Apple };
  }

  // --- các kệ cũ ---
  if (hasPhrase(name, 'hải sản') || hasWord(w, 'cá', 'tôm', 'cua')) {
    return { icon: Fish };
  }
  if (hasWord(w, 'thịt', 'bò', 'gà', 'heo') || hasPhrase(name, 'gia cầm')) {
    return { icon: Beef };
  }
  if (hasWord(w, 'rau', 'củ')) {
    return { icon: LeafyGreen };
  }
  if (hasWord(w, 'khô', 'gạo', 'mì')) {
    return { icon: Wheat };
  }
  if (hasPhrase(name, 'gia vị', 'nước chấm')) {
    return { icon: UtensilsCrossed };
  }
  if (hasWord(w, 'sữa', 'trứng', 'bơ')) {
    return { icon: Egg };
  }
  if (hasPhrase(name, 'đông lạnh')) {
    return { icon: Snowflake };
  }
  if (hasWord(w, 'uống', 'nước')) {
    return { icon: CupSoda };
  }
  if (hasWord(w, 'bánh', 'kẹo', 'snack')) {
    return { icon: Cookie };
  }
  if (hasWord(w, 'hộp')) {
    return { icon: Archive };
  }
  if (hasWord(w, 'khác', 'chung')) {
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
