import React from 'react';
import styles from './AisleGroupHeader.module.css';

const AISLE_ICONS = {
  'Thịt, cá, hải sản': '🥩',
  'Rau, củ, quả': '🥬',
  'Đồ khô, gạo, mì': '🍚',
  'Gia vị, nước chấm': '🧂',
  'Sữa, trứng, bơ': '🥛',
  'Đồ đông lạnh': '❄️',
  'Đồ uống': '🥤',
  'Bánh kẹo, snack': '🍪',
  'Đồ hộp': '🥫',
  'Khác': '📦',
};

const AisleGroupHeader = ({ aisleName, itemCount, purchasedCount }) => {
  const icon = AISLE_ICONS[aisleName] || '🛒';
  const allPurchased = itemCount > 0 && purchasedCount === itemCount;

  return (
    <div className={`${styles.header} ${allPurchased ? styles.allPurchased : ''}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.name}>{aisleName}</span>
      <span className={styles.count}>
        {purchasedCount}/{itemCount}
      </span>
    </div>
  );
};

export default AisleGroupHeader;