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

function getAisleIcon(aisleName) {
  if (!aisleName) return '📦';
  const lower = aisleName.toLowerCase();
  for (const [key, icon] of Object.entries(aisleIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '📦';
}

export default function PantryGrid({ groups = {}, onViewDetail }) {
  return (
    <div className={s.pantryGroups}>
      {Object.entries(groups).filter(([, items]) => items?.length).map(([aisle, items]) => (
        <section className={s.aisleSection} key={aisle}>
          <header className={s.aisleHeader}>
            <div>
              <span><span className={s.aisleIcon}>{getAisleIcon(aisle)}</span></span>
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