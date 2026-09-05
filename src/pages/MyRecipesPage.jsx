import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { Plus, Clock, Zap, Flame, Star, Sparkles, Edit3, Trash2, MoreVertical } from 'lucide-react';
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

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

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
  // Calculate total cooked times from all recipes
  const totalCooked = recipes.reduce((sum, r) => sum + (r.cookCount || 0), 0);
  
  // Fake stats for UI completeness (others)
  const totalViews = "24k"; 
  const favorites = 8; 

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    setDeleting(true);
    try {
      await recipeService.delete(recipeToDelete.id);
      toast.success('Đã xóa công thức');
      fetchRecipes(0);
    } catch (err) {
      toast.error('Lỗi khi xóa công thức');
      console.error(err);
    } finally {
      setDeleting(false);
      setRecipeToDelete(null);
    }
  };

  return (
    <div className={s.pageContainer}>
      
      {/* Header */}
      <div className={s.headerSection}>
        <div>
          <h1 className={s.pageTitle}>Sáng tạo món ngon</h1>
          <p className={s.pageSubtitle}>Khám phá và quản lý bộ sưu tập ẩm thực cá nhân của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/recipes/new" className={s.btnCreate}>
            <Plus size={18} /> Tạo công thức mới
          </Link>
        </div>
      </div>

      {/* Bento Stats */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <span className={s.statValue}>{totalRecipes}</span>
          <span className={s.statLabel}>Tổng công thức</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{totalCooked}</span>
          <span className={s.statLabel}>Tổng đã nấu</span>
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
          <Link 
            to={`/recipes/${recipe.id}`} 
            key={recipe.id} 
            className={s.recipeCard}
          >
            <div className={s.cardActions}>
              <button 
                className={`${s.btnMore} ${menuOpenId === recipe.id ? s.active : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === recipe.id ? null : recipe.id);
                }}
              >
                <MoreVertical size={18} />
              </button>
              
              {menuOpenId === recipe.id && (
                <div className={s.dropdownMenu}>
                  <button 
                    className={s.dropdownItem}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/recipes/${recipe.id}/edit`);
                    }}
                  >
                    <Edit3 size={16} /> Sửa
                  </button>
                  <button 
                    className={`${s.dropdownItem} ${s.delete}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRecipeToDelete(recipe);
                      setMenuOpenId(null);
                    }}
                    disabled={deleting}
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              )}
            </div>
            
            <div className={s.recipeImageWrapper}>
              {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.title} className={s.recipeImage} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl opacity-50">🍲</div>
              )}
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
                  <span>
                    {recipe.nutrition?.caloriesPerServing != null
                      ? `${Math.round(recipe.nutrition.caloriesPerServing)} kcal`
                      : '-- kcal'}
                  </span>
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
      <Link to="/ai-suggestion" className={s.aiFloatBtn}>
        <Sparkles size={20} /> Gợi ý thực đơn AI
      </Link>

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className={s.modalOverlay}>
          <div className={s.modalContent}>
            <div className={s.modalIcon}>
              <Trash2 size={24} color="#a13923" />
            </div>
            <h3 className={s.modalTitle}>Xóa công thức</h3>
            <p className={s.modalDesc}>
              Bạn có chắc chắn muốn xóa công thức <strong>{recipeToDelete.title}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className={s.modalActions}>
              <button 
                className={s.btnCancelModal} 
                onClick={() => setRecipeToDelete(null)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button 
                className={s.btnConfirmDelete} 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa công thức'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}