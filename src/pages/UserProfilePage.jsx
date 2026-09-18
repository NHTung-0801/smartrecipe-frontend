import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Camera, Loader2, Plus, Clock, ChefHat, 
  Sparkles, Trophy, Pencil, Star, Heart, Users, UserCheck, ChevronRight,
  Zap, Flame, Utensils, BookOpen
} from 'lucide-react';
import { userService } from '../services/userService';
import { recipeService } from '../services/recipeService';
import useAuthStore from '../store/useAuthStore';
import FollowButton from '../components/FollowButton';
import UserAvatar from '../components/ui/UserAvatar';
import BadgesModal, { BADGE_DEFINITIONS, getPinnedBadgeIds } from '../components/profile/BadgesModal';
import useLikedRecipes from '../hooks/useLikedRecipes';

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

  // Fetch user's followers list
  const { data: followersData, isLoading: isLoadingFollowers } = useQuery({
    queryKey: ['followers', id],
    queryFn: async () => {
      try {
        const res = await userService.getFollowers(id, 0, 50);
        return res?.data?.content || res?.content || [];
      } catch (e) {
        console.warn('Failed to load followers:', e);
        return [];
      }
    },
    enabled: Boolean(id),
  });

  // Fetch user's following list
  const { data: followingData, isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following', id],
    queryFn: async () => {
      try {
        const res = await userService.getFollowing(id, 0, 50);
        return res?.data?.content || res?.content || [];
      } catch (e) {
        console.warn('Failed to load following:', e);
        return [];
      }
    },
    enabled: Boolean(id),
  });

  const profile = profileData?.data;
  const followersList = Array.isArray(followersData) ? followersData : (followersData?.content || []);
  const followingList = Array.isArray(followingData) ? followingData : (followingData?.content || []);
  
  // Quản lý danh sách các công thức đã thích
  const { likedIds = [], toggleLike, isLiked } = useLikedRecipes();

  // Tải chi tiết các món ăn đã thích để hiển thị thẻ công thức hoàn chỉnh
  const { data: likedRecipes = [], isLoading: isLoadingLikedRecipes } = useQuery({
    queryKey: ['likedRecipesList', likedIds],
    queryFn: async () => {
      if (!likedIds || likedIds.length === 0) return [];
      const recipePromises = likedIds.map((recipeId) =>
        recipeService.getById(recipeId).catch(() => null)
      );
      const results = await Promise.all(recipePromises);
      return results.filter(Boolean);
    },
    enabled: Boolean(isOwnProfile && likedIds?.length > 0),
  });
  
  // Tính tổng lượt thích từ profile hoặc từ danh sách các món ăn đã đăng
  const totalLikes = profile?.totalLikes !== undefined && profile?.totalLikes !== null
    ? profile.totalLikes
    : (recipesData?.content?.reduce((sum, r) => sum + (r.likeCount || 0), 0) || 0);

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
          <div className="flex-1 text-center md:text-left w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap mb-1.5">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d271d]">
                    {profile.displayName || profile.username}
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${(profile.role === 'ADMIN' || profile.username === 'admin123') ? 'bg-[#a13923] text-white border-[#a13923]' : 'text-[#a13923] bg-[#fff5f2] border-[#fbdcd5]'}`}>
                    {(profile.role === 'ADMIN' || profile.username === 'admin123') 
                      ? 'Quản trị viên' 
                      : (profile.recipeCount > 0 ? 'Đầu bếp' : 'Thành viên')}
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
                <Link 
                  to="/profile" 
                  className="bg-[#a13923] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#8b311e] active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-2 self-center md:self-start whitespace-nowrap shrink-0 hover:shadow-lg"
                  title="Chuyển đến trang Cài đặt & Chỉnh sửa hồ sơ"
                >
                  <Pencil size={15} />
                  <span>Chỉnh sửa hồ sơ</span>
                </Link>
              ) : (
                <div className="self-center md:self-start shrink-0">
                  <FollowButton 
                    userId={profile.id} 
                    initialIsFollowing={profile.isFollowing} 
                    className="rounded-full shadow-md text-sm px-7 py-2.5 font-bold whitespace-nowrap"
                  />
                </div>
              )}
            </div>

            {/* Statistics Bento Grid: 4 ô thống kê theo yêu cầu (Bấm để chuyển tab tương ứng) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
              <div 
                className={`${s.statBox} cursor-pointer hover:border-[#a13923]/40 ${activeTab === 'recipes' ? 'bg-[#a13923]/10 border-[#a13923]/40' : ''}`}
                onClick={() => setActiveTab('recipes')}
                title="Bấm để xem danh sách công thức"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Công thức</span>
                  <ChefHat size={15} className="text-[#a13923]/60" />
                </div>
                <span className="block text-2xl font-heading text-[#a13923] font-bold">
                  {profile.recipeCount || 0}
                </span>
              </div>

              <div 
                className={`${s.statBox} cursor-pointer hover:border-[#a13923]/40 ${activeTab === 'followers' ? 'bg-[#a13923]/10 border-[#a13923]/40' : ''}`}
                onClick={() => setActiveTab('followers')}
                title="Bấm để xem danh sách người theo dõi"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Người theo dõi</span>
                  <Users size={15} className="text-[#a13923]/60" />
                </div>
                <span className="block text-2xl font-heading text-[#a13923] font-bold">
                  {profile.followerCount || followersList.length || 0}
                </span>
              </div>

              <div 
                className={`${s.statBox} cursor-pointer hover:border-[#a13923]/40 ${activeTab === 'following' ? 'bg-[#a13923]/10 border-[#a13923]/40' : ''}`}
                onClick={() => setActiveTab('following')}
                title="Bấm để xem danh sách đang theo dõi"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Đang theo dõi</span>
                  <UserCheck size={15} className="text-[#a13923]/60" />
                </div>
                <span className="block text-2xl font-heading text-[#a13923] font-bold">
                  {profile.followingCount || followingList.length || 0}
                </span>
              </div>

              <div 
                className={`${s.statBox} ${isOwnProfile ? 'cursor-pointer hover:border-[#a13923]/40' : ''} ${activeTab === 'liked' ? 'bg-[#a13923]/10 border-[#a13923]/40' : ''}`}
                onClick={() => {
                  if (isOwnProfile) setActiveTab('liked');
                }}
                title={isOwnProfile ? "Bấm để xem các công thức đã thích" : "Tổng lượt thích nhận được"}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#796255] uppercase tracking-wider">Lượt thích</span>
                  <Heart size={15} className="text-[#a13923]/70 fill-[#a13923]/20" />
                </div>
                <span className="block text-2xl font-heading text-[#a13923] font-bold">
                  {totalLikes}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Tabbed Navigation Interface: Công thức, Người theo dõi, Đang theo dõi... */}
      <section className={`mb-12 ${fx.stagger2}`}>
        {/* Thanh Tag / Tab */}
        <div className={`flex items-center gap-8 mb-8 border-b border-[#f0e3d9] overflow-x-auto ${s.hideScrollbar}`}>
          {/* Tab 1: Công thức */}
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

          {/* Tab 2: Đã thích (Đặt ngay bên cạnh Công thức của người dùng theo yêu cầu) */}
          {isOwnProfile && (
            <button 
              onClick={() => setActiveTab('liked')}
              className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center gap-2 ${activeTab === 'liked' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
            >
              <span>Đã thích</span>
              <span className="text-xs bg-[#fff5f2] text-[#a13923] font-bold px-2.5 py-0.5 rounded-full border border-[#fbdcd5]">
                {likedIds?.length || 0}
              </span>
              <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'liked' ? 'w-full' : 'w-0'}`}></div>
            </button>
          )}

          {/* Tab 3: Người theo dõi */}
          <button 
            onClick={() => setActiveTab('followers')}
            className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center gap-2 ${activeTab === 'followers' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
          >
            <span>Người theo dõi</span>
            <span className="text-xs bg-[#fff5f2] text-[#a13923] font-bold px-2.5 py-0.5 rounded-full border border-[#fbdcd5]">
              {profile.followerCount || followersList.length || 0}
            </span>
            <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'followers' ? 'w-full' : 'w-0'}`}></div>
          </button>

          {/* Tab 4: Đang theo dõi */}
          <button 
            onClick={() => setActiveTab('following')}
            className={`pb-3.5 px-2 font-heading text-base sm:text-lg whitespace-nowrap transition-all relative flex items-center gap-2 ${activeTab === 'following' ? 'text-[#a13923] font-bold' : 'text-[#796255] font-medium hover:text-[#a13923]'}`}
          >
            <span>Đang theo dõi</span>
            <span className="text-xs bg-[#fff5f2] text-[#a13923] font-bold px-2.5 py-0.5 rounded-full border border-[#fbdcd5]">
              {profile.followingCount || followingList.length || 0}
            </span>
            <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-[#a13923] rounded-full transition-all duration-300 ${activeTab === 'following' ? 'w-full' : 'w-0'}`}></div>
          </button>
        </div>

        {/* Tab 1: Công thức đã đăng */}
        {activeTab === 'recipes' && (
          <>
            {isLoadingRecipes ? (
              <div className="flex justify-center py-16">
                <Loader2 className={`${fx.spinner} text-[#a13923] w-9 h-9`} />
              </div>
            ) : recipesData?.content?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipesData.content.map((recipe, idx) => (
                  <div key={recipe.id} className={`${s.glassCard} rounded-2xl overflow-hidden group hover:-translate-y-2 flex flex-col opacity-0 animate-[sr-slideUpFade_0.8s_ease-out_forwards] border border-[#f0e3d9] shadow-sm hover:shadow-lg transition-all duration-300`} style={{ animationDelay: `${idx * 0.08}s` }}>
                    <Link to={`/recipes/${recipe.id}`} className="block relative overflow-hidden" style={{ height: '200px' }}>
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-[#f7efe9] group-hover:scale-105 transition-transform duration-500">
                          🍳
                        </div>
                      )}

                      {/* Dark gradient overlay at bottom of image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Category badge bottom-left */}
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-white/20 z-10">
                        {recipe.tags && recipe.tags.length > 0 ? recipe.tags[0].name : 'Món Mới'}
                      </div>

                      {/* Status badge top-left (owner only, non-public) */}
                      {isOwnProfile && recipe.status && recipe.status !== 'PUBLIC' && (
                        <span className={`absolute top-3 left-3 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold z-10 shadow-xs border border-white/20 ${
                          recipe.status === 'PENDING_REVIEW' ? 'bg-amber-500/80' : 'bg-[#3d271d]/80'
                        }`}>
                          {recipe.status === 'DRAFT' ? 'Riêng tư' : (recipe.status === 'PENDING_REVIEW' ? 'Chờ duyệt' : recipe.status)}
                        </span>
                      )}

                      {/* Like button top-right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(recipe.id);
                        }}
                        className={`absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/30 transition-all hover:scale-110 active:scale-95 cursor-pointer z-10`}
                        title={isLiked(recipe.id) ? "Bỏ thích công thức" : "Thích công thức"}
                      >
                        <Heart 
                          size={13} 
                          className={`transition-colors ${
                            isLiked(recipe.id)
                              ? 'text-red-400 fill-red-400'
                              : 'text-white fill-none'
                          }`} 
                        />
                        <span className="text-xs font-bold text-white">
                          {recipe.likeCount || 0}
                        </span>
                      </button>
                    </Link>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <Link to={`/recipes/${recipe.id}`} className="font-bold text-base text-[#3d271d] group-hover:text-[#a13923] transition-colors line-clamp-2 leading-snug mb-3">
                        {recipe.title}
                      </Link>
                      
                      {/* 4-item meta row */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Clock size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">{formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Zap size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">{DIFFICULTY_LABELS[recipe.difficulty] || 'Vừa'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Flame size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">
                            {recipe.nutrition?.caloriesPerServing != null ? `${Math.round(recipe.nutrition.caloriesPerServing)}k` : '--'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Utensils size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">
                            {recipe.ingredientCount != null ? `${recipe.ingredientCount}NL` : (recipe.ingredients?.length ? `${recipe.ingredients.length}NL` : '--')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thẻ Thêm công thức mới (dành cho chính chủ) */}
                {isOwnProfile && (
                  <Link to="/recipes/new" className={`${s.glassCard} rounded-2xl border-2 border-dashed border-[#fbdcd5] flex flex-col items-center justify-center p-8 text-center min-h-[330px] group cursor-pointer hover:bg-[#fff9f7] transition-all opacity-0 animate-[sr-slideUpFade_0.6s_ease-out_forwards]`} style={{ animationDelay: `${recipesData.content.length * 0.08}s` }}>
                    <div className="w-16 h-16 rounded-full bg-[#fff5f2] border border-[#fbdcd5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#a13923]">
                      <Plus size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#3d271d] mb-1">Thêm công thức mới</h3>
                    <p className="text-xs text-[#796255] max-w-[200px]">Chia sẻ bí quyết nấu nướng của bạn với cộng đồng</p>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-white/60 rounded-2xl border border-[#f0e3d9]">
                <div className="w-16 h-16 rounded-full bg-[#fff5f2] text-[#a13923] flex items-center justify-center mx-auto mb-3">
                  <ChefHat size={32} className="opacity-80" />
                </div>
                <p className="text-base text-[#3d271d] font-bold mb-1.5">Người dùng này chưa chia sẻ công thức nào.</p>
                <p className="text-xs text-[#796255] max-w-sm mx-auto mb-5">Các món ăn được chia sẻ công khai sẽ xuất hiện tại đây để mọi người cùng học hỏi và lưu lại.</p>
                {isOwnProfile && (
                  <Link to="/recipes/new" className="bg-[#a13923] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#8b311e] active:scale-95 transition-all inline-flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> Tạo công thức đầu tiên
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Danh sách Người theo dõi */}
        {activeTab === 'followers' && (
          <div>
            {isLoadingFollowers ? (
              <div className="flex justify-center py-16">
                <Loader2 className={`${fx.spinner} text-[#a13923] w-9 h-9`} />
              </div>
            ) : followersList.length > 0 ? (
              <div className="flex flex-col gap-3">
                {followersList.map((follower, idx) => (
                  <Link
                    key={follower.id}
                    to={`/users/${follower.id}`}
                    className={`${s.glassCard} rounded-2xl border border-[#f0e3d9] hover:border-[#a13923]/40 group transition-all hover:-translate-y-0.5 hover:shadow-md opacity-0 animate-[sr-slideUpFade_0.6s_ease-out_forwards] overflow-hidden`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Avatar with rank indicator */}
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={follower.avatarUrl}
                          name={follower.displayName || follower.username}
                          className="w-14 h-14 text-base border-2 border-[#fbdcd5] shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#a13923] rounded-full flex items-center justify-center border-2 border-white">
                          <Users size={9} className="text-white" />
                        </div>
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-[#3d271d] group-hover:text-[#a13923] transition-colors truncate">
                          {follower.displayName || follower.username}
                        </p>
                        <p className="text-xs text-[#796255] truncate">@{follower.username}</p>
                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {follower.recipeCount != null && (
                            <span className="flex items-center gap-1 text-[10px] text-[#796255] font-medium">
                              <BookOpen size={10} className="text-[#a13923]" />
                              {follower.recipeCount} công thức
                            </span>
                          )}
                          {follower.followerCount != null && (
                            <span className="flex items-center gap-1 text-[10px] text-[#796255] font-medium">
                              <Users size={10} className="text-[#a13923]" />
                              {follower.followerCount} người theo dõi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="w-9 h-9 rounded-full bg-[#fff5f2] group-hover:bg-[#a13923] text-[#a13923] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Bottom highlight bar */}
                    <div className="h-0.5 bg-gradient-to-r from-[#a13923]/0 via-[#a13923]/40 to-[#a13923]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-white/60 rounded-2xl border border-[#f0e3d9]">
                <div className="w-16 h-16 rounded-full bg-[#fff5f2] text-[#a13923] flex items-center justify-center mx-auto mb-3">
                  <Users size={32} className="opacity-80" />
                </div>
                <p className="text-base text-[#3d271d] font-bold mb-1.5">Chưa có người theo dõi nào</p>
                <p className="text-xs text-[#796255] max-w-sm mx-auto mb-5">
                  {isOwnProfile
                    ? 'Chia sẻ thêm nhiều món ngon để thu hút thêm cộng đồng người theo dõi nhé!'
                    : 'Hãy là người đầu tiên bấm theo dõi để cập nhật công thức mới từ đầu bếp này!'}
                </p>
                {!isOwnProfile && (
                  <div className="inline-block">
                    <FollowButton userId={profile.id} initialIsFollowing={profile.isFollowing} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Danh sách Đang theo dõi */}
        {activeTab === 'following' && (
          <div>
            {isLoadingFollowing ? (
              <div className="flex justify-center py-16">
                <Loader2 className={`${fx.spinner} text-[#a13923] w-9 h-9`} />
              </div>
            ) : followingList.length > 0 ? (
              <div className="flex flex-col gap-3">
                {followingList.map((targetUser, idx) => (
                  <Link
                    key={targetUser.id}
                    to={`/users/${targetUser.id}`}
                    className={`${s.glassCard} rounded-2xl border border-[#f0e3d9] hover:border-[#a13923]/40 group transition-all hover:-translate-y-0.5 hover:shadow-md opacity-0 animate-[sr-slideUpFade_0.6s_ease-out_forwards] overflow-hidden`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Avatar with following indicator */}
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={targetUser.avatarUrl}
                          name={targetUser.displayName || targetUser.username}
                          className="w-14 h-14 text-base border-2 border-[#fbdcd5] shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#e06c47] rounded-full flex items-center justify-center border-2 border-white">
                          <UserCheck size={9} className="text-white" />
                        </div>
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-[#3d271d] group-hover:text-[#a13923] transition-colors truncate">
                          {targetUser.displayName || targetUser.username}
                        </p>
                        <p className="text-xs text-[#796255] truncate">@{targetUser.username}</p>
                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {targetUser.recipeCount != null && (
                            <span className="flex items-center gap-1 text-[10px] text-[#796255] font-medium">
                              <BookOpen size={10} className="text-[#a13923]" />
                              {targetUser.recipeCount} công thức
                            </span>
                          )}
                          {targetUser.followerCount != null && (
                            <span className="flex items-center gap-1 text-[10px] text-[#796255] font-medium">
                              <Users size={10} className="text-[#a13923]" />
                              {targetUser.followerCount} người theo dõi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="w-9 h-9 rounded-full bg-[#fff5f2] group-hover:bg-[#a13923] text-[#a13923] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Bottom highlight bar */}
                    <div className="h-0.5 bg-gradient-to-r from-[#a13923]/0 via-[#a13923]/40 to-[#a13923]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-white/60 rounded-2xl border border-[#f0e3d9]">
                <div className="w-16 h-16 rounded-full bg-[#fff5f2] text-[#a13923] flex items-center justify-center mx-auto mb-3">
                  <UserCheck size={32} className="opacity-80" />
                </div>
                <p className="text-base text-[#3d271d] font-bold mb-1.5">Chưa theo dõi người dùng nào</p>
                <p className="text-xs text-[#796255] max-w-sm mx-auto">
                  {isOwnProfile
                    ? 'Khám phá cộng đồng đầu bếp và theo dõi những tài khoản bạn yêu thích nhé!'
                    : 'Người dùng này chưa theo dõi ai.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Công thức đã thích (Đã thích từ người khác) */}
        {activeTab === 'liked' && (
          <div>
            {isLoadingLikedRecipes ? (
              <div className="flex justify-center py-16">
                <Loader2 className={`${fx.spinner} text-[#a13923] w-9 h-9`} />
              </div>
            ) : likedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedRecipes.map((recipe, idx) => (
                  <div 
                    key={recipe.id} 
                    className={`${s.glassCard} rounded-2xl overflow-hidden group hover:-translate-y-2 flex flex-col opacity-0 animate-[sr-slideUpFade_0.8s_ease-out_forwards] border border-[#f0e3d9] shadow-sm hover:shadow-lg transition-all duration-300`} 
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <Link to={`/recipes/${recipe.id}`} className="block relative overflow-hidden" style={{ height: '200px' }}>
                      {recipe.imageUrl ? (
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-[#f7efe9] group-hover:scale-105 transition-transform duration-500">
                          🍳
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Category badge bottom-left */}
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-white/20 z-10">
                        {recipe.tags && recipe.tags.length > 0 ? recipe.tags[0].name : 'Món Ngon'}
                      </div>
                      
                      {/* Like button top-right - always filled since this is liked tab */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(recipe.id);
                        }}
                        className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/30 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                        title="Bỏ thích hoặc thích lại"
                      >
                        <Heart size={13} className="text-red-400 fill-red-400" />
                        <span className="text-xs font-bold text-white">{recipe.likeCount || 0}</span>
                      </button>
                    </Link>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Author info */}
                      {recipe.author && (
                        <Link 
                          to={`/users/${recipe.author.id}`} 
                          className="flex items-center gap-2 mb-2 group/author hover:opacity-80 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                          title={`Xem hồ sơ của ${recipe.author.displayName || recipe.author.username}`}
                        >
                          <UserAvatar
                            src={recipe.author.avatarUrl}
                            name={recipe.author.displayName || recipe.author.username}
                            className="w-5 h-5 text-[10px] shrink-0"
                          />
                          <span className="text-[11px] text-[#796255] font-medium group-hover/author:text-[#a13923] truncate">
                            bởi <span className="font-semibold text-[#3d271d] group-hover/author:text-[#a13923]">{recipe.author.displayName || recipe.author.username}</span>
                          </span>
                        </Link>
                      )}

                      <Link 
                        to={`/recipes/${recipe.id}`} 
                        className="font-bold text-base text-[#3d271d] group-hover:text-[#a13923] transition-colors line-clamp-2 leading-snug mb-3"
                      >
                        {recipe.title}
                      </Link>
                      
                      {/* 4-item meta row */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Clock size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">{formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Zap size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">{DIFFICULTY_LABELS[recipe.difficulty] || 'Vừa'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Flame size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">
                            {recipe.nutrition?.caloriesPerServing != null ? `${Math.round(recipe.nutrition.caloriesPerServing)}k` : '--'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 bg-[#fdf6f3] rounded-xl py-2 px-1">
                          <Utensils size={13} className="text-[#a13923]" />
                          <span className="text-[10px] font-semibold text-[#3d271d] leading-none">
                            {recipe.ingredientCount != null ? `${recipe.ingredientCount}NL` : (recipe.ingredients?.length ? `${recipe.ingredients.length}NL` : '--')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-white/60 rounded-2xl border border-[#f0e3d9]">
                <div className="w-16 h-16 rounded-full bg-[#fff5f2] text-[#a13923] flex items-center justify-center mx-auto mb-3">
                  <Heart size={32} className="opacity-80 fill-[#a13923]/20 text-[#a13923]" />
                </div>
                <p className="text-base text-[#3d271d] font-bold mb-1.5">Bạn chưa thích công thức nào</p>
                <p className="text-xs text-[#796255] max-w-sm mx-auto mb-5">
                  Khi bạn thích các món ngon từ những người khác trong cộng đồng, công thức sẽ xuất hiện tại đây để bạn tiện theo dõi và nấu lại.
                </p>
                <Link to="/" className="bg-[#a13923] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#8b311e] active:scale-95 transition-all inline-flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Khám phá công thức ngay
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Guest Conversion Hook */}
      {!currentUser && (
        <div className="mb-14 p-8 rounded-2xl bg-gradient-to-r from-[#3d271d] via-[#5c3e33] to-[#a13923] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
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
