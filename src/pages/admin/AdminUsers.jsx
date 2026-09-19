import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, ShieldCheck, UserCheck, Sparkles, Search, ChevronRight,
  Eye, Trash2, X, RefreshCw, AlertCircle, BookOpen, Utensils,
  Heart, Calendar, Mail, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import useAuthStore from '../../store/useAuthStore';
import DeleteUserModal from '../../components/admin/DeleteUserModal';
import RoleChangeModal from '../../components/admin/RoleChangeModal';
import s from '../../styles/pages/admin/AdminUsers.module.css';

// ─── User Profile Drawer (Slide-out từ bên phải) ──────────────────────────────
function UserDetailDrawer({ userId, isClosing, onClose, onRoleChange, onDeleteUser }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminService.getAdminUserDetail(userId),
    select: (res) => res.data,
    enabled: !!userId,
  });

  const currentUser = useAuthStore((state) => state.user);

  if (!userId) return null;

  const isSelf = currentUser && (currentUser.id === Number(userId) || currentUser.username === data?.username);

  return (
    <div
      className={`${s.drawerOverlay} ${isClosing ? s.closing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${s.drawerPanel} ${isClosing ? s.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={s.drawerHeader}>
          <h3 className={s.drawerHeaderTitle}>
            <Users size={18} style={{ color: '#a13923' }} />
            Hồ sơ người dùng #{userId}
          </h3>
          <button
            type="button"
            className={s.closeDrawerBtn}
            onClick={onClose}
            title="Đóng bảng chi tiết"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        {isLoading ? (
          <div className={s.stateBox}>
            <RefreshCw size={28} className={s.spin} style={{ color: '#a13923' }} />
            <span>Đang tải thông tin người dùng...</span>
          </div>
        ) : data ? (
          <div className={s.drawerContent}>
            {/* Profile Card */}
            <div className={s.drawerProfileCard}>
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt={data.username} className={s.drawerAvatar} />
              ) : (
                <div className={s.drawerAvatar}>
                  {(data.displayName || data.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className={s.drawerProfileMeta}>
                <h4 className={s.drawerDisplayName}>
                  {data.displayName || data.username}
                </h4>
                <span className={s.drawerUsername}>@{data.username}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span className={`${s.rolePill} ${data.role === 'ADMIN' ? s.roleAdmin : s.roleUser}`}>
                    {data.role === 'ADMIN' ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                    {data.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#78716c' }}>
                    ID: #{data.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Email & Join Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#57534e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Mail size={14} style={{ color: '#a8a29e' }} />
                <span>{data.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calendar size={14} style={{ color: '#a8a29e' }} />
                <span>Tham gia ngày: {new Date(data.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Bio */}
            {data.bio && (
              <div className={s.bioBox}>
                <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#292524' }}>Tiểu sử:</strong>
                {data.bio}
              </div>
            )}

            {/* Metrics Grid */}
            <div className={s.drawerStatGrid}>
              <div className={s.drawerStatItem}>
                <span className={s.drawerStatLabel}>
                  <BookOpen size={13} style={{ color: '#a13923' }} /> Công thức tạo
                </span>
                <span className={s.drawerStatValue}>{data.recipeCount ?? 0}</span>
                <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>
                  ({data.publicRecipeCount ?? 0} công khai)
                </span>
              </div>

              <div className={s.drawerStatItem}>
                <span className={s.drawerStatLabel}>
                  <Utensils size={13} style={{ color: '#d97706' }} /> Nhật ký nấu
                </span>
                <span className={s.drawerStatValue}>{data.journalCount ?? 0}</span>
                <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>Lượt ghi món</span>
              </div>

              <div className={s.drawerStatItem}>
                <span className={s.drawerStatLabel}>
                  <Users size={13} style={{ color: '#2563eb' }} /> Người theo dõi
                </span>
                <span className={s.drawerStatValue}>{data.followerCount ?? 0}</span>
                <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>Followers</span>
              </div>

              <div className={s.drawerStatItem}>
                <span className={s.drawerStatLabel}>
                  <UserPlus size={13} style={{ color: '#059669' }} /> Đang theo dõi
                </span>
                <span className={s.drawerStatValue}>{data.followingCount ?? 0}</span>
                <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>Following</span>
              </div>
            </div>

            {/* Recent Recipes */}
            <div className={s.drawerSection}>
              <h5 className={s.drawerSectionTitle}>
                <BookOpen size={14} style={{ color: '#a13923' }} />
                Công thức gần đây ({data.recentRecipes?.length || 0})
              </h5>

              {data.recentRecipes && data.recentRecipes.length > 0 ? (
                <div className={s.recentRecipeList}>
                  {data.recentRecipes.map((r) => (
                    <div key={r.id} className={s.recentRecipeItem}>
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.title} className={s.recipeThumb} />
                      ) : (
                        <div className={s.recipeThumbFallback}>🍲</div>
                      )}
                      <div className={s.recipeItemMeta}>
                        <span className={s.recipeItemTitle}>{r.title}</span>
                        <div className={s.recipeItemSub}>
                          <span>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span>{r.status}</span>
                          {r.likeCount > 0 && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#e11d48' }}>
                                <Heart size={10} fill="#e11d48" /> {r.likeCount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#a8a29e', fontStyle: 'italic' }}>
                  Người dùng chưa đăng công thức nào.
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Drawer Footer Actions */}
        {data && (
          <div className={s.drawerFooter}>
            <button type="button" className={s.btnSecondary} onClick={onClose}>
              Đóng
            </button>

            {data.role === 'USER' ? (
              <button
                type="button"
                className={s.btnPromote}
                onClick={() => onRoleChange(data, 'ADMIN')}
                title="Nâng người dùng này thành Quản trị viên"
              >
                <ShieldCheck size={15} /> Thăng quyền ADMIN
              </button>
            ) : (
              <button
                type="button"
                className={s.btnDemote}
                disabled={isSelf}
                onClick={() => onRoleChange(data, 'USER')}
                title={isSelf ? 'Không thể tự hạ quyền của chính mình' : 'Hạ quyền xuống Thành viên thường'}
              >
                <UserCheck size={15} /> Hạ quyền USER
              </button>
            )}

            <button
              type="button"
              className={s.btnDeleteUser}
              disabled={isSelf}
              onClick={() => onDeleteUser(data)}
              title={isSelf ? 'Không thể tự xóa chính mình' : 'Xóa tài khoản người dùng này'}
            >
              <Trash2 size={15} /> Xóa tài khoản
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Users Page ────────────────────────────────────────────────────
export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [roleChangingUser, setRoleChangingUser] = useState(null);

  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  // Load danh sách người dùng
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', activeTab, searchKeyword, page],
    queryFn: () => adminService.getAdminUsers(page, 20, searchKeyword, activeTab),
    select: (res) => res.data,
  });

  // Mutation cập nhật quyền
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminService.updateUserRole(id, role),
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật vai trò thành công!');
      setRoleChangingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Thao tác thất bại!';
      toast.error(msg);
    },
  });

  // Mutation xóa người dùng
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã xóa người dùng thành công!');
      setDeletingUser(null);
      handleCloseDrawer();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Không thể xóa người dùng!';
      toast.error(msg);
    },
  });

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setSelectedUserId(null);
      setIsDrawerClosing(false);
    }, 240);
  }, []);

  const handleOpenUser = useCallback((id) => {
    setIsDrawerClosing(false);
    setSelectedUserId(id);
  }, []);

  const handleRoleChange = (user, role) => {
    setRoleChangingUser({ user, targetRole: role });
  };

  const handleConfirmRoleChange = ({ id, role }) => {
    roleMutation.mutate({ id, role });
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = (user) => {
    deleteMutation.mutate(user.id);
  };

  // Keyboard shortcut: ESC để đóng drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedUserId) {
        handleCloseDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUserId, handleCloseDrawer]);

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Real KPIs từ response backend
  const totalUsers       = data?.totalUsers ?? 0;
  const adminCount       = data?.adminCount ?? 0;
  const userCount        = data?.userCount ?? 0;
  const newUsersThisWeek = data?.newUsersThisWeek ?? 0;

  return (
    <div className={s.page}>
      {/* ─── Header ──────────────────────────────────── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Quản lý Người dùng</h1>
            <span className={s.titleBadge}>
              <Users size={13} /> USER MANAGEMENT
            </span>
          </div>
          <p className={s.subtitle}>
            Quản trị danh sách tài khoản, phân cấp quyền hạn và theo dõi mức độ đóng góp của thành viên
          </p>
        </div>
      </div>

      {/* ─── KPI Cards Row ─────────────────────────── */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}>
            <Users size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Tổng thành viên</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{totalUsers}</span>
            </div>
            <div className={s.kpiSub}>Toàn bộ tài khoản đã đăng ký</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}>
            <ShieldCheck size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Quản trị viên (ADMIN)</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{adminCount}</span>
            </div>
            <div className={s.kpiSub}>Tài khoản có quyền kiểm duyệt</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}>
            <UserCheck size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Thành viên thường (USER)</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{userCount}</span>
            </div>
            <div className={s.kpiSub}>Người nấu bếp & nội trợ</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}>
            <Sparkles size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Mới trong 7 ngày</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{newUsersThisWeek}</span>
            </div>
            <div className={s.kpiSub}>Tài khoản mới đăng ký</div>
          </div>
        </div>
      </div>

      {/* ─── Control Bar (Search & Filter Tabs) ────────── */}
      <div className={s.controlBar}>
        <div className={s.searchWrap}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tên hiển thị, username hoặc email..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
            className={s.searchInput}
          />
        </div>

        <div className={s.tabsGroup}>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'ALL' ? s.activeTab : ''}`}
            onClick={() => {
              setActiveTab('ALL');
              setPage(0);
            }}
          >
            Tất cả <span className={s.tabCount}>{totalUsers}</span>
          </button>

          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'USER' ? s.activeTab : ''}`}
            onClick={() => {
              setActiveTab('USER');
              setPage(0);
            }}
          >
            Thành viên <span className={s.tabCount}>{userCount}</span>
          </button>

          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'ADMIN' ? s.activeTab : ''}`}
            onClick={() => {
              setActiveTab('ADMIN');
              setPage(0);
            }}
          >
            Quản trị viên <span className={s.tabCount}>{adminCount}</span>
          </button>
        </div>
      </div>

      {/* ─── Table Content ────────────────────────────── */}
      {isLoading ? (
        <div className={s.stateBox}>
          <RefreshCw size={28} className={s.spin} style={{ color: '#a13923' }} />
          <span>Đang tải danh sách người dùng...</span>
        </div>
      ) : isError ? (
        <div className={s.stateBox}>
          <AlertCircle size={32} style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444' }}>
            {error?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu'}
          </span>
          <button
            type="button"
            className={s.pageBtn}
            onClick={() => refetch()}
            style={{ marginTop: '0.5rem' }}
          >
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className={s.stateBox}>
          <Users size={36} style={{ color: '#d6d3d1' }} />
          <span style={{ fontWeight: 700, color: '#44403c' }}>
            Không tìm thấy người dùng nào phù hợp
          </span>
          <span style={{ fontSize: '0.78rem' }}>
            Thử thay đổi từ khóa tìm kiếm hoặc chuyển tab bộ lọc
          </span>
        </div>
      ) : (
        <div className={s.tableContainer}>
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Người dùng</th>
                <th style={{ width: '24%' }}>Email</th>
                <th style={{ width: '14%' }}>Vai trò</th>
                <th style={{ width: '18%' }}>Đóng góp</th>
                <th style={{ width: '16%' }}>Ngày tạo</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isSelf = currentUser && (currentUser.id === u.id || currentUser.username === u.username);
                return (
                  <tr
                    key={u.id}
                    className={u.id === selectedUserId ? s.activeRow : ''}
                    onClick={() => handleOpenUser(u.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* 1. User Info */}
                    <td>
                      <div className={s.userCell}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.username} className={s.userAvatar} />
                        ) : (
                          <div className={s.userAvatar}>
                            {(u.displayName || u.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className={s.userDetails}>
                          <button
                            type="button"
                            className={s.userNameBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUser(u.id);
                            }}
                            title="Bấm để xem hồ sơ chi tiết"
                          >
                            <span>{u.displayName || u.username}</span>
                            <ChevronRight size={14} />
                          </button>
                          <span className={s.userSub}>@{u.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Email */}
                    <td>
                      <span className={s.emailText}>{u.email}</span>
                    </td>

                    {/* 3. Role */}
                    <td>
                      <span className={`${s.rolePill} ${u.role === 'ADMIN' ? s.roleAdmin : s.roleUser}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                        {u.role}
                      </span>
                    </td>

                    {/* 4. Activity metrics */}
                    <td>
                      <div className={s.metricsWrap}>
                        <span className={s.metricBadge} title="Số công thức đã tạo">
                          <BookOpen size={11} style={{ color: '#a13923' }} />
                          {u.recipeCount ?? 0} món
                        </span>
                        <span className={s.metricBadge} title="Số nhật ký đã nấu">
                          <Utensils size={11} style={{ color: '#d97706' }} />
                          {u.journalCount ?? 0} nhật ký
                        </span>
                      </div>
                    </td>

                    {/* 5. Created Date */}
                    <td>
                      <span className={s.dateText}>
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    {/* 6. Actions */}
                    <td>
                      <div className={s.actionGroup} style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className={`${s.btnAction} ${s.preview}`}
                          title="Xem chi tiết hồ sơ"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUser(u.id);
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className={`${s.btnAction} ${s.delete}`}
                          title={isSelf ? 'Không thể tự xóa chính mình' : 'Xóa tài khoản'}
                          disabled={isSelf || deleteMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={s.pagination}>
              <span className={s.pageInfo}>
                Trang {page + 1} / {totalPages} ({totalElements} người dùng)
              </span>
              <div className={s.pageBtnGroup}>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className={s.pageBtn}
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className={s.pageBtn}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Slide-out Drawer Panel ─────────────────── */}
      <UserDetailDrawer
        userId={selectedUserId}
        isClosing={isDrawerClosing}
        onClose={handleCloseDrawer}
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
      />

      {/* ─── Delete User Modal ──────────────────────── */}
      <DeleteUserModal
        isOpen={!!deletingUser}
        user={deletingUser}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleteMutation.isPending && setDeletingUser(null)}
      />

      {/* ─── Role Change Modal ───────────────────────── */}
      <RoleChangeModal
        isOpen={!!roleChangingUser}
        user={roleChangingUser?.user}
        targetRole={roleChangingUser?.targetRole}
        isLoading={roleMutation.isPending}
        onConfirm={handleConfirmRoleChange}
        onClose={() => !roleMutation.isPending && setRoleChangingUser(null)}
      />
    </div>
  );
}
