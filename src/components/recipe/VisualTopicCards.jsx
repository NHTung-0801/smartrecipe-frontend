import React from 'react';

export const TOPIC_ITEMS = [
  {
    key: 'all',
    title: 'Tất cả món',
    subtitle: 'Khám phá trọn vẹn',
    count: '250+',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    tag: '✨ Đa dạng thực đơn',
  },
  {
    key: 'bua_sang',
    title: 'Bữa Sáng Năng Lượng',
    subtitle: 'Nhanh gọn & đủ chất',
    count: '128',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
    tag: '🍳 Bắt đầu ngày mới',
  },
  {
    key: 'canh',
    title: 'Món Canh Thanh Mát',
    subtitle: 'Hương vị cơm nhà',
    count: '64',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
    tag: '🍲 Ngọt lành ấm bụng',
  },
  {
    key: 'salad',
    title: 'Eat Clean Giữ Dáng',
    subtitle: 'Tươi ngon & healthy',
    count: '85',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
    tag: '🥗 Lối sống xanh',
  },
  {
    key: 'mon_nhau',
    title: 'Món Nhậu Cuối Tuần',
    subtitle: 'Bùng nổ hương vị',
    count: '52',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80',
    tag: '🥩 Sum vầy rôm rả',
  },
  {
    key: 'trang_mieng',
    title: 'Bếp Bánh Ngọt Ngào',
    subtitle: 'Tráng miệng mê ly',
    count: '76',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
    tag: '🍰 Ngọt ngào thư thái',
  },
  {
    key: 'chay',
    title: 'Món Chay Thanh Tịnh',
    subtitle: 'An yên tâm hồn',
    count: '49',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    tag: '🍃 Thuần khiết dinh dưỡng',
  },
];

export default function VisualTopicCards({ activeFilter, onFilterChange, topicCounts = {} }) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-[var(--sr-primary)]" />
          <h3 className="text-base font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
            Chủ đề ẩm thực gợi ý
          </h3>
        </div>
        <span className="text-xs text-[var(--sr-on-surface-variant)]">
          Chọn chủ đề để lọc nhanh công thức
        </span>
      </div>

      {/* Grid of 7 cards: 2 on mobile, 4 on md, 7 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {TOPIC_ITEMS.map((topic) => {
          const isActive = (activeFilter === topic.key) || (!activeFilter && topic.key === 'all');
          const realCount = topicCounts[topic.key] !== undefined ? topicCounts[topic.key] : (topic.count || 0);

          return (
            <button
              key={topic.key}
              type="button"
              onClick={() => {
                if (topic.key === 'all') {
                  onFilterChange('all');
                } else {
                  // Toggle: if clicked again, reset to 'all'
                  onFilterChange(isActive ? 'all' : topic.key);
                }
              }}
              className={`group relative h-40 rounded-2xl overflow-hidden text-left p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg ${
                isActive
                  ? 'ring-3 ring-[var(--sr-primary)] ring-offset-2 scale-[1.02] shadow-orange-900/20'
                  : 'hover:-translate-y-1 hover:border-amber-400/50'
              }`}
            >
              {/* Background Photo */}
              <img
                src={topic.image}
                alt={topic.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
              {isActive && (
                <div className="absolute inset-0 bg-[var(--sr-primary)]/20 mix-blend-overlay" />
              )}

              {/* Top Tag & Active Pulsating Dot */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/25 backdrop-blur-md text-white border border-white/30 shadow-sm line-clamp-1">
                  {topic.tag}
                </span>
                {isActive && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0" title="Đang xem">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-sm" />
                  </span>
                )}
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 space-y-0.5">
                <h4 className={`text-xs md:text-sm font-bold leading-tight transition-colors duration-200 ${
                  isActive ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                }`}>
                  {topic.title}
                </h4>
                <p className="text-[10px] md:text-[11px] text-gray-300 font-medium line-clamp-1">
                  {topic.subtitle}
                </p>
                <div className="text-[10px] md:text-[11px] font-semibold text-amber-300/90 pt-0.5">
                  {realCount} công thức
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
