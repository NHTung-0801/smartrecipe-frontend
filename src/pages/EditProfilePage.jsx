import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, User, Lock, Save, Loader2, ArrowLeft, Share2, Utensils, Heart, Mail, BookText, Globe, MapPin, Shield, Trash2, ChevronRight, BookOpen, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { userService } from '../services/userService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import s from '../styles/pages/EditProfilePage.module.css';
import fx from '../styles/effects.module.css';

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
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "Mật khẩu mới không được trùng với mật khẩu cũ",
  path: ["newPassword"],
});

const EditProfilePage = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const handleOpenPasswordModal = () => {
    resetPassword();
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    resetPassword();
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Fetch Profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile
  });

  React.useEffect(() => {
    if (profileData?.data) {
      updateUser(profileData.data);
    }
  }, [profileData, updateUser]);

  const currentProfile = profileData?.data || user;

  // Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
    }
  });

  React.useEffect(() => {
    if (currentProfile) {
      resetProfile({
        displayName: currentProfile.displayName || '',
        bio: currentProfile.bio || '',
      });
    }
  }, [currentProfile, resetProfile]);

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
      handleClosePasswordModal();
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
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp hình ảnh hợp lệ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }
    updateAvatarMutation.mutate(file);
  };

  if (isLoadingProfile && !currentProfile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className={`${fx.spinner} text-primary w-10 h-10`} />
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      
      {/* Hero Section / Statistics */}
      <section className={`${s.heroGrid} ${fx.stagger1}`}>
        {/* User Profile Intro */}
        <div className={s.profileIntro}>
          <div className={s.avatarGroup} onClick={() => fileInputRef.current?.click()}>
            <div className={s.avatarCircle}>
              {currentProfile?.avatarUrl ? (
                <img src={currentProfile.avatarUrl} alt="Avatar" className={s.avatarImg} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <User size={48} />
                </div>
              )}
            </div>
            <button className={s.btnCamera} disabled={updateAvatarMutation.isPending}>
              {updateAvatarMutation.isPending ? <Loader2 size={20} className={fx.spinner} /> : <Camera size={20} />}
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarChange}
              accept="image/*"
            />
          </div>
          
          <h2 className={s.userName}>{currentProfile?.displayName || currentProfile?.username}</h2>
          <p className={s.userBio}>{currentProfile?.bio || 'Đam mê ẩm thực & Sống khỏe'}</p>
          
          <div className={s.actionButtons}>
            <button className={s.btnChangePhoto} onClick={() => fileInputRef.current?.click()}>
              Đổi ảnh
            </button>
            <button className={s.btnShare}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Bento Stats Cards */}
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={s.statCardGlow1} />
            <div className={s.statHeader}>
              <div className={`${s.statIcon} ${s.statIcon1}`}>
                <BookOpen size={20} />
              </div>
              <span className={s.statChange}>+12% tháng này</span>
            </div>
            <div className={s.statBody}>
              <span className={`${s.statNumber} ${s.statNumber1}`}>{currentProfile?.recipeCount || 0}</span>
              <p className={s.statLabel}>Công thức đã tạo</p>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardGlow2} />
            <div className={s.statHeader}>
              <div className={`${s.statIcon} ${s.statIcon2}`}>
                <Heart size={20} />
              </div>
              <span className={s.statChange}>Lượt yêu thích</span>
            </div>
            <div className={s.statBody}>
              <span className={`${s.statNumber} ${s.statNumber2}`}>1.2k</span>
              <p className={s.statLabel}>Lượt thích nhận được</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Settings Form */}
      <section className={`${s.formSection} ${fx.stagger2}`}>
        <div className={s.formHeader}>
          <div>
            <h3 className={s.formTitle}>Thông tin cá nhân</h3>
            <p className={s.formSubtitle}>Cập nhật chi tiết tài khoản của bạn tại đây.</p>
          </div>
          <button 
            onClick={handleSubmitProfile(onProfileSubmit)}
            disabled={!isDirty || updateProfileMutation.isPending}
            className={s.btnSave}
          >
            {updateProfileMutation.isPending ? <Loader2 size={18} className={fx.spinner} /> : 'Lưu thay đổi'}
          </button>
        </div>

        <form className={s.formGrid}>
          {/* Name Input */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Họ và tên</label>
            <div className={s.inputWrapper}>
              <User className={s.inputIcon} size={18} />
              <input 
                type="text" 
                {...registerProfile('displayName')}
                className={s.inputField} 
              />
            </div>
            {profileErrors.displayName && <p className={s.errorMessage}>{profileErrors.displayName.message}</p>}
          </div>

          {/* Email Input (Disabled/Read-only since API might not support changing email easily here) */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Email liên kết</label>
            <div className={s.inputWrapper}>
              <Mail className={s.inputIcon} size={18} />
              <input 
                type="email" 
                value={currentProfile?.email || ''} 
                disabled
                className={`${s.inputField} opacity-60 cursor-not-allowed`} 
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className={s.fieldGroupFull}>
            <label className={s.fieldLabel}>Tiểu sử</label>
            <div className={s.inputWrapper}>
              <BookText className={s.inputIconTop} size={18} />
              <textarea 
                {...registerProfile('bio')}
                className={s.textareaField} 
                rows="2"
                placeholder="Chia sẻ đôi điều về bạn..."
              />
            </div>
            {profileErrors.bio && <p className={s.errorMessage}>{profileErrors.bio.message}</p>}
          </div>
        </form>

        {/* Additional Options */}
        <div className={s.dangerZone}>
          <div className={s.optionItem} onClick={handleOpenPasswordModal}>
            <div className={s.optionContent}>
              <div className={`${s.optionIcon} ${s.optionIcon1}`}>
                <Shield size={24} />
              </div>
              <div>
                <p className={`${s.optionTitle} ${s.optionTitle1}`}>Đổi mật khẩu</p>
                <p className={s.optionDesc}>Bảo mật tài khoản của bạn</p>
              </div>
            </div>
            <ChevronRight className={s.chevron} size={20} />
          </div>

          <div className={s.optionItem}>
            <div className={s.optionContent}>
              <div className={`${s.optionIcon} ${s.optionIcon2}`}>
                <Trash2 size={24} />
              </div>
              <div>
                <p className={`${s.optionTitle} ${s.optionTitle2}`}>Xóa tài khoản</p>
                <p className={s.optionDesc}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <ChevronRight className={s.chevron} size={20} />
          </div>
        </div>
      </section>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[sr-fadeIn_0.3s_ease-out_forwards]">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[420px] shadow-2xl relative animate-[sr-slideUpFade_0.4s_ease-out_forwards]">
            <h3 className="text-2xl font-bold text-on-surface mb-6">Đổi mật khẩu</h3>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              <div className={s.fieldGroup}>
                <label className={s.fieldLabel}>Mật khẩu cũ</label>
                <div className={s.inputWrapper}>
                  <Lock className={s.inputIcon} size={18} />
                  <input type={showOldPassword ? "text" : "password"} {...registerPassword('oldPassword')} className={s.inputField} />
                  <button type="button" className={s.eyeButton} onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.oldPassword && <p className={s.errorMessage}>{passwordErrors.oldPassword.message}</p>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.fieldLabel}>Mật khẩu mới</label>
                <div className={s.inputWrapper}>
                  <Lock className={s.inputIcon} size={18} />
                  <input type={showNewPassword ? "text" : "password"} {...registerPassword('newPassword')} className={s.inputField} />
                  <button type="button" className={s.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className={s.errorMessage}>{passwordErrors.newPassword.message}</p>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.fieldLabel}>Xác nhận mật khẩu</label>
                <div className={s.inputWrapper}>
                  <Lock className={s.inputIcon} size={18} />
                  <input type={showConfirmPassword ? "text" : "password"} {...registerPassword('confirmPassword')} className={s.inputField} />
                  <button type="button" className={s.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className={s.errorMessage}>{passwordErrors.confirmPassword.message}</p>}
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={handleClosePasswordModal} className="flex-1 py-3 bg-surface-container-high rounded-xl font-label-md font-semibold text-on-surface hover:brightness-95 transition-all">Hủy</button>
                <button type="submit" disabled={changePasswordMutation.isPending} className="flex-1 py-3 bg-primary rounded-xl font-label-md font-semibold text-white hover:brightness-110 active:scale-95 transition-all">
                  {changePasswordMutation.isPending ? <Loader2 size={20} className={`${fx.spinner} mx-auto`} /> : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;
