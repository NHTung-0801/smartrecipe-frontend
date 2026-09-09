import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  LayoutDashboard, 
  BookOpen, 
  PackageSearch, 
  ShoppingCart, 
  Settings, 
  Plus, 
  UtensilsCrossed, 
  NotebookPen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import s from '../../styles/layout/Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Danh sách menu cho khách: chỉ có 2 mục
  const guestNavItems = [
    { name: 'Khám phá', path: '/', icon: <Compass size={20} /> },
    { 
      name: 'Đặc quyền thành viên', 
      path: '/features', 
      icon: <Sparkles size={20} className="text-amber-500 animate-pulse" />,
      isSpecial: true 
    },
  ];

  // Danh sách menu đầy đủ cho thành viên đã đăng nhập: 7 mục công cụ cá nhân
  const memberNavItems = [
    { name: 'Khám phá', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Công thức của tôi', path: '/recipes', icon: <BookOpen size={20} /> },
    { name: 'Tủ nguyên liệu', path: '/pantry', icon: <PackageSearch size={20} /> },
    { name: 'Đi chợ', path: '/grocery', icon: <ShoppingCart size={20} /> },
    { name: 'Nhật ký', path: '/journal', icon: <NotebookPen size={20} /> },
    { name: 'Trợ lý AI', path: '/ai-suggestion', icon: <Sparkles size={20} /> },
    { name: 'Cài đặt', path: '/profile', icon: <Settings size={20} /> },
  ];

  const currentNavItems = isAuthenticated ? memberNavItems : guestNavItems;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`${s.sidebar} ${isOpen ? s.open : ''}`}>
      {/* Brand */}
      <div className={s.brandArea}>
        <div className={s.brandIcon}>
          <UtensilsCrossed size={22} />
        </div>
        <div className={s.brandText}>
          <span className={s.brandTitle}>Smart Recipe</span>
          <span className={s.brandSubtitle}>Smart Cooking</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className={s.navMenu}>
        {currentNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`${active ? s.navLinkActive : s.navLink} ${
                item.isSpecial ? 'border border-amber-300/60 bg-amber-50/40 text-amber-900 shadow-xs' : ''
              }`}
              onClick={() => toggleSidebar(false)}
            >
              <span className={s.navIcon}>{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action Area: Khách thấy card đăng ký, Thành viên thấy nút Lên thực đơn */}
      {isAuthenticated ? (
        <div className={s.actionArea}>
          <Link to="/recipes/new" className={s.btnAdd} onClick={() => toggleSidebar(false)}>
            <Plus size={18} />
            Lên thực đơn
          </Link>
        </div>
      ) : (
        <div className={s.actionArea}>
          <div className="bg-gradient-to-br from-[#ffe9df] to-[#fff3ed] rounded-2xl p-4 border border-[#f4c49d]/60 shadow-xs text-center">
            <div className="w-8 h-8 rounded-full bg-[#a13923]/15 text-[#a13923] flex items-center justify-center mx-auto mb-2">
              <Sparkles size={16} />
            </div>
            <p className="text-xs font-bold text-[#3d271d] mb-1">Trở thành thành viên</p>
            <p className="text-[11px] text-[#6b5548] mb-3 leading-snug">
              Mở khóa trợ lý AI & quản lý tủ lạnh thông minh
            </p>
            <Link
              to="/register"
              onClick={() => toggleSidebar(false)}
              className="inline-flex items-center justify-center gap-1 w-full py-2 px-3 rounded-xl bg-[#a13923] text-white text-xs font-bold shadow-xs hover:bg-[#8b311e] active:scale-95 transition-all"
            >
              Đăng ký ngay
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

