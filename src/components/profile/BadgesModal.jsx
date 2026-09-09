import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles, ChevronRight, Trophy, ChefHat, Users, Calendar, Star } from 'lucide-react';
import { toast } from 'react-toastify';

export const BADGE_DEFINITIONS = [
  // Nhóm 1: Sáng tạo món ngon (Dựa trên recipeCount công khai)
  {
    id: 'first_recipe',
    category: 'recipes',
    categoryName: 'Sáng tạo món ngon',
    title: 'Đầu bếp khởi đầu',
    description: 'Đã đóng góp món ăn đầu tiên lên Smart Recipe',
    icon: '🍳',
    colorClasses: 'from-orange-50 to-rose-50 text-[#a13923] border-[#fbdcd5]',
    checkUnlocked: (profile) => (profile?.recipeCount || 0) >= 1,
    progress: (profile) => ({
      current: Math.min(profile?.recipeCount || 0, 1),
      target: 1,
      unit: 'công thức'
    }),
  },
  {
    id: 'recipes_2',
    category: 'recipes',
    categoryName: 'Sáng tạo món ngon',
    title: 'Lan tỏa cảm hứng',
    description: 'Chia sẻ từ 2 công thức nấu ăn phong phú cho cộng đồng',
    icon: '🔥',
    colorClasses: 'from-amber-50 to-orange-100 text-amber-900 border-amber-200',
    checkUnlocked: (profile) => (profile?.recipeCount || 0) >= 2,
    progress: (profile) => ({
      current: Math.min(profile?.recipeCount || 0, 2),
      target: 2,
      unit: 'công thức'
    }),
  },
  {
    id: 'recipes_5',
    category: 'recipes',
    categoryName: 'Sáng tạo món ngon',
    title: 'Bậc thầy món ngon',
    description: 'Sáng tạo từ 5 công thức ẩm thực chất lượng cao',
    icon: '👑',
    colorClasses: 'from-yellow-50 to-amber-100 text-yellow-900 border-yellow-300',
    checkUnlocked: (profile) => (profile?.recipeCount || 0) >= 5,
    progress: (profile) => ({
      current: Math.min(profile?.recipeCount || 0, 5),
      target: 5,
      unit: 'công thức'
    }),
  },
  {
    id: 'recipes_10',
    category: 'recipes',
    categoryName: 'Sáng tạo món ngon',
    title: 'Đại sứ ẩm thực',
    description: 'Bộ sưu tập ẩm thực đồ sộ với hơn 10 công thức',
    icon: '🌟',
    colorClasses: 'from-rose-50 to-red-100 text-rose-900 border-rose-300',
    checkUnlocked: (profile) => (profile?.recipeCount || 0) >= 10,
    progress: (profile) => ({
      current: Math.min(profile?.recipeCount || 0, 10),
      target: 10,
      unit: 'công thức'
    }),
  },

  // Nhóm 2: Bạn bếp & Cộng đồng (Dựa trên followerCount)
  {
    id: 'follower_1',
    category: 'social',
    categoryName: 'Kết nối & Bạn bếp',
    title: 'Kết nối bạn bếp',
    description: 'Có bạn bếp đầu tiên quan tâm và theo dõi gian bếp',
    icon: '🤝',
    colorClasses: 'from-blue-50 to-indigo-50 text-blue-900 border-blue-200',
    checkUnlocked: (profile) => (profile?.followerCount || 0) >= 1,
    progress: (profile) => ({
      current: Math.min(profile?.followerCount || 0, 1),
      target: 1,
      unit: 'người theo dõi'
    }),
  },
  {
    id: 'follower_5',
    category: 'social',
    categoryName: 'Kết nối & Bạn bếp',
    title: 'Được mến mộ',
    description: 'Được từ 5 bạn bếp yêu thích và bấm theo dõi',
    icon: '💖',
    colorClasses: 'from-pink-50 to-rose-50 text-pink-900 border-pink-200',
    checkUnlocked: (profile) => (profile?.followerCount || 0) >= 5,
    progress: (profile) => ({
      current: Math.min(profile?.followerCount || 0, 5),
      target: 5,
      unit: 'người theo dõi'
    }),
  },
  {
    id: 'follower_20',
    category: 'social',
    categoryName: 'Kết nối & Bạn bếp',
    title: 'Ngôi sao gian bếp',
    description: 'Đạt mốc 20 bạn bếp đồng hành trong hành trình nấu nướng',
    icon: '✨',
    colorClasses: 'from-purple-50 to-violet-100 text-purple-900 border-purple-300',
    checkUnlocked: (profile) => (profile?.followerCount || 0) >= 20,
    progress: (profile) => ({
      current: Math.min(profile?.followerCount || 0, 20),
      target: 20,
      unit: 'người theo dõi'
    }),
  },

  // Nhóm 3: Đồng hành & Hồ sơ (Dựa trên createdAt & profile details)
  {
    id: 'member_official',
    category: 'community',
    categoryName: 'Đồng hành Smart Recipe',
    title: 'Thành viên chính thức',
    description: 'Đã hoàn tất đăng ký tài khoản tại Smart Recipe',
    icon: '🏅',
    colorClasses: 'from-[#fff9f6] to-[#fff0ea] text-[#796255] border-[#e4d5cc]',
    checkUnlocked: () => true,
    progress: () => ({ current: 1, target: 1, unit: 'hoàn thành' }),
  },
  {
    id: 'profile_complete',
    category: 'community',
    categoryName: 'Đồng hành Smart Recipe',
    title: 'Hồ sơ chỉn chu',
    description: 'Đã cập nhật ảnh đại diện và lời giới thiệu tiểu sử bản thân',
    icon: '📝',
    colorClasses: 'from-emerald-50 to-teal-50 text-emerald-900 border-emerald-200',
    checkUnlocked: (profile) => Boolean(profile?.bio && profile?.bio.trim().length > 0 && profile?.avatarUrl),
    progress: (profile) => {
      let count = 0;
      if (profile?.bio && profile?.bio.trim().length > 0) count++;
      if (profile?.avatarUrl) count++;
      return { current: count, target: 2, unit: 'bước hoàn tất' };
    },
  },
  {
    id: 'senior_member',
    category: 'community',
    categoryName: 'Đồng hành Smart Recipe',
    title: 'Bạn bếp gắn kết',
    description: 'Đồng hành cùng Smart Recipe từ 30 ngày trở lên',
    icon: '💎',
    colorClasses: 'from-cyan-50 to-blue-50 text-cyan-900 border-cyan-200',
    checkUnlocked: (profile) => {
      if (!profile?.createdAt) return false;
      const days = (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return days >= 30;
    },
    progress: (profile) => {
      if (!profile?.createdAt) return { current: 1, target: 30, unit: 'ngày' };
      const days = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return { current: Math.min(days, 30), target: 30, unit: 'ngày' };
    },
  }
];

// Helper: Lấy danh sách ID huy hiệu được ghim để hiển thị trên profile (tối đa 3)
export const getPinnedBadgeIds = (userId, profile) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`smartrecipe_pinned_badges_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Lọc lại để chỉ hiển thị những huy hiệu thực sự đã mở khóa
        const validUnlocked = parsed.filter(badgeId => {
          const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
          return def ? def.checkUnlocked(profile) : false;
        });
        if (validUnlocked.length > 0) {
          return validUnlocked.slice(0, 3);
        }
      }
    }
  } catch (e) {
    console.error('Error reading pinned badges:', e);
  }

  // Mặc định: Chọn tối đa 3 huy hiệu cao nhất đã mở khóa
  const unlocked = BADGE_DEFINITIONS.filter(b => b.checkUnlocked(profile)).map(b => b.id);
  return unlocked.slice(0, 3);
};

// Helper: Lưu danh sách ID huy hiệu ghim (tối đa 3)
export const savePinnedBadgeIds = (userId, badgeIds) => {
  if (!userId) return;
  try {
    localStorage.setItem(`smartrecipe_pinned_badges_${userId}`, JSON.stringify(badgeIds.slice(0, 3)));
  } catch (e) {
    console.error('Error saving pinned badges:', e);
  }
};

const BadgesModal = ({ isOpen, onClose, profile, isOwner = false, onPinnedChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pinnedIds, setPinnedIds] = useState([]);

  useEffect(() => {
    if (profile?.id) {
      setPinnedIds(getPinnedBadgeIds(profile.id, profile));
    }
  }, [profile?.id, profile?.recipeCount, profile?.followerCount, isOpen]);

  if (!isOpen) return null;

  const totalBadges = BADGE_DEFINITIONS.length;
  const unlockedBadges = BADGE_DEFINITIONS.filter(b => b.checkUnlocked(profile));
  const unlockedCount = unlockedBadges.length;
  const percentComplete = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = selectedCategory === 'all' 
    ? BADGE_DEFINITIONS 
    : BADGE_DEFINITIONS.filter(b => b.category === selectedCategory);

  const handleTogglePin = (badgeId) => {
    if (!isOwner) return;

    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badge || !badge.checkUnlocked(profile)) {
      toast.info('Bạn cần mở khóa danh hiệu này trước khi ghim lên hồ sơ.');
      return;
    }

    let newPinned;
    if (pinnedIds.includes(badgeId)) {
      newPinned = pinnedIds.filter(id => id !== badgeId);
      toast.info(`Đã bỏ ghim "${badge.title}" khỏi hồ sơ.`);
    } else {
      if (pinnedIds.length >= 3) {
        toast.warning('Bạn chỉ có thể chọn tối đa 3 huy hiệu để hiển thị trên hồ sơ!');
        return;
      }
      newPinned = [...pinnedIds, badgeId];
      toast.success(`Đã chọn hiển thị "${badge.title}" trên hồ sơ! (${newPinned.length}/3)`);
    }

    setPinnedIds(newPinned);
    savePinnedBadgeIds(profile.id, newPinned);
    if (onPinnedChange) {
      onPinnedChange(newPinned);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[sr-fadeIn_0.25s_ease-out]">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-[sr-slideUpFade_0.35s_ease-out] border border-[#f0e3d9]">
        
        {/* Header Modal */}
        <div className="p-6 pb-4 border-b border-[#f0e3d9] bg-gradient-to-r from-[#fff9f6] via-white to-[#fff5f2]">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shadow-xs">
                🏆
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-[#3d271d]">
                  Bộ Sưu Tập Huy Hiệu Ẩm Thực
                </h3>
                <p className="text-xs text-[#796255]">
                  Thành tích của <strong className="text-[#a13923]">{profile?.displayName || profile?.username}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Overview Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#f0e3d9] shadow-xs mb-3">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#553e32]">
                Tiến độ mở khóa: <strong className="text-[#a13923]">{unlockedCount}/{totalBadges}</strong> huy hiệu
              </span>
              <span className="text-[#a13923] font-bold">{percentComplete}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#f0e3d9]/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#d97706] via-[#a13923] to-[#8b311e] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Owner Instruction Notice: Chọn huy hiệu hiển thị */}
          {isOwner && (
            <div className="p-2.5 px-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Star size={15} className="text-amber-600 fill-amber-500 flex-shrink-0" />
                <span>
                  <strong>Chọn hiển thị trên hồ sơ:</strong> Bạn có thể ghim tối đa <strong>3 huy hiệu</strong> đã mở khóa.
                </span>
              </div>
              <span className="font-bold bg-white px-2 py-0.5 rounded-full border border-amber-200 text-[11px] whitespace-nowrap">
                Đã chọn: {pinnedIds.length}/3
              </span>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-[#a13923] text-white shadow-xs' : 'bg-gray-100 text-[#796255] hover:bg-gray-200'}`}
            >
              Tất cả ({totalBadges})
            </button>
            <button
              onClick={() => setSelectedCategory('recipes')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${selectedCategory === 'recipes' ? 'bg-[#a13923] text-white shadow-xs' : 'bg-gray-100 text-[#796255] hover:bg-gray-200'}`}
            >
              🍳 Sáng tạo món ({BADGE_DEFINITIONS.filter(b => b.category === 'recipes').length})
            </button>
            <button
              onClick={() => setSelectedCategory('social')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${selectedCategory === 'social' ? 'bg-[#a13923] text-white shadow-xs' : 'bg-gray-100 text-[#796255] hover:bg-gray-200'}`}
            >
              👥 Bạn bếp ({BADGE_DEFINITIONS.filter(b => b.category === 'social').length})
            </button>
            <button
              onClick={() => setSelectedCategory('community')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${selectedCategory === 'community' ? 'bg-[#a13923] text-white shadow-xs' : 'bg-gray-100 text-[#796255] hover:bg-gray-200'}`}
            >
              🏅 Đồng hành ({BADGE_DEFINITIONS.filter(b => b.category === 'community').length})
            </button>
          </div>
        </div>

        {/* Badges List Body */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBadges.map((badge) => {
              const isUnlocked = badge.checkUnlocked(profile);
              const prog = badge.progress(profile);
              const progressRatio = Math.min(100, Math.round((prog.current / prog.target) * 100));
              const isPinned = pinnedIds.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isUnlocked 
                      ? `bg-gradient-to-br ${badge.colorClasses} shadow-sm ${isPinned ? 'ring-2 ring-amber-400' : ''}` 
                      : 'bg-gray-50/70 border-gray-200/80 text-gray-500 opacity-60 hover:opacity-85'
                  }`}
                >
                  {/* Top row: Icon + Title + Status/Pin button */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isUnlocked ? 'bg-white/90 shadow-xs' : 'bg-gray-200 text-gray-400'}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm leading-snug ${isUnlocked ? 'text-[#3d271d]' : 'text-gray-700'}`}>
                          {badge.title}
                        </h4>
                        <span className="text-[10.5px] uppercase font-semibold tracking-wider text-[#8c786c]">
                          {badge.categoryName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 size={12} /> Đã đạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-200/90 text-gray-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          <Lock size={11} /> Khóa
                        </span>
                      )}

                      {/* Pin to Profile toggle (Chỉ hiển thị khi là chủ sở hữu và đã mở khóa) */}
                      {isOwner && isUnlocked && (
                        <button
                          type="button"
                          onClick={() => handleTogglePin(badge.id)}
                          className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs scale-102'
                              : 'bg-white/90 hover:bg-amber-50 text-gray-700 hover:text-amber-800 border border-gray-200'
                          }`}
                          title={isPinned ? 'Bấm để bỏ ghim khỏi hồ sơ' : 'Bấm để ghim hiển thị trên hồ sơ (tối đa 3 cái)'}
                        >
                          <Star size={11} className={isPinned ? 'fill-white' : ''} />
                          <span>{isPinned ? 'Đang ghim' : 'Ghim hồ sơ'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs leading-relaxed mb-3 ${isUnlocked ? 'text-[#553e32]' : 'text-gray-500'}`}>
                    {badge.description}
                  </p>

                  {/* Progress info */}
                  <div className="mt-auto pt-2 border-t border-black/5">
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span className={isUnlocked ? 'text-emerald-700' : 'text-gray-500'}>
                        {isUnlocked ? 'Hoàn thành' : `Tiến độ: ${prog.current}/${prog.target} ${prog.unit}`}
                      </span>
                      <span className="text-gray-400">{progressRatio}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isUnlocked ? 'bg-emerald-500' : 'bg-gray-400'}`}
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-gray-50 border-t border-[#f0e3d9] flex items-center justify-between text-xs text-gray-500">
          <span>
            {isOwner ? 'Chọn tối đa 3 huy hiệu để hiển thị nổi bật trên đầu trang hồ sơ.' : 'Huy hiệu được cấp tự động theo hoạt động trên Smart Recipe.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#3d271d] hover:bg-[#2c1a12] text-white font-bold rounded-full transition-all shadow-xs"
          >
            Đã xong
          </button>
        </div>

      </div>
    </div>
  );
};

export default BadgesModal;
