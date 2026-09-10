import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Menu, LogIn, UserPlus } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useAuthPromptStore from '../../store/useAuthPromptStore';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from './NotificationDropdown';
import s from '../../styles/layout/TopHeader.module.css';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Khám phá';
  if (pathname === '/features') return 'Đặc quyền thành viên';
  if (pathname.startsWith('/recipes/new')) return 'Tạo công thức mới';
  if (pathname.match(/^\/recipes\/\d+/)) return 'Chi tiết công thức';
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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthPromptStore((state) => state.openModal);
  
  const title = getPageTitle(location.pathname);

  const handleProtectedClick = (featureName) => {
    if (!isAuthenticated) {
      openAuthModal(featureName);
      return false;
    }
    return true;
  };

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

        {/* Action Area: Khách thấy [Đăng nhập] & [Đăng ký], Thành viên thấy Bell, Heart, Avatar */}
        {isAuthenticated ? (
          <div className={s.actionGroup}>
            <NotificationDropdown />
            <button 
              className={s.iconBtn}
              title="Món ăn yêu thích"
            >
              <Heart size={20} />
            </button>
            
            <Link to={`/users/${user?.id}`} className={s.profileAvatar} title="Trang cá nhân">
              <UserAvatar 
                src={user?.avatarUrl} 
                name={user?.displayName || user?.username} 
                className="w-10 h-10 text-xs border border-[#e4d5cc]" 
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-sm font-bold text-[#3d271d] hover:bg-[#f3e9e3] hover:text-[#a13923] transition-colors border border-[#e4d5cc]/80 bg-white/80 shadow-xs"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-[#a13923] text-white rounded-full px-4 py-2 text-sm font-bold shadow-md hover:bg-[#8b311e] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span className="hidden xs:inline">Đăng ký miễn phí</span>
              <span className="xs:hidden">Đăng ký</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopHeader;

