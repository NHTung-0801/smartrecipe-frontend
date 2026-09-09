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

            {/* Register link inside card */}
            <div className={s.registerLink}>
              <p className={s.registerText}>
                Bạn chưa có tài khoản?
                <Link to="/register" className={`${s.registerAnchor} ${fx.linkUnderlineGradient}`}>
                  Đăng ký ngay
                </Link>
              </p>
            </div>
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
