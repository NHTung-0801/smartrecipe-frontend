import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const FollowButton = ({ userId, initialIsFollowing, className = '' }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return await userService.unfollowUser(userId);
      } else {
        return await userService.followUser(userId);
      }
    },
    onMutate: async () => {
      // Optimistic update
      setIsFollowing(!isFollowing);
    },
    onSuccess: (data) => {
      toast.success(data?.message || (isFollowing ? 'Đã hủy theo dõi' : 'Đã theo dõi thành công'));
      // Invalidate relevant queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ['publicProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
    },
    onError: (error) => {
      // Revert on error
      setIsFollowing(isFollowing);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  });

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để theo dõi tác giả này');
      navigate('/login');
      return;
    }
    toggleFollowMutation.mutate();
  };

  if (isFollowing) {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={toggleFollowMutation.isPending}
        className={`flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors ${className}`}
      >
        {toggleFollowMutation.isPending ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <UserMinus className="w-5 h-5 mr-2" />
        )}
        Đang theo dõi
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={toggleFollowMutation.isPending}
      className={`flex items-center justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors ${className}`}
    >
      {toggleFollowMutation.isPending ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-5 h-5 mr-2" />
      )}
      Theo dõi
    </button>
  );
};

export default FollowButton;
