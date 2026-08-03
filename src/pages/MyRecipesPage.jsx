import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';

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

export default function MyRecipesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công thức "${title}"?`)) return;
    try {
      await recipeService.delete(id);
      toast.success('Đã xóa công thức');
      fetchRecipes(page);
    } catch (err) {
      toast.error('Xóa thất bại');
      console.error(err);
    }
  };

  const handleClone = async (id, title) => {
    try {
      await recipeService.clone(id);
      toast.success(`Đã sao chép công thức "${title}"`);
      fetchRecipes(page);
    } catch (err) {
      toast.error('Sao chép thất bại');
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📖 Công thức của tôi</h1>
          <p className="text-gray-500 mt-1">
            Quản lý tất cả công thức bạn đã tạo
          </p>
        </div>
        <Link
          to="/recipes/new"
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
        >
          <span>+</span> Tạo mới
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && recipes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có công thức nào</h3>
          <p className="text-gray-400 mb-6">Hãy tạo công thức đầu tiên của bạn!</p>
          <Link
            to="/recipes/new"
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all"
          >
            + Tạo công thức mới
          </Link>
        </div>
      )}

      {/* Recipe list */}
      {!loading && recipes.length > 0 && (
        <>
          <div className="space-y-4">
            {recipes.map((recipe) => {
              const status = STATUS_LABELS[recipe.status] || { text: recipe.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                          🍲
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="text-lg font-semibold text-gray-800 truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          onClick={() => navigate(`/recipes/${recipe.id}`)}
                        >
                          {recipe.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      {recipe.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
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
                        <span className="flex items-center gap-1">
                          <span>❤️</span> {recipe.likeCount || 0}
                        </span>
                      </div>

                      {/* Tags */}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        👁 Xem
                      </button>
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                        className="px-3 py-1.5 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleClone(recipe.id, recipe.title)}
                        className="px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="Nhân bản"
                      >
                        📋 Sao chép
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id, recipe.title)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Xóa"
                      >
                        🗑 Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => fetchRecipes(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchRecipes(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    i === page
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'border border-gray-300 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => fetchRecipes(page + 1)}
                disabled={page === totalPages - 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}