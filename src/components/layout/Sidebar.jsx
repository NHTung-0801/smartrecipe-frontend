import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PackageSearch, ShoppingCart, Settings, Plus, UtensilsCrossed } from 'lucide-react';
import s from '../../styles/layout/Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Recipes', path: '/recipes', icon: <BookOpen size={20} /> },
    { name: 'Tủ nguyên liệu', path: '/pantry', icon: <PackageSearch size={20} /> },
    { name: 'Shopping List', path: '/list', icon: <ShoppingCart size={20} /> },
    { name: 'Settings', path: '/profile', icon: <Settings size={20} /> },
  ];

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
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={active ? s.navLinkActive : s.navLink}
              onClick={() => toggleSidebar(false)}
            >
              <span className={s.navIcon}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action */}
      <div className={s.actionArea}>
        <Link to="/recipes/new" className={s.btnAdd} onClick={() => toggleSidebar(false)}>
          <Plus size={18} />
          Plan Meal
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

