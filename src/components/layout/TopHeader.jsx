import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, UserPlus, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
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

const FOOD_QUOTES = [
  'Bữa ăn ngon nhất là bữa ăn được nấu bằng tình yêu.',
  'Nấu ăn là nghệ thuật sẻ chia và gắn kết gia đình.',
  'Mỗi bữa cơm sum vầy là một kỷ niệm đáng trân trọng.',
  'Căn bếp ấm cúng là trái tim tràn ngập yêu thương.',
  'Ẩm thực tinh tế bắt đầu từ sự tỉ mỉ trong từng nguyên liệu.',
  'Hương vị quê nhà — nơi lưu giữ yêu thương và ký ức.',
  'Mỗi món ăn ngon là một câu chuyện được kể bằng gia vị.',
  'Nấu ăn ngon, quây quần bên người thân là niềm vui trọn vẹn nhất.',
  'Người yêu ẩm thực là người biết trân quý cuộc sống.',
  'Gia vị tuyệt vời nhất cho món ăn chính là sự chân thành.',
  'Hương vị ngọt ngào nhất là hương vị được sẻ chia cùng nhau.',
  'Món ăn ngon không chỉ no lòng, mà còn sưởi ấm tâm hồn.',
];

const TopHeader = ({ toggleSidebar }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const title = getPageTitle(location.pathname);

  // Quote rotation state
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextQuote = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % FOOD_QUOTES.length);
      setIsExiting(false);
    }, 380);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextQuote();
    }, 4800);
    return () => clearInterval(timer);
  }, [isPaused, nextQuote]);

  return (
    <header className={s.header}>
      <div className={s.titleGroup}>
        <button className={s.mobileMenuToggle} onClick={() => toggleSidebar(prev => !prev)}>
          <Menu size={24} />
        </button>
        <h1 className={s.pageTitle}>{title}</h1>
      </div>

      {/* Rotating Food Quotes Carousel — center of header */}
      <div 
        className={s.quoteChip}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => {
          if (!isExiting) nextQuote();
        }}
        title="Nhấp để đổi câu cảm hứng ẩm thực khác"
      >
        <UtensilsCrossed size={16} className={`${s.quoteIcon} ${isExiting ? s.quoteIconSpin : ''}`} />
        <div className={s.quoteTextWrapper}>
          <span 
            key={quoteIndex} 
            className={`${s.quoteText} ${isExiting ? s.quoteTextExiting : s.quoteTextEntering}`}
          >
            {FOOD_QUOTES[quoteIndex]}
          </span>
        </div>
      </div>

      <div className={s.rightSection}>

        {/* Action Area: Khách thấy [Đăng nhập] & [Đăng ký], Thành viên thấy Bell, Heart, Avatar */}
        {isAuthenticated ? (
          <div className={s.actionGroup}>
            {(user?.role === 'ADMIN' || user?.username === 'admin123') && (
              <Link
                to="/admin/dashboard"
                className={s.adminQuickBtn}
                title="Chuyển sang Trang Quản Trị (Admin Panel)"
              >
                <ShieldCheck size={16} />
                <span className={s.adminBtnText}>Trang Quản trị</span>
              </Link>
            )}

            <NotificationDropdown />
            
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

