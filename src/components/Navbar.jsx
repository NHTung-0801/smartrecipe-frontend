import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          <span className="text-2xl">🍳</span>
          <span className="hidden sm:inline">Smart Recipe</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏠 <span className="hidden sm:inline">Trang chủ</span>
          </Link>
          <Link
            to="/recipes"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/recipes')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📖 <span className="hidden sm:inline">Công thức</span>
          </Link>
          <Link
            to="/recipes/new"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/recipes/new')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ➕ <span className="hidden sm:inline">Tạo mới</span>
          </Link>
          <Link
            to={`/users/${user?.id}`}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/users/')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👤 <span className="hidden sm:inline">Trang cá nhân</span>
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/profile')
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚙️ <span className="hidden sm:inline">Cài đặt</span>
          </Link>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">
            {user?.displayName || user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🚪 <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </nav>
  );
}