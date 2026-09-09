import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, User, Lock, Save, Loader2, ArrowLeft, Share2, Utensils, Heart, Mail, BookText, Globe, MapPin, Shield, Trash2, ChevronRight, BookOpen, Eye, EyeOff, LogOut, Users, Calendar, CheckCircle2, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { userService } from '../services/userService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatar from '../components/ui/UserAvatar';
import BadgesModal, { BADGE_DEFINITIONS } from '../components/profile/BadgesModal';

import s from '../styles/pages/EditProfilePage.module.css';
import fx from '../styles/effects.module.css';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(50, 'Tên quá dài'),
  bio: z.string().max(500, 'Tiểu sử không được vượt quá 500 ký tự').optional().or(z.literal('')),
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteAccount(deletePassword),
    onSuccess: () => {
      toast.success('Tài khoản đã được xóa thành công.');
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Xóa tài khoản thất bại.';
      toast.error(msg);
    },
  });

  const handleOpenDeleteModal = () => {
    setDeletePassword('');
    setShowDeletePassword(false);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu để xác nhận.');
      return;
    }
    deleteAccountMutation.mutate();
  };

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
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, watch, formState: { errors: profileErrors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
    }
  });

  const watchedBio = watch('bio') || '';

  React.useEffect(() => {
    if (currentProfile) {
      resetProfile({
        displayName: currentProfile.displayName || currentProfile.username || '',
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
      
      {/* 1. Profile Header Banner (Horizontal, Non-overlapping, Cohesive) */}
      <section className={`${s.profileBanner} ${fx.stagger1}`}>
        {/* Left: Identity info */}
        <div className={s.bannerIdentity}>
          <div className={s.avatarWrapper} onClick={() => fileInputRef.current?.click()} title="Bấm để đổi ảnh đại diện">
            <UserAvatar
              src={currentProfile?.avatarUrl}
              name={currentProfile?.displayName || currentProfile?.username}
              className="w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl font-bold border-4 border-white shadow-md"
            />
            <button 
              type="button" 
              className={s.btnCamera} 
              disabled={updateAvatarMutation.isPending}
              title="Tải ảnh mới"
            >
              {updateAvatarMutation.isPending ? <Loader2 size={15} className={fx.spinner} /> : <Camera size={15} />}
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarChange}
              accept="image/*"
            />
          </div>

          <div className={s.bannerDetails}>
            <div className={s.bannerNameRow}>
              <h2 className={s.bannerName}>
                {currentProfile?.displayName || currentProfile?.username}
              </h2>
              <span className={s.bannerRoleBadge}>
                {currentProfile?.recipeCount > 0 ? 'Đầu bếp' : 'Thành viên'}
              </span>
            </div>
            
            <div className={s.bannerMeta}>
              <span className="font-semibold text-[#553e32]">@{currentProfile?.username}</span>
              <span>•</span>
              <span>Mã đầu bếp: #{currentProfile?.id || '--'}</span>
              {currentProfile?.createdAt && (
                <>
                  <span>•</span>
                  <span>Tham gia: {new Date(currentProfile.createdAt).toLocaleDateString('vi-VN')}</span>
                </>
              )}
            </div>

            <p className={s.bannerBioSnippet}>
              "{currentProfile?.bio || 'Yêu thích nấu ăn và sẻ chia hương vị bữa cơm gia đình'}"
            </p>
          </div>
        </div>

        {/* Right: Real live Stats & Quick Action buttons */}
        <div className={s.bannerRight}>
          <div className={s.miniStatsGroup}>
            <div className={s.miniStatItem} title="Tổng số công thức bạn đã chia sẻ">
              <BookOpen size={14} className="text-[#a13923]" />
              <span className={s.miniStatVal}>{currentProfile?.recipeCount || 0}</span>
              <span>Công thức</span>
            </div>
            <div className={s.miniStatItem} title="Số người đang theo dõi bạn">
              <Users size={14} className="text-[#a13923]" />
              <span className={s.miniStatVal}>{currentProfile?.followerCount || 0}</span>
              <span>Người theo dõi</span>
            </div>
            <div className={s.miniStatItem} title="Số người bạn đang theo dõi">
              <Heart size={14} className="text-[#a13923]" />
              <span className={s.miniStatVal}>{currentProfile?.followingCount || 0}</span>
              <span>Đang theo dõi</span>
            </div>
          </div>

          <div className={s.bannerActions}>
            <button 
              type="button"
              className={s.btnChangeAvatar}
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatarMutation.isPending}
            >
              <Camera size={14} />
              <span>{updateAvatarMutation.isPending ? 'Đang tải...' : 'Đổi ảnh đại diện'}</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsBadgesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200/90 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Xem danh sách huy hiệu và thành tích ẩm thực"
            >
              <span>🏆</span>
              <span>Bộ sưu tập ({BADGE_DEFINITIONS.filter(b => b.checkUnlocked(currentProfile)).length}/{BADGE_DEFINITIONS.length})</span>
            </button>
            <Link 
              to={`/users/${currentProfile?.id}`}
              className={s.btnViewPublic}
              title="Xem trang cá nhân công khai dưới góc nhìn người khác"
            >
              <Eye size={14} />
              <span>Xem trang công khai</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Settings Grid (2 Columns: Left Form, Right Security) */}
      <div className={`${s.settingsGrid} ${fx.stagger2}`}>
        
        {/* Left Column: Form thông tin cá nhân */}
        <div className={s.formCard}>
          <div className={s.formHeader}>
            <div>
              <h3 className={s.formTitle}>Thông tin cá nhân</h3>
              <p className={s.formSubtitle}>Cập nhật tên hiển thị và lời giới thiệu của bạn trên Smart Recipe</p>
            </div>
            <button 
              onClick={handleSubmitProfile(onProfileSubmit)}
              disabled={!isDirty || updateProfileMutation.isPending}
              className={s.btnSave}
            >
              {updateProfileMutation.isPending ? (
                <Loader2 size={16} className={fx.spinner} />
              ) : (
                <Save size={16} />
              )}
              <span>Lưu thay đổi</span>
            </button>
          </div>

          <form className={s.formFields} onSubmit={handleSubmitProfile(onProfileSubmit)}>
            <div className={s.fieldRow2}>
              {/* Name Input */}
              <div className={s.fieldGroup}>
                <label className={s.fieldLabel}>Tên hiển thị</label>
                <div className={s.inputWrapper}>
                  <User className={s.inputIcon} size={18} />
                  <input 
                    type="text" 
                    {...registerProfile('displayName')}
                    placeholder="Ví dụ: Hoàng Tùng"
                    className={s.inputField} 
                  />
                </div>
                {profileErrors.displayName ? (
                  <p className={s.errorMessage}>{profileErrors.displayName.message}</p>
                ) : (
                  <p className="text-[11px] text-[#8c786c] mt-0.5 ml-1">Tên xuất hiện trên các công thức công khai.</p>
                )}
              </div>

              {/* Email Input (Read-only) */}
              <div className={s.fieldGroup}>
                <div className="flex items-center justify-between mb-0.5">
                  <label className={s.fieldLabel}>Email tài khoản</label>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 size={11} /> Đã liên kết
                  </span>
                </div>
                <div className={s.inputWrapper}>
                  <Mail className={s.inputIcon} size={18} />
                  <input 
                    type="email" 
                    value={currentProfile?.email || ''} 
                    disabled
                    className={`${s.inputField} opacity-75 cursor-not-allowed bg-black/[0.02]`} 
                  />
                </div>
                <p className="text-[11px] text-[#8c786c] mt-0.5 ml-1">Dùng để đăng nhập và bảo mật.</p>
              </div>
            </div>

            {/* Bio Input */}
            <div className={s.fieldGroup}>
              <div className="flex items-center justify-between mb-0.5">
                <label className={s.fieldLabel}>Tiểu sử bản thân</label>
                <span className="text-xs text-[#8c786c] font-medium">{watchedBio.length}/500</span>
              </div>
              <div className={s.inputWrapper}>
                <BookText className={s.inputIconTop} size={18} />
                <textarea 
                  {...registerProfile('bio')}
                  className={s.textareaField} 
                  rows="3"
                  placeholder="Chia sẻ niềm đam mê nấu ăn của bạn... (Nếu để trống, hệ thống sẽ hiển thị câu mặc định ấm áp)"
                />
              </div>
              {profileErrors.bio && <p className={s.errorMessage}>{profileErrors.bio.message}</p>}
            </div>

            {/* Account strip */}
            <div className="p-3 px-4 bg-[#fff9f6] rounded-xl border border-[#f0e3d9] flex items-center justify-between text-xs text-[#796255] mt-1">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#a13923]" />
                <span>
                  Ngày tham gia: <strong>{currentProfile?.createdAt ? new Date(currentProfile.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}</strong>
                </span>
              </div>
              <div>
                <span>Trạng thái: <strong className="text-emerald-700 font-semibold">Đang hoạt động</strong></span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Bảo mật & Quản trị tài khoản */}
        <div className={s.securityCard}>
          <div>
            <h3 className={s.formTitle}>Bảo mật & Quản lý</h3>
            <p className={s.formSubtitle}>Thiết lập mật khẩu và quyền riêng tư tài khoản</p>
          </div>

          <div className={s.securityList}>
            <div className={s.securityItem} onClick={() => setIsBadgesModalOpen(true)}>
              <div className={s.securityLeft}>
                <div className={`${s.securityIcon} bg-amber-100 text-amber-800`}>
                  <Trophy size={20} />
                </div>
                <div>
                  <p className={s.securityTitle}>Huy hiệu hiển thị</p>
                  <p className={s.securityDesc}>Chọn tối đa 3 huy hiệu xuất hiện ở hồ sơ</p>
                </div>
              </div>
              <ChevronRight className={s.chevron} size={18} />
            </div>

            <div className={s.securityItem} onClick={handleOpenPasswordModal}>
              <div className={s.securityLeft}>
                <div className={`${s.securityIcon} ${s.iconShield}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <p className={s.securityTitle}>Đổi mật khẩu</p>
                  <p className={s.securityDesc}>Cập nhật mật khẩu định kỳ để an toàn</p>
                </div>
              </div>
              <ChevronRight className={s.chevron} size={18} />
            </div>

            <div className={s.securityItem} onClick={handleLogout}>
              <div className={s.securityLeft}>
                <div className={`${s.securityIcon} ${s.iconLogout}`}>
                  <LogOut size={20} />
                </div>
                <div>
                  <p className={s.securityTitle}>Đăng xuất</p>
                  <p className={s.securityDesc}>Thoát tài khoản trên thiết bị này</p>
                </div>
              </div>
              <ChevronRight className={s.chevron} size={18} />
            </div>

            <div className={s.securityItem} onClick={handleOpenDeleteModal}>
              <div className={s.securityLeft}>
                <div className={`${s.securityIcon} ${s.iconTrash}`}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <p className={`${s.securityTitle} text-red-600`}>Xóa tài khoản</p>
                  <p className={s.securityDesc}>Hành động vĩnh viễn không thể khôi phục</p>
                </div>
              </div>
              <ChevronRight className={s.chevron} size={18} />
            </div>
          </div>
        </div>

      </div>

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

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[sr-fadeIn_0.3s_ease-out_forwards]">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[420px] shadow-2xl relative animate-[sr-slideUpFade_0.4s_ease-out_forwards]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xóa tài khoản</h3>
            </div>

            {/* Warning */}
            <p className="text-sm text-gray-500 mb-1 leading-relaxed">
              Hành động này <strong className="text-red-600">không thể hoàn tác</strong>. Toàn bộ dữ liệu bao gồm công thức, nhật ký và tủ nguyên liệu sẽ bị xóa vĩnh viễn.
            </p>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Nhập mật khẩu của bạn để xác nhận:
            </p>

            {/* Password input */}
            <div className={s.fieldGroup}>
              <div className={s.inputWrapper}>
                <Lock className={s.inputIcon} size={18} />
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  placeholder="Mật khẩu xác nhận"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
                  className={s.inputField}
                  autoFocus
                />
                <button type="button" className={s.eyeButton} onClick={() => setShowDeletePassword(!showDeletePassword)}>
                  {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteAccountMutation.isPending}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="flex-1 py-3 bg-red-600 rounded-xl font-semibold text-white hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60"
              >
                {deleteAccountMutation.isPending
                  ? <Loader2 size={20} className={`${fx.spinner} mx-auto`} />
                  : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badges Collection Modal */}
      <BadgesModal 
        isOpen={isBadgesModalOpen} 
        onClose={() => setIsBadgesModalOpen(false)} 
        profile={currentProfile} 
        isOwner={true}
      />
    </div>
  );
};

export default EditProfilePage;
