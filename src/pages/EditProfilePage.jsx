import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, User, Lock, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { userService } from '../services/userService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(50, 'Tên quá dài'),
  bio: z.string().max(500, 'Tiểu sử quá dài').optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

const EditProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch Profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile
  });

  // Sync to store when data arrives
  React.useEffect(() => {
    if (profileData?.data) {
      updateUser(profileData.data);
    }
  }, [profileData, updateUser]);

  const currentProfile = profileData?.data || user;

  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
    }
  });

  // Sync form values khi dữ liệu profile từ API về
  React.useEffect(() => {
    if (currentProfile) {
      resetProfile({
        displayName: currentProfile.displayName || '',
        bio: currentProfile.bio || '',
      });
    }
  }, [currentProfile, resetProfile]);

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      toast.success(data.message || 'Cập nhật hồ sơ thành công!');
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Đổi mật khẩu thành công!');
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Mật khẩu cũ không chính xác');
    }
  });

  const updateAvatarMutation = useMutation({
    mutationFn: userService.updateAvatar,
    onSuccess: (data) => {
      toast.success(data.message || 'Cập nhật ảnh đại diện thành công!');
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh');
    }
  });

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp hình ảnh hợp lệ');
      return;
    }
    
    // Check file size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    updateAvatarMutation.mutate(file);
  };

  if (isLoadingProfile && !currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hồ sơ cá nhân</h1>
        </div>

        <div className="bg-white shadow-xl shadow-emerald-900/5 rounded-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 bg-gray-50/50 p-6 border-r border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                  {currentProfile?.avatarUrl ? (
                    <img 
                      src={currentProfile.avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updateAvatarMutation.isPending}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {updateAvatarMutation.isPending ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{currentProfile?.displayName || currentProfile?.username}</h2>
              <p className="text-sm text-gray-500 mb-8">{currentProfile?.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                Thông tin chung
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'password' 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Lock className="w-5 h-5 mr-3" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="w-full md:w-2/3 p-8 lg:p-12">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chung</h3>
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập (Username)</label>
                    <input 
                      type="text" 
                      value={currentProfile?.username || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                    <input 
                      type="text" 
                      {...registerProfile('displayName')}
                      className={`w-full px-4 py-3 rounded-xl border ${profileErrors.displayName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-white transition-colors focus:ring-2 outline-none`}
                      placeholder="Nhập tên hiển thị của bạn"
                    />
                    {profileErrors.displayName && <p className="mt-2 text-sm text-red-600">{profileErrors.displayName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử (Bio)</label>
                    <textarea 
                      {...registerProfile('bio')}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-xl border ${profileErrors.bio ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-white transition-colors focus:ring-2 outline-none resize-none`}
                      placeholder="Giới thiệu đôi nét về bản thân..."
                    ></textarea>
                    {profileErrors.bio && <p className="mt-2 text-sm text-red-600">{profileErrors.bio.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h3>
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      {...registerPassword('oldPassword')}
                      className={`w-full px-4 py-3 rounded-xl border ${passwordErrors.oldPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-white transition-colors focus:ring-2 outline-none`}
                      placeholder="••••••••"
                    />
                    {passwordErrors.oldPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.oldPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      {...registerPassword('newPassword')}
                      className={`w-full px-4 py-3 rounded-xl border ${passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-white transition-colors focus:ring-2 outline-none`}
                      placeholder="••••••••"
                    />
                    {passwordErrors.newPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      {...registerPassword('confirmPassword')}
                      className={`w-full px-4 py-3 rounded-xl border ${passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} bg-white transition-colors focus:ring-2 outline-none`}
                      placeholder="••••••••"
                    />
                    {passwordErrors.confirmPassword && <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      className="flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5 mr-2" />
                      )}
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
