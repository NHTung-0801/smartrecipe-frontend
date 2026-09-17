import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import useAuthStore from '../store/useAuthStore';
import useAuthPromptStore from '../store/useAuthPromptStore';

const FollowButton = ({ userId, initialIsFollowing = false, onFollowChange, className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(Boolean(initialIsFollowing));
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthPromptStore((s) => s.openModal);

  useEffect(() => {
    setIsFollowing(Boolean(initialIsFollowing));
  }, [initialIsFollowing]);

  const toggleFollowMutation = useMutation({
    mutationFn: async (currentlyFollowing) => {
      // currentlyFollowing là trạng thái trước khi người dùng click
      if (currentlyFollowing) {
        return await userService.unfollowUser(userId);
      } else {
        return await userService.followUser(userId);
      }
    },
    onMutate: async (currentlyFollowing) => {
      // Optimistic update: đảo trạng thái ngay lập tức trên UI
      const nextStatus = !currentlyFollowing;
      setIsFollowing(nextStatus);
      onFollowChange?.(nextStatus);
      return { wasFollowing: currentlyFollowing };
    },
    onSuccess: (data, currentlyFollowing, context) => {
      const wasFollowing = context?.wasFollowing ?? currentlyFollowing;
      const actionMsg = wasFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi thành công! 🎉';
      toast.success(data?.message || actionMsg);
      queryClient.invalidateQueries({ queryKey: ['publicProfile', String(userId)] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', Number(userId)] });
      queryClient.invalidateQueries({ queryKey: ['followers', String(userId)] });
      queryClient.invalidateQueries({ queryKey: ['followers', Number(userId)] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    onError: (error, currentlyFollowing, context) => {
      const rollbackStatus = context?.wasFollowing ?? currentlyFollowing;
      setIsFollowing(rollbackStatus);
      onFollowChange?.(rollbackStatus);
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
    if (toggleFollowMutation.isPending) return;

    // Truyền trực tiếp trạng thái hiện tại vào mutate
    toggleFollowMutation.mutate(isFollowing);
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
