import React, { useState } from 'react';

/**
 * Trích xuất chữ cái viết tắt từ tên người dùng
 * Ví dụ:
 *  - "Hoàng Tùng" -> "HT"
 *  - "Nguyễn Văn Nam" -> "NN" (Chữ đầu họ + chữ đầu tên)
 *  - "Tùng" -> "TU" (hoặc 2 ký tự đầu nếu chỉ có 1 từ)
 *  - null/undefined -> "U"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim().replace(/^@/, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Bảng màu gradient ấm theo phong cách ẩm thực Smart Recipe
 */
const BG_GRADIENTS = [
  'linear-gradient(135deg, #a13923 0%, #732314 100%)', // Terracotta
  'linear-gradient(135deg, #c2410c 0%, #852606 100%)', // Deep Orange
  'linear-gradient(135deg, #7c2d12 0%, #451a0a 100%)', // Warm Chestnut
  'linear-gradient(135deg, #9a3412 0%, #601f09 100%)', // Rust
  'linear-gradient(135deg, #5c3e33 0%, #3d271d 100%)', // Espresso
  'linear-gradient(135deg, #b45309 0%, #78350f 100%)', // Amber
  'linear-gradient(135deg, #854d0e 0%, #543107 100%)', // Spiced Ochre
];

function getGradient(str) {
  if (!str) return BG_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_GRADIENTS.length;
  return BG_GRADIENTS[index];
}

export default function UserAvatar({
  src,
  name = 'Người dùng',
  className = 'w-10 h-10',
  style = {},
  alt,
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const hasValidImage = !!src && !imgFailed && typeof src === 'string' && src.trim().length > 0;
  const initials = getInitials(name);
  const backgroundGradient = getGradient(name);

  if (hasValidImage) {
    return (
      <img
        src={src}
        alt={alt || name}
        onError={() => setImgFailed(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none shadow-xs tracking-wider ${className}`}
      style={{
        background: backgroundGradient,
        ...style,
      }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
