import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, UtensilsCrossed, ArrowRight, AlertCircle, CheckCircle2, Cookie, Shield, User, Headset } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import useAuthStore from '../store/useAuthStore';
import loginHero from '../assets/login-hero.png';

// ── Shared effect styles & components ──
import fx from '../styles/effects.module.css';
import { AuroraBackground, FloatingParticles } from '../components/effects';

// ── Page-specific layout styles ──
import s from '../styles/pages/LoginPage.module.css';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

/* ─── SVG Icons ─── */
const GoogleIcon = () => (
  <svg className={fx.btnSocialIcon} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className={fx.btnSocialIcon} fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/* ─── Click ripple hook ─── */
const useRipple = () => {
  const btnRef = useRef(null);
  const createRipple = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const rippleEl = document.createElement('span');
    rippleEl.className = fx.ripple;
    rippleEl.style.left = `${e.clientX - rect.left - 20}px`;
    rippleEl.style.top = `${e.clientY - rect.top - 20}px`;
    btn.appendChild(rippleEl);
    setTimeout(() => rippleEl.remove(), 600);
  }, []);
  return { btnRef, createRipple };
};

/* ─── Rotating quotes ─── */
const QUOTES = [
  { text: '"Nấu ăn không chỉ là tạo ra món ăn, mà là cách chúng ta chăm sóc những người thân yêu."', author: 'Chef Minh Tâm' },
  { text: '"Bếp là nơi trái tim tỏa sáng, nơi mùi vị trở thành kỷ niệm."', author: 'Chef Hương' },
  { text: '"Mỗi món ăn kể một câu chuyện — hãy để câu chuyện của bạn bắt đầu."', author: 'Smart Recipe' },
];

/* ─── 3D Tilt Hook for Premium Glass Card ─── */
const useTilt = () => {
  const tiltRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = tiltRef.current;
    if (!card) return;
    
    // Only apply on desktop
    if (window.innerWidth < 1024) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Very subtle tilt (max 3 degrees)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = tiltRef.current;
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);

  return { tiltRef, handleMouseMove, handleMouseLeave };
};

/* ─── Main Component ─── */
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const { btnRef, createRipple } = useRipple();
  const { tiltRef, handleMouseMove: handleCardMouseMove, handleMouseLeave: handleCardMouseLeave } = useTilt();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
        setQuoteFade(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('sr_remember_me') === 'true';
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authService.login(data);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('sr_remember_me', 'true');
          localStorage.setItem('sr_saved_username', data.username);
        } else {
          localStorage.removeItem('sr_remember_me');
          localStorage.removeItem('sr_saved_username');
        }
        toast.success(res.message);
        login(res.data, res.data.accessToken, res.data.refreshToken);
        navigate('/');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const handleSocialMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const quote = QUOTES[quoteIdx];

  return (
    <div className={s.loginWrapper}>
      {/* ── Shared ambient effects ── */}
      <AuroraBackground />
      <FloatingParticles />

      {/* ── Left: Hero Image ── */}
      <div className={s.heroPanel}>
        <div className={s.heroImageContainer}>
          <img src={loginHero} alt="Món Phở Việt Nam ấm áp" className={s.heroImage} />
          <div className={s.heroOverlayTop} />
          <div className={s.heroOverlayBottom} />
          <div className={fx.shimmerOverlay} />
        </div>

        {/* Brand */}
        <div className={s.brandOverlay}>
          <div className={`${fx.brandIcon} ${s.brandIconSize}`}>
            <UtensilsCrossed size={26} />
          </div>
          <div>
            <h1 className={s.brandTitle}>Smart Recipe</h1>
            <p className={s.brandSubtitle}>Nơi niềm đam mê nấu nướng bắt đầu</p>
          </div>
        </div>

        {/* Quote */}
        <div className={s.quoteOverlay}>
          <div
            className={`${s.quoteCard} ${fx.glassPanelLight}`}
            style={{
              opacity: quoteFade ? 1 : 0,
              transform: quoteFade ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s, transform 0.4s',
            }}
          >
            <p className={s.quoteText}>{quote.text}</p>
            <div className={s.quoteAuthorLine}>
              <div className={s.quoteAuthorDash} />
              <span className={s.quoteAuthorName}>{quote.author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className={s.formPanel}>
        <div className={s.formContent}>
          {/* Mobile brand */}
          <div className={s.mobileBrand}>
            <div className={`${fx.brandIcon} ${s.mobileBrandIconSize}`}>
              <UtensilsCrossed size={24} />
            </div>
            <span className={s.mobileBrandTitle}>Smart Recipe</span>
          </div>

          {/* Header */}
          <div className={`${s.formHeader} ${fx.stagger1}`}>
            <h2 className={`${s.welcomeTitle} ${fx.gradientText}`}>Chào mừng trở lại</h2>
            <p className={s.welcomeSubtitle}>
              Vui lòng đăng nhập để tiếp tục hành trình nấu nướng của bạn
            </p>
          </div>

          {/* Glass Card */}
          <div 
            ref={tiltRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className={`${s.glassCard} ${fx.glassPanel} ${fx.glassPanelHover} ${fx.stagger2}`}
            style={{ transition: 'box-shadow 0.4s, transform 0.1s ease-out' }}
          >
            <div className={`${fx.glowBorder} ${s.glassCardGlow}`} />

            <form onSubmit={handleSubmit(onSubmit)} className={s.formInner}>
              {/* Username */}
              <div className={s.fieldGroup}>
                <label className={s.fieldLabel} htmlFor="login-username">Tên đăng nhập</label>
                <div className={s.inputWrapper}>
                  <span className={s.inputIcon}><User size={18} /></span>
                  <input
                    {...register('username')}
                    id="login-username"
                    type="text"
                    placeholder="Nhập tên đăng nhập..."
                    className={s.inputField}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className={s.fieldGroup}>
                <div className={s.fieldLabelRow}>
                  <label className={s.fieldLabel} htmlFor="login-password">Mật khẩu</label>
                  <button type="button" className={`${s.forgotLink} ${fx.linkUnderline}`}>
                    Quên mật khẩu?
                  </button>
                </div>
                <div className={s.inputWrapper}>
                  <span className={s.inputIcon}><Lock size={18} /></span>
                  <input
                    {...register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={s.inputFieldPassword}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={s.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.password.message}</p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <div className={s.serverError}>
                  <AlertCircle size={16} />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Remember */}
              <div className={s.rememberRow}>
                <label className={s.rememberCheckWrapper}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={s.rememberCheckbox}
                  />
                  <span className={s.rememberCheckmark}>
                    <CheckCircle2 size={14} />
                  </span>
                  <span className={s.rememberLabel}>Ghi nhớ đăng nhập</span>
                </label>
              </div>

              {/* Submit */}
              <button
                ref={btnRef}
                type="submit"
                disabled={isSubmitting}
                className={fx.btnPrimary}
                onClick={createRipple}
              >
                {isSubmitting ? (
                  <Loader2 className={fx.spinner} />
                ) : (
                  <>Đăng nhập ngay <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={fx.divider}>
              <div className={fx.dividerLine} />
              <span className={fx.dividerText}>Hoặc tiếp tục với</span>
              <div className={fx.dividerLine} />
            </div>

            {/* Social */}
            <div className={s.socialGrid}>
              <button type="button" className={fx.btnSocial} onMouseMove={handleSocialMouseMove}>
                <GoogleIcon />
                <span className={fx.btnSocialText}>Google</span>
              </button>
              <button type="button" className={fx.btnSocial} onMouseMove={handleSocialMouseMove}>
                <FacebookIcon />
                <span className={fx.btnSocialText}>Facebook</span>
              </button>
            </div>
          </div>

          {/* Register link */}
          <div className={`${s.registerLink} ${fx.stagger3}`}>
            <p className={s.registerText}>
              Bạn chưa có tài khoản?
              <Link to="/register" className={`${s.registerAnchor} ${fx.linkUnderlineGradient}`}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

          {/* Footer */}
          <div className={s.footerLinks}>
            <a href="#" className={`${s.footerLink} ${fx.linkUnderline}`}><Shield size={12} /> Điều khoản</a>
            <a href="#" className={`${s.footerLink} ${fx.linkUnderline}`}><Cookie size={12} /> Bảo mật</a>
            <a href="#" className={`${s.footerLink} ${fx.linkUnderline}`}><Headset size={12} /> Liên hệ</a>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;
