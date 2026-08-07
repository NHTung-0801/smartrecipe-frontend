import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';

const DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function formatTime(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}ph` : `${h}h`;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=a13923&color=fff&size=80&font-size=0.4&bold=true';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const timeText = formatTime(totalTime);
  const diffText = DIFFICULTY_LABELS[recipe.difficulty] || null;

  // Author info
  const authorName = recipe.authorName || recipe.author?.displayName || recipe.author?.username || 'Ẩn danh';
  const authorAvatar = recipe.authorAvatarUrl || recipe.author?.avatarUrl || `${DEFAULT_AVATAR}&name=${encodeURIComponent(authorName)}`;

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-white/60 backdrop-blur-xl rounded-[24px] shadow-sm border border-white/50 p-2.5 hover:shadow-xl hover:shadow-amber-900/5 hover:border-white/80 hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer group flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
            <span className="text-6xl opacity-60">🍲</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-left badges: time & difficulty */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {timeText && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
              <Clock size={12} className="text-gray-500" />
              {timeText}
            </span>
          )}
          {diffText && (
            <span className="px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
              {diffText}
            </span>
          )}
        </div>

        {/* Top-right: like button */}
        <div className="absolute top-3 right-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all
            ${recipe.likeCount > 0 
              ? 'bg-white text-rose-500' 
              : 'bg-white/80 backdrop-blur-sm text-gray-400 group-hover:bg-white group-hover:text-rose-400'
            }`}
          >
            <Heart size={16} fill={recipe.likeCount > 0 ? 'currentColor' : 'none'} />
          </div>
        </div>

        {/* Status badge for non-public */}
        {recipe.status && recipe.status !== 'PUBLIC' && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-gray-900/60 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-sm">
              {recipe.status === 'PRIVATE' ? '🔒 Riêng tư' : recipe.status === 'DRAFT' ? '📝 Bản nháp' : recipe.status}
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="pt-4 pb-2 px-2 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#a13923] transition-colors duration-200">
          {recipe.title}
        </h3>
        
        {/* Author row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
            />
            <span className="text-sm text-gray-500 truncate">{authorName}</span>
          </div>

          {recipe.likeCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold flex-shrink-0 ml-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>{(recipe.likeCount * 0.8 + 3.2).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
