import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditProfilePage from './pages/EditProfilePage';
import MyRecipesPage from './pages/MyRecipesPage';
import RecipeFormPage from './pages/RecipeFormPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import PantryPage from './pages/PantryPage';
import GroceryPage from './pages/GroceryPage';
import GroceryHistoryPage from './pages/GroceryHistoryPage';
import CookingJournalPage from './pages/CookingJournalPage';
import JournalDetailPage from './pages/JournalDetailPage';
import AiSuggestionPage from './pages/AiSuggestionPage';
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIngredients from './pages/admin/AdminIngredients';
import AdminRecipes from './pages/admin/AdminRecipes';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import BenefitsPage from './pages/BenefitsPage';
import useAuthStore from './store/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Component bảo vệ Route: Chỉ cho phép người dùng đã đăng nhập vào
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes - không có Navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* === Public routes - Có Navbar, không yêu cầu đăng nhập === */}
          {/* Trang Khám phá: Khách vãng lai xem được công thức công khai */}
          <Route
            path="/"
            element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            }
          />

          {/* Trang Đặc quyền thành viên: Giới thiệu hệ sinh thái Smart Recipe */}
          <Route
            path="/features"
            element={
              <AppLayout>
                <BenefitsPage />
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MyRecipesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RecipeFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Trang chi tiết công thức: Khách xem được nguyên liệu, bước nấu, bình luận.
              Chỉ khi bấm Like / Clone / Thêm vào giỏ mới nhắc đăng nhập (xem RecipeDetailPage.jsx). */}
          <Route
            path="/recipes/:id"
            element={
              <AppLayout>
                <RecipeDetailPage />
              </AppLayout>
            }
          />
          {/* Trang hồ sơ người dùng: Khách xem được profile công khai của tác giả */}
          <Route
            path="/users/:id"
            element={
              <AppLayout>
                <UserProfilePage />
              </AppLayout>
            }
          />
          <Route
            path="/pantry"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PantryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <GroceryHistoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <GroceryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CookingJournalPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JournalDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-suggestion"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AiSuggestionPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/inventory" element={<Navigate to="/pantry" replace />} />
          <Route
            path="/recipes/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RecipeFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Admin routes ── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/ingredients"
            element={
              <AdminGuard>
                <AdminLayout><AdminIngredients /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/recipes"
            element={
              <AdminGuard>
                <AdminLayout><AdminRecipes /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminLayout><AdminPlaceholder title="Quản lý Người dùng" /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/masterdata"
            element={
              <AdminGuard>
                <AdminLayout><AdminPlaceholder title="Master Data" /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminGuard>
                <AdminLayout><AdminPlaceholder title="Cài đặt Hệ thống" /></AdminLayout>
              </AdminGuard>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
