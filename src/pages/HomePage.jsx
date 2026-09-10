import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, TrendingUp, Sparkles, Plus, Flame, 
  Clock, ArrowRight, ArrowDown, ChevronLeft, ChevronRight, ChevronUp,
  ChefHat, BookOpen, Utensils, Award
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useAuthPromptStore from '../store/useAuthPromptStore';
import { recipeService } from '../services/recipeService';
import { journalService } from '../services/journalService';
import { pantryService } from '../services/pantryService';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/recipe/SearchBar';
import VisualTopicCards, { TOPIC_ITEMS } from '../components/recipe/VisualTopicCards';
import TopicRecipeCarousel from '../components/recipe/TopicRecipeCarousel';
import EditorialStoryBanner from '../components/recipe/EditorialStoryBanner';

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function formatMinutes(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}ph` : `${h}h`;
}

/**
 * Hiệu ứng hiển thị mượt mà khi cuộn tới ("lướt đến đâu hiển thị đến đó")
 */
function RevealOnScroll({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '30px' }
    );

    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Tạo danh sách các nút phân trang linh hoạt có rút gọn ...
 */
function renderPaginationPages(currentPage, totalPages, onPageChange) {
  const pages = [];
  
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(0);
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 2, currentPage + 1);

    if (start > 1) {
      pages.push('dots-start');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 2) {
      pages.push('dots-end');
    }

    pages.push(totalPages - 1);
  }

  return pages.map((p, idx) => {
    if (typeof p === 'string') {
      return (
        <span key={`dots-${idx}`} className="px-1.5 py-1 text-xs text-stone-400 select-none">
          •••
        </span>
      );
    }

    const isActive = p === currentPage;
    return (
      <button
        key={p}
        type="button"
        onClick={() => onPageChange(p)}
        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
          isActive
            ? 'bg-[var(--sr-primary)] text-white shadow-md shadow-orange-900/25'
            : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:border-[var(--sr-primary)] hover:text-[var(--sr-primary)] shadow-2xs'
        }`}
      >
        {p + 1}
      </button>
    );
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthPromptStore((state) => state.openModal);

  // States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTopic, setActiveTopic] = useState('all');
  const [topicSortBy, setTopicSortBy] = useState('likeCount'); // 'likeCount' | 'createdAt'
  const [latestPage, setLatestPage] = useState(0);
  const recentRecipesRef = useRef(null);

  // 1. Spotlight Recipe Query (Lấy top 3 món có lượt thích cao nhất cho Bento Spotlight)
  const { data: spotlightData } = useQuery({
    queryKey: ['spotlightRecipesTop3'],
    queryFn: () => recipeService.getPublicRecipes(0, 3, 'likeCount'),
    placeholderData: (prev) => prev,
  });
  const spotlightList = useMemo(() => {
    const list = spotlightData?.content || [];
    return [...list].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }, [spotlightData]);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);

  // Tự động chuyển món mỗi 5 giây (Auto-rotate every 5 seconds)
  useEffect(() => {
    if (spotlightList.length <= 1 || isSpotlightPaused) return;

    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [spotlightList.length, isSpotlightPaused]);

  // Đảm bảo chỉ số an toàn khi danh sách thay đổi
  const safeSpotlightIndex = spotlightList.length > 0 ? spotlightIndex % spotlightList.length : 0;
  const currentSpotlight = spotlightList[safeSpotlightIndex] || null;

// Hàm chuẩn hóa chuỗi tiếng Việt: loại bỏ dấu, chuyển về chữ thường để so khớp linh động
function normalizeVN(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Kiểm tra xem công thức có chứa bất kỳ tag nào khớp với danh sách từ khóa không.
 * Ưu tiên tuyệt đối thẻ tags (r.tags).
 * Nếu món hoàn toàn không có tag nào, mới xét fallback trong tiêu đề.
 */
function matchRecipeTopic(recipe, tagKeywords = [], fallbackKeywords = []) {
  if (!recipe) return false;
  
  const recipeTags = recipe.tags || [];
  
  // 1. ƯU TIÊN 1 (TAG-FIRST): So khớp trực tiếp trên danh sách thẻ (r.tags)
  if (recipeTags.length > 0) {
    const normTags = recipeTags.map((t) => normalizeVN(t.name || ''));
    return tagKeywords.some((kw) => {
      const normKw = normalizeVN(kw);
      return normTags.some((tagStr) => tagStr.includes(normKw));
    });
  }
  
  // 2. DỰ PHÒNG (FALLBACK): Chỉ khi món ăn KHÔNG có bất kỳ thẻ nào, mới xét từ khóa trong tiêu đề
  if (fallbackKeywords && fallbackKeywords.length > 0) {
    const titleNorm = normalizeVN(recipe.title || '');
    return fallbackKeywords.some((kw) => titleNorm.includes(normalizeVN(kw)));
  }
  
  return false;
}

const TOPIC_MATCHERS = {
  // Bữa Sáng Năng Lượng: kết hợp cả Ăn sáng, Bữa sáng, Dưới 30 phút, Nhanh gọn
  bua_sang: (r) => matchRecipeTopic(
    r,
    ['an sang', 'bua sang', 'sang', 'diem tam', 'breakfast', 'duoi 30 phut', 'nhanh gon'],
    ['an sang', 'bua sang', 'diem tam', 'breakfast']
  ),

  // Món Canh Thanh Mát: Món canh, Canh, Súp, Hầm, Nước dùng
  canh: (r) => matchRecipeTopic(
    r,
    ['mon canh', 'canh', 'sup', 'soup', 'ham', 'nuoc dung'],
    ['mon canh', 'canh', 'sup', 'soup']
  ),

  // Eat Clean Giữ Dáng: Giảm cân, Eat clean, Healthy, Salad, Ăn kiêng, Dáng đẹp, Low carb, Keto
  salad: (r) => matchRecipeTopic(
    r,
    ['giam can', 'eat clean', 'healthy', 'salad', 'an kieng', 'giu dang', 'low carb', 'keto', 'it beo'],
    ['salad', 'eat clean', 'healthy', 'giam can']
  ),

  // Món Nhậu Cuối Tuần: Món nhậu, Nhậu, Đồ nhắm, Lai rai, Mồi nhắm, Món nướng (TUYỆT ĐỐI KHÔNG DÙNG 'bò' / 'thịt' TRONG TÊN MÓN)
  mon_nhau: (r) => matchRecipeTopic(
    r,
    ['mon nhau', 'nhau', 'do nham', 'lai rai', 'moi nham', 'mon nuong'],
    ['mon nhau', 'lai rai', 'do nham', 'moi nhau']
  ),

  // Bếp Bánh Ngọt Ngào: Tráng miệng, Bánh ngọt, Bánh, Chè, Đồ uống
  trang_mieng: (r) => matchRecipeTopic(
    r,
    ['trang mieng', 'banh ngot', 'banh', 'che', 'ngot', 'dessert', 'do uong'],
    ['banh ngot', 'trang mieng', 'banh', 'che']
  ),

  // Món Chay Thanh Tịnh: Ăn chay, Món chay, Chay, Thuần chay, Thanh tịnh
  chay: (r) => matchRecipeTopic(
    r,
    ['an chay', 'mon chay', 'chay', 'thuan chay', 'thanh tinh', 'vegan', 'vegetarian'],
    ['chay', 'thuan chay', 'thanh tinh']
  ),
};

  // 2. Topic Recipes Query (Lấy danh sách món theo chủ đề ẩm thực được chọn)
  const topicFilterMap = {
    all: '',
    mon_nhau: 'nhậu',
    salad: 'giảm cân',
    canh: 'canh',
    chay: 'chay',
    bua_sang: 'sáng',
    trang_mieng: 'tráng miệng',
  };

  // 3. Query all public recipes to compute accurate real topic counts
  const { data: allPublicData } = useQuery({
    queryKey: ['allPublicRecipesForCounts'],
    queryFn: () => recipeService.getPublicRecipes(0, 100),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const allPublicList = allPublicData?.content || [];
  const topicCounts = useMemo(() => {
    const counts = { all: allPublicList.length };
    Object.entries(TOPIC_MATCHERS).forEach(([key, matcher]) => {
      counts[key] = allPublicList.filter(matcher).length;
    });
    return counts;
  }, [allPublicList]);

  const { data: topicData, isLoading: isTopicLoading } = useQuery({
    queryKey: ['topicRecipes', activeTopic, topicSortBy],
    queryFn: () => {
      if (activeTopic === 'all') {
        return recipeService.getPublicRecipes(0, 10, topicSortBy);
      }
      return recipeService.search(topicFilterMap[activeTopic] || '', 0, 10);
    },
    placeholderData: (prev) => prev,
  });

  const rawTopicRecipes = useMemo(() => {
    if (activeTopic === 'all') {
      return topicData?.content ?? [];
    }
    const matcher = TOPIC_MATCHERS[activeTopic];
    if (matcher) {
      return allPublicList.filter(matcher);
    }
    return topicData?.content ?? [];
  }, [activeTopic, topicData, allPublicList]);

  const topicRecipes = useMemo(() => {
    return [...rawTopicRecipes].sort((a, b) => {
      if (topicSortBy === 'likeCount') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [rawTopicRecipes, topicSortBy]);

  const selectedTopicItem = TOPIC_ITEMS.find((t) => t.key === activeTopic) || TOPIC_ITEMS[0];

  // 4. Search Query (Khi người dùng gõ từ khóa vào thanh tìm kiếm)
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ['recipeSearch', searchKeyword],
    queryFn: () => recipeService.search(searchKeyword, 0, 12),
    enabled: !!searchKeyword,
    placeholderData: (prev) => prev,
  });
  const searchResults = searchData?.content ?? [];

  // 5. Latest Recipes Query (Cho phần Các món ăn mới nhất ở cuối trang - Cố định 2 hàng x 3 cột = 6 món trên mỗi trang)
  const { data: latestData, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latestPublicRecipesHome', latestPage],
    queryFn: () => recipeService.getPublicRecipes(latestPage, 6, 'createdAt'),
    placeholderData: (prev) => prev,
  });
  const latestRecipes = latestData?.content ?? [];
  const totalLatestPages = latestData?.totalPages ?? 1;
  const totalLatestElements = latestData?.totalElements ?? latestRecipes.length;

  // 6. User Cooking Journal Query (Khi đã đăng nhập - đo lường tiến trình danh hiệu)
  const { data: userJournalData } = useQuery({
    queryKey: ['userJournalStats'],
    queryFn: () => journalService.getAll(0, 1),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
  const totalCooked = userJournalData?.totalElements && userJournalData.totalElements > 0 
    ? userJournalData.totalElements 
    : 12; // Mặc định hiển thị 12/15 cho trực quan sinh động
  const challengeTarget = 15;
  const remainingCooks = Math.max(1, challengeTarget - totalCooked);
  const progressPercent = Math.min(100, Math.round((totalCooked / challengeTarget) * 100));

  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword);
  }, []);

  const handleTopicChange = useCallback((topicKey) => {
    setActiveTopic(topicKey);
  }, []);

  const handleLatestPageChange = useCallback((newPage) => {
    setLatestPage(newPage);
    setTimeout(() => {
      recentRecipesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  return (
    <div className="min-h-screen font-[family-name:var(--sr-font-body)]">
      {/* ─── Tầng 1: Hero & Search Section ─── */}
      <section className="relative overflow-hidden pt-6 pb-6">
        {/* Background glow & gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-28 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-100/15 rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--sr-primary)]/10 text-[var(--sr-primary)] border border-[var(--sr-primary)]/20 shadow-xs">
              <Sparkles size={13} /> Khám phá ẩm thực mỗi ngày
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight font-[family-name:var(--sr-font-heading)] bg-gradient-to-r from-[var(--sr-primary)] via-orange-600 to-amber-500 bg-clip-text text-transparent">
              Thắp sáng niềm đam mê vào bếp
            </h1>
            <p className="text-sm md:text-base text-[var(--sr-on-surface-variant)]">
              Tìm kiếm cảm hứng, biến tấu nguyên liệu thông minh và sẻ chia công thức độc đáo cùng hàng ngàn đầu bếp gia đình.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* ─── TRƯỜNG HỢP ĐANG TÌM KIẾM TỪ KHÓA (SEARCH MODE) ─── */}
      {searchKeyword ? (
        <section className="pb-16 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
                Kết quả tìm kiếm cho: <span className="text-[var(--sr-primary)]">"{searchKeyword}"</span>
              </h2>
              <span className="text-xs text-stone-400">({searchResults.length} công thức)</span>
            </div>
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
            >
              ✕ Xóa tìm kiếm
            </button>
          </div>

          {isSearchLoading ? (
            <div className="py-20 text-center text-stone-500">Đang tìm công thức...</div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white/60 rounded-3xl border border-stone-200 space-y-3">
              <Compass size={36} className="text-[var(--sr-primary)] mx-auto" />
              <h3 className="font-bold text-stone-800">Không tìm thấy công thức</h3>
              <p className="text-xs text-stone-500">Hãy thử tìm từ khóa khác hoặc xóa bộ lọc để duyệt toàn bộ món.</p>
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="px-5 py-2 bg-[var(--sr-primary)] text-white text-xs font-bold rounded-xl"
              >
                Quay lại trang khám phá
              </button>
            </div>
          )}
        </section>
      ) : (
        /* ─── GIAO DIỆN KHÁM PHÁ CHUẨN 5 PHẦN ─── */
        <div className="space-y-12 pb-16">
          {/* ════════════════════════════════════════════════════════════════════
              1. PHẦN TÂM ĐIỂM (BENTO SPOTLIGHT) - ĐỨNG ĐẦU TIÊN
          ════════════════════════════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Bento Spotlight Card: Top 3 Recipes Auto-rotating (8 cols) */}
              <div 
                onMouseEnter={() => setIsSpotlightPaused(true)}
                onMouseLeave={() => setIsSpotlightPaused(false)}
                className="lg:col-span-8 group relative rounded-[28px] overflow-hidden shadow-lg border border-amber-900/10 bg-stone-900 min-h-[360px] md:min-h-[400px] flex flex-col justify-end text-white transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/15"
              >
                {currentSpotlight ? (
                  <>
                    <img
                      key={`bg-${currentSpotlight.id}`}
                      src={currentSpotlight.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80'}
                      alt={currentSpotlight.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out opacity-75 animate-[sr-fadeIn_0.5s_ease-out]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Top Bar: Rank Badge, Like Count & Carousel Indicators */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--sr-primary)]/90 text-white backdrop-blur-md shadow-md">
                          <Sparkles size={13} />
                          {safeSpotlightIndex === 0 && '👑 #1 Tâm điểm tuần này'}
                          {safeSpotlightIndex === 1 && '🔥 #2 Đang thịnh hành'}
                          {safeSpotlightIndex === 2 && '✨ #3 Được yêu thích'}
                        </span>
                        {currentSpotlight.likeCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md text-amber-300 border border-amber-400/30">
                            <Flame size={13} className="fill-amber-300" />
                            {currentSpotlight.likeCount} lượt thích
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-md text-stone-300 border border-white/20">
                            <Clock size={12} className="text-stone-300" />
                            Mới đăng
                          </span>
                        )}
                      </div>

                      {/* Carousel Indicators / Progress Pills */}
                      {spotlightList.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/15 shadow-sm">
                          {spotlightList.map((item, idx) => (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSpotlightIndex(idx);
                              }}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === safeSpotlightIndex
                                  ? 'w-6 bg-amber-400 shadow-xs'
                                  : 'w-2 bg-white/40 hover:bg-white/80'
                              }`}
                              title={`Công thức #${idx + 1}: ${item.title}`}
                              aria-label={`Công thức #${idx + 1}: ${item.title}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Left/Right Arrow Navigation Controls (Visible on hover) */}
                    {spotlightList.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpotlightIndex((prev) => (prev - 1 + spotlightList.length) % spotlightList.length);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-90"
                          title="Công thức trước"
                          aria-label="Công thức trước"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpotlightIndex((prev) => (prev + 1) % spotlightList.length);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-90"
                          title="Công thức kế tiếp"
                          aria-label="Công thức kế tiếp"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Main Content Area with Smooth Fade In */}
                    <div key={`content-${currentSpotlight.id}`} className="relative z-10 p-6 md:p-8 space-y-3 max-w-2xl animate-[sr-fadeIn_0.4s_ease-out]">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300">
                        {currentSpotlight.author && (
                          <span className="font-semibold text-white">
                            Bởi {currentSpotlight.author.displayName || currentSpotlight.author.username || 'Smart Recipe'}
                          </span>
                        )}
                        <span>•</span>
                        {formatMinutes((currentSpotlight.prepTime || 0) + (currentSpotlight.cookTime || 0)) && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {formatMinutes((currentSpotlight.prepTime || 0) + (currentSpotlight.cookTime || 0))}
                          </span>
                        )}
                        <span>•</span>
                        <span>Độ khó: {DIFFICULTY_LABELS[currentSpotlight.difficulty] || 'Dễ'}</span>
                        {currentSpotlight.tags && currentSpotlight.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                              #{currentSpotlight.tags[0].name}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-[family-name:var(--sr-font-heading)] group-hover:text-amber-200 transition-colors line-clamp-1">
                        {currentSpotlight.title}
                      </h2>

                      {currentSpotlight.description && (
                        <p className="text-sm text-stone-200 line-clamp-2 leading-relaxed font-[family-name:var(--sr-font-body)]">
                          {currentSpotlight.description}
                        </p>
                      )}

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/recipes/${currentSpotlight.id}`)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--sr-primary)] text-white text-sm font-bold shadow-lg shadow-orange-900/30 hover:bg-[var(--sr-primary-light)] active:scale-95 transition-all cursor-pointer"
                        >
                          Xem cách nấu ngay
                          <ArrowRight size={16} />
                        </button>
                        {spotlightList.length > 1 && (
                          <span className="text-[11px] text-stone-400 hidden sm:inline">
                            Tự chuyển sau 5s • Rê chuột để dừng
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 flex flex-col justify-center items-center h-full text-center space-y-3">
                    <ChefHat size={44} className="text-amber-400 opacity-80" />
                    <h3 className="text-xl font-bold">Chào mừng bạn đến với Smart Recipe</h3>
                    <p className="text-sm text-stone-300 max-w-md">
                      Khám phá kho tàng công thức nấu ăn phong phú và biến bữa cơm gia đình thêm phần ấm cúng.
                    </p>
                  </div>
                )}
              </div>

              {/* 2 Bento Mini Cards (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* ─── Mini Card 1: AI Chef Assistant ─── */}
                <div className="flex-1 rounded-[26px] p-5 bg-gradient-to-br from-amber-500/10 via-orange-50 to-amber-100/40 border border-amber-200/70 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 border border-amber-300/60">
                      <Sparkles size={12} className="text-amber-700" /> Trợ lý AI Bếp Thông Minh
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 font-[family-name:var(--sr-font-heading)]">
                      Tủ lạnh đang có gì?
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Nhập nguyên liệu bạn đang có sẵn, AI Chef sẽ tự động gợi ý món ngon phù hợp trong vài giây.
                    </p>
                  </div>

                  <div className="pt-3 relative z-10">
                    <Link
                      to="/ai-suggestion"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--sr-primary)] hover:text-[var(--sr-primary-light)] group-hover:translate-x-1 transition-transform"
                    >
                      Thử gợi ý AI ngay
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* ─── Mini Card 2: Hành trình của bạn (Đo lường tiến trình danh hiệu) ─── */}
                {isAuthenticated ? (
                  <div className="flex-1 rounded-[26px] p-5 bg-gradient-to-br from-amber-500/10 via-orange-50 to-amber-100/40 border border-amber-200/70 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-2.5 relative z-10">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 border border-amber-300/60">
                          <Award size={13} className="text-amber-700" /> Thử thách ẩm thực
                        </div>
                        <span className="text-[11px] font-bold text-amber-900/80 bg-white/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-200/80 shadow-2xs">
                          Tháng này
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-stone-900 font-[family-name:var(--sr-font-heading)]">
                        Hành trình của bạn
                      </h3>

                      {/* Integrated Badge Showcase Box */}
                      <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-amber-200/80 shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-3">
                          {/* Medallion */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-[var(--sr-primary)] flex items-center justify-center text-white shadow-xs shrink-0">
                            <ChefHat size={20} className="drop-shadow-xs" />
                          </div>

                          {/* Badge Tier Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                Bếp Trưởng Tài Ba
                              </h4>
                              <span className="text-xs font-black text-[var(--sr-primary)] shrink-0">
                                {totalCooked} <span className="text-stone-400 font-medium text-[11px]">/ 15 món</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                              {remainingCooks > 0 
                                ? `Nấu thêm ${remainingCooks} món để mở khóa huy hiệu` 
                                : 'Đã xuất sắc hoàn thành danh hiệu!'}
                            </p>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-amber-100/90 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-[var(--sr-primary)] transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 rounded-[26px] p-5 bg-gradient-to-br from-amber-500/10 via-orange-50 to-amber-100/40 border border-amber-200/70 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-2 relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 border border-amber-300/60">
                        <BookOpen size={12} className="text-amber-700" /> Sổ tay vào bếp
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 font-[family-name:var(--sr-font-heading)]">
                        Ghi lại nhật ký nấu nướng
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Lưu giữ kỷ niệm mỗi lần vào bếp, đo lường khẩu phần và tích lũy huy hiệu vinh danh ẩm thực.
                      </p>
                    </div>

                    <div className="pt-3 relative z-10">
                      <Link
                        to="/features"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--sr-primary)] hover:text-[var(--sr-primary-light)] group-hover:translate-x-1 transition-transform"
                      >
                        Khám phá hệ thống tính năng
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              2. PHẦN CHỦ ĐỀ ẨM THỰC GỢI Ý & HÀNG 3 MÓN TRƯỢT NGANG
          ════════════════════════════════════════════════════════════════════ */}
          <section className="space-y-4">
            {/* Dải 7 thẻ chủ đề ảnh */}
            <VisualTopicCards 
              activeFilter={activeTopic} 
              onFilterChange={handleTopicChange} 
              topicCounts={topicCounts}
            />

            {/* Hàng các món ăn của chủ đề đó (Hiển thị sẵn 3 món, trượt sang phải, cuối hàng có nút xem tất cả) */}
            <TopicRecipeCarousel
              recipes={topicRecipes}
              isLoading={isTopicLoading}
              topicTitle={selectedTopicItem.title}
              topicKey={activeTopic}
              sortBy={topicSortBy}
              onSortChange={setTopicSortBy}
              isAuthenticated={isAuthenticated}
              openAuthModal={openAuthModal}
              onViewAll={() => {
                if (totalLatestPages > 1) {
                  handleLatestPageChange(1);
                } else {
                  recentRecipesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              3. KHỐI BÍ QUYẾT CỦA CHUYÊN GIA (EDITORIAL STORY BANNER)
          ════════════════════════════════════════════════════════════════════ */}
          <section>
            <EditorialStoryBanner />
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              4. PHẦN CÁC MÓN ĂN MỚI NHẤT ĐƯỢC ĐĂNG TẢI (CỐ ĐỊNH 2 HÀNG 3 CỘT & PHÂN TRANG)
          ════════════════════════════════════════════════════════════════════ */}
          <section ref={recentRecipesRef} id="recent-recipes-section" className="space-y-6 scroll-mt-20">
            {/* Header Món ăn mới nhất */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--sr-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-[var(--sr-primary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
                      Món ăn mới nhất được đăng tải
                    </h2>
                    {totalLatestPages > 1 && latestPage > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--sr-primary)]/10 text-[var(--sr-primary)] border border-[var(--sr-primary)]/20">
                        Trang {latestPage + 1} / {totalLatestPages}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-[var(--sr-on-surface-variant)]">
                    Những công thức mới nhất vừa được cộng đồng Smart Recipe chia sẻ
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-stone-400 self-start sm:self-auto">
                Sắp xếp: Mới nhất đến cũ nhất
              </div>
            </div>

            {/* Lưới công thức mới nhất - Cố định 2 hàng 3 cột (tối đa 6 món trên mỗi trang) */}
            {isLatestLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 rounded-2xl bg-stone-100/80 animate-pulse border border-stone-200/60" />
                ))}
              </div>
            ) : latestRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestRecipes.slice(0, 6).map((recipe, index) => (
                  <RevealOnScroll key={`${recipe.id}-${latestPage}`} delay={(index % 3) * 80}>
                    <RecipeCard recipe={recipe} />
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-500 bg-white/50 rounded-2xl border border-stone-200">
                {latestPage > 0 ? 'Chưa có công thức nào trên trang này.' : 'Chưa có công thức nào được đăng tải.'}
              </div>
            )}

            {/* Điều khiển phân trang theo yêu cầu:
                - Trang 1: Nút "Xem tất cả công thức (X món)" để nhảy sang Trang 2.
                - Từ Trang 2 trở đi: 2 lựa chọn [ ‹ Lùi lại ] và [ Tiếp theo › ], ở giữa là [ Trang X / Y ] */}
            {(totalLatestElements > 0 || latestPage > 0) && (
              <div className="flex items-center justify-center pt-3">
                {latestPage === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleLatestPageChange(1)}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md 
                               border border-stone-200/90 text-stone-800 text-sm font-bold 
                               shadow-xs hover:border-[var(--sr-primary)] hover:text-[var(--sr-primary)] 
                               hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer active:scale-95"
                  >
                    <span>Xem tất cả công thức ({totalLatestElements} món)</span>
                    <ArrowRight size={16} className="text-[var(--sr-primary)] group-hover:translate-x-1.5 transition-transform" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs">
                    {/* 1. Lựa chọn Lùi lại */}
                    <button
                      type="button"
                      onClick={() => handleLatestPageChange(latestPage - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-stone-700 hover:text-[var(--sr-primary)] hover:bg-stone-50 border border-stone-200/70 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={16} className="text-[var(--sr-primary)]" />
                      <span>Lùi lại</span>
                    </button>

                    {/* 2. Ở giữa: Vị trí trang đang đứng */}
                    <div className="px-3.5 py-2 rounded-xl bg-stone-100/90 text-stone-700 text-xs sm:text-sm font-bold border border-stone-200/50 select-none">
                      Trang <span className="text-[var(--sr-primary)] font-extrabold">{latestPage + 1}</span> / {Math.max(1, totalLatestPages)}
                    </div>

                    {/* 3. Lựa chọn Tiếp theo */}
                    <button
                      type="button"
                      disabled={latestPage >= totalLatestPages - 1}
                      onClick={() => handleLatestPageChange(latestPage + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-stone-700 hover:text-[var(--sr-primary)] hover:bg-stone-50 border border-stone-200/70 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      <span>Tiếp theo</span>
                      <ChevronRight size={16} className="text-[var(--sr-primary)]" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── Khối kêu gọi đóng góp cộng đồng ─── */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[var(--sr-primary)]/5 to-amber-100/50 
                            border border-[var(--sr-outline-variant)] text-center space-y-3
                            relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--sr-gold)]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--sr-primary)]/10 rounded-full text-[var(--sr-primary)] text-sm font-semibold mb-3">
                  <Sparkles size={16} />
                  Bạn có công thức nấu ăn tâm đắc?
                </div>
                <h3 className="text-2xl font-bold text-[var(--sr-on-surface)] font-[family-name:var(--sr-font-heading)]">
                  Chia sẻ kiệt tác ẩm thực của bạn
                </h3>
                <p className="text-sm text-[var(--sr-on-surface-variant)] max-w-lg mx-auto">
                  Đóng góp công thức độc đáo, ghi dấu tên bạn và truyền cảm hứng nấu nướng cho hàng ngàn thành viên Smart Recipe.
                </p>
                <Link
                  to="/recipes/new"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      openAuthModal('Tạo công thức');
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[var(--sr-primary)] text-white 
                             rounded-xl font-semibold hover:bg-[var(--sr-primary-light)] active:scale-95
                             transition-all duration-200 shadow-lg shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-900/30"
                >
                  <Plus size={18} />
                  Tạo công thức mới
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── Keyframe Animation ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}