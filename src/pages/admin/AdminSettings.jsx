import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Shield,
  ShieldCheck,
  Activity,
  Lock,
  Key,
  Cpu,
  User,
  Mail,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  Server,
  Database,
  Sparkles,
  Cloud,
  FileText,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  BookOpen,
  Salad,
  Users,
  Scale,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Utensils,
  Info,
  X,
  Bot,
} from 'lucide-react';

import { userService } from '../../services/userService';
import { adminService } from '../../services/adminService';
import useAuthStore from '../../store/useAuthStore';
import {
  exportRecipesToCsv,
  exportIngredientsToCsv,
  exportUsersToCsv,
  exportUnitConversionsToCsv,
  exportAiLogsToCsv,
} from '../../utils/exportUtils';
import s from '../../styles/pages/admin/AdminSettings.module.css';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'system' | 'export'
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeTab];
      if (el) {
        setIndicatorStyle({
          left: el.offsetLeft,
          width: el.clientWidth,
          ready: true,
        });
      }
    };
    updateIndicator();
    const t1 = setTimeout(updateIndicator, 40);
    const t2 = setTimeout(updateIndicator, 150);
    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTab]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);

  // Profile Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Avatar upload state
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // System Health state
  const [healthStatus, setHealthStatus] = useState('UP');
  const [healthLatency, setHealthLatency] = useState(25);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Admin Preferences state (localStorage)
  const [toastDuration, setToastDuration] = useState(() => {
    return localStorage.getItem('sr_admin_toast_duration') || '3000';
  });
  const [confirmDelete, setConfirmDelete] = useState(() => {
    return localStorage.getItem('sr_admin_confirm_delete') !== 'false';
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // ── AI Logs State (Gộp trong Tab 3) ────────────────────────
  const [aiLogs, setAiLogs] = useState([]);
  const [loadingAiLogs, setLoadingAiLogs] = useState(false);
  const [aiPage, setAiPage] = useState(0);
  const [aiTotalPages, setAiTotalPages] = useState(1);
  const [aiTotalElements, setAiTotalElements] = useState(0);
  const [aiTypeFilter, setAiTypeFilter] = useState('ALL'); // 'ALL' | 'ZERO_WASTE' | 'FEASIBLE_FINDER'
  const [aiStats, setAiStats] = useState({ totalCalls: 0, todayCalls: 0, savedRecipes: 0 });
  const [selectedLogModal, setSelectedLogModal] = useState(null);

  // ── Export State ───────────────────────────────────────────
  const [exportingType, setExportingType] = useState(null); // 'recipes' | 'ingredients' | 'users' | 'conversions' | 'ai-logs'

  // ── 1. Fetch Profile on Mount ──────────────────────────────
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await userService.getProfile();
      const data = res.data;
      setProfile(data);
      setDisplayName(data.displayName || '');
      setBio(data.bio || '');
    } catch (err) {
      toast.error('Không thể tải thông tin hồ sơ Admin');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── 2. Fetch Health on Mount ───────────────────────────────
  const fetchHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await adminService.getSystemHealth();
      setHealthStatus(res.status || 'UP');
      setHealthLatency(res.latency || 25);
    } catch (err) {
      setHealthStatus('DEGRADED');
      setHealthLatency(0);
    } finally {
      setCheckingHealth(false);
    }
  };

  // ── 3. Fetch AI Logs ───────────────────────────────────────
  const fetchAiLogs = async (page = 0, type = aiTypeFilter) => {
    setLoadingAiLogs(true);
    try {
      const res = await adminService.getAdminAiLogs(page, 8, type);
      const data = res.data || res;
      setAiLogs(data.content || []);
      setAiTotalPages(data.totalPages || 1);
      setAiTotalElements(data.totalElements || 0);
      setAiPage(data.currentPage != null ? data.currentPage : page);
      if (data.totalCalls != null) {
        setAiStats({
          totalCalls: data.totalCalls,
          todayCalls: data.todayCalls || 0,
          savedRecipes: data.savedRecipes || 0,
        });
      }
    } catch (err) {
      // Yên lặng nếu lỗi nhỏ hoặc retry
    } finally {
      setLoadingAiLogs(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHealth();
    fetchAiLogs(0, 'ALL');
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      fetchAiLogs(aiPage, aiTypeFilter);
    }
  }, [activeTab, aiPage, aiTypeFilter]);

  // ── 4. Handle Update Profile ───────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.warning('Tên hiển thị không được để trống');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await userService.updateProfile({
        displayName: trimmedName,
        bio: bio.trim(),
      });
      toast.success('Cập nhật hồ sơ thành công!');
      const updated = res.data;
      setProfile(updated);
      useAuthStore.getState().updateUser(updated);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật hồ sơ thất bại!';
      toast.error(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ── 5. Handle Avatar Upload ────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await userService.updateAvatar(file);
      toast.success('Cập nhật ảnh đại diện thành công!');
      const updated = res.data;
      setProfile(updated);
      useAuthStore.getState().updateUser(updated);
    } catch (err) {
      const msg = err.response?.data?.message || 'Tải ảnh đại diện thất bại!';
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── 6. Handle Change Password ──────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warning('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không trùng khớp');
      return;
    }
    if (newPassword === currentPassword) {
      toast.warning('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  // ── 7. Handle Save Preferences ─────────────────────────────
  const handleSavePreferences = () => {
    setSavingPrefs(true);
    localStorage.setItem('sr_admin_toast_duration', toastDuration);
    localStorage.setItem('sr_admin_confirm_delete', String(confirmDelete));
    setTimeout(() => {
      setSavingPrefs(false);
      toast.success('Đã lưu tùy chọn giao diện quản trị!');
    }, 250);
  };

  // ── 8. Handle Data Export ──────────────────────────────────
  const handleExportData = async (type) => {
    setExportingType(type);
    try {
      if (type === 'recipes') {
        const [pubRes, penRes, priRes] = await Promise.all([
          adminService.getAdminRecipes('PUBLIC', 0, 500).catch(() => ({ data: { content: [] } })),
          adminService.getAdminRecipes('PENDING_REVIEW', 0, 500).catch(() => ({ data: { content: [] } })),
          adminService.getAdminRecipes('PRIVATE', 0, 500).catch(() => ({ data: { content: [] } })),
        ]);
        const allRecipes = [
          ...(pubRes.data?.content || pubRes.content || []),
          ...(penRes.data?.content || penRes.content || []),
          ...(priRes.data?.content || priRes.content || []),
        ];
        if (!allRecipes.length) {
          toast.warning('Không có dữ liệu công thức nào để xuất');
        } else {
          exportRecipesToCsv(allRecipes);
          toast.success(`Đã xuất thành công ${allRecipes.length} công thức nấu ăn!`);
        }
      } else if (type === 'ingredients') {
        const res = await adminService.getAllIngredients(0, 1000);
        const data = res.data?.content || res.content || [];
        if (!data.length) {
          toast.warning('Không có dữ liệu nguyên liệu nào để xuất');
        } else {
          exportIngredientsToCsv(data);
          toast.success(`Đã xuất thành công ${data.length} nguyên liệu & chỉ số dinh dưỡng!`);
        }
      } else if (type === 'users') {
        const res = await adminService.getAdminUsers(0, 1000, '', 'ALL');
        const data = res.data?.content || res.content || [];
        if (!data.length) {
          toast.warning('Không có dữ liệu người dùng nào để xuất');
        } else {
          exportUsersToCsv(data);
          toast.success(`Đã xuất thành công danh sách ${data.length} người dùng!`);
        }
      } else if (type === 'conversions') {
        const res = await adminService.getUnitConversions();
        const data = res.data || res || [];
        if (!data.length) {
          toast.warning('Không có dữ liệu quy đổi đơn vị nào để xuất');
        } else {
          exportUnitConversionsToCsv(data);
          toast.success(`Đã xuất thành công ${data.length} quy tắc quy đổi đơn vị!`);
        }
      } else if (type === 'ai-logs') {
        const res = await adminService.getAdminAiLogs(0, 1000, 'ALL');
        const data = res.data?.content || res.content || [];
        if (!data.length) {
          toast.warning('Chưa có lịch sử gợi ý AI nào để xuất');
        } else {
          exportAiLogsToCsv(data);
          toast.success(`Đã xuất thành công ${data.length} bản ghi nhật ký AI!`);
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra trong quá trình xuất dữ liệu!');
    } finally {
      setExportingType(null);
    }
  };

  // Helper: Parse Ingredients List
  const parseIngredients = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
      return [input];
    } catch {
      return [input];
    }
  };

  // Helper: Parse Output Response JSON for Modal
  const parseAiOutput = (outputStr) => {
    if (!outputStr) return null;
    try {
      return JSON.parse(outputStr);
    } catch {
      return null;
    }
  };

  // Format Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Password Rules validation checks
  const isLenValid = newPassword.length >= 6;
  const isMatchValid = newPassword && newPassword === confirmPassword;
  const hasLetterAndNumber = /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword);

  return (
    <div className={s.page}>
      {/* ── Hidden File Input for Avatar ── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/webp"
      />

      {/* ── Page Header ── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Cài đặt hệ thống & Quản trị</h1>
            <span className={s.titleBadge}>
              <Shield size={13} /> ADMIN SETTINGS
            </span>
          </div>
          <p className={s.subtitle}>
            Quản lý thông tin tài khoản cá nhân, bảo mật phân quyền, giám sát hạ tầng kỹ thuật và trích xuất báo cáo dữ liệu.
          </p>
        </div>
      </div>

      {/* ── Top KPI Strip (4 Cards đồng bộ Design System) ── */}
      <div className={s.kpiStrip}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}>
            <ShieldCheck size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Tài khoản Admin</div>
            <div className={s.kpiValue}>
              {loadingProfile ? '...' : `@${profile?.username || 'admin'}`}
            </div>
            <div className={s.kpiSub}>Quyền Quản trị viên tối cao</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}>
            <Activity size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Trạng thái Dịch vụ</div>
            <div className={s.kpiValue}>
              {healthStatus === 'UP' ? 'UP' : 'ERR'}
            </div>
            <div className={s.kpiSub}>Độ trễ phản hồi: ~{healthLatency}ms</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}>
            <Lock size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Bảo mật & Phiên</div>
            <div className={s.kpiValue}>24 Giờ</div>
            <div className={s.kpiSub}>Thời hạn hiệu lực Access Token</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}>
            <Cpu size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Trợ lý AI & Cloud</div>
            <div className={s.kpiValue}>Gemini AI</div>
            <div className={s.kpiSub}>Mô hình gemini-3-flash active</div>
          </div>
        </div>
      </div>

      {/* ── Main Content: 2-Column Split Grid ── */}
      <div className={s.contentGrid}>
        {/* ── CỘT TRÁI (340px): Identity Card & Health Monitor ── */}
        <div className={s.leftCol}>
          {/* Card 1: Thẻ Danh thiếp Admin */}
          <div className={s.profileCard}>
            <div className={s.avatarContainer}>
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || profile.username}
                  className={s.avatarImg}
                />
              ) : (
                <div className={s.avatarPlaceholder}>
                  {(profile?.displayName || profile?.username || 'A')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <button
                type="button"
                className={s.avatarUploadBtn}
                title="Thay đổi ảnh đại diện"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <RefreshCw size={14} className="spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
            </div>

            <h3 className={s.profileName}>
              {loadingProfile ? 'Đang tải...' : profile?.displayName || profile?.username}
            </h3>

            <div className={s.profileHandleRow}>
              <span className={s.profileUsername}>
                @{profile?.username || 'admin123'}
              </span>
              <span className={s.roleBadgeAdmin}>
                <Shield size={11} /> {profile?.role || 'ADMIN'}
              </span>
            </div>

            <div className={s.profileMetaList}>
              <div className={s.profileMetaItem}>
                <Mail size={15} className={s.profileMetaIcon} />
                <span>{profile?.email || 'admin@smartrecipe.com'}</span>
              </div>
              <div className={s.profileMetaItem}>
                <Calendar size={15} className={s.profileMetaIcon} />
                <span>Gia nhập: {formatDate(profile?.createdAt)}</span>
              </div>
            </div>

            <div className={s.profileBioBox}>
              {profile?.bio ? (
                <span>{profile.bio}</span>
              ) : (
                <span className={s.profileBioEmpty}>
                  Chưa có tiểu sử giới thiệu công tác. Bạn có thể cập nhật ở tab bên cạnh.
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Trạng Thái Hệ Thống (Health Monitor) */}
          <div className={s.healthCard}>
            <div className={s.healthHeader}>
              <h4 className={s.healthTitle}>
                <Server size={17} /> Trạng thái Server
              </h4>
              <div className={s.pulseIndicator}>
                <span className={s.pulseDot} />
                <span>{healthStatus}</span>
              </div>
            </div>

            <div className={s.healthRows}>
              <div className={s.healthRow}>
                <span>Actuator Health:</span>
                <span className={s.healthRowValue}>
                  {healthStatus === 'UP' ? 'Sẵn sàng (Live)' : 'Chậm'}
                </span>
              </div>
              <div className={s.healthRow}>
                <span>Thời gian phản hồi:</span>
                <span className={s.healthRowValue}>~{healthLatency} ms</span>
              </div>
              <div className={s.healthRow}>
                <span>Máy chủ ứng dụng:</span>
                <span className={s.healthRowValue}>Spring Boot 3.4</span>
              </div>
              <div className={s.healthRow}>
                <span>Môi trường:</span>
                <span className={s.healthRowValue}>Java 21 (Port 8080)</span>
              </div>
            </div>

            <button
              type="button"
              className={s.btnPing}
              onClick={fetchHealth}
              disabled={checkingHealth}
            >
              <RefreshCw size={13} className={checkingHealth ? 'spin' : ''} />
              {checkingHealth ? 'Đang ping...' : 'Kiểm tra kết nối lại'}
            </button>
          </div>
        </div>

        {/* ── CỘT PHẢI (Workspace with 4 Balanced Tabs) ── */}
        <div className={s.rightCol}>
          {/* Tabs Bar: 4 Tabs Cân Xứng, Rộng Rãi với Hiệu ứng Trượt */}
          <div className={s.tabsBar}>
            <div
              className={s.activeTabIndicator}
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.ready ? 1 : 0,
              }}
            />
            <button
              ref={(el) => (tabRefs.current['profile'] = el)}
              type="button"
              className={`${s.tabBtn} ${activeTab === 'profile' ? s.activeTab : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={15} className={s.tabIcon} />
              Hồ sơ cá nhân
            </button>

            <button
              ref={(el) => (tabRefs.current['security'] = el)}
              type="button"
              className={`${s.tabBtn} ${activeTab === 'security' ? s.activeTab : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={15} className={s.tabIcon} />
              Bảo mật
            </button>

            <button
              ref={(el) => (tabRefs.current['system'] = el)}
              type="button"
              className={`${s.tabBtn} ${activeTab === 'system' ? s.activeTab : ''}`}
              onClick={() => setActiveTab('system')}
            >
              <Sliders size={15} className={s.tabIcon} />
              Hạ tầng & Trợ lý AI
            </button>

            <button
              ref={(el) => (tabRefs.current['export'] = el)}
              type="button"
              className={`${s.tabBtn} ${activeTab === 'export' ? s.activeTab : ''}`}
              onClick={() => setActiveTab('export')}
            >
              <FileSpreadsheet size={15} className={s.tabIcon} />
              Dữ liệu
            </button>
          </div>

          {/* Workspace Card (Thân nội dung theo tab) */}
          <div className={s.workspaceCard}>
            {/* ── TAB 1: HỒ SƠ CÁ NHÂN ── */}
            {activeTab === 'profile' && (
              <div className={s.tabPane} key="profile">
                <div className={s.tabHeader}>
                  <h3 className={s.tabTitle}>Thông tin cá nhân quản trị viên</h3>
                  <p className={s.tabDesc}>
                    Cập nhật tên hiển thị và tiểu sử công tác. Tên này sẽ xuất hiện trên thanh điều hướng và bảng quản trị.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className={s.formGrid}>
                  <div className={s.formRow2Col}>
                    <div className={s.formGroup}>
                      <label className={s.label}>
                        <User size={14} /> Tên hiển thị công khai
                      </label>
                      <div className={s.inputWrap}>
                        <User size={16} className={s.inputIcon} />
                        <input
                          type="text"
                          className={s.inputField}
                          placeholder="Nhập tên hiển thị của bạn..."
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          maxLength={50}
                        />
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>
                        <Lock size={14} /> Tên đăng nhập (Username)
                      </label>
                      <div className={s.inputWrap}>
                        <Lock size={16} className={s.inputIcon} />
                        <input
                          type="text"
                          className={s.inputField}
                          value={profile?.username || ''}
                          disabled
                        />
                        <span className={s.inputLockBadge}>Cố định</span>
                      </div>
                    </div>
                  </div>

                  <div className={s.formRow2Col}>
                    <div className={s.formGroup}>
                      <label className={s.label}>
                        <Mail size={14} /> Email liên kết
                      </label>
                      <div className={s.inputWrap}>
                        <Mail size={16} className={s.inputIcon} />
                        <input
                          type="email"
                          className={s.inputField}
                          value={profile?.email || ''}
                          disabled
                        />
                        <span className={s.inputLockBadge}>Cố định</span>
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>
                        <Shield size={14} /> Vai trò hệ thống
                      </label>
                      <div className={s.inputWrap}>
                        <Shield size={16} className={s.inputIcon} />
                        <input
                          type="text"
                          className={s.inputField}
                          value={profile?.role || 'ADMIN'}
                          disabled
                        />
                        <span className={s.inputLockBadge}>ADMIN</span>
                      </div>
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.label}>
                      <FileText size={14} /> Tiểu sử / Ghi chú công tác
                    </label>
                    <textarea
                      className={s.textareaField}
                      placeholder="Nhập đôi nét giới thiệu hoặc ghi chú trách nhiệm công tác của bạn..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                    <div className={s.charCounter}>{bio.length}/500 ký tự</div>
                  </div>

                  <div className={s.formFooter}>
                    <button
                      type="submit"
                      className={s.btnPrimary}
                      disabled={updatingProfile}
                    >
                      <Check size={16} />
                      {updatingProfile ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB 2: BẢO MẬT & ĐỔI MẬT KHẨU ── */}
            {activeTab === 'security' && (
              <div className={s.tabPane} key="security">
                <div className={s.tabHeader}>
                  <h3 className={s.tabTitle}>Bảo mật tài khoản & Đổi mật khẩu</h3>
                  <p className={s.tabDesc}>
                    Để đảm bảo an toàn cho toàn bộ dữ liệu quản trị, hãy sử dụng mật khẩu mạnh và thay đổi định kỳ.
                  </p>
                </div>

                <div className={s.securitySplit}>
                  {/* Form đổi mật khẩu */}
                  <form onSubmit={handleChangePassword} className={s.formGrid}>
                    <div className={s.formGroup}>
                      <label className={s.label}>Mật khẩu hiện tại</label>
                      <div className={s.inputWrap}>
                        <Key size={16} className={s.inputIcon} />
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          className={s.inputField}
                          placeholder="Nhập mật khẩu bạn đang dùng..."
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className={s.toggleEyeBtn}
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                        >
                          {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>Mật khẩu mới</label>
                      <div className={s.inputWrap}>
                        <Lock size={16} className={s.inputIcon} />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          className={s.inputField}
                          placeholder="Tối thiểu 6 ký tự..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className={s.toggleEyeBtn}
                          onClick={() => setShowNewPw(!showNewPw)}
                        >
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.label}>Xác nhận mật khẩu mới</label>
                      <div className={s.inputWrap}>
                        <Lock size={16} className={s.inputIcon} />
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          className={s.inputField}
                          placeholder="Nhập lại mật khẩu mới..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className={s.toggleEyeBtn}
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                        >
                          {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className={s.formFooter}>
                      <button
                        type="submit"
                        className={s.btnPrimary}
                        disabled={changingPassword}
                      >
                        <Key size={16} />
                        {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                      </button>
                    </div>
                  </form>

                  {/* Cột hướng dẫn & Checklist tiêu chí */}
                  <div className={s.rulesCard}>
                    <h5 className={s.rulesTitle}>
                      <ShieldCheck size={16} /> Tiêu chuẩn mật khẩu
                    </h5>
                    <ul className={s.rulesList}>
                      <li className={`${s.ruleItem} ${isLenValid ? s.ruleValid : s.ruleInvalid}`}>
                        {isLenValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>Độ dài từ 6 ký tự trở lên</span>
                      </li>
                      <li className={`${s.ruleItem} ${hasLetterAndNumber ? s.ruleValid : s.ruleInvalid}`}>
                        {hasLetterAndNumber ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>Bao gồm cả chữ cái và số</span>
                      </li>
                      <li className={`${s.ruleItem} ${isMatchValid ? s.ruleValid : s.ruleInvalid}`}>
                        {isMatchValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>Hai mật khẩu mới trùng khớp</span>
                      </li>
                    </ul>

                    <div className={s.jwtNoteBox}>
                      <strong>Lưu ý bảo mật:</strong> Sau khi đổi mật khẩu, phiên đăng nhập của bạn vẫn được giữ nguyên an toàn với JWT Token có hiệu lực 24 giờ.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: HẠ TẦNG & TRỢ LÝ AI (GỘP CHUNG & CÂN XỨNG) ── */}
            {activeTab === 'system' && (
              <div className={s.tabPane} key="system">
                <div className={s.tabHeader}>
                  <h3 className={s.tabTitle}>Hạ tầng kỹ thuật & Vận hành Trợ lý AI</h3>
                  <p className={s.tabDesc}>
                    Kiểm tra cấu hình môi trường vận hành backend, tinh chỉnh trải nghiệm giao diện và theo dõi lịch sử tương tác AI.
                  </p>
                </div>

                {/* 1. Sáu ô Thông số Hệ thống */}
                <div className={s.specsGrid}>
                  <div className={s.specTile}>
                    <span className={s.specLabel}>Môi trường Java</span>
                    <span className={s.specValue}>Java 21 LTS</span>
                    <span className={s.specSub}>OpenJDK Runtime Environment</span>
                  </div>

                  <div className={s.specTile}>
                    <span className={s.specLabel}>Framework Cốt lõi</span>
                    <span className={s.specValue}>Spring Boot 3.4</span>
                    <span className={s.specSub}>Spring Security + JPA Hibernate</span>
                  </div>

                  <div className={s.specTile}>
                    <span className={s.specLabel}>Cơ sở dữ liệu</span>
                    <span className={s.specValue}>MySQL 8.0</span>
                    <span className={s.specSub}>Mã hóa utf8mb4 full unicode</span>
                  </div>

                  <div className={s.specTile}>
                    <span className={s.specLabel}>Bộ nhớ đệm (Cache)</span>
                    <span className={s.specValue}>Redis Server</span>
                    <span className={s.specSub}>Tối ưu tốc độ truy vấn DTO</span>
                  </div>

                  <div className={s.specTile}>
                    <span className={s.specLabel}>Trí tuệ nhân tạo (AI)</span>
                    <span className={s.specValue}>Gemini 3 Flash</span>
                    <span className={s.specSub}>Hạn mức 10 gợi ý/ngày/user</span>
                  </div>

                  <div className={s.specTile}>
                    <span className={s.specLabel}>Lưu trữ Hình ảnh</span>
                    <span className={s.specValue}>Cloudinary CDN</span>
                    <span className={s.specSub}>Tối ưu hóa ảnh công thức & avatar</span>
                  </div>
                </div>

                {/* 2. Tùy chọn giao diện cá nhân (localStorage) */}
                <div className={s.prefSection}>
                  <h4 className={s.prefTitle}>Tùy chọn trải nghiệm Admin Panel</h4>
                  <div className={s.prefList}>
                    <div className={s.prefItem}>
                      <div className={s.prefItemLeft}>
                        <span className={s.prefItemTitle}>Thời gian hiển thị thông báo Toast</span>
                        <span className={s.prefItemDesc}>
                          Điều chỉnh thời gian các thông báo thành công hoặc lỗi tự động biến mất.
                        </span>
                      </div>
                      <select
                        className={s.selectField}
                        value={toastDuration}
                        onChange={(e) => setToastDuration(e.target.value)}
                      >
                        <option value="2000">2.0 giây (Nhanh)</option>
                        <option value="3000">3.0 giây (Mặc định)</option>
                        <option value="5000">5.0 giây (Thong thả)</option>
                      </select>
                    </div>

                    <div className={s.prefItem}>
                      <div className={s.prefItemLeft}>
                        <span className={s.prefItemTitle}>Xác nhận hành động xóa / thay đổi dữ liệu</span>
                        <span className={s.prefItemDesc}>
                          Luôn hiển thị hộp thoại xác nhận trước khi xóa người dùng, nguyên liệu hay danh mục.
                        </span>
                      </div>
                      <label className={s.switch}>
                        <input
                          type="checkbox"
                          checked={confirmDelete}
                          onChange={(e) => setConfirmDelete(e.target.checked)}
                        />
                        <span className={s.slider} />
                      </label>
                    </div>
                  </div>

                  <div className={s.formFooter}>
                    <button
                      type="button"
                      className={s.btnPrimary}
                      onClick={handleSavePreferences}
                      disabled={savingPrefs}
                    >
                      <Check size={16} />
                      {savingPrefs ? 'Đang lưu...' : 'Lưu tùy chọn giao diện'}
                    </button>
                  </div>
                </div>

                {/* 3. Lịch sử Trợ lý AI (Dạng List Ngắn Gọn - Chỉ khi nhấn vào mới xem chi tiết) */}
                <div className={s.aiSectionWrap}>
                  <div className={s.aiSectionHeader}>
                    <h4 className={s.aiSectionTitle}>
                      <Sparkles size={17} style={{ color: '#a13923' }} />
                      Lịch sử yêu cầu gợi ý món ăn (Trợ lý AI)
                    </h4>
                    <button
                      type="button"
                      className={s.aiQuickExportBtn}
                      onClick={() => handleExportData('ai-logs')}
                      disabled={exportingType === 'ai-logs'}
                    >
                      {exportingType === 'ai-logs' ? (
                        <RefreshCw size={13} className="spin" />
                      ) : (
                        <Download size={13} />
                      )}
                      <span>Xuất CSV</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className={s.aiFilterBar}>
                    <div className={s.aiFilterGroup}>
                      <button
                        type="button"
                        className={`${s.aiFilterBtn} ${aiTypeFilter === 'ALL' ? s.aiFilterBtnActive : ''}`}
                        onClick={() => {
                          setAiTypeFilter('ALL');
                          setAiPage(0);
                        }}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        className={`${s.aiFilterBtn} ${aiTypeFilter === 'ZERO_WASTE' ? s.aiFilterBtnActive : ''}`}
                        onClick={() => {
                          setAiTypeFilter('ZERO_WASTE');
                          setAiPage(0);
                        }}
                      >
                        Tủ lạnh (Zero-Waste)
                      </button>
                      <button
                        type="button"
                        className={`${s.aiFilterBtn} ${aiTypeFilter === 'FEASIBLE_FINDER' ? s.aiFilterBtnActive : ''}`}
                        onClick={() => {
                          setAiTypeFilter('FEASIBLE_FINDER');
                          setAiPage(0);
                        }}
                      >
                        Theo nguyên liệu
                      </button>
                    </div>

                    <span style={{ fontSize: '0.76rem', color: '#78716c' }}>
                      Nhấn vào từng dòng để xem thực đơn & công thức chi tiết
                    </span>
                  </div>

                  {/* Compact List Items */}
                  {loadingAiLogs ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c' }}>
                      <RefreshCw size={20} className="spin" style={{ color: '#a13923', marginBottom: '0.4rem' }} />
                      <div style={{ fontSize: '0.82rem' }}>Đang tải lịch sử tương tác AI...</div>
                    </div>
                  ) : aiLogs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c', background: '#fafaf9', borderRadius: '10px' }}>
                      <Bot size={28} style={{ color: '#d6d3d1', marginBottom: '0.4rem' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Chưa có lượt tương tác AI nào</div>
                    </div>
                  ) : (
                    <div className={s.compactAiList}>
                      {aiLogs.map((log) => {
                        const ingredients = parseIngredients(log.inputIngredients);
                        return (
                          <div
                            key={log.id}
                            className={s.compactAiItem}
                            onClick={() => setSelectedLogModal(log)}
                            title="Nhấn để xem chi tiết thực đơn do AI đề xuất"
                          >
                            <div className={s.compactAiLeft}>
                              <div className={log.type === 'ZERO_WASTE' ? s.compactIconZero : s.compactIconFeasible}>
                                {log.type === 'ZERO_WASTE' ? <Utensils size={15} /> : <Sparkles size={15} />}
                              </div>
                              <div className={s.compactAiInfo}>
                                <div className={s.compactAiTitleRow}>
                                  <span className={s.compactAiTitle}>
                                    {log.recipeTitle || 'Món ăn do Gemini đề xuất'}
                                  </span>
                                  <span className={log.type === 'ZERO_WASTE' ? s.badgeZeroWasteMini : s.badgeFeasibleMini}>
                                    {log.type === 'ZERO_WASTE' ? 'Tủ lạnh' : 'Yêu cầu'}
                                  </span>
                                </div>
                                <div className={s.compactAiSub}>
                                  <span>@{log.username || 'user'}</span>
                                  <span>•</span>
                                  <span>{formatDateTime(log.createdAt)}</span>
                                  {ingredients.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{ingredients.length} nguyên liệu nhập</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={s.compactAiRight}>
                              {log.savedRecipeId ? (
                                <span className={s.badgeSavedMini}>
                                  <CheckCircle2 size={12} /> Đã lưu (#{log.savedRecipeId})
                                </span>
                              ) : (
                                <span className={s.badgeNotSavedMini}>
                                  Tham khảo
                                </span>
                              )}
                              <div className={s.compactChevron} title="Xem chi tiết">
                                <Eye size={13} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Phân trang ngắn gọn cho AI List */}
                  {aiTotalPages > 1 && (
                    <div className={s.paginationBar}>
                      <span style={{ fontSize: '0.78rem' }}>
                        Trang <strong>{aiPage + 1}</strong> / {aiTotalPages} ({aiTotalElements} bản ghi)
                      </span>
                      <div className={s.pageControls}>
                        <button
                          type="button"
                          className={s.btnPageNav}
                          disabled={aiPage <= 0}
                          onClick={() => setAiPage((prev) => Math.max(0, prev - 1))}
                        >
                          <ChevronLeft size={13} /> Trước
                        </button>
                        <button
                          type="button"
                          className={s.btnPageNav}
                          disabled={aiPage >= aiTotalPages - 1}
                          onClick={() => setAiPage((prev) => prev + 1)}
                        >
                          Sau <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Thống kê hoạt động AI (ĐẶT Ở DƯỚI CÙNG THEO YÊU CẦU) */}
                <div className={s.aiBottomStatsSection}>
                  <h4 className={s.aiSectionTitle}>
                    <Activity size={16} style={{ color: '#a13923' }} />
                    Thống kê hiệu suất Trợ lý AI nền tảng
                  </h4>
                  <div className={s.aiKpiRow}>
                    <div className={s.aiKpiCard}>
                      <div className={`${s.aiKpiIconWrap} ${s.aiKpiPurple}`}>
                        <Bot size={20} />
                      </div>
                      <div>
                        <div className={s.aiKpiLabel}>Tổng lượt yêu cầu AI</div>
                        <div className={s.aiKpiVal}>{aiStats.totalCalls}</div>
                      </div>
                    </div>

                    <div className={s.aiKpiCard}>
                      <div className={`${s.aiKpiIconWrap} ${s.aiKpiEmerald}`}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className={s.aiKpiLabel}>Lượt gọi hôm nay</div>
                        <div className={s.aiKpiVal}>{aiStats.todayCalls}</div>
                      </div>
                    </div>

                    <div className={s.aiKpiCard}>
                      <div className={`${s.aiKpiIconWrap} ${s.aiKpiAmber}`}>
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className={s.aiKpiLabel}>Món đã lưu thành công thức</div>
                        <div className={s.aiKpiVal}>{aiStats.savedRecipes}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: TRÍCH XUẤT DỮ LIỆU (DATA EXPORT SUITE) ── */}
            {activeTab === 'export' && (
              <div className={s.tabPane} key="export">
                <div className={s.tabHeader}>
                  <h3 className={s.tabTitle}>Trung tâm Dữ liệu & Trích xuất Báo cáo</h3>
                  <p className={s.tabDesc}>
                    Tải về toàn bộ danh mục dữ liệu của hệ thống dưới dạng tệp CSV chuẩn UTF-8, sẵn sàng để phân tích trên Microsoft Excel, Google Sheets.
                  </p>
                </div>

                {/* Notice Box về Excel Compatibility */}
                <div className={s.exportNoticeBox}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Tiêu chuẩn mã hóa UTF-8 với BOM:</strong> Toàn bộ tệp CSV xuất ra từ hệ thống được tích hợp tiền tố Byte Order Mark (`\uFEFF`), giúp Microsoft Excel trên hệ điều hành Windows hiển thị tiếng Việt có dấu chuẩn 100%, không bị vỡ hoặc lỗi font ký tự.
                  </div>
                </div>

                {/* 4 Cards Export Grid (2x2) */}
                <div className={s.exportGrid}>
                  {/* Card 1: Công thức món ăn */}
                  <div className={s.exportCard}>
                    <div className={s.exportCardTop}>
                      <div className={s.exportCardHeader}>
                        <div className={`${s.exportIconBadge} ${s.terracotta}`} style={{ background: '#fdf6f0', color: '#a13923' }}>
                          <BookOpen size={22} />
                        </div>
                        <span className={s.exportFormatTag}>CSV UTF-8</span>
                      </div>
                      <h4 className={s.exportCardTitle}>Công thức món ăn (Recipes)</h4>
                      <p className={s.exportCardDesc}>
                        Toàn bộ danh mục bài đăng công thức trên nền tảng, bao gồm cả công thức công khai, chờ duyệt và riêng tư.
                      </p>
                      <div className={s.exportFieldsWrap}>
                        <strong>Các cột dữ liệu:</strong> ID, Tiêu đề, Tác giả, Username, Độ khó, Thời gian chuẩn bị, Thời gian nấu, Số nguyên liệu, Lượt thích, Trạng thái, Ngày đăng.
                      </div>
                    </div>
                    <div className={s.exportCardAction}>
                      <button
                        type="button"
                        className={s.btnExportFull}
                        onClick={() => handleExportData('recipes')}
                        disabled={exportingType === 'recipes'}
                      >
                        {exportingType === 'recipes' ? (
                          <RefreshCw size={15} className="spin" />
                        ) : (
                          <Download size={15} />
                        )}
                        <span>{exportingType === 'recipes' ? 'Đang trích xuất dữ liệu...' : 'Tải xuống File CSV'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Kho Nguyên liệu & Dinh dưỡng */}
                  <div className={s.exportCard}>
                    <div className={s.exportCardTop}>
                      <div className={s.exportCardHeader}>
                        <div className={`${s.exportIconBadge} ${s.emerald}`} style={{ background: '#ecfdf5', color: '#059669' }}>
                          <Salad size={22} />
                        </div>
                        <span className={s.exportFormatTag}>CSV UTF-8</span>
                      </div>
                      <h4 className={s.exportCardTitle}>Nguyên liệu & Dinh dưỡng (Ingredients)</h4>
                      <p className={s.exportCardDesc}>
                        Bảng danh mục nguyên liệu thực phẩm chuẩn hóa, kệ hàng siêu thị và bảng phân tích 4 thành phần dinh dưỡng per 100g.
                      </p>
                      <div className={s.exportFieldsWrap}>
                        <strong>Các cột dữ liệu:</strong> ID, Tên nguyên liệu, Kệ hàng siêu thị, Đơn vị chuẩn (g/ml), Calo (kcal), Đạm (Protein), Chất béo (Fat), Tinh bột (Carbs).
                      </div>
                    </div>
                    <div className={s.exportCardAction}>
                      <button
                        type="button"
                        className={s.btnExportFull}
                        onClick={() => handleExportData('ingredients')}
                        disabled={exportingType === 'ingredients'}
                      >
                        {exportingType === 'ingredients' ? (
                          <RefreshCw size={15} className="spin" />
                        ) : (
                          <Download size={15} />
                        )}
                        <span>{exportingType === 'ingredients' ? 'Đang trích xuất dữ liệu...' : 'Tải xuống File CSV'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Người dùng & Phân quyền */}
                  <div className={s.exportCard}>
                    <div className={s.exportCardTop}>
                      <div className={s.exportCardHeader}>
                        <div className={`${s.exportIconBadge} ${s.blue}`} style={{ background: '#eff6ff', color: '#2563eb' }}>
                          <Users size={22} />
                        </div>
                        <span className={s.exportFormatTag}>CSV UTF-8</span>
                      </div>
                      <h4 className={s.exportCardTitle}>Người dùng & Tài khoản (Users)</h4>
                      <p className={s.exportCardDesc}>
                        Danh sách tài khoản thành viên hệ thống, địa chỉ email liên kết, vai trò phân quyền và chỉ số đóng góp nội dung.
                      </p>
                      <div className={s.exportFieldsWrap}>
                        <strong>Các cột dữ liệu:</strong> ID, Username (@), Tên hiển thị, Email, Vai trò (ADMIN/USER), Số công thức đóng góp, Số nhật ký nấu ăn, Ngày tham gia.
                      </div>
                    </div>
                    <div className={s.exportCardAction}>
                      <button
                        type="button"
                        className={s.btnExportFull}
                        onClick={() => handleExportData('users')}
                        disabled={exportingType === 'users'}
                      >
                        {exportingType === 'users' ? (
                          <RefreshCw size={15} className="spin" />
                        ) : (
                          <Download size={15} />
                        )}
                        <span>{exportingType === 'users' ? 'Đang trích xuất dữ liệu...' : 'Tải xuống File CSV'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Quy chuẩn Đơn vị đo lường */}
                  <div className={s.exportCard}>
                    <div className={s.exportCardTop}>
                      <div className={s.exportCardHeader}>
                        <div className={`${s.exportIconBadge} ${s.amber}`} style={{ background: '#fffbeb', color: '#d97706' }}>
                          <Scale size={22} />
                        </div>
                        <span className={s.exportFormatTag}>CSV UTF-8</span>
                      </div>
                      <h4 className={s.exportCardTitle}>Quy đổi Đơn vị đo lường (Conversions)</h4>
                      <p className={s.exportCardDesc}>
                        Bảng đối soát hệ số quy đổi đơn vị đo lường ẩm thực dân gian (thìa, muỗng, chén, bát) sang đơn vị khối lượng chuẩn (g, ml).
                      </p>
                      <div className={s.exportFieldsWrap}>
                        <strong>Các cột dữ liệu:</strong> ID, Nguyên liệu áp dụng, Đơn vị đầu vào, Hệ số quy đổi, Đơn vị chuẩn hóa, Công thức mô tả quy tắc quy đổi.
                      </div>
                    </div>
                    <div className={s.exportCardAction}>
                      <button
                        type="button"
                        className={s.btnExportFull}
                        onClick={() => handleExportData('conversions')}
                        disabled={exportingType === 'conversions'}
                      >
                        {exportingType === 'conversions' ? (
                          <RefreshCw size={15} className="spin" />
                        ) : (
                          <Download size={15} />
                        )}
                        <span>{exportingType === 'conversions' ? 'Đang trích xuất dữ liệu...' : 'Tải xuống File CSV'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL CHI TIẾT NHẬT KÝ AI ── */}
      {selectedLogModal && (
        <div className={s.modalBackdrop} onClick={() => setSelectedLogModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalHeaderTitle}>
                <Sparkles size={18} style={{ color: '#a13923' }} />
                <span>Chi tiết Gợi ý AI #LOG-{selectedLogModal.id}</span>
              </div>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setSelectedLogModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={s.modalBody}>
              {/* Thông tin ngữ cảnh */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#78716c' }}>
                <div>
                  Người yêu cầu: <strong>@{selectedLogModal.username}</strong> ({selectedLogModal.displayName || 'Thành viên'})
                </div>
                <div>{formatDateTime(selectedLogModal.createdAt)}</div>
              </div>

              {/* Khối Nguyên liệu đầu vào */}
              <div className={s.modalSection}>
                <div className={s.modalSectionHeading}>
                  <Salad size={14} /> Nguyên liệu người dùng cung cấp
                </div>
                <div className={s.ingredientChipsWrap}>
                  {parseIngredients(selectedLogModal.inputIngredients).map((ing, idx) => (
                    <span key={idx} className={s.ingChip}>
                      {typeof ing === 'string' ? ing : ing?.name || JSON.stringify(ing)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Khối Thực đơn do AI gợi ý */}
              {(() => {
                const aiData = parseAiOutput(selectedLogModal.outputResponse);
                return (
                  <div className={s.dishMetaCard}>
                    <h4 className={s.dishMetaTitle}>
                      {aiData?.title || selectedLogModal.recipeTitle || 'Món ăn do Gemini đề xuất'}
                    </h4>
                    {aiData?.description && (
                      <p className={s.dishMetaDesc}>{aiData.description}</p>
                    )}

                    <div className={s.dishStatsRow}>
                      <span>Khẩu phần: <strong>{aiData?.baseServings || 2} người</strong></span>
                      <span>Chuẩn bị: <strong>{aiData?.prepTime || selectedLogModal.prepTime || 10} phút</strong></span>
                      <span>Nấu: <strong>{aiData?.cookTime || selectedLogModal.cookTime || 20} phút</strong></span>
                      <span>Độ khó: <strong>{aiData?.difficulty || selectedLogModal.difficulty || 'Dễ'}</strong></span>
                    </div>

                    {/* Danh sách nguyên liệu chi tiết trong công thức AI */}
                    {aiData?.ingredients && Array.isArray(aiData.ingredients) && (
                      <div style={{ marginTop: '1rem', borderTop: '1px dashed #fbdad0', paddingTop: '0.8rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '0.4rem' }}>
                          Định lượng nguyên liệu AI tính toán:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#44403c' }}>
                          {aiData.ingredients.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem' }}>
                              <strong>{item.ingredientName}</strong>: {item.amount} {item.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Các bước nấu do AI hướng dẫn */}
                    {aiData?.steps && Array.isArray(aiData.steps) && (
                      <div style={{ marginTop: '1rem', borderTop: '1px dashed #fbdad0', paddingTop: '0.8rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c2d12', marginBottom: '0.6rem' }}>
                          Quy trình chế biến món ăn:
                        </div>
                        <div className={s.stepsList}>
                          {aiData.steps.map((st, idx) => (
                            <div key={idx} className={s.stepItem}>
                              <span className={s.stepNum}>{st.stepNumber || idx + 1}</span>
                              <div>
                                {st.title && <div style={{ fontWeight: 600, color: '#2b130c' }}>{st.title}</div>}
                                <div>{st.instruction}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
