import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { groceryService } from '../services/groceryService';
import { pantryService } from '../services/pantryService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { 
  Heart, Share2, Copy, ArrowLeft, Clock, ShoppingCart, Play, List, Utensils, Soup, Globe, Lock, Lightbulb, BarChart, Users, Timer
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

const CHEF_TIPS = [
  "Nướng gừng và hành tím trước khi cho vào nước dùng để tạo mùi thơm đặc trưng.",
  "Luôn vớt bọt thường xuyên để nước dùng được trong trẻo.",
  "Chần xương qua nước sôi có pha chút muối để khử mùi hôi hiệu quả.",
  "Để món xào giòn ngon, hãy để chảo thật nóng trước khi cho nguyên liệu vào.",
  "Thêm một chút muối khi luộc rau sẽ giúp rau giữ được màu xanh bắt mắt.",
  "Ướp thịt với một chút dầu ăn sẽ giúp gia vị thấm đều và thịt mềm hơn.",
  "Khi chiên, hãy rắc một ít bột mì vào chảo dầu để dầu không bị bắn.",
  "Sử dụng nước đá lạnh để sốc nhiệt rau củ sau khi luộc sẽ giúp rau giòn hơn.",
  "Để chanh vắt được nhiều nước, hãy lăn nhẹ chanh trên mặt bàn trước khi cắt."
];

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
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  
  // Trạng thái các checkbox nguyên liệu
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [pantryMap, setPantryMap] = useState({});
  const [randomTips, setRandomTips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [r, similarRes, pantryRes] = await Promise.all([
          recipeService.getById(id),
          recipeService.getPublicRecipes(0, 3),
          currentUser ? pantryService.getPantry() : Promise.resolve(null)
        ]);
        
        setRecipe(r);
        setIsLiked(r.isLiked || false);
        setLikeCount(r.likeCount || 0);
        setSimilarRecipes(similarRes.content || []);

        // Xử lý thông tin tủ nguyên liệu
        const pMap = {};
        if (pantryRes && pantryRes.data) {
          Object.values(pantryRes.data).flat().forEach(pi => {
            if (pi.ingredient && pi.ingredient.id) {
              const current = pMap[pi.ingredient.id] || 0;
              pMap[pi.ingredient.id] = current + (pi.quantityAvailable || 0);
            }
          });
        }
        setPantryMap(pMap);

        // Đánh dấu tự động các nguyên liệu đã đủ số lượng trong tủ
        const initialChecked = {};
        if (r.ingredients) {
          r.ingredients.forEach((ing, idx) => {
             const available = pMap[ing.ingredientId] || 0;
             if (available >= ing.amount) {
                 initialChecked[idx] = true;
             }
          });
        }
        setCheckedIngredients(initialChecked);
      } catch (err) {
        toast.error('Lỗi: ' + (err.response?.data?.message || err.message || err));
        console.error(err);
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Randomize tips initially
    const shuffled = [...CHEF_TIPS].sort(() => 0.5 - Math.random());
    setRandomTips(shuffled.slice(0, 3));

    // Rotate tips every 10 seconds
    const interval = setInterval(() => {
      setRandomTips([...CHEF_TIPS].sort(() => 0.5 - Math.random()).slice(0, 3));
    }, 10000);

    return () => clearInterval(interval);
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

  const handleAddToGroceryList = async () => {
    try {
      setAddingToGrocery(true);
      const res = await groceryService.generateFromRecipe(id);
      toast.success('Đã thêm nguyên liệu vào danh sách đi chợ!');
      const listId = res?.id;
      if (listId) navigate(`/grocery?list=${listId}`);
      else navigate('/grocery');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể thêm vào danh sách đi chợ');
    } finally {
      setAddingToGrocery(false);
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

  // Nutrition data from backend (null if not available)
  const nutrition = recipe.nutrition || null;

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
              <p className={s.description} style={{ marginBottom: '24px' }}>
                {recipe.description || 'Hương vị tuyệt hảo đậm đà, mang đậm bản sắc truyền thống.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Chuẩn bị */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#3d271d]/40 backdrop-blur-md border border-white/20 text-white shadow-xl">
                  <Clock size={20} className="text-white/90" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Chuẩn bị</span>
                    <span className="text-sm font-bold">{formatTime(recipe.prepTime)}</span>
                  </div>
                </div>

                {/* Nấu */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#3d271d]/40 backdrop-blur-md border border-white/20 text-white shadow-xl">
                  <Timer size={20} className="text-white/90" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Nấu</span>
                    <span className="text-sm font-bold">{formatTime(recipe.cookTime)}</span>
                  </div>
                </div>

                {/* Độ khó */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#3d271d]/40 backdrop-blur-md border border-white/20 text-white shadow-xl">
                  <BarChart size={20} className="text-white/90" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Độ khó</span>
                    <span className="text-sm font-bold">
                      {recipe.difficulty === 'EASY' ? 'Dễ nấu' : recipe.difficulty === 'MEDIUM' ? 'Trung bình' : recipe.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
                    </span>
                  </div>
                </div>

                {/* Khẩu phần */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#3d271d]/40 backdrop-blur-md border border-white/20 text-white shadow-xl">
                  <Users size={20} className="text-white/90" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Khẩu phần</span>
                    <span className="text-sm font-bold">{recipe.baseServings || 4} người</span>
                  </div>
                </div>
              </div>
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
                      ? 'bg-[#a13923] text-white shadow-lg shadow-[#a13923]/30' 
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

      {/* NUTRITION BANNER */}
      <section className="max-w-[1200px] mx-auto px-5 mt-8 mb-2">
        <div style={{
          background: 'linear-gradient(135deg, #3d271d 0%, #5c3e33 60%, #a13923 100%)',
          borderRadius: '24px',
          padding: '28px 36px',
          boxShadow: '0 8px 32px rgba(161,57,35,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {/* Label */}
          <div style={{ marginRight: '8px', minWidth: '120px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Dinh dưỡng
            </div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>
              mỗi khẩu phần
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.15)', marginRight: '8px' }} />

          {/* Calories */}
          <div style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '0 12px' }}>
            <div style={{ color: '#ffb347', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
              {nutrition?.caloriesPerServing != null ? Math.round(nutrition.caloriesPerServing) : '--'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              kcal
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Protein */}
          <div style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '0 12px' }}>
            <div style={{ color: '#7ecfff', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
              {nutrition?.proteinPerServing != null ? (
                <>
                  {Math.round(nutrition.proteinPerServing)}
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>g</span>
                </>
              ) : '--'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Protein
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Carbs */}
          <div style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '0 12px' }}>
            <div style={{ color: '#a8e6a3', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
              {nutrition?.carbsPerServing != null ? (
                <>
                  {Math.round(nutrition.carbsPerServing)}
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>g</span>
                </>
              ) : '--'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Carbs
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Fat */}
          <div style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '0 12px' }}>
            <div style={{ color: '#f9a8d4', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
              {nutrition?.fatPerServing != null ? (
                <>
                  {Math.round(nutrition.fatPerServing)}
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>g</span>
                </>
              ) : '--'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Chất béo
            </div>
          </div>

          {/* Note */}
          <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'right', minWidth: '110px' }}>
            * Ước tính từ<br />nguyên liệu AI
          </div>
        </div>
      </section>

      {/* MAIN SPLIT CONTENT */}
      <section className={s.mainContent}>
        
        {/* LEFT COLUMN: INGREDIENTS */}
        <div className="space-y-6">
          <div className={s.ingredientsContainer}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-[26px] font-bold text-[#3d271d] flex items-center gap-2" style={{ marginBottom: 0 }}>
                <List size={24} className="text-[#a13923]" />
                Nguyên liệu
              </h2>
              <span className="px-3 py-1 bg-[#efebe7] text-[#a13923] rounded-full text-sm font-semibold">
                {recipe.ingredients?.length || 0} mục
              </span>
            </div>

            <div className="flex flex-col mb-6">
              {recipe.ingredients?.map((ing, idx) => {
                const available = pantryMap[ing.ingredientId] || 0;
                const isSufficient = available >= ing.amount;
                
                return (
                <div 
                  key={idx} 
                  className={`${s.ingredientItem} ${checkedIngredients[idx] ? s.checked : ''}`}
                  onClick={() => toggleIngredient(idx)}
                >
                  <div className={s.ingredientLeft}>
                    <div className={s.checkbox}>✓</div>
                    <span className="font-medium text-gray-800">{ing.ingredientName}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500 font-semibold">{ing.amount} {ing.unit}</span>
                    {currentUser && !checkedIngredients[idx] && (
                      <span className={`text-[11px] font-medium mt-1 px-2 py-0.5 rounded-md ${available > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-500'}`}>
                        {available > 0 ? `Chỉ có ${available} ${ing.unit}` : 'Chưa có trong tủ'}
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <p className="text-gray-400 italic">Chưa có nguyên liệu</p>
              )}
            </div>

            <button 
              className="w-full py-3 rounded-2xl bg-[#efebe7] text-[#8b6b55] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#e4dfd9] transition-colors disabled:opacity-60"
              onClick={handleAddToGroceryList}
              disabled={addingToGrocery}
            >
              <ShoppingCart size={18} /> {addingToGrocery ? 'Đang thêm...' : 'Thêm vào danh sách mua sắm'}
            </button>
          </div>

          {/* CHEF TIPS */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbf8 0%, #fff8f4 100%)',
            borderRadius: '24px',
            padding: '28px',
            border: '1.5px solid #f0e4da',
            boxShadow: '0 4px 20px rgba(161,57,35,0.05)',
          }}>
            <h3 className="font-heading text-[19px] font-bold text-[#3d271d] mb-5 flex items-center gap-2">
              <Lightbulb size={20} className="text-[#a13923]" /> Mẹo từ đầu bếp
            </h3>
            <ul className="space-y-3">
              {randomTips.map((tip, idx) => {
                const colors = [
                  { bg: 'rgba(161,57,35,0.12)', text: '#a13923' },
                  { bg: 'rgba(230,150,80,0.15)', text: '#b8611a' },
                  { bg: 'rgba(100,160,100,0.12)', text: '#3d7a3d' },
                  { bg: 'rgba(80,130,200,0.12)', text: '#2a6aad' },
                ];
                const c = colors[idx % colors.length];
                return (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      transition: 'background 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(161,57,35,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      minWidth: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: c.bg,
                      color: c.text,
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      {idx + 1}
                    </span>
                    <span className="text-[15px] text-[#5c3e33] leading-relaxed">{tip}</span>
                  </li>
                );
              })}
            </ul>
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
              return (
                <div key={idx} className={`${s.stepItem} group`}>
                  <div className={`${s.stepNumber} transition-all duration-300 group-hover:bg-[#a13923] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_0_10px_#fcfaf8,0_4px_10px_rgba(161,57,35,0.3)]`}>
                    {step.stepNumber || idx + 1}
                  </div>
                  <div className={`${s.stepCard} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg border border-transparent group-hover:border-[#a13923]/10`}>
                    <div className={s.stepCardText}>
                      {step.title ? (
                        <>
                          <h4 className={`${s.stepTitle} transition-colors duration-300 group-hover:text-[#a13923]`}>{step.title}</h4>
                          <p className={s.stepDesc}>{step.instruction}</p>
                        </>
                      ) : (
                        <p className={`${s.stepDesc} transition-colors duration-300 group-hover:text-[#a13923]`} style={{ fontSize: '16px', fontWeight: 500, color: '#3d271d' }}>{step.instruction}</p>
                      )}
                    </div>
                    {step.imageUrl ? (
                      <img src={step.imageUrl} alt={`Bước ${idx + 1}`} className={`${s.stepCardImage} transition-transform duration-500 group-hover:scale-105`} />
                    ) : (
                      <div className={`${s.stepCardImage} transition-transform duration-500 group-hover:scale-105`}>
                        <Soup size={32} opacity={0.6} className="transition-all duration-300 group-hover:opacity-100 group-hover:text-[#a13923]" />
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
