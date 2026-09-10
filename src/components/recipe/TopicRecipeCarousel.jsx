import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Compass, Utensils, Flame, Clock } from 'lucide-react';
import RecipeCard from '../RecipeCard';

export default function TopicRecipeCarousel({
  recipes = [],
  isLoading = false,
  topicTitle = 'Tất cả món',
  topicKey = 'all',
  sortBy = 'likeCount',
  onSortChange,
  isAuthenticated = false,
  openAuthModal,
  onViewAll,
}) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      // Scroll by roughly 1 page width (approx 3 cards)
      const scrollOffset = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollOffset : scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll(topicKey, topicTitle);
      return;
    }
    const section = document.getElementById('recent-recipes-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Carousel Sub-header with Sort Filter Tabs & Navigation Arrows */}
      <div className="flex items-center justify-between">
        {/* Sort Filter Tabs: Phổ biến nhất & Mới nhất */}
        <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 backdrop-blur-md border border-stone-300/60 shadow-inner">
          <button
            type="button"
            onClick={() => onSortChange?.('likeCount')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
              sortBy === 'likeCount'
                ? 'bg-[var(--sr-primary)] text-white shadow-md shadow-orange-900/25'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Flame size={14} className={sortBy === 'likeCount' ? 'text-amber-300 fill-amber-300' : 'text-stone-500'} />
            <span>Phổ biến nhất</span>
          </button>

          <button
            type="button"
            onClick={() => onSortChange?.('createdAt')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
              sortBy === 'createdAt'
                ? 'bg-[var(--sr-primary)] text-white shadow-md shadow-orange-900/25'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Clock size={14} className={sortBy === 'createdAt' ? 'text-amber-200' : 'text-stone-500'} />
            <span>Mới nhất</span>
          </button>
        </div>

        {/* Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={recipes.length <= 2}
            className="w-8 h-8 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[var(--sr-primary)] hover:border-[var(--sr-primary)] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
            title="Trượt sang trái"
            aria-label="Trượt sang trái"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={recipes.length <= 2}
            className="w-8 h-8 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[var(--sr-primary)] hover:border-[var(--sr-primary)] flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
            title="Trượt sang phải"
            aria-label="Trượt sang phải"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Slider (Hiển thị sẵn 1 hàng, 3 món trên desktop, trượt qua phải) */}
      {isLoading ? (
        <div className="flex gap-5 overflow-hidden py-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 h-64 rounded-2xl bg-stone-100 animate-pulse"
            />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x pb-4 pt-1 [&::-webkit-scrollbar]:hidden"
        >
          {/* List of Recipe Cards */}
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 snap-start"
            >
              <RecipeCard 
                recipe={recipe} 
                rankingIndex={sortBy === 'likeCount' ? index : null} 
              />
            </div>
          ))}

          {/* End Card: "Xem tất cả món ăn có chủ đề đó" */}
          <div
            onClick={handleViewAll}
            className="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 snap-start rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-orange-50/70 to-amber-100/50 border-2 border-dashed border-amber-300/80 hover:border-[var(--sr-primary)] hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center text-center cursor-pointer group min-h-[360px] h-full"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-[var(--sr-primary)] group-hover:scale-110 transition-transform mb-3">
              <Compass size={28} />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--sr-primary)]/10 text-[var(--sr-primary)] mb-2">
              Khám phá thêm
            </span>

            <h4 className="text-base md:text-lg font-bold text-stone-900 group-hover:text-[var(--sr-primary)] transition-colors line-clamp-1 mb-1 font-[family-name:var(--sr-font-heading)]">
              {topicTitle.toLowerCase().includes('tất cả') ? 'Khám phá tất cả món ngon' : `Tất cả món ${topicTitle}`}
            </h4>

            <p className="text-xs md:text-sm text-stone-500 max-w-[260px] mb-4">
              Xem toàn bộ công thức và bí quyết nấu nướng hấp dẫn thuộc chủ đề này
            </p>

            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--sr-primary)] text-white text-xs font-bold shadow-md shadow-orange-900/20 group-hover:bg-[var(--sr-primary-light)] transition-all">
              Xem tất cả
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      ) : (
        /* Empty state tinh tế, ĐỒNG BỘ KHUNG KÍCH THƯỚC h-[360px] VÀ GIỮ NGUYÊN KHOẢNG CÁCH */
        <div className="h-[360px] rounded-[24px] overflow-hidden bg-gradient-to-br from-white/70 via-amber-50/35 to-orange-50/20 backdrop-blur-xl border border-dashed border-amber-900/15 p-6 text-center shadow-xs flex flex-col justify-center items-center relative pb-4 pt-1 mb-4">
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-300/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-orange-300/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-3">
            {/* Elegant Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[var(--sr-primary)] shadow-xs mx-auto">
              <Utensils size={22} className="opacity-85" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200/60 shadow-xs">
                Chủ đề: {topicTitle}
              </span>
              <h4 className="text-base md:text-lg font-bold text-stone-900 font-[family-name:var(--sr-font-heading)]">
                Chưa có công thức thuộc chủ đề này
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto line-clamp-2">
                Các đầu bếp đang chuẩn bị những món ngon tuyệt vời cho chủ đề này. Hãy thử chọn chủ đề khác hoặc khám phá toàn bộ món nhé!
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleViewAll}
                className="px-4 py-2 rounded-xl bg-[var(--sr-primary)] hover:bg-[var(--sr-primary-light)] text-white text-xs font-bold shadow-md shadow-orange-900/15 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <Compass size={14} />
                <span>Khám phá tất cả món</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated && openAuthModal) {
                    openAuthModal(`Đăng công thức cho chủ đề ${topicTitle}`);
                    return;
                  }
                  navigate('/recipes/new');
                }}
                className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-700 hover:text-[var(--sr-primary)] border border-stone-200 text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>+ Viết công thức</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
