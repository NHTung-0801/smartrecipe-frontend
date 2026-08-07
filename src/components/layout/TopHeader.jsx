import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Heart, Menu } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import s from '../../styles/layout/TopHeader.module.css';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/recipes')) return 'CÃ´ng thá»©c';
  if (pathname.startsWith('/inventory')) return 'Kho nguyÃªn liá»‡u';
  if (pathname.startsWith('/list')) return 'Danh sÃ¡ch mua sáº¯m';
  if (pathname.startsWith('/profile')) return 'CÃ i Ä‘áº·t TÃ i khoáº£n';
  if (pathname.startsWith('/users')) return 'Há»“ sÆ¡ ngÆ°á»i dÃ¹ng';
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
            placeholder="TÃ¬m kiáº¿m..." 
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

