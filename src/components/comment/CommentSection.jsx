import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../../services/commentService';
import CommentItem from './CommentItem';
import styles from './CommentSection.module.css';

export default function CommentSection({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!localStorage.getItem('accessToken');

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

  const handleDelete = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await commentService.delete(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Không thể xóa bình luận.');
    }
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.title}>
        Bình luận ({comments.length})
      </h3>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {isLoggedIn ? (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={submitting}
          />
          <div className={styles.formFooter}>
            <span className={styles.charCount}>
              {newComment.length}/2000
            </span>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <p className={styles.loginPrompt}>
          <a href="/login">Đăng nhập</a> để viết bình luận.
        </p>
      )}

      {loading ? (
        <p className={styles.loading}>Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}