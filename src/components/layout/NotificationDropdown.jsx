import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CheckCheck, Clock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { notificationService } from '../../services/notificationService';
import UserAvatar from '../ui/UserAvatar';
import s from '../../styles/layout/NotificationDropdown.module.css';

const formatRelativeTime = (dateStr) => {
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

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Polling số lượng thông báo chưa đọc mỗi 30 giây
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
    enabled: !!isAuthenticated,
  });

  // Tải danh sách thông báo khi dropdown mở
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => notificationService.getNotifications(0, 20),
    enabled: !!isAuthenticated && isOpen,
  });

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Click vào 1 thông báo
  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      } catch (err) {
        console.error('Lỗi khi đánh dấu đã đọc:', err);
      }
    }
    setIsOpen(false);
    if (notif.recipeId) {
      navigate(`/recipes/${notif.recipeId}`);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
    }
  };

  return (
    <div className={s.wrapper} ref={dropdownRef}>
      {/* Icon chuông và badge số lượng */}
      <button
        className={`${s.bellBtn} ${isOpen ? s.bellBtnActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Thông báo"
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={s.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={s.dropdown} role="dialog">
          {/* Header */}
          <div className={s.header}>
            <div className={s.title}>
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className={s.unreadTag}>{unreadCount} mới</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className={s.markAllBtn}
                onClick={handleMarkAllAsRead}
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={14} className="inline mr-1" />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* List Content */}
          <div className={s.list}>
            {isLoading ? (
              <div className={s.loadingState}>Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className={s.emptyState}>
                <BellOff size={36} className={s.emptyIcon} />
                <p className={s.emptyText}>Bạn chưa có thông báo nào mới</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${s.item} ${!notif.isRead ? s.unreadItem : ''}`}
                  onClick={() => handleItemClick(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={s.avatarWrapper}>
                    <UserAvatar
                      src={notif.actor?.avatarUrl}
                      name={notif.actor?.displayName || notif.actor?.username || 'U'}
                      className="w-9 h-9 text-xs border border-[#e4d5cc]"
                    />
                  </div>
                  <div className={s.contentWrapper}>
                    <p className={s.message}>{notif.message}</p>
                    <span className={s.time}>
                      <Clock size={11} />
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.isRead && <div className={s.unreadDot} title="Chưa đọc" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
