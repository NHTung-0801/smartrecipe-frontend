import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Compass, TrendingUp, Sparkles, Plus } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/recipe/SearchBar';
import QuickFilterChips from '../components/recipe/QuickFilterChips';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch recipes dựa trên search keyword (nếu có), nếu không thì lấy public recipes
  const queryKey = searchKeyword
    ? ['recipeSearch', searchKeyword]
    : ['recentPublicRecipes'];

  const queryFn = searchKeyword
    ? () => recipeService.search(searchKeyword, 0, 8)
    : () => recipeService.getPublicRecipes(0, 8);

  const { data: recipesData, isLoading } = useQuery({
    queryKey,
    queryFn,
    placeholderData: (prev) => prev, // keep old data while fetching new
  });

  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword);
  }, []);

  const handleFilterChange = useCallback((filterKey) => {
    setActiveFilter(filterKey);
    // Map filter to search keyword
    const filterMap = {
      all: '',
      thit_bo: 'thịt bò',
      ga: 'gà',
      hai_san: 'hải sản',
      salad: 'salad',
      canh: 'canh',
      chay: 'chay',
      an_vat: 'ăn vặt',
      bua_sang: 'bữa sáng',
      trang_mieng: 'tráng miệng',
    };
    setSearchKeyword(filterMap[filterKey] || '');
  }, []);

  const recipes = recipesData?.content ?? [];

  return (
    <div className="min-h-screen font-[family-name:var(--sr-font-body)]">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pb-10 pt-8">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-rose-200/25 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-8">

          {/* Hero CTA */}
          <div className="text-center space-y-3 mt-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--sr-on-surface)] tracking-tight leading-tight font-[family-name:var(--sr-font-heading)]">
              Khám phá thế giới <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sr-primary)] to-amber-500">ẩm thực</span>
            </h1>
            <p className="text-lg text-[var(--sr-on-surface-variant)] max-w-xl mx-auto">
              Tìm kiếm, nấu ăn và chia sẻ những công thức tuyệt vời cùng cộng đồng Smart Recipe
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Quick Filters */}
          <QuickFilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />
        </div>
      </section>

      {/* ─── Recipe Feed Section ─── */}
      <section className="pb-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--sr-primary)]/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-[var(--sr-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
                {searchKeyword ? `Kết quả cho "${searchKeyword}"` : 'Mới nhất trên cộng đồng'}
              </h2>
              <p className="text-sm text-[var(--sr-on-surface-variant)]">
                {searchKeyword
                  ? `${recipes.length} công thức được tìm thấy`
                  : 'Những công thức mới nhất từ cộng đồng Smart Recipe'}
              </p>
            </div>
          </div>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md 
                       border border-[var(--sr-outline-variant)] text-[var(--sr-on-surface-variant)] 
                       text-sm font-semibold hover:text-[var(--sr-primary)] hover:border-[var(--sr-primary)]
                       hover:shadow-md transition-all duration-300"
          >
            Xem tất cả
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[var(--sr-primary)]/10 animate-pulse" />
              <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--sr-primary)] animate-spin" />
            </div>
            <p className="text-sm text-[var(--sr-on-surface-variant)] animate-pulse">Đang tải công thức...</p>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Compass size={36} className="text-[var(--sr-outline)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--sr-on-surface)]">
              {searchKeyword ? 'Không tìm thấy kết quả' : 'Chưa có công thức nào'}
            </h3>
            <p className="text-sm text-[var(--sr-on-surface-variant)] max-w-md text-center">
              {searchKeyword
                ? `Không có công thức nào khớp với "${searchKeyword}". Hãy thử từ khóa khác nhé!`
                : 'Hãy trở thành người đầu tiên chia sẻ công thức tuyệt vời của bạn với cộng đồng Smart Recipe!'}
            </p>
            {!searchKeyword && (
              <Link
                to="/recipes/new"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[var(--sr-primary)] text-white 
                           rounded-xl font-semibold hover:bg-[var(--sr-primary-light)] active:scale-95
                           transition-all duration-200 shadow-lg shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-900/30"
              >
                <Plus size={18} />
                Tạo công thức đầu tiên
              </Link>
            )}
          </div>
        )}

        {/* ─── Create Recipe CTA (chỉ hiện khi có recipes) ─── */}
        {recipes.length > 0 && !searchKeyword && (
          <div className="mt-14 p-8 rounded-3xl bg-gradient-to-br from-[var(--sr-primary)]/5 to-amber-100/50 
                          border border-[var(--sr-outline-variant)] text-center space-y-3
                          relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--sr-gold)]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--sr-primary)]/10 rounded-full text-[var(--sr-primary)] text-sm font-semibold mb-3">
                <Sparkles size={16} />
                Bạn có công thức ngon?
              </div>
              <h3 className="text-2xl font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
                Chia sẻ kiệt tác ẩm thực của bạn
              </h3>
              <p className="text-[var(--sr-on-surface-variant)] max-w-lg mx-auto">
                Đóng góp công thức nấu ăn độc đáo của bạn và truyền cảm hứng cho hàng ngàn đầu bếp khác
              </p>
              <Link
                to="/recipes/new"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[var(--sr-primary)] text-white 
                           rounded-xl font-semibold hover:bg-[var(--sr-primary-light)] active:scale-95
                           transition-all duration-200 shadow-lg shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-900/30"
              >
                <Plus size={18} />
                Tạo công thức mới
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─── Keyframe animation injection ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}