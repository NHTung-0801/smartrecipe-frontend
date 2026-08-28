import PantryItemCard from './PantryItemCard';
import s from '../../styles/pages/PantryPage.module.css';

/**
 * Tách tên kệ thành các từ rời để so khớp theo TỪ, không theo chuỗi con.
 * Cùng cách làm với components/grocery/AisleGroupHeader.jsx: \b của JS chỉ hiểu
 * ASCII nên không dùng được với tiếng Việt có dấu, phải dựa vào \p{L} + cờ u.
 *
 * Không tra cứu bằng key nguyên chuỗi (kiểu icons['Dầu mỡ & Chất béo']) vì tên
 * kệ trong DB có thể đổi qua API, chỉ cần thêm một chữ là mất icon.
 */
const words = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const hasWord = (list, ...targets) => targets.some((t) => list.includes(t));

const hasPhrase = (text, ...phrases) => phrases.some((p) => text.toLowerCase().includes(p));

/**
 * Thứ tự luật có ý nghĩa: luật hẹp phải đứng trước luật rộng.
 * 'Các loại Hạt' phải xét trước luật hải sản, vì chuỗi con 'cá' nằm trong 'Các'.
 */
const getAisleIcon = (name) => {
  if (!name) return '📦';
  const w = words(name);

  if (hasPhrase(name, 'các loại hạt') || hasWord(w, 'hạt')) return '🥜';
  if (hasWord(w, 'dầu', 'mỡ') || hasPhrase(name, 'chất béo')) return '🫒';
  if (hasPhrase(name, 'trái cây') || hasWord(w, 'quả')) return '🍎';
  if (hasPhrase(name, 'hải sản') || hasWord(w, 'cá', 'tôm', 'cua')) return '🦐';
  if (hasWord(w, 'thịt', 'bò', 'gà', 'heo') || hasPhrase(name, 'gia cầm')) return '🥩';
  if (hasWord(w, 'rau', 'củ')) return '🥬';
  // 'gia vị' xét trước 'khô' vì luật gia vị hẹp hơn: tên gộp kiểu
  // 'Gia vị & Đồ khô' nên ra hũ gia vị, không phải bó lúa.
  if (hasPhrase(name, 'gia vị', 'nước chấm')) return '🫙';
  if (hasWord(w, 'khô', 'gạo', 'mì') || hasPhrase(name, 'ngũ cốc')) return '🌾';
  if (hasWord(w, 'sữa', 'trứng', 'bơ')) return '🥛';
  if (hasPhrase(name, 'đông lạnh')) return '🧊';
  if (hasWord(w, 'uống')) return '🥤';
  if (hasWord(w, 'bánh', 'kẹo')) return '🍞';

  return '📦';
};

/**
 * Thứ tự hiển thị theo lối đi siêu thị (đồ tươi -> đồ khô -> gia vị).
 * Kệ không có trong danh sách (admin tự thêm, hoặc 'Chưa phân loại' mà
 * PantryServiceImpl gán cho nguyên liệu thiếu aisle) bị đẩy xuống cuối.
 */
const AISLE_ORDER = [
  'Rau củ',
  'Trái cây',
  'Thịt & Gia cầm',
  'Hải sản',
  'Sữa & Trứng',
  'Đồ khô & Gạo',
  'Các loại Hạt',
  'Dầu mỡ & Chất béo',
  'Gia vị & Nước chấm',
];

const orderOf = (name) => {
  const i = AISLE_ORDER.indexOf(name);
  return i === -1 ? AISLE_ORDER.length : i;
};

export default function PantryGrid({ groups = {}, onViewDetail }) {
  // Backend chỉ trả về kệ đang có nguyên liệu; vẫn lọc phòng mảng rỗng.
  const sections = Object.entries(groups)
    .filter(([, items]) => items?.length > 0)
    .sort(([a], [b]) => orderOf(a) - orderOf(b) || a.localeCompare(b, 'vi'));

  return (
    <div className={s.pantryGroups}>
      {sections.map(([aisle, items]) => (
        <section className={s.aisleSection} key={aisle}>
          <header className={s.aisleHeader}>
            <div>
              <span><span className={s.aisleIcon}>{getAisleIcon(aisle)}</span></span>
              <h2>{aisle}</h2>
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
