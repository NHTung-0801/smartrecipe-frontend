import React from 'react';
import { BookOpen, Heart, Users, UtensilsCrossed } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const UserWelcomeStats = ({ stats = {} }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const displayName = user.displayName || user.username || 'Đầu bếp';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const statItems = [
    {
      icon: <BookOpen size={18} />,
      value: stats.recipeCount ?? '--',
      label: 'Công thức',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: <Heart size={18} />,
      value: stats.likeCount ?? '--',
      label: 'Yêu thích',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      icon: <Users size={18} />,
      value: stats.followerCount ?? '--',
      label: 'Follower',
      color: 'text-sky-600 bg-sky-50',
    },
  ];

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glassmorphism card */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-5 px-6 py-5 
                      bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl
                      shadow-lg shadow-orange-900/5
                      font-[family-name:var(--sr-font-body)]">

        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--sr-outline-variant)] shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sr-primary)] to-[var(--sr-primary-light)] 
                            flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-orange-900/20">
              {avatarLetter}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-[var(--sr-on-surface-variant)]">
            Chào mừng trở lại 👋
          </p>
          <h2 className="text-xl font-bold text-[var(--sr-on-surface)] mt-0.5">
            {displayName}
          </h2>
          <p className="text-sm text-[var(--sr-on-surface-variant)] mt-1">
            Hôm nay bạn muốn nấu món gì?
          </p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-[var(--sr-outline-variant)]" />

        {/* Stats */}
        <div className="flex items-center gap-5">
          {statItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-lg font-bold text-[var(--sr-on-surface)] leading-none">
                {item.value}
              </span>
              <span className="text-xs text-[var(--sr-on-surface-variant)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserWelcomeStats;