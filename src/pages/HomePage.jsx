import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">🍳</div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
        Chào mừng đến với Smart Recipe
      </h1>
      <p className="text-lg text-gray-500 mb-2">
        Xin chào, {user?.displayName || user?.username}!
      </p>
      <p className="text-gray-400 mb-10 max-w-md mx-auto">
        Khám phá, tạo và chia sẻ những công thức nấu ăn tuyệt vời của bạn.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/recipes"
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all font-medium"
        >
          📖 Công thức của tôi
        </Link>
        <Link
          to="/recipes/new"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all font-medium"
        >
          ➕ Tạo công thức mới
        </Link>
        <Link
          to="/profile"
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all font-medium"
        >
          👤 Hồ sơ cá nhân
        </Link>
      </div>
    </div>
  );
}