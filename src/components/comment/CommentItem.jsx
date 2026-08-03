import { useState } from 'react';
import styles from './CommentSection.module.css';

export default function CommentItem({ comment, onReply, onUpdate, onDelete, depth }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReplies, setShowReplies] = useState(true);

  const currentUserId = getCurrentUserId();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    } catch (err) {
      setError('Không thể gửi trả lời.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      setError('Không thể cập nhật bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = currentUserId && Number(currentUserId) === Number(comment.author?.id);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div
      className={`${styles.commentItem} ${depth > 0 ? styles.nested : ''}`}
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 20, 80)}px` : 0 }}
    >
      <div className={styles.commentHeader}>
        <img
          src={comment.author?.avatarUrl || '/default-avatar.png'}
          alt={comment.author?.displayName || comment.author?.username}
          className={styles.avatar}
        />
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>
            {comment.author?.displayName || comment.author?.username || 'Người dùng'}
          </span>
          <span className={styles.commentTime}>{formatDate(comment.createdAt)}</span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <span className={styles.editedLabel}>(đã sửa)</span>
          )}
        </div>
      </div>

      <div className={styles.commentBody}>
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className={styles.editForm}>
            <textarea
              className={styles.editTextarea}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={submitting}
            />
            {error && <span className={styles.error}>{error}</span>}
            <div className={styles.editActions}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting || !editContent.trim()}
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                  setError(null);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.commentContent}>{comment.content}</p>
        )}
      </div>

      <div className={styles.commentActions}>
        {isOwner && !isEditing && (
          <>
            <button
              className={styles.actionBtn}
              onClick={() => setIsEditing(true)}
            >
              Sửa
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => onDelete(comment.id)}
            >
              Xóa
            </button>
          </>
        )}
        <button
          className={styles.actionBtn}
          onClick={() => setIsReplying(!isReplying)}
        >
          {isReplying ? 'Hủy trả lời' : 'Trả lời'}
        </button>
        {hasReplies && (
          <button
            className={styles.actionBtn}
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? `Ẩn ${comment.replies.length} trả lời` : `Xem ${comment.replies.length} trả lời`}
          </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className={styles.replyForm}>
          <textarea
            className={styles.replyTextarea}
            placeholder={`Trả lời @${comment.author?.displayName || comment.author?.username}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
            maxLength={2000}
            disabled={submitting}
          />
          {error && <span className={styles.error}>{error}</span>}
          <button
            type="submit"
            className={styles.replyBtn}
            disabled={submitting || !replyContent.trim()}
          >
            {submitting ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      )}

      {hasReplies && showReplies && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Lấy userId từ JWT token trong localStorage */
function getCurrentUserId() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
}