import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import useAuthStore from '../store/useAuthStore';
import useAuthPromptStore from '../store/useAuthPromptStore';

const FollowButton = ({ userId, initialIsFollowing = false, className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthPromptStore((s) => s.openModal);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return await userService.unfollowUser(userId);
      } else {
        return await userService.followUser(userId);
      }
    },
    onMutate: async () => {
      setIsFollowing(!isFollowing);
    },
    onSuccess: (data) => {
      toast.success(data?.message || (isFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi thành công'));
      queryClient.invalidateQueries({ queryKey: ['publicProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
    },
    onError: (error) => {
      setIsFollowing(isFollowing);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  });

  const handleToggleFollow = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('Vui lòng đăng nhập để theo dõi đầu bếp này và nhận thông báo công thức mới!');
      return;
    }
    toggleFollowMutation.mutate();
  };

  if (isFollowing) {
    return (
      <button
        type="button"
        onClick={handleToggleFollow}
        disabled={toggleFollowMutation.isPending}
        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f0e3d9] text-[#553e32] font-semibold text-xs rounded-full hover:bg-[#e4d2c5] transition-all shadow-sm ${className}`}
      >
        {toggleFollowMutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <UserCheck className="w-3.5 h-3.5 text-[#a13923]" />
        )}
        Đang theo dõi
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      disabled={toggleFollowMutation.isPending}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#a13923] text-white font-semibold text-xs rounded-full hover:bg-[#8b311e] transition-all shadow-sm shadow-[#a13923]/25 hover:-translate-y-0.5 ${className}`}
    >
      {toggleFollowMutation.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      Theo dõi
    </button>
  );
};

export default FollowButton;
