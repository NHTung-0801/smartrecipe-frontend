import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Calendar, BookOpen, Users, UserCheck, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { recipeService } from '../services/recipeService';
import useAuthStore from '../store/useAuthStore';
import FollowButton from '../components/FollowButton';
import RecipeCard from '../components/RecipeCard';

const UserProfilePage = () => {
  const { id } = useParams();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isOwnProfile = currentUserId === parseInt(id, 10);

  // Lấy thông tin profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => userService.getPublicProfile(id),
  });

  // Lấy danh sách công thức public của user
  const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['userRecipes', id],
    queryFn: () => recipeService.getUserPublicRecipes(id, 0, 20),
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const profile = profileData?.data;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Không tìm thấy người dùng này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 md:-mt-20 mb-6 gap-6">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <User className="w-16 h-16 md:w-20 md:h-20" />
                    </div>
                  )}
                </div>
                
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.displayName || profile.username}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>

              <div className="pb-2 w-full md:w-auto flex justify-start md:justify-end">
                {isOwnProfile ? (
                  <Link 
                    to="/profile" 
                    className="inline-flex items-center px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Chỉnh sửa hồ sơ
                  </Link>
                ) : (
                  <FollowButton 
                    userId={profile.id} 
                    initialIsFollowing={profile.isFollowing} 
                    className="w-full md:w-auto shadow-sm"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {profile.bio ? (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tiểu sử</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                ) : null}

                <div className="flex gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <span>Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 h-fit">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-medium">Công thức</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{profile.recipeCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium">Người theo dõi</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{profile.followerCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-medium">Đang theo dõi</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{profile.followingCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Công thức của {profile.displayName || profile.username}
          </h2>
          
          {isLoadingRecipes ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : recipesData?.data?.content?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipesData.data.content.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có công thức nào</h3>
              <p className="text-gray-500">Người dùng này chưa chia sẻ công thức nào.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
