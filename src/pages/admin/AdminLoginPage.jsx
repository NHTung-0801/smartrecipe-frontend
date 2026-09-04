import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import s from '../../styles/pages/admin/AdminLoginPage.module.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const data = res.data?.data;

      if (data?.role !== 'ADMIN') {
        toast.error('Tài khoản này không có quyền truy cập Admin.');
        return;
      }

      // login(userData, accessToken, refreshToken) — 3 args riêng biệt
      const { accessToken, refreshToken, ...userData } = data;
      setAuth(userData, accessToken, refreshToken);
      toast.success('Đăng nhập thành công!');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.root}>
      {/* Background decorations */}
      <div className={s.bg}>
        <div className={s.bgOrb1} />
        <div className={s.bgOrb2} />
      </div>

      <div className={s.card}>
        {/* Logo */}
        <div className={s.logo}>
          <div className={s.logoIcon}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className={s.logoTitle}>SmartRecipe</h1>
            <p className={s.logoSub}>Admin Panel</p>
          </div>
        </div>

        <h2 className={s.heading}>Đăng nhập quản trị</h2>
        <p className={s.subheading}>Chỉ dành cho tài khoản có quyền ADMIN</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label htmlFor="admin-username" className={s.label}>Tên đăng nhập</label>
            <div className={s.inputWrap}>
              <User size={18} className={s.inputIcon} />
              <input
                id="admin-username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin123"
                autoComplete="username"
                required
                className={s.input}
              />
            </div>
          </div>

          <div className={s.field}>
            <label htmlFor="admin-password" className={s.label}>Mật khẩu</label>
            <div className={s.inputWrap}>
              <Lock size={18} className={s.inputIcon} />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={s.input}
              />
              <button
                type="button"
                className={s.eyeBtn}
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={s.submitBtn}>
            {loading ? (
              <span className={s.spinner} />
            ) : (
              <><ShieldCheck size={18} /> Đăng nhập</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
