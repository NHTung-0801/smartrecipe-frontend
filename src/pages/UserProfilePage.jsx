import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Camera, MoreVertical, Loader2, Plus, Clock, ChefHat, Bookmark, Sparkles, Trophy } from 'lucide-react';
import { userService } from '../services/userService';
import { recipeService } from '../services/recipeService';
import useAuthStore from '../store/useAuthStore';
import FollowButton from '../components/FollowButton';
import UserAvatar from '../components/ui/UserAvatar';
import BadgesModal, { BADGE_DEFINITIONS, getPinnedBadgeIds } from '../components/profile/BadgesModal';
import { Star } from 'lucide-react';

import s from '../styles/pages/UserProfilePage.module.css';
import fx from '../styles/effects.module.css';

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

const UserProfilePage = () => {
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;
  const isOwnProfile = currentUserId === parseInt(id, 10);
  const [activeTab, setActiveTab] = useState('recipes');
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [pinnedBadgeIds, setPinnedBadgeIds] = useState([]);

  // Fetch public profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => userService.getPublicProfile(id),
  });


  // Fetch user's recipes (all for self, public for others)
  const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['userRecipes', id, isOwnProfile],
    queryFn: () => isOwnProfile ? recipeService.getMyRecipes(0, 20) : recipeService.getUserPublicRecipes(id, 0, 20),
  });

  const profile = profileData?.data;

  React.useEffect(() => {
    if (profile?.id) {
      setPinnedBadgeIds(getPinnedBadgeIds(profile.id, profile));
    }
  }, [profile?.id, profile?.recipeCount, profile?.followerCount]);

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className={`${fx.spinner} text-primary w-10 h-10`} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`${s.pageContainer} flex items-center justify-center min-h-[50vh]`}>
        <p className="text-xl text-on-surface-variant">Không tìm thấy người dùng này.</p>
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      
      {/* Profile Header Section */}
      <section className={`mb-12 ${fx.stagger1}`}>
        <div className={`${s.glassCard} rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8`}>
          
          {/* Avatar */}
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-[#a13923]/20 group-hover:ring-[#a13923]/60 border-4 border-white transition-all duration-500 group-hover:scale-105 shadow-xl">
              <UserAvatar
                src={profile.avatarUrl}
                name={profile.displayName || profile.username}
                className="w-full h-full text-4xl md:text-5xl font-bold"
              />
            </div>
            
            {isOwnProfile && (
              <Link to="/profile" className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-90 transition-transform">
                <Camera size={20} />
              </Link>
            )}
          </div>

          {/* Identity & Stats */}
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap mb-1.5">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d271d]">
                    {profile.displayName || profile.username}
                  </h2>
                  <span className="text-xs text-[#a13923] bg-[#fff5f2] px-2.5 py-0.5 rounded-full font-semibold border border-[#fbdcd5]">
                    {profile.recipeCount > 0 ? 'Đầu bếp' : 'Thành viên'}
                  </span>
                </div>
                <p className="text-xs text-[#796255] mb-2.5 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="font-medium">@{profile.username}</span>
                  {profile.createdAt && (
                    <>
                      <span>•</span>
                      <span>Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</span>
                    </>
                  )}
                </p>
                {profile.bio ? (
                  <p className="text-[#553e32] text-sm max-w-lg leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-[#8c786c] text-sm italic max-w-lg">Yêu thích nấu ăn và sẻ chia hương vị bữa cơm gia đình cùng Smart Recipe.</p>
                )}

                {/* Huy hiệu danh hiệu ẩm thực */}
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mt-3 pt-2.5 border-t border-[#f0e3d9]/70">
                  <span className="text-[11px] font-bold text-[#8c786c] uppercase tracking-wider mr-0.5 flex items-center gap-1">
                    <Trophy size={13} className="text-amber-600" />
                    Huy hiệu:
                  </span>

                  {/* Danh sách huy hiệu được ghim / chọn hiển thị (tối đa 3) */}
                  {pinnedBadgeIds.map((badgeId) => {
                    const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
                    if (!badge) return null;
                    return (
                      <button 
                        key={badge.id}
                        type="button"
                        onClick={() => setIsBadgesModalOpen(true)}
                        className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${badge.colorClasses} px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer border`} 
                        title={`Bấm để xem chi tiết danh hiệu: ${badge.title}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.title}</span>
                      </button>
                    );
                  })}

                  {/* Nút Chọn huy hiệu hiển thị cho chính chủ */}
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => setIsBadgesModalOpen(true)}
                      className="inline-flex items-center gap-1 bg-[#fff5f2] hover:bg-[#ffece6] text-[#a13923] border border-[#fbdcd5] px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Chọn tối đa 3 huy hiệu để hiển thị ở hồ sơ"
                    >
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>Chọn hiển thị ({pinnedBadgeIds.length}/3)</span>
                    </button>
                  )}

                  {/* Nút Xem tất cả bộ sưu tập */}
                  <button
                    type="button"
                    onClick={() => setIsBadgesModalOpen(true)}
                    className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs transition-all cursor-pointer ml-1"
                    title="Mở toàn bộ bộ sưu tập huy hiệu"
                  >
                    <Sparkles size={11} className="text-amber-600" />
                    <span>Bộ sưu tập ({BADGE_DEFINITIONS.filter(b => b.checkUnlocked(profile)).length}/{BADGE_DEFINITIONS.length})</span>
                  </button>
                </div>
              </div>
              
              {isOwnProfile ? (
                <Link to="/profile" className="bg-[#a13923] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#8b311e] active:scale-95 transition-all shadow-md inline-flex items-center gap-2 self-center md:self-start">
                  Chỉnh sửa hồ sơ
                </Link>
              ) : (
                <div className="self-center md:self-start">
                  <FollowButton 
                    userId={profile.id} 
                    initialIsFollowing={profile.isFollowing} 
                    className="rounded-full shadow-md text-sm px-7 py-2.5 font-bold"
                  />
                </div>
              )}
            </div>

            {/* Statistics Bento Grid: 3 ô căn đều khi xem người khác, 4 ô khi là chính chủ */}
            <div className={`grid ${isOwnProfile ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-3 sm:gap-4 mt-4`}>
              <div className={s.statBox}>
                <span className="block text-2xl font-heading text-[#a13923] font-bold mb-0.5">{profile.recipeCount || 0}</span>
                <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Công thức</span>
              </div>
              <div className={s.statBox}>
                <span className="block text-2xl font-heading text-[#a13923] font-bold mb-0.5">{profile.followerCount || 0}</span>
                <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Người theo dõi</span>
              </div>
              <div className={s.statBox}>
                <span className="block text-2xl font-heading text-[#a13923] font-bold mb-0.5">{profile.followingCount || 0}</span>
                <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Đang theo dõi</span>
              </div>
              {isOwnProfile && (
                <div className={s.statBox}>
                  <span className="block text-2xl font-heading text-[#a13923] font-bold mb-0.5">0</span>
                  <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Đã lưu</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

        {/* Tabbed Interface */}
        <section className={`mb-10 ${fx.stagger2}`}>
          <div className={`flex items-center gap-8 mb-8 border-b border-[#f0e3d9] overflow-x-auto ${s.hideScrollbar}`}>
            <button 
              onClick={() => setActiveTab('recipes')}
              className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center gap-2 ${activeTab === 'recipes' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
            >
              <span>{isOwnProfile ? 'Công thức của tôi' : 'Công thức đã đăng'}</span>
              <span className="text-xs bg-[#fff5f2] text-[#a13923] font-bold px-2.5 py-0.5 rounded-full border border-[#fbdcd5]">
                {profile.recipeCount || 0}
              </span>
              <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'recipes' ? 'w-full' : 'w-0'}`}></div>
            </button>
            
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => setActiveTab('saved')}
                  className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center ${activeTab === 'saved' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
                >
                  <span>Đã lưu</span>
                  <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'saved' ? 'w-full' : 'w-0'}`}></div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center ${activeTab === 'activity' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
                >
                  <span>Hoạt động</span>
                  <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'activity' ? 'w-full' : 'w-0'}`}></div>
                </button>
              </>
            )}
          </div>

        {/* Tab Contents */}
        {activeTab === 'recipes' && (
          <>
            {isLoadingRecipes ? (
              <div className="flex justify-center py-12">
                <Loader2 className={`${fx.spinner} text-primary w-8 h-8`} />
              </div>
            ) : recipesData?.content?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipesData.content.map((recipe, idx) => (
                  <div key={recipe.id} className={`${s.glassCard} rounded-2xl overflow-hidden group hover:-translate-y-2 flex flex-col opacity-0 animate-[sr-slideUpFade_0.8s_ease-out_forwards]`} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <Link to={`/recipes/${recipe.id}`} className="block h-56 relative overflow-hidden">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-container-high group-hover:scale-105 transition-transform duration-500">
                          🍳
                        </div>
                      )}
                      <div className={`absolute top-4 right-4 ${s.glassSurface} px-3 py-1 rounded-full flex items-center gap-1`}>
                        <span className="text-secondary text-sm">❤️</span>
                        <span className="text-sm font-semibold text-on-secondary-container">{recipe.likeCount || 0}</span>
                      </div>
                    </Link>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/recipes/${recipe.id}`} className="font-bold text-lg text-primary group-hover:text-primary-container transition-colors line-clamp-2">
                          {recipe.title}
                        </Link>
                        <MoreVertical className="text-on-surface-variant flex-shrink-0" size={20} />
                      </div>
                      
                      <div className="flex items-center gap-4 text-on-surface-variant text-sm mb-4">
                        <span className="flex items-center gap-1.5"><Clock size={16} /> {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}</span>
                        <span className="flex items-center gap-1.5"><ChefHat size={16} /> {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty || 'Dễ'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {recipe.tags && recipe.tags.slice(0, 3).map(tag => (
                          <span key={tag.id} className="bg-surface-container-highest px-3 py-1 rounded-full text-xs text-on-surface-variant font-medium">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Recipe Card (If own profile) */}
                {isOwnProfile && (
                  <Link to="/recipes/new" className={`${s.glassCard} rounded-xl border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center p-8 text-center min-h-[350px] group cursor-pointer hover:bg-surface-container-low transition-colors opacity-0 animate-[sr-slideUpFade_0.6s_ease-out_forwards]`} style={{ animationDelay: `${recipesData.content.length * 0.1}s` }}>
                    <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="text-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-2">Thêm công thức mới</h3>
                    <p className="text-on-surface-variant text-sm max-w-[200px]">Chia sẻ bí quyết nấu nướng của bạn với cộng đồng</p>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                <p className="text-xl text-on-surface-variant font-semibold mb-4">Người dùng này chưa chia sẻ công thức nào.</p>
                {isOwnProfile && (
                  <Link to="/recipes/new" className="bg-primary text-white px-6 py-2.5 rounded-full font-label-md hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2">
                    <Plus size={20} /> Tạo công thức đầu tiên
                  </Link>
                )}
              </div>
            )}

            {/* Guest Conversion Hook */}
            {!currentUser && (
              <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#3d271d] via-[#5c3e33] to-[#a13923] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-[#ffb347]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ffb347]">Khám phá cùng Smart Recipe</span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold mb-1.5">
                    Yêu thích công thức của {profile.displayName || profile.username}?
                  </h3>
                  <p className="text-white/80 text-sm max-w-xl">
                    Đăng ký tài khoản miễn phí để lưu món ngon vào thực đơn tuần, nhận thông báo công thức mới và quản lý nguyên liệu nấu ăn thông minh ngay hôm nay!
                  </p>
                </div>
                <Link 
                  to="/register" 
                  className="px-6 py-3 rounded-full bg-white text-[#a13923] font-bold text-sm shadow-md hover:bg-[#fff5f2] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Đăng ký miễn phí
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
            <div className="flex justify-center mb-4">
              <Bookmark className="text-outline-variant" size={48} />
            </div>
            <p className="text-xl text-on-surface-variant font-semibold">Bạn chưa lưu công thức nào</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
            <p className="text-xl text-on-surface-variant font-semibold">Chưa có hoạt động nào được ghi nhận</p>
          </div>
        )}
      </section>

      {/* Badges Collection Modal */}
      <BadgesModal 
        isOpen={isBadgesModalOpen} 
        onClose={() => setIsBadgesModalOpen(false)} 
        profile={profile} 
        isOwner={isOwnProfile}
        onPinnedChange={(newPinned) => setPinnedBadgeIds(newPinned)}
      />

    </div>
  );
};

export default UserProfilePage;
