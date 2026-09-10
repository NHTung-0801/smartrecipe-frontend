import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useAuthPromptStore from '../store/useAuthPromptStore';
import useLikedRecipes from '../hooks/useLikedRecipes';

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

const RecipeCard = ({ recipe, rankingIndex = null }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthPromptStore((state) => state.openModal);
  const { isLiked: checkIsLiked, toggleLike } = useLikedRecipes();

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const timeText = formatTime(totalTime);
  const diffText = DIFFICULTY_LABELS[recipe.difficulty] || null;

  const isLiked = checkIsLiked(recipe.id);
  const [likeDelta, setLikeDelta] = useState(0);

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('Lưu công thức yêu thích');
      return;
    }
    setLikeDelta((prev) => (isLiked ? prev - 1 : prev + 1));
    toggleLike(recipe.id);
  };

  const effectiveLikeCount = Math.max(0, (recipe.likeCount || 0) + likeDelta);

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* 1. Top-left: ONLY Ranking badge if applicable */}
        {rankingIndex !== null && rankingIndex !== undefined && rankingIndex < 3 && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-md ${
              rankingIndex === 0 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 ring-1 ring-amber-400/60' 
                : rankingIndex === 1 
                  ? 'bg-gradient-to-r from-slate-500 to-gray-600 ring-1 ring-slate-400/60' 
                  : 'bg-gradient-to-r from-amber-700 to-amber-800 ring-1 ring-amber-600/60'
            }`}>
              {rankingIndex === 0 ? '🏆 #1' : rankingIndex === 1 ? '🥈 #2' : '🥉 #3'} Thịnh hành
            </span>
          </div>
        )}

        {/* 2. Top-right: Like button with onClick toggle */}
        <div 
          className="absolute top-3 right-3 z-10"
          onClick={handleLikeToggle}
        >
          <button
            type="button"
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer ${
              isLiked 
                ? 'bg-white text-rose-500 ring-2 ring-rose-300 shadow-rose-200' 
                : 'bg-white/85 backdrop-blur-sm text-stone-400 hover:bg-white hover:text-rose-500'
            }`}
            title={isLiked ? 'Bỏ thích công thức' : 'Yêu thích công thức'}
            aria-label={isLiked ? 'Bỏ thích công thức' : 'Yêu thích công thức'}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-rose-500 scale-110 transition-transform' : ''} />
          </button>
        </div>

        {/* 3. Bottom-left: Difficulty badge */}
        {diffText && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-stone-800 shadow-md border border-white/70">
              {diffText}
            </span>
          </div>
        )}

        {/* 4. Bottom-right: Cook time badge */}
        {timeText && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-stone-800 shadow-md border border-white/70">
              <Clock size={12} className="text-[var(--sr-primary)]" />
              {timeText}
            </span>
          </div>
        )}

        {/* Status badge for non-public if needed */}
        {recipe.status && recipe.status !== 'PUBLIC' && (
          <div className="absolute top-12 left-3 z-10">
            <span className="px-2.5 py-1 bg-gray-900/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-sm">
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

          {effectiveLikeCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-500 flex-shrink-0 ml-2">
              <Heart size={13} fill="currentColor" />
              <span>{effectiveLikeCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
