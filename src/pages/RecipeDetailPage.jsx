import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { 
  Heart, Share2, Copy, ArrowLeft, Clock, ShoppingCart, Play, List, Utensils, Soup, Globe, Lock
} from 'lucide-react';
import s from '../styles/pages/RecipeDetailPage.module.css';
import CookingMode from '../components/recipe/CookingMode';
import ShareRecipeModal from '../components/recipe/ShareRecipeModal';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200';

function formatTime(minutes) {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}ph` : `${h}h`;
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [recipe, setRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [cloning, setCloning] = useState(false);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Trạng thái các checkbox nguyên liệu
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await recipeService.getById(id);
        setRecipe(r);
        setIsLiked(r.isLiked || false);
        setLikeCount(r.likeCount || 0);

        // Fetch similar recipes
        const similarRes = await recipeService.getPublicRecipes(0, 3);
        setSimilarRecipes(similarRes.content || []);
      } catch (err) {
        toast.error('Không thể tải công thức');
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await recipeService.unlike(id);
        setIsLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await recipeService.like(id);
        setIsLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (err) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleClone = async () => {
    if (!window.confirm('Bạn có muốn sao chép công thức này về bộ sưu tập của mình?')) return;
    setCloning(true);
    try {
      const cloned = await recipeService.clone(id);
      toast.success('Đã sao chép công thức!');
      navigate(`/recipes/${cloned?.id}`);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi clone');
    } finally {
      setCloning(false);
    }
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fcfaf8]">
        <div className="w-10 h-10 border-4 border-[#a13923] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) return null;

  // Mock nutrition data if missing to match design
  const nutrition = recipe.nutrition || {
    caloriesPerServing: 540,
    proteinPerServing: 32,
    carbsPerServing: 65,
    fatPerServing: 18
  };

  return (
    <div className={s.pageContainer}>
      
      {/* 1. HERO BANNER */}
      <section className={s.heroSection}>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <img 
          src={recipe.imageUrl || DEFAULT_IMAGE} 
          alt={recipe.title} 
          className={s.heroImage}
        />
        <div className={s.heroOverlay} />
        
        <div className={s.heroContent}>
          <div className="flex justify-between items-end w-full gap-8">
            <div className="flex-1 max-w-[700px]">
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags && recipe.tags.length > 0 ? (
                  recipe.tags.map(tag => (
                    <span key={tag.id} className="px-3 py-1 bg-[#a13923] text-white text-xs font-semibold rounded-full shadow-md">
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-md">
                    Chưa có thẻ
                  </span>
                )}
              </div>
              
              <h1 className={s.title}>{recipe.title}</h1>
              <p className={s.description} style={{ marginBottom: 0 }}>
                {recipe.description || 'Hương vị tuyệt hảo đậm đà, mang đậm bản sắc truyền thống.'}
              </p>
            </div>

            <div className="flex gap-3 mb-2 shrink-0">
              <button onClick={handleLike} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isLiked ? 'bg-[#a13923] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <Share2 size={18} />
              </button>
              
              {currentUser && recipe.author && currentUser.id === recipe.author.id ? (
                <div 
                  className={`px-5 h-10 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors cursor-default
                    ${recipe.status === 'PUBLIC' 
                      ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-gray-700/90 text-white shadow-lg shadow-gray-900/20'
                    }`}
                >
                  {recipe.status === 'PUBLIC' ? <Globe size={16} /> : <Lock size={16} />} 
                  {recipe.status === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                </div>
              ) : (
                <button onClick={handleClone} disabled={cloning} className="px-5 h-10 rounded-full bg-[#a13923] text-white hover:bg-[#8b311e] font-semibold text-sm flex items-center gap-2 transition-colors">
                  <Copy size={16} /> {cloning ? 'Đang Clone...' : 'Clone'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. NUTRITION & TIME CARDS */}
      <section className={s.nutritionGrid}>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Chuẩn bị</span>
          <span className={s.nutriValue} style={{ color: '#a13923' }}>
            {formatTime(recipe.prepTime)}
          </span>
        </div>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Nấu</span>
          <span className={s.nutriValue} style={{ color: '#a13923' }}>
            {formatTime(recipe.cookTime)}
          </span>
        </div>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Calories</span>
          <span className={s.nutriValue} style={{ color: '#d94833' }}>{nutrition.caloriesPerServing} kcal</span>
        </div>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Protein</span>
          <span className={s.nutriValue} style={{ color: '#8b6b55' }}>{nutrition.proteinPerServing}g</span>
        </div>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Carbs</span>
          <span className={s.nutriValue} style={{ color: '#687858' }}>{nutrition.carbsPerServing}g</span>
        </div>
        <div className={s.nutriCard}>
          <span className={s.nutriLabel}>Fat</span>
          <span className={s.nutriValue} style={{ color: '#b99a6d' }}>{nutrition.fatPerServing}g</span>
        </div>
      </section>

      {/* 3. MAIN SPLIT CONTENT */}
      <section className={s.mainContent}>
        
        {/* LEFT COLUMN: INGREDIENTS */}
        <div className="space-y-6">
          <div className={s.ingredientsContainer}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={s.sectionTitle} style={{ marginBottom: 0 }}>
                <List className="text-[#a13923]" size={24} /> Nguyên liệu
              </h2>
              <span className="px-3 py-1 bg-[#efebe7] text-[#5c3e33] rounded-full text-xs font-semibold">{recipe.baseServings || 4} người ăn</span>
            </div>

            <div className="flex flex-col mb-8">
              {recipe.ingredients?.map((ing, idx) => (
                <div 
                  key={idx} 
                  className={`${s.ingredientItem} ${checkedIngredients[idx] ? s.checked : ''}`}
                  onClick={() => toggleIngredient(idx)}
                >
                  <div className={s.ingredientLeft}>
                    <div className={s.checkbox}>✓</div>
                    <span className="font-medium text-gray-800">{ing.ingredientName}</span>
                  </div>
                  <span className="text-gray-500 font-semibold">{ing.amount} {ing.unit}</span>
                </div>
              ))}
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <p className="text-gray-400 italic">Chưa có nguyên liệu</p>
              )}
            </div>

            <button 
              className="w-full py-3.5 rounded-full border-2 border-[#a13923] text-[#a13923] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#fff9f8] transition-colors"
              onClick={() => toast.info('Tính năng giỏ hàng đang được phát triển!')}
            >
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: STEPS */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className={s.sectionTitle} style={{ marginBottom: 0 }}>
              <Utensils className="text-[#a13923]" size={24} /> Các bước thực hiện
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCookingMode(true)}
                className="px-4 py-2 bg-[#a13923] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-[#8b311e] transition-colors shadow-sm"
              >
                <Play size={14} fill="currentColor" /> Bắt đầu nấu ăn
              </button>
            </div>
          </div>

          <div className={s.timeline}>
            {recipe.steps?.map((step, idx) => {
              // Extract first sentence as pseudo-title if possible
              const textParts = step.instruction.split(/(?<=\.)\s/);
              const pseudoTitle = textParts[0];
              const desc = textParts.slice(1).join(' ');

              return (
                <div key={idx} className={s.stepItem}>
                  <div className={s.stepNumber}>{step.stepNumber || idx + 1}</div>
                  <div className={s.stepCard}>
                    <div className={s.stepCardText}>
                      {desc ? (
                        <>
                          <h4 className={s.stepTitle}>{pseudoTitle}</h4>
                          <p className={s.stepDesc}>{desc}</p>
                        </>
                      ) : (
                        <p className={s.stepDesc} style={{ fontSize: '16px', fontWeight: 500, color: '#3d271d' }}>{step.instruction}</p>
                      )}
                    </div>
                    {step.imageUrl ? (
                      <img src={step.imageUrl} alt={`Bước ${idx + 1}`} className={s.stepCardImage} />
                    ) : (
                      <div className={s.stepCardImage}>
                        <Soup size={32} opacity={0.6} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {(!recipe.steps || recipe.steps.length === 0) && (
              <p className="text-gray-400 italic">Chưa có hướng dẫn các bước</p>
            )}
          </div>

          {recipe.steps?.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button onClick={() => setIsCookingMode(true)} className="px-8 py-4 bg-[#a13923] text-white rounded-full text-[15px] font-bold flex items-center gap-2 hover:bg-[#8b311e] transition-colors shadow-lg shadow-[#a13923]/30 hover:-translate-y-1">
                <Clock size={20} /> BẮT ĐẦU NẤU NGAY <ArrowLeft size={20} className="rotate-180 ml-1" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. SIMILAR RECIPES */}
      <section className="max-w-[1200px] mx-auto mt-20 px-5">
        <h2 className="font-heading text-2xl font-bold text-[#3d271d] mb-6">Món ngon tương tự</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarRecipes.map(r => (
            <Link key={r.id} to={`/recipes/${r.id}`} className="block group">
              <div className="rounded-2xl overflow-hidden mb-3 aspect-[4/3] bg-gray-100">
                <img 
                  src={r.imageUrl || DEFAULT_IMAGE} 
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#3d271d] group-hover:text-[#a13923] transition-colors mb-1">{r.title}</h3>
              <p className="text-sm text-gray-500">Người đăng: {r.authorName}</p>
            </Link>
          ))}
        </div>
      </section>
      

      {isCookingMode && (
        <CookingMode recipe={recipe} onClose={() => setIsCookingMode(false)} />
      )}

      <ShareRecipeModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        recipe={recipe} 
        onStatusChanged={setRecipe}
      />
    </div>
  );
}
