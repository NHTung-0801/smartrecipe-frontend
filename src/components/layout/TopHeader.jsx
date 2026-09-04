import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Heart, Menu } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import s from '../../styles/layout/TopHeader.module.css';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Khám phá';
  if (pathname.startsWith('/recipes')) return 'Công thức của tôi';
  if (pathname.startsWith('/pantry') || pathname.startsWith('/inventory')) return 'Tủ nguyên liệu';
  if (pathname.startsWith('/grocery') || pathname.startsWith('/list')) return 'Đi chợ';
  if (pathname.startsWith('/journal')) return 'Nhật ký';
  if (pathname.startsWith('/profile')) return 'Cài đặt tài khoản';
  if (pathname.startsWith('/users')) return 'Hồ sơ người dùng';
  if (pathname.startsWith('/ai-suggestion')) return 'Trợ lý AI';
  return 'Smart Recipe';
};

const TopHeader = ({ toggleSidebar }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  
  const title = getPageTitle(location.pathname);

  return (
    <header className={s.header}>
      <div className={s.titleGroup}>
        <button className={s.mobileMenuToggle} onClick={() => toggleSidebar(prev => !prev)}>
          <Menu size={24} />
        </button>
        <h1 className={s.pageTitle}>{title}</h1>
      </div>

      <div className={s.rightSection}>
        {/* Search Bar */}
        <div className={s.searchWrapper}>
          <Search size={18} className={s.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..."
            className={s.searchInput}
          />
        </div>

        {/* Action Icons */}
        <div className={s.actionGroup}>
          <button className={s.iconBtn}>
            <Bell size={20} />
          </button>
          <button className={s.iconBtn}>
            <Heart size={20} />
          </button>
          
          {/* Avatar */}
          <Link to={`/users/${user?.id}`} className={s.profileAvatar}>
            <img 
              src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.displayName || user?.username || 'User')} 
              alt={user?.displayName || 'User'} 
              className={s.avatarImg}
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;

