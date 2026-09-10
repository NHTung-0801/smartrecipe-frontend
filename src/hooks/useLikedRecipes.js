import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import useAuthPromptStore from '../store/useAuthPromptStore';
import { recipeService } from '../services/recipeService';

function getLocalLikes(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`sr_liked_ids_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLikes(userId, ids) {
  if (!userId) return;
  try {
    localStorage.setItem(`sr_liked_ids_${userId}`, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/**
 * Hook quản lý danh sách món ăn đã thích của người dùng.
 * Tự động đồng bộ với backend và cache dữ liệu, giúp trái tim luôn hiển thị đỏ
 * trên mọi thành phần giao diện (RecipeCard, Carousel, DetailPage).
 */
export function useLikedRecipes() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthPromptStore((state) => state.openModal);

  const userId = user?.id;

  const { data: likedIds = [] } = useQuery({
    queryKey: ['liked-recipe-ids', userId],
    queryFn: async () => {
      const ids = await recipeService.getLikedRecipeIds();
      const numIds = (Array.isArray(ids) ? ids : []).map(Number);
      saveLocalLikes(userId, numIds);
      return numIds;
    },
    enabled: !!isAuthenticated && !!userId,
    initialData: () => getLocalLikes(userId),
    staleTime: 1000 * 60 * 5, // 5 phút
    refetchOnWindowFocus: false,
  });

  const likedSet = useMemo(() => {
    return new Set((likedIds || []).map(Number));
  }, [likedIds]);

  const isLiked = useCallback(
    (recipeId) => {
      if (!isAuthenticated || !recipeId) return false;
      return likedSet.has(Number(recipeId));
    },
    [isAuthenticated, likedSet]
  );

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ recipeId, currentlyLiked }) => {
      if (currentlyLiked) {
        await recipeService.unlike(recipeId);
      } else {
        await recipeService.like(recipeId);
      }
      return { recipeId, currentlyLiked };
    },
    onMutate: async ({ recipeId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['liked-recipe-ids', userId] });
      const previousIds = queryClient.getQueryData(['liked-recipe-ids', userId]) || [];
      const numId = Number(recipeId);

      const nextIds = currentlyLiked
        ? previousIds.filter((id) => Number(id) !== numId)
        : [...previousIds.filter((id) => Number(id) !== numId), numId];

      queryClient.setQueryData(['liked-recipe-ids', userId], nextIds);
      saveLocalLikes(userId, nextIds);

      return { previousIds };
    },
    onError: (err, variables, context) => {
      console.error('Lỗi cập nhật yêu thích:', err);
      if (context?.previousIds) {
        queryClient.setQueryData(['liked-recipe-ids', userId], context.previousIds);
        saveLocalLikes(userId, context.previousIds);
      }
      toast.error('Không thể cập nhật lượt thích. Vui lòng thử lại.');
    },
    onSuccess: (_, variables) => {
      if (variables.currentlyLiked) {
        toast.info('Đã bỏ thích công thức');
      } else {
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-recipe-ids', userId] });
    },
  });

  const toggleLike = useCallback(
    (recipeId) => {
      if (!isAuthenticated) {
        openAuthModal('Lưu công thức yêu thích');
        return false;
      }
      const currentlyLiked = likedSet.has(Number(recipeId));
      toggleLikeMutation.mutate({ recipeId, currentlyLiked });
      return !currentlyLiked;
    },
    [isAuthenticated, likedSet, openAuthModal, toggleLikeMutation]
  );

  return {
    likedIds,
    isLiked,
    toggleLike,
    isAuthenticated,
  };
}

export default useLikedRecipes;
