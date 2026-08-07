import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Users, UtensilsCrossed, UserPlus, Sparkles, PackageSearch, AlertCircle, CheckCircle2, Shield, Cookie, Headset } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import loginHero from '../assets/login-hero.png';

// ── Shared effect styles & components ──
import fx from '../styles/effects.module.css';
import { AuroraBackground, FloatingParticles, BlobBackground } from '../components/effects';

// ── Page-specific layout styles ──
import s from '../styles/pages/RegisterPage.module.css';

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải từ 3 ký tự trở lên').max(50, 'Tên đăng nhập quá dài'),
  email: z.string().email('Định dạng email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải từ 8 ký tự trở lên')
    .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số'),
  confirmPassword: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "Bạn cần đồng ý với Điều khoản sử dụng" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
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

/* ─── 3D Tilt Hook for Premium Glass Card ─── */
const useTilt = () => {
  const tiltRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const card = tiltRef.current;
    if (!card) return;
    if (window.innerWidth < 1024) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
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
const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const { btnRef, createRipple } = useRipple();
  const { tiltRef, handleMouseMove: handleCardMouseMove, handleMouseLeave: handleCardMouseLeave } = useTilt();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ 
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false }
  });

  const [serverError, setServerError] = useState('');
  const watchedPassword = watch('password', '');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: 1, label: 'Yếu', color: '#ba1a1a' };
    if (score <= 3) return { level: 2, label: 'Trung bình', color: '#d4a853' };
    return { level: 3, label: 'Mạnh', color: '#2e7d32' };
  };

  const pwdStrength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const { confirmPassword, terms, ...registerData } = data;
      const res = await authService.register(registerData);
      if (res.success) {
        toast.success('Đăng ký thành công! Hãy đăng nhập nhé.');
        navigate('/login');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const handleSocialMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div className={s.registerWrapper}>
      {/* ── Shared ambient effects ── */}
      <BlobBackground />
      <AuroraBackground />
      <FloatingParticles />

      {/* ── Left: Hero Branding & Features ── */}
      <div className={s.heroPanel}>
        <div className={s.heroImageContainer}>
          <img src={loginHero} alt="Background" className={s.heroImage} />
          <div className={s.heroOverlay} />
        </div>

        <div className={s.heroContent}>
          {/* Brand */}
          <div className={`${s.brandHeader} ${fx.stagger1}`}>
            <div className={`${fx.brandIcon} ${s.brandIconSize}`}>
              <UtensilsCrossed size={26} />
            </div>
            <span className={s.brandTitle}>Smart Recipe</span>
          </div>

          {/* Headline */}
          <div className={fx.stagger2}>
            <h1 className={s.heroHeadline}>
              Bắt đầu hành trình <br />
              <span className={fx.gradientText}>vị giác mới</span> hôm nay.
            </h1>
            <p className={s.heroDescription}>
              Tham gia cộng đồng yêu bếp để khám phá hàng ngàn công thức nấu ăn thông minh và quản lý tủ lạnh hiệu quả.
            </p>
          </div>

          {/* Feature Grid */}
          <div className={s.featureGrid}>
            <div className={`${s.featureCard} ${fx.glassPanel} ${fx.stagger3}`}>
              <div className={s.featureIcon1}>
                <PackageSearch size={22} />
              </div>
              <div>
                <h4 className={s.featureTitle}>Quản lý kho nguyên liệu</h4>
                <p className={s.featureDesc}>
                  Theo dõi chính xác những gì bạn đang có, giúp tiết kiệm chi phí và chống lãng phí thực phẩm.
                </p>
              </div>
            </div>

            <div className={`${s.featureCard} ${fx.glassPanel} ${fx.stagger4}`}>
              <div className={s.featureIcon2}>
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className={s.featureTitle}>Gợi ý món ăn AI</h4>
                <p className={s.featureDesc}>
                  Nhận những gợi ý món ăn độc đáo dựa trên chính những nguyên liệu bạn có sẵn trong tủ lạnh.
                </p>
              </div>
            </div>

            <div className={`${s.featureCard} ${fx.glassPanel} ${fx.stagger5}`}>
              <div className={s.featureIcon3}>
                <Users size={22} />
              </div>
              <div>
                <h4 className={s.featureTitle}>Cộng đồng ẩm thực</h4>
                <p className={s.featureDesc}>
                  Chia sẻ, đánh giá và học hỏi bí quyết từ hàng ngàn người yêu bếp giống như bạn.
                </p>
              </div>
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
            <h2 className={`${s.welcomeTitle} ${fx.gradientText}`}>Tạo tài khoản</h2>
            <p className={s.welcomeSubtitle}>
              Cùng chúng tôi tạo nên những bữa ăn ngon.
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
              <div className={`${s.fieldGroup} ${fx.stagger3}`}>
                <label className={s.fieldLabel}>Họ và tên</label>
                <div className={s.inputWrapper}>
                  <span className={s.inputIcon}><User size={18} /></span>
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className={s.inputField}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className={`${s.fieldGroup} ${fx.stagger3}`}>
                <label className={s.fieldLabel}>Địa chỉ Email</label>
                <div className={s.inputWrapper}>
                  <span className={s.inputIcon}><Mail size={18} /></span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="email@vi-du.com"
                    className={s.inputField}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.email.message}</p>
                )}
              </div>

              {/* Password Group (Grid layout on desktop) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }} className={fx.stagger4}>
                {/* Password */}
                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Mật khẩu</label>
                  <div className={s.inputWrapper}>
                    <span className={s.inputIcon}><Lock size={18} /></span>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tối thiểu 8 ký tự"
                      className={s.inputFieldPassword}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={s.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn' : 'Hiện'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {watchedPassword && (
                    <div className={s.strengthBar}>
                      <div className={s.strengthTrack}>
                        <div
                          className={s.strengthFill}
                          style={{
                            width: `${(pwdStrength.level / 3) * 100}%`,
                            backgroundColor: pwdStrength.color,
                          }}
                        />
                      </div>
                      <span className={s.strengthLabel} style={{ color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Xác nhận</label>
                  <div className={s.inputWrapper}>
                    <span className={s.inputIcon}><Lock size={18} /></span>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      className={s.inputFieldPassword}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={s.togglePassword}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ẩn' : 'Hiện'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Server Error */}
              {serverError && (
                <div className={s.serverError}>
                  <AlertCircle size={16} />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className={`${s.termsRow} ${fx.stagger4}`}>
                <label className={s.termsCheckWrapper}>
                  <input 
                    type="checkbox" 
                    className={s.termsCheckbox}
                    {...register('terms')}
                  />
                  <span className={s.termsCheckmark}>
                    <CheckCircle2 size={14} />
                  </span>
                  <span className={s.termsLabel}>
                    Tôi đồng ý với <Link to="#" className={`${fx.linkUnderlineGradient}`} style={{ fontWeight: 700, color: 'var(--sr-primary)' }}>Điều khoản sử dụng</Link> và <Link to="#" className={`${fx.linkUnderlineGradient}`} style={{ fontWeight: 700, color: 'var(--sr-primary)' }}>Chính sách bảo mật</Link> của Smart Recipe.
                  </span>
                </label>
              </div>
              {errors.terms && (
                <p className={`${s.errorMessage} ${fx.errorShake}`}>{errors.terms.message}</p>
              )}

              {/* Submit */}
              <button
                ref={btnRef}
                type="submit"
                disabled={isSubmitting}
                className={`${fx.btnPrimary} ${fx.stagger5} mt-2`}
                onClick={createRipple}
              >
                {isSubmitting ? (
                  <Loader2 className={fx.spinner} />
                ) : (
                  <>Đăng ký ngay <UserPlus size={18} /></>
                )}
              </button>
              
              {/* Divider */}
              <div className={`${fx.divider} ${fx.stagger5} my-2`}>
                <div className={fx.dividerLine} />
                <span className={fx.dividerText}>Hoặc đăng ký bằng</span>
                <div className={fx.dividerLine} />
              </div>

              {/* Social Login */}
              <div className={`${s.socialGrid} ${fx.stagger5}`}>
                <button type="button" className={fx.btnSocial} onMouseMove={handleSocialMouseMove}>
                  <GoogleIcon />
                  <span className={fx.btnSocialText}>Google</span>
                </button>
                <button type="button" className={fx.btnSocial} onMouseMove={handleSocialMouseMove}>
                  <FacebookIcon />
                  <span className={fx.btnSocialText}>Facebook</span>
                </button>
              </div>
            </form>
          </div>

          {/* Login link */}
          <div className={`${s.registerLink} ${fx.stagger5}`}>
            <p className={s.registerText}>
              Đã có tài khoản?
              <Link to="/login" className={`${s.registerAnchor} ${fx.linkUnderlineGradient}`}>
                Đăng nhập ngay
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

export default RegisterPage;
