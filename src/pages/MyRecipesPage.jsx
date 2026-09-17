import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { Plus, Clock, Zap, Flame, Star, Sparkles, Edit3, Trash2, MoreVertical, Utensils, CheckCircle2, Lock, FileText, Copy } from 'lucide-react';
import s from '../styles/pages/MyRecipesPage.module.css';
import fx from '../styles/effects.module.css';

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Vừa',
  HARD: 'Khó',
};

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả', icon: Sparkles, countKey: 'total' },
  { id: 'PENDING_REVIEW', label: 'Chờ duyệt', icon: Clock, countKey: 'pendingCount' },
  { id: 'PUBLIC', label: 'Đã công khai', icon: CheckCircle2, countKey: 'publicCount' },
  { id: 'PRIVATE', label: 'Riêng tư / Nháp', icon: Lock, countKey: 'privateCount' },
];

function formatTime(minutes) {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes}p`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}p` : `${h}h`;
}

export default function MyRecipesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [recipes, setRecipes] = useState([]);
  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const fetchAllForStats = async () => {
    try {
      const data = await recipeService.getMyRecipes(0, 100, '');
      setAllUserRecipes(data.content || []);
    } catch (err) {
      console.error('Failed to fetch all recipes for stats', err);
    }
  };

  const fetchRecipes = async (pageNum = 0, currentFilter = statusFilter) => {
    setLoading(true);
    try {
      const data = await recipeService.getMyRecipes(pageNum, 12, currentFilter === 'ALL' ? '' : currentFilter);
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
    fetchAllForStats();
    fetchRecipes(0, 'ALL');
  }, []);

  // 100% Real Stats Calculation
  const stats = useMemo(() => {
    const list = allUserRecipes.length > 0 ? allUserRecipes : recipes;
    const total = list.length;
    const totalLikes = list.reduce((sum, r) => sum + (r.likeCount || 0), 0);
    const totalCooked = list.reduce((sum, r) => sum + (r.cookCount || 0), 0);
    const totalClones = list.reduce((sum, r) => sum + (r.cloneCount || 0), 0);
    const publicCount = list.filter((r) => r.status === 'PUBLIC').length;
    const pendingCount = list.filter((r) => r.status === 'PENDING_REVIEW').length;
    const privateCount = list.filter((r) => r.status === 'PRIVATE' || r.status === 'DRAFT').length;
    const totalIngredients = list.reduce((sum, r) => sum + (r.ingredientCount || 0), 0);
    return { total, totalLikes, totalCooked, totalClones, publicCount, pendingCount, privateCount, totalIngredients };
  }, [allUserRecipes, recipes]);

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    setDeleting(true);
    try {
      await recipeService.delete(recipeToDelete.id);
      toast.success('Đã xóa công thức');
      fetchRecipes(0, statusFilter);
      fetchAllForStats();
    } catch (err) {
      toast.error('Lỗi khi xóa công thức');
      console.error(err);
    } finally {
      setDeleting(false);
      setRecipeToDelete(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <div className={`${s.statusBadge} ${s.statusPending}`}>
            <Clock size={11} />
            <span>Chờ duyệt</span>
          </div>
        );
      case 'PUBLIC':
        return (
          <div className={`${s.statusBadge} ${s.statusPublic}`}>
            <CheckCircle2 size={11} />
            <span>Công khai</span>
          </div>
        );
      case 'PRIVATE':
        return (
          <div className={`${s.statusBadge} ${s.statusPrivate}`}>
            <Lock size={11} />
            <span>Riêng tư</span>
          </div>
        );
      case 'DRAFT':
        return (
          <div className={`${s.statusBadge} ${s.statusDraft}`}>
            <FileText size={11} />
            <span>Bản nháp</span>
          </div>
        );
      default:
        return null;
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

      {/* Bento Stats (100% Real User Stats) */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <span className={s.statValue}>{stats.total}</span>
          <span className={s.statLabel}>Tổng công thức</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{stats.totalLikes}</span>
          <span className={s.statLabel}>Số lượt thích</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{stats.totalCooked}</span>
          <span className={s.statLabel}>Tổng đã nấu</span>
        </div>
        <div className={s.statCard}>
          <span className={s.statValue}>{stats.totalClones}</span>
          <span className={s.statLabel}>Lượt biến tấu</span>
        </div>
      </div>

      {/* Status Filter Tabs (Full-Width Segmented Bar Spanning Recipe Grid) */}
      <div className={s.filterSection}>
        {STATUS_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count = stats[tab.countKey] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${s.statusTab} ${statusFilter === tab.id ? s.active : ''}`}
              onClick={() => {
                setStatusFilter(tab.id);
                fetchRecipes(0, tab.id);
              }}
            >
              {TabIcon && <TabIcon size={15} />}
              <span>{tab.label}</span>
              <span className={`${s.tabCountBadge} ${tab.id === 'PENDING_REVIEW' && count > 0 ? s.alert : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
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
              {/* Status Badge */}
              {renderStatusBadge(recipe.status)}

              {/* Cloned Badge */}
              {recipe.clonedFromId && (
                <div 
                  className={`${s.statusBadge} ${s.statusClone}`}
                  style={{ top: '42px' }}
                  title="Công thức sao chép / biến tấu"
                >
                  <Copy size={11} />
                  <span>Bản sao</span>
                </div>
              )}

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
              
              {/* 4-item Meta: Time, Difficulty, Calo, Ingredients */}
              <div className={s.recipeMeta}>
                <div className={s.metaItem} title="Thời gian chuẩn bị & nấu">
                  <Clock size={13} className={s.metaIcon} />
                  <span>{formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}</span>
                </div>
                <div className={s.metaItem} title="Độ khó">
                  <Zap size={13} className={s.metaIcon} />
                  <span>{DIFFICULTY_LABELS[recipe.difficulty] || 'Vừa'}</span>
                </div>
                <div className={s.metaItem} title="Calo mỗi khẩu phần">
                  <Flame size={13} className={s.metaIcon} />
                  <span>
                    {recipe.nutrition?.caloriesPerServing != null
                      ? `${Math.round(recipe.nutrition.caloriesPerServing)}k`
                      : '--'}
                  </span>
                </div>
                <div className={s.metaItem} title="Số lượng nguyên liệu">
                  <Utensils size={13} className={s.metaIcon} />
                  <span>
                    {recipe.ingredientCount != null
                      ? `${recipe.ingredientCount} NL`
                      : (recipe.ingredients?.length ? `${recipe.ingredients.length} NL` : '--')}
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