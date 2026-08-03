import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import CommentSection from '../components/comment/CommentSection';

const STATUS_LABELS = {
  PUBLIC: { text: 'Công khai', color: 'bg-green-100 text-green-700' },
  PRIVATE: { text: 'Riêng tư', color: 'bg-gray-100 text-gray-700' },
  DRAFT: { text: 'Bản nháp', color: 'bg-yellow-100 text-yellow-700' },
  DELETED: { text: 'Đã xóa', color: 'bg-red-100 text-red-700' },
};

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

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
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [cloning, setCloning] = useState(false);

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const r = await recipeService.getById(id);
      setRecipe(r);
      setIsLiked(r.isLiked || false);
      setLikeCount(r.likeCount || 0);
    } catch (err) {
      toast.error('Không thể tải công thức');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

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
      toast.error('Sao chép thất bại');
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa công thức "${recipe?.title}"?`)) return;
    try {
      await recipeService.delete(id);
      toast.success('Đã xóa công thức');
      navigate('/recipes');
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const isOwner = currentUser?.id === recipe?.author?.id;

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) return null;

  const status = STATUS_LABELS[recipe.status] || { text: recipe.status, color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← Quay lại
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Image */}
        {recipe.imageUrl && (
          <div className="w-full h-64 md:h-80 bg-gray-100">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{recipe.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
              {status.text}
            </span>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-gray-600 mb-4">{recipe.description}</p>
          )}

          {/* Author */}
          {recipe.author && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium">
                {(recipe.author.displayName || recipe.author.username || '?')[0].toUpperCase()}
              </span>
              <span>{recipe.author.displayName || recipe.author.username}</span>
            </div>
          )}

          {/* Meta info bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            {recipe.prepTime > 0 && (
              <span className="flex items-center gap-1">
                <span>⏱</span> Chuẩn bị: {formatTime(recipe.prepTime)}
              </span>
            )}
            {recipe.cookTime > 0 && (
              <span className="flex items-center gap-1">
                <span>🔥</span> Nấu: {formatTime(recipe.cookTime)}
              </span>
            )}
            {recipe.difficulty && (
              <span className="flex items-center gap-1">
                <span>📊</span> {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span>🍽️</span> {recipe.baseServings || 1} phần
            </span>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recipe.tags.map((tag) => (
                <span key={tag.id} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Cloned from */}
          {recipe.clonedFromId && (
            <p className="text-xs text-gray-400 mb-4">
              📋 Sao chép từ{' '}
              <Link to={`/recipes/${recipe.clonedFromId}`} className="underline hover:text-emerald-600">
                công thức gốc
              </Link>
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            {/* Like button */}
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                isLiked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isLiked ? '❤️' : '🤍'} {likeCount}
            </button>

            {/* Clone button */}
            <button
              onClick={handleClone}
              disabled={cloning}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              📋 {cloning ? 'Đang sao chép...' : 'Sao chép'}
            </button>

            {/* Owner actions */}
            {isOwner && (
              <>
                <button
                  onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all flex items-center gap-1.5"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-1.5"
                >
                  🗑 Xóa
                </button>
              </>
            )}
          </div>

          {/* Nutrition summary */}
          {recipe.nutrition && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Dinh dưỡng (mỗi suất)</h3>
              <div className="flex flex-wrap gap-3 text-xs">
                {recipe.nutrition.caloriesPerServing != null && (
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-md">
                    🔥 {recipe.nutrition.caloriesPerServing} kcal
                  </span>
                )}
                {recipe.nutrition.proteinPerServing != null && (
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md">
                    💪 {recipe.nutrition.proteinPerServing}g protein
                  </span>
                )}
                {recipe.nutrition.carbsPerServing != null && (
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-md">
                    🍞 {recipe.nutrition.carbsPerServing}g carbs
                  </span>
                )}
                {recipe.nutrition.fatPerServing != null && (
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md">
                    🧈 {recipe.nutrition.fatPerServing}g fat
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🥕 Nguyên liệu</h2>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={ing.id || i}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="flex-1 text-gray-700">
                  {ing.ingredientName || `Nguyên liệu #${ing.ingredientId}`}
                </span>
                <span className="text-gray-500 font-medium">
                  {ing.amount} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-4">Chưa có nguyên liệu</p>
        )}
      </div>

      {/* Steps Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Các bước thực hiện</h2>
        {recipe.steps && recipe.steps.length > 0 ? (
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={step.id || i} className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {step.stepNumber || i + 1}
                </span>
                <p className="text-gray-700 pt-1 leading-relaxed">{step.instruction}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-400 text-center py-4">Chưa có bước thực hiện</p>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <CommentSection recipeId={Number(id)} />
      </div>
    </div>
  );
}
