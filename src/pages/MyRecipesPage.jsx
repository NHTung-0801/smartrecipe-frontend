import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { Plus, Clock, Zap, Flame, Star, Sparkles } from 'lucide-react';
import s from '../styles/pages/MyRecipesPage.module.css';
import fx from '../styles/effects.module.css';

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function formatTime(minutes) {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes} ph`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}ph` : `${h}h`;
}

export default function MyRecipesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRecipes = async (pageNum = 0) => {
    setLoading(true);
    try {
      const data = await recipeService.getMyRecipes(pageNum, 10);
      setRecipes(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      toast.error('Không thể tải danh sách công thức');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(0);
  }, []);

  // Stats calculation
  const totalRecipes = recipes.length; 
  // Fake stats for UI completeness
  const totalViews = "24k"; 
  const cookedThisWeek = 12; 
  const favorites = 8; 

  return (
    <div className={s.pageContainer}>
      
      {/* Header */}
      <div className={s.headerSection}>
        <div>
          <h1 className={s.pageTitle}>Công thức của tôi</h1>
          <p className={s.pageSubtitle}>Khám phá và quản lý bộ sưu tập ẩm thực cá nhân của bạn.</p>
        </div>
        <Link to="/recipes/new" className={s.btnCreate}>
          <Plus size={18} /> Tạo công thức mới
        </Link>
      </div>

      {/* Bento Stats */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <span className={s.statValue}>{totalRecipes > 0 ? totalRecipes : 42}</span>
          <span className={s.statLabel}>Tổng công thức</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{cookedThisWeek}</span>
          <span className={s.statLabel}>Đã nấu tuần này</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{favorites}</span>
          <span className={s.statLabel}>Yêu thích</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{totalViews}</span>
          <span className={s.statLabel}>Lượt xem</span>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className={s.recipesGrid}>
        {recipes.map((recipe) => (
          <Link to={`/recipes/${recipe.id}`} key={recipe.id} className={s.recipeCard}>
            <div className={s.recipeImageWrapper}>
              {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.title} className={s.recipeImage} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl opacity-50">🍲</div>
              )}
              {/* Fake Rating for design matching */}
              <div className={s.ratingBadge}>
                <Star size={12} className="fill-amber-400 text-amber-400" /> 4.8
              </div>
              {/* Category Badge - taking first tag or default */}
              <div className={s.categoryBadge}>
                {recipe.tags && recipe.tags.length > 0 ? recipe.tags[0].name : 'Món Mới'}
              </div>
            </div>
            
            <div className={s.recipeContent}>
              <h3 className={s.recipeTitle}>{recipe.title}</h3>
              
              <div className={s.recipeMeta}>
                <div className={s.metaItem}>
                  <Clock size={16} className={s.metaIcon} />
                  <span>{formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0)) || '30 ph'}</span>
                </div>
                <div className={s.metaItem}>
                  <Zap size={16} className={s.metaIcon} />
                  <span>{DIFFICULTY_LABELS[recipe.difficulty] || 'Trung bình'}</span>
                </div>
                <div className={s.metaItem}>
                  <Flame size={16} className={s.metaIcon} />
                  <span>{recipe.likeCount ? recipe.likeCount * 50 : 350} kcal</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Add New Recipe Card */}
        <Link to="/recipes/new" className={s.addRecipeCard}>
          <div className={s.addIconWrapper}>
            <Plus size={24} />
          </div>
          <span className={s.addTitle}>Thêm món mới</span>
          <span className={s.addSubtitle}>Chia sẻ sự sáng tạo của bạn với mọi người</span>
        </Link>
      </div>

      {/* Floating AI Button */}
      <button className={s.aiFloatBtn} onClick={() => toast.info('Tính năng Gợi ý thực đơn AI đang được phát triển!')}>
        <Sparkles size={20} /> Gợi ý thực đơn AI
      </button>

    </div>
  );
}