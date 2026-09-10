import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { commentService } from '../../services/commentService';
import CommentItem from './CommentItem';
import ConfirmModal from '../ui/ConfirmModal';
import useAuthStore from '../../store/useAuthStore';
import useAuthPromptStore from '../../store/useAuthPromptStore';
import UserAvatar from '../ui/UserAvatar';
import { MessageSquare, Sparkles, LogIn, Send, ChefHat, AlertCircle } from 'lucide-react';
import styles from './CommentSection.module.css';

export default function CommentSection({ recipeId, recipeAuthorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthPromptStore((s) => s.openModal);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commentService.getByRecipeId(recipeId);
      setComments(data);
    } catch (err) {
      setError('Không thể tải bình luận. Vui lòng thử lại.');
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('Vui lòng đăng nhập để gửi bình luận!');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await commentService.create(recipeId, { content: newComment.trim() });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      setError('Không thể gửi bình luận. Vui lòng thử lại.');
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await commentService.create(recipeId, { content, parentId });
      await fetchComments();
    } catch (err) {
      console.error('Failed to reply:', err);
      throw err;
    }
  };

  const handleUpdate = async (commentId, content) => {
    try {
      await commentService.update(commentId, { content });
      await fetchComments();
    } catch (err) {
      console.error('Failed to update comment:', err);
      throw err;
    }
  };

  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const confirmDelete = async () => {
    if (!deleteCommentId) return;
    setIsDeleting(true);
    try {
      await commentService.delete(deleteCommentId);
      setDeleteCommentId(null);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Không thể xóa bình luận. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const userDisplayName = currentUser?.displayName || currentUser?.fullName || currentUser?.username || 'Bạn';

  return (
    <div className={styles.commentSection}>
      {/* SECTION HEADER */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconCircle}>
            <MessageSquare size={22} className={styles.headerIcon} />
          </div>
          <div>
            <h3 className={styles.title}>
              Bình luận & Đánh giá <span className={styles.titleCount}>({comments.length})</span>
            </h3>
            <p className={styles.subtitle}>
              Cùng chia sẻ cảm nhận, mẹo nấu nướng hoặc đặt câu hỏi cho đầu bếp
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* NẾU ĐÃ ĐĂNG NHẬP: Form nhập bình luận đặt ở đầu */}
      {isAuthenticated && (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <UserAvatar
              src={currentUser?.avatarUrl}
              name={userDisplayName}
              className={styles.formAvatar}
            />
            <span className={styles.formAuthorLabel}>
              Đang viết với tư cách <strong>{userDisplayName}</strong>
            </span>
          </div>

          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Bạn đã thử món này chưa? Hãy chia sẻ bí quyết, nêm nếm hoặc nhận xét của bạn nhé..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={submitting}
            />
          </div>

          <div className={styles.formFooter}>
            <span className={styles.charCount}>
              {newComment.length}/2000 ký tự
            </span>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !newComment.trim()}
            >
              <Send size={15} />
              <span>{submitting ? 'Đang gửi...' : 'Gửi bình luận'}</span>
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH BÌNH LUẬN / EMPTY STATE */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Đang tải bình luận cộng đồng...</p>
        </div>
      ) : comments.length === 0 ? (
        /* KHI CHƯA CÓ BÌNH LUẬN NÀO: Hợp nhất giao diện tinh tế */
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <ChefHat size={32} />
          </div>
          <h4 className={styles.emptyTitle}>Chưa có bình luận nào</h4>
          <p className={styles.emptyDesc}>
            {isAuthenticated
              ? 'Hãy là người đầu tiên chia sẻ cảm nhận hoặc đặt câu hỏi về món ăn này!'
              : 'Bạn đã thử nấu món này chưa? Hãy đăng nhập để là người đầu tiên chia sẻ cảm nhận hoặc đặt câu hỏi cho đầu bếp nhé!'}
          </p>
          {!isAuthenticated && (
            <div className={styles.emptyGuestAction}>
              <button
                type="button"
                onClick={() => openAuthModal('Vui lòng đăng nhập để gửi bình luận và đánh giá công thức này!')}
                className={styles.loginPromptBtn}
              >
                <LogIn size={16} />
                <span>Đăng nhập để viết bình luận</span>
              </button>
              <Link to="/register" className={styles.registerLink}>
                Chưa có tài khoản? <strong>Đăng ký ngay</strong>
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* KHI ĐÃ CÓ BÌNH LUẬN: Hiển thị danh sách bình luận trước */
        <div className={styles.commentsListWrapper}>
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                depth={0}
                recipeAuthorId={recipeAuthorId}
              />
            ))}
          </div>

          {/* DÀNH CHO KHÁCH: Sau khi đọc xong danh sách bình luận, mới thấy khung mời đăng nhập ở cuối */}
          {!isAuthenticated && (
            <div className={`${styles.loginPrompt} ${styles.loginPromptBottom}`}>
              <div className={styles.loginPromptContent}>
                <div className={styles.loginPromptIcon}>
                  <Sparkles size={22} />
                </div>
                <div className={styles.loginPromptText}>
                  <h4 className={styles.loginPromptTitle}>Tham gia thảo luận về món ăn này</h4>
                  <p className={styles.loginPromptDesc}>
                    Bạn muốn chia sẻ cảm nhận hoặc đặt câu hỏi? Đăng nhập để cùng bàn luận với cộng đồng nhé!
                  </p>
                </div>
              </div>
              <div className={styles.loginPromptActions}>
                <button
                  type="button"
                  onClick={() => openAuthModal('Vui lòng đăng nhập để gửi bình luận và đánh giá công thức này!')}
                  className={styles.loginPromptBtn}
                >
                  <LogIn size={16} />
                  <span>Đăng nhập để viết bình luận</span>
                </button>
                <Link to="/register" className={styles.registerLink}>
                  Chưa có tài khoản? <strong>Đăng ký ngay</strong>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hộp thoại xác nhận xóa đồng bộ chuẩn Design System */}
      <ConfirmModal
        isOpen={!!deleteCommentId}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này? Thao tác này sẽ xóa bình luận vĩnh viễn và không thể hoàn tác."
        confirmText="Xóa bình luận"
        cancelText="Hủy bỏ"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteCommentId(null)}
      />
    </div>
  );
}