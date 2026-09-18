import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import s from './ForgotPasswordModal.module.css';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess, initialEmail = '' }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setCooldown(0);
    }
  }, [isOpen, initialEmail]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  // Bước 1: Yêu cầu gửi mã OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Email không đúng định dạng.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(trimmedEmail);
      toast.success(res?.message || 'Đã gửi mã OTP đến email của bạn.');
      setStep(2);
      setCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã OTP khi đang ở Bước 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      toast.info(res?.message || 'Đã gửi lại mã OTP mới!');
      setCooldown(60);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gửi lại mã thất bại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP và đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError('Vui lòng nhập đúng mã OTP gồm 6 chữ số.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: trimmedOtp,
        newPassword,
        confirmPassword,
      });

      toast.success(res?.message || 'Đặt lại mật khẩu thành công!');
      if (onSuccess) {
        onSuccess(email.trim());
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.glowTop} />

        <button className={s.closeBtn} onClick={onClose} aria-label="Đóng cửa sổ">
          <X size={18} />
        </button>

        <div className={s.header}>
          <div className={s.iconBadge}>
            {step === 1 ? <Mail size={28} /> : <KeyRound size={28} />}
          </div>
          <span className={s.stepPill}>
            {step === 1 ? 'Bước 1: Gửi mã xác thực' : 'Bước 2: Đổi mật khẩu'}
          </span>
          <h3 className={s.title}>
            {step === 1 ? 'Quên mật khẩu?' : 'Nhập mã xác thực OTP'}
          </h3>
          <p className={s.subtitle}>
            {step === 1
              ? 'Nhập email tài khoản của bạn để nhận mã xác thực 6 chữ số.'
              : `Mã OTP đã được gửi đến: ${email}`}
          </p>
        </div>

        {error && (
          <div className={s.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          /* FORM BƯỚC 1: NHẬP EMAIL */
          <form onSubmit={handleRequestOtp} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="forgot-email">Địa chỉ Email</label>
              <div className={s.inputGroup}>
                <span className={s.inputIcon}><Mail size={18} /></span>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={s.input}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={s.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={s.spinner} />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <>
                  <span>Gửi mã xác thực</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM BƯỚC 2: NHẬP OTP VÀ MẬT KHẨU MỚI */
          <form onSubmit={handleResetPassword} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="otp-code">Mã OTP (6 chữ số)</label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className={s.otpInput}
                autoFocus
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="new-password">Mật khẩu mới</label>
              <div className={s.inputGroup}>
                <span className={s.inputIcon}><Lock size={18} /></span>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={s.input}
                  required
                />
                <button
                  type="button"
                  className={s.toggleEye}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="confirm-password">Xác nhận mật khẩu</label>
              <div className={s.inputGroup}>
                <span className={s.inputIcon}><Lock size={18} /></span>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={s.input}
                  required
                />
                <button
                  type="button"
                  className={s.toggleEye}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={s.primaryBtn}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={s.spinner} />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Đặt lại mật khẩu</span>
                </>
              )}
            </button>

            <div className={s.footerRow}>
              <button
                type="button"
                className={s.linkBtn}
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
              >
                <ArrowLeft size={14} />
                <span>Thay đổi email</span>
              </button>

              <button
                type="button"
                className={s.resendBtn}
                disabled={cooldown > 0 || loading}
                onClick={handleResendOtp}
              >
                {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
