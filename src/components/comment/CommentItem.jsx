import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useAuthPromptStore from '../../store/useAuthPromptStore';
import UserAvatar from '../ui/UserAvatar';
import { MessageCircle, Edit3, Trash2, ChefHat, ChevronDown, ChevronUp, CornerDownRight, Check, X } from 'lucide-react';
import styles from './CommentSection.module.css';

export default function CommentItem({ comment, onReply, onUpdate, onDelete, depth = 0, recipeAuthorId }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReplies, setShowReplies] = useState(true);

  const currentUser = useAuthStore((s) => s.user);
  const openAuthModal = useAuthPromptStore((s) => s.openModal);

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
    if (!currentUser) {
      openAuthModal('Vui lòng đăng nhập để trả lời bình luận này!');
      return;
    }
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
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

  const isOwner = !!currentUser?.id && Number(currentUser.id) === Number(comment.author?.id);
  const isRecipeAuthor = recipeAuthorId && Number(recipeAuthorId) === Number(comment.author?.id);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const authorName = comment.author?.displayName || comment.author?.fullName || comment.author?.username || 'Người dùng';

  return (
    <div
      className={`${styles.commentItem} ${depth > 0 ? styles.nestedItem : styles.rootItem}`}
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 24, 72)}px` : 0 }}
    >
      <div className={styles.commentHeader}>
        <UserAvatar
          src={comment.author?.avatarUrl}
          name={authorName}
          className={styles.avatar}
        />
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>
            {authorName}
          </span>
          {isRecipeAuthor && (
            <span className={styles.recipeAuthorBadge} title="Tác giả công thức này">
              <ChefHat size={12} /> Tác giả
            </span>
          )}
          <span className={styles.commentDot}>•</span>
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
                <Check size={14} />
                <span>{submitting ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                <X size={14} />
                <span>Hủy</span>
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.commentText}>{comment.content}</p>
        )}
      </div>

      <div className={styles.commentActions}>
        <button
          className={styles.actionBtn}
          onClick={() => {
            if (!currentUser) {
              openAuthModal('Vui lòng đăng nhập để trả lời bình luận này!');
              return;
            }
            setIsReplying(!isReplying);
          }}
        >
          <MessageCircle size={13} />
          <span>{isReplying ? 'Hủy trả lời' : 'Trả lời'}</span>
        </button>

        {isOwner && (
          <>
            <button
              className={styles.actionBtn}
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={13} />
              <span>Sửa</span>
            </button>
            <button
              className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 size={13} />
              <span>Xóa</span>
            </button>
          </>
        )}

        {hasReplies && (
          <button
            className={`${styles.actionBtn} ${styles.toggleRepliesBtn}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{showReplies ? `Ẩn ${comment.replies.length} phản hồi` : `Xem ${comment.replies.length} phản hồi`}</span>
          </button>
        )}
      </div>

      {isReplying && (
        <form onSubmit={handleReplySubmit} className={styles.replyForm}>
          <div className={styles.replyFormIndicator}>
            <CornerDownRight size={16} className="text-[#a13923]" />
            <span>Trả lời @{authorName}</span>
          </div>
          <textarea
            className={styles.replyTextarea}
            placeholder={`Viết câu trả lời cho @${authorName}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
            maxLength={2000}
            disabled={submitting}
            autoFocus
          />
          {error && <span className={styles.error}>{error}</span>}
          <div className={styles.replyActions}>
            <button
              type="button"
              className={styles.cancelReplyBtn}
              onClick={() => setIsReplying(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.replyBtn}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
            </button>
          </div>
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
              recipeAuthorId={recipeAuthorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}