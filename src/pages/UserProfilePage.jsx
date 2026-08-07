import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Camera, MoreVertical, Loader2, Plus, Clock, ChefHat, Bookmark } from 'lucide-react';
import { userService } from '../services/userService';
import { recipeService } from '../services/recipeService';
import useAuthStore from '../store/useAuthStore';
import FollowButton from '../components/FollowButton';

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
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isOwnProfile = currentUserId === parseInt(id, 10);
  const [activeTab, setActiveTab] = useState('recipes');

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

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className={`${fx.spinner} text-primary w-10 h-10`} />
      </div>
    );
  }

  const profile = profileData?.data;

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
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/60 border-4 border-white bg-surface-container transition-all duration-500 group-hover:scale-105 shadow-xl">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-primary font-bold">
                  {(profile.displayName || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {isOwnProfile && (
              <Link to="/profile" className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-90 transition-transform">
                <Camera size={20} />
              </Link>
            )}
          </div>

          {/* Identity & Stats */}
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-1">
                  {profile.displayName || profile.username}
                </h2>
                {profile.bio && (
                  <p className="text-on-surface-variant font-body-md max-w-lg">{profile.bio}</p>
                )}
              </div>
              
              {isOwnProfile ? (
                <Link to="/profile" className="bg-primary text-white px-6 py-2.5 rounded-full font-label-md hover:brightness-110 active:scale-95 transition-all shadow-md inline-block">
                  Chỉnh sửa hồ sơ
                </Link>
              ) : (
                <FollowButton 
                  userId={profile.id} 
                  initialIsFollowing={profile.isFollowing} 
                  className="rounded-full shadow-md font-label-md px-8 py-2.5"
                />
              )}
            </div>

            {/* Statistics Bento-ish Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className={s.statBox}>
                <span className="block text-2xl text-primary font-bold mb-1">{profile.recipeCount || 0}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Công thức</span>
              </div>
              <div className={s.statBox}>
                <span className="block text-2xl text-primary font-bold mb-1">{profile.followerCount || 0}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Người theo dõi</span>
              </div>
              <div className={s.statBox}>
                <span className="block text-2xl text-primary font-bold mb-1">{profile.followingCount || 0}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đang theo dõi</span>
              </div>
              <div className={s.statBox}>
                <span className="block text-2xl text-primary font-bold mb-1">0</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đã lưu</span>
              </div>
            </div>
          </div>

        </div>
      </section>

        {/* Tabbed Interface */}
      <section className={`mb-10 ${fx.stagger2}`}>
        <div className={`flex items-center gap-8 mb-8 border-b border-outline-variant/20 overflow-x-auto ${s.hideScrollbar}`}>
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`pb-4 px-2 font-label-md whitespace-nowrap transition-all relative flex items-center ${activeTab === 'recipes' ? 'text-primary font-bold' : 'text-on-surface-variant font-medium hover:text-primary'}`}
          >
            <span>Công thức của tôi</span>
            <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-primary transition-all duration-300 ${activeTab === 'recipes' ? 'w-full' : 'w-0'}`}></div>
          </button>
          
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 px-2 font-label-md whitespace-nowrap transition-all relative flex items-center ${activeTab === 'saved' ? 'text-primary font-bold' : 'text-on-surface-variant font-medium hover:text-primary'}`}
          >
            <span>Đã lưu</span>
            <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-primary transition-all duration-300 ${activeTab === 'saved' ? 'w-full' : 'w-0'}`}></div>
          </button>
          
          <button 
            onClick={() => setActiveTab('activity')}
            className={`pb-4 px-2 font-label-md whitespace-nowrap transition-all relative flex items-center ${activeTab === 'activity' ? 'text-primary font-bold' : 'text-on-surface-variant font-medium hover:text-primary'}`}
          >
            <span>Hoạt động</span>
            <div className={`absolute bottom-[-1px] left-0 h-[3px] bg-primary transition-all duration-300 ${activeTab === 'activity' ? 'w-full' : 'w-0'}`}></div>
          </button>
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

    </div>
  );
};

export default UserProfilePage;
