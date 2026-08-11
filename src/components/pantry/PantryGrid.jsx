import { LayoutGrid } from 'lucide-react';
import PantryItemCard from './PantryItemCard';
import s from '../../styles/pages/PantryPage.module.css';

const aisleIcons = {
  'thịt': '🍖', 'hải sản': '🦐', 'thịt & hải sản': '🥩',
  'rau': '🥬', 'trái cây': '🍎', 'rau củ': '🥕', 'rau củ & trái cây': '🥬',
  'gia vị': '🫙', 'đồ khô': '🌾', 'gia vị & đồ khô': '🫙',
  'sữa': '🥛', 'trứng': '🥚', 'sữa & trứng': '🥛',
  'đồ uống': '🥤', 'bánh': '🍞', 'ngũ cốc': '🌾',
  'dầu': '🫒', 'nước chấm': '🫙', 'đông lạnh': '🧊',
};

const FIXED_CATEGORIES = [
  { name: 'Thịt & Hải sản', icon: '🥩' },
  { name: 'Rau củ & Trái cây', icon: '🥬' },
  { name: 'Gia vị & Đồ khô', icon: '🫙' },
  { name: 'Sữa & Trứng', icon: '🥚' }
];

export default function PantryGrid({ groups = {}, onViewDetail }) {
  return (
    <div className={s.pantryGroups}>
      {/* Hai danh mục đầu tiên: Hiển thị 100% width */}
      {FIXED_CATEGORIES.slice(0, 2).map((category) => {
        const items = groups[category.name] || [];
        return (
          <section className={s.aisleSection} key={category.name}>
            <header className={s.aisleHeader}>
              <div>
                <span><span className={s.aisleIcon}>{category.icon}</span></span>
                <h2>{category.name}</h2>
              </div>
              <span className={s.itemCount}>{items.length} nguyên liệu</span>
            </header>
            
            {items.length > 0 ? (
              <div className={s.itemGrid}>
                {items.map((item, index) => (
                  <PantryItemCard key={item.id} item={item} index={index} onViewDetail={onViewDetail} />
                ))}
              </div>
            ) : (
              <div className={s.emptyCategoryState}>
                <p>Chưa có nguyên liệu</p>
              </div>
            )}
          </section>
        );
      })}

      {/* Hai danh mục cuối: Hiển thị 50% width, side-by-side */}
      <div className={s.bottomRow}>
        {FIXED_CATEGORIES.slice(2, 4).map((category) => {
          const items = groups[category.name] || [];
          // Phân biệt class cho lưới nhỏ và danh sách
          const gridClass = category.name === 'Gia vị & Đồ khô' ? s.spiceGrid : s.dairyGrid;
          
          return (
            <section className={s.aisleSection} key={category.name}>
              <header className={s.aisleHeader}>
                <div>
                  <span><span className={s.aisleIcon}>{category.icon}</span></span>
                  <h2>{category.name}</h2>
                </div>
                <span className={s.itemCount}>{items.length} nguyên liệu</span>
              </header>
              
              {items.length > 0 ? (
                <div className={gridClass}>
                  {items.map((item, index) => (
                    <PantryItemCard key={item.id} item={item} index={index} onViewDetail={onViewDetail} compact={true} />
                  ))}
                </div>
              ) : (
                <div className={s.emptyCategoryState}>
                  <p>Chưa có nguyên liệu</p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Render any unknown/uncategorized items just in case */}
      {Object.entries(groups)
        .filter(([aisle, items]) => items?.length > 0 && !FIXED_CATEGORIES.find(c => c.name === aisle))
        .map(([aisle, items]) => (
        <section className={s.aisleSection} key={aisle}>
          <header className={s.aisleHeader}>
            <div>
              <span><span className={s.aisleIcon}>📦</span></span>
              <h2>{aisle || 'Khác'}</h2>
            </div>
            <span className={s.itemCount}>{items.length} nguyên liệu</span>
          </header>
          <div className={s.itemGrid}>
            {items.map((item, index) => (
              <PantryItemCard key={item.id} item={item} index={index} onViewDetail={onViewDetail} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}