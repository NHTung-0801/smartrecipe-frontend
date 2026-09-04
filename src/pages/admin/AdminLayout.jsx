import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ChefHat, Users, Database, Settings, LogOut, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';
import s from '../../styles/pages/admin/AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/admin/ingredients',  icon: Package,          label: 'Nguyên liệu' },
  { to: '/admin/recipes',      icon: ChefHat,          label: 'Công thức' },
  { to: '/admin/users',        icon: Users,            label: 'Người dùng' },
  { to: '/admin/masterdata',   icon: Database,         label: 'Master Data' },
  { to: '/admin/settings',     icon: Settings,         label: 'Cài đặt' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất khỏi Admin Panel.');
    navigate('/admin/login');
  };

  return (
    <div className={s.root}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        {/* Logo */}
        <div className={s.brand}>
          <div className={s.brandIcon}><ShieldCheck size={24} /></div>
          <div>
            <span className={s.brandName}>SmartRecipe</span>
            <span className={s.brandRole}>Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={s.nav}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${s.navItem} ${isActive ? s.navActive : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className={s.sidebarFooter}>
          <div className={s.userInfo}>
            <div className={s.userAvatar}>{user?.username?.[0]?.toUpperCase() ?? 'A'}</div>
            <div>
              <div className={s.userName}>{user?.username}</div>
              <div className={s.userRole}>ADMIN</div>
            </div>
          </div>
          <button className={s.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={s.main}>
        {children}
      </main>
    </div>
  );
}
