import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * AdminGuard — bảo vệ toàn bộ route /admin/*
 * Redirect về /admin/login nếu chưa đăng nhập.
 * Redirect về / nếu đã đăng nhập nhưng không phải ADMIN.
 */
export default function AdminGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}
