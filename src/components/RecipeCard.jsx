import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const status = STATUS_LABELS[recipe.status] || { text: recipe.status, color: 'bg-gray-100 text-gray-700' };

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 group-hover:scale-105 transition-transform duration-300">
            🍲
          </div>
        )}
        
        {/* Status Badge */}
        {recipe.status !== 'PUBLIC' && (
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm ${status.color}`}>
              {status.text}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>
        
        {recipe.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{recipe.description}</p>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium"
              >
                {tag.name}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-xs font-medium">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info bottom */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-gray-600">
              <span className="text-rose-500">❤️</span> {recipe.likeCount || 0}
            </span>
            {(recipe.prepTime > 0 || recipe.cookTime > 0) && (
              <span className="flex items-center gap-1">
                <span>⏱</span> {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}
              </span>
            )}
          </div>
          
          {recipe.difficulty && (
            <span className="font-medium text-gray-600">
              {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
