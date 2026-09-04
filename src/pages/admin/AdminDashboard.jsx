import { useQuery } from '@tanstack/react-query';
import {
  Users, BookOpen, Package, ShoppingCart,
  AlertTriangle, TrendingUp, RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import s from '../../styles/pages/admin/AdminDashboard.module.css';

function StatCard({ icon: Icon, label, value, sub, color = 'primary', alert = false }) {
  return (
    <div className={`${s.statCard} ${alert ? s.statAlert : ''}`}>
      <div className={`${s.statIcon} ${s[color]}`}>
        <Icon size={24} />
      </div>
      <div className={s.statContent}>
        <div className={s.statValue}>{value ?? '—'}</div>
        <div className={s.statLabel}>{label}</div>
        {sub && <div className={s.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    staleTime: 2 * 60 * 1000,
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className={s.loading}>
        <RefreshCw size={28} className={s.spin} />
        <span>Đang tải thống kê...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={s.error}>
        <AlertTriangle size={28} />
        <span>Không thể tải dữ liệu. <button onClick={refetch}>Thử lại</button></span>
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Tổng quan hệ thống</h1>
          <p className={s.subtitle}>Theo dõi toàn bộ hoạt động của nền tảng SmartRecipe</p>
        </div>
        <button className={s.refreshBtn} onClick={refetch}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* KPI Row 1 — Platform */}
      <section>
        <h2 className={s.sectionTitle}><TrendingUp size={18} /> Chỉ số nền tảng</h2>
        <div className={s.grid}>
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value={stats?.totalUsers?.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={BookOpen}
            label="Công thức PUBLIC"
            value={stats?.publicRecipes?.toLocaleString()}
            sub={`Tổng: ${stats?.totalRecipes?.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={Package}
            label="Nguyên liệu chờ duyệt"
            value={stats?.pendingIngredients?.toLocaleString()}
            sub={`/ ${stats?.totalIngredients?.toLocaleString()} nguyên liệu`}
            color={stats?.pendingIngredients > 0 ? 'orange' : 'green'}
            alert={stats?.pendingIngredients > 0}
          />
          <StatCard
            icon={ShoppingCart}
            label="Danh sách chợ ACTIVE"
            value={stats?.activeGroceryLists?.toLocaleString()}
            color="primary"
          />
          <StatCard
            icon={BookOpen}
            label="Công thức chờ duyệt"
            value={stats?.pendingRecipes?.toLocaleString()}
            sub="Cần Admin phê duyệt"
            color={stats?.pendingRecipes > 0 ? 'orange' : 'green'}
            alert={stats?.pendingRecipes > 0}
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className={s.quickLinks}>
        <h2 className={s.sectionTitle}>Hành động nhanh</h2>
        <div className={s.quickGrid}>
          <a href="/admin/ingredients" className={s.quickCard}>
            <Package size={24} />
            <span>Kiểm duyệt nguyên liệu</span>
            {stats?.pendingIngredients > 0 && (
              <span className={s.badge}>{stats.pendingIngredients}</span>
            )}
          </a>
          <a href="/admin/recipes" className={s.quickCard}>
            <BookOpen size={24} />
            <span>Xem tất cả công thức</span>
          </a>
          <a href="/admin/users" className={s.quickCard}>
            <Users size={24} />
            <span>Quản lý người dùng</span>
          </a>
        </div>
      </section>
    </div>
  );
}
