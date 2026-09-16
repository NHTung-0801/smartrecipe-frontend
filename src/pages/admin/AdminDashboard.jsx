import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Users, Clock, Package, RefreshCw, AlertTriangle,
  Sparkles, CheckCircle, ChefHat, Star, Check, X,
  ShieldCheck, ArrowUpRight, Flame, ShieldAlert, BookMarked, ShoppingBag, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import ReviewModal from '../../components/admin/ReviewModal';
import s from '../../styles/pages/admin/AdminDashboard.module.css';

// ─── Recipe Preview Drawer Subcomponent ─────────────────────────────────────
function RecipePreviewDrawer({ id, onClose, onAction, onCalibrateIngredient }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-recipe-detail', id],
    queryFn: () => adminService.getAdminRecipeDetail(id),
    select: (res) => res.data,
    enabled: !!id,
  });

  if (!id) return null;

  return (
    <div className={s.drawerOverlay} onClick={onClose}>
      <aside className={s.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={s.drawerHeader}>
          <h3>Xem xét & Duyệt công thức</h3>
          <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {isLoading ? (
          <div className={s.drawerBody} style={{ alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <RefreshCw size={24} className={s.spin} />
          </div>
        ) : data ? (
          <>
            <div className={s.drawerBody}>
              {data.imageUrl && (
                <img src={data.imageUrl} alt={data.title} className={s.drawerImg} />
              )}

              <div className={s.drawerMeta}>
                <h2 className={s.drawerTitle}>{data.title}</h2>
                <div className={s.drawerPills}>
                  <span className={s.pill}>Tác giả: @{data.authorUsername}</span>
                  {data.difficulty && (
                    <span className={s.pill}>
                      Độ khó: {data.difficulty === 'EASY' ? 'Dễ' : data.difficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
                    </span>
                  )}
                  {data.prepTime && <span className={s.pill}><Clock size={12} /> {data.prepTime}p chuẩn bị</span>}
                  {data.cookTime && <span className={s.pill}><Clock size={12} /> {data.cookTime}p nấu</span>}
                  {data.baseServings && <span className={s.pill}><Users size={12} /> {data.baseServings} khẩu phần</span>}
                </div>
              </div>

              {data.description && (
                <div className={s.section}>
                  <h4 className={s.sectionTitle}>Mô tả món ăn</h4>
                  <p className={s.desc}>{data.description}</p>
                </div>
              )}

              {/* Nguyên liệu & Dinh dưỡng */}
              <div className={s.section}>
                <h4 className={s.sectionTitle}>
                  Thành phần nguyên liệu & Dinh dưỡng ({data.ingredients?.length ?? 0})
                </h4>
                <div className={s.ingList}>
                  {data.ingredients?.map((i) => {
                    const hasNutri = i.caloriesPer100g && Number(i.caloriesPer100g) > 0;
                    return (
                      <div key={i.id || i.name} className={s.ingItem}>
                        <div className={s.ingItemLeft}>
                          <span className={s.ingName}>{i.name}</span>
                          <span className={s.ingAmount}>
                            {i.amount} {i.unit} {i.aisleName ? `• ${i.aisleName}` : ''}
                          </span>
                        </div>
                        <div className={s.ingRight}>
                          {hasNutri ? (
                            <span className={s.ingNutriGood}>
                              {Math.round(i.caloriesPer100g)} kcal/100g
                            </span>
                          ) : (
                            <span className={s.ingNutriMissing}>
                              ⚠️ Chưa có calo
                            </span>
                          )}
                          <button
                            className={s.btnCalibrateSmall}
                            title="Gán / chuẩn hóa dinh dưỡng cho nguyên liệu này"
                            onClick={() => onCalibrateIngredient({
                              id: i.id,
                              name: i.name,
                              baseUnit: i.baseUnit || i.unit || 'g',
                              caloriesPer100g: i.caloriesPer100g || 0,
                              protein: i.protein || 0,
                              fat: i.fat || 0,
                              carbs: i.carbs || 0,
                              aisleId: i.aisleId,
                              aisleName: i.aisleName
                            })}
                          >
                            Gán calo
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Các bước nấu */}
              {data.steps?.length > 0 && (
                <div className={s.section}>
                  <h4 className={s.sectionTitle}>Các bước thực hiện ({data.steps.length})</h4>
                  <div>
                    {data.steps.map((st) => (
                      <div key={st.stepNumber} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', background: '#f5efe9',
                          color: '#a13923', fontWeight: 800, fontSize: '0.75rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {st.stepNumber}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#444', lineHeight: 1.5 }}>
                          {st.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={s.drawerFooter}>
              <button
                className={s.btnReject}
                onClick={() => onAction(id, 'HIDE')}
              >
                <X size={14} /> Ẩn bài
              </button>
              <button
                className={s.btnApprove}
                onClick={() => onAction(id, 'APPROVE')}
              >
                <Check size={14} /> Duyệt công khai ngay
              </button>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [reviewingIngredient, setReviewingIngredient] = useState(null);
  const [moderatingRecipeId, setModeratingRecipeId] = useState(null);
  const [previewRecipeId, setPreviewRecipeId] = useState(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    staleTime: 60 * 1000,
  });

  const stats = data?.data;

  const handleModerateRecipe = async (recipeId, action) => {
    setModeratingRecipeId(recipeId);
    try {
      await adminService.updateRecipeStatus(recipeId, action);
      const msg = action === 'APPROVE'
        ? 'Đã duyệt và công khai công thức thành công!'
        : 'Đã ẩn công thức khỏi bảng tin công khai.';
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch {
      toast.error('Thao tác thất bại, vui lòng thử lại.');
    } finally {
      setModeratingRecipeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={s.loading}>
        <RefreshCw size={32} className={s.spin} />
        <span>Đang kết nối trung tâm điều khiển Admin...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={s.error}>
        <AlertTriangle size={32} color="#a13923" />
        <span>Không thể tải dữ liệu điều hành.</span>
        <button onClick={refetch}>Thử lại ngay</button>
      </div>
    );
  }

  // ── Tính toán biểu đồ độ khó ──
  const diffEasy = stats?.difficultyBreakdown?.EASY ?? 0;
  const diffMedium = stats?.difficultyBreakdown?.MEDIUM ?? 0;
  const diffHard = stats?.difficultyBreakdown?.HARD ?? 0;
  const totalDiff = diffEasy + diffMedium + diffHard || 1;
  const maxDiff = Math.max(diffEasy, diffMedium, diffHard, 1);

  const easyHeight = Math.max(12, Math.round((diffEasy / maxDiff) * 85));
  const mediumHeight = Math.max(12, Math.round((diffMedium / maxDiff) * 85));
  const hardHeight = Math.max(12, Math.round((diffHard / maxDiff) * 85));

  // ── Tính toán Gauge Chống lãng phí ──
  const wasteRate = Math.min(100, Math.max(0, stats?.pantryWasteStats?.preventionRate ?? 100));
  // Bán nguyệt chu vi: PI * R = PI * 65 ≈ 204.2
  const arcLength = 204.2;
  const strokeOffset = arcLength - (arcLength * wasteRate) / 100;
  const gaugeColor = wasteRate >= 75 ? '#10b981' : wasteRate >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className={s.page}>
      {/* ── HEADER ── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Tổng quan hệ thống</h1>
            <span className={s.cockpitBadge}>
              <ShieldCheck size={14} /> Culinary Cockpit
            </span>
          </div>
          <p className={s.subtitle}>Trung tâm giám sát hoạt động bếp núc, trợ lý AI và dữ liệu thời gian thực</p>
        </div>

        <div className={s.headerActions}>
          <button className={s.refreshBtn} onClick={refetch} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? s.spin : ''} />
            {isFetching ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </div>

      {/* ── TOP METRIC BAR (4 KPI CARDS) ── */}
      <section className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}>
            <BookOpen size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Tổng công thức</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{stats?.totalRecipes ?? 0}</span>
              <span className={s.kpiBadge}>{stats?.publicRecipes ?? 0} Public</span>
            </div>
            <div className={s.kpiSub}>
              {stats?.totalRecipes - stats?.publicRecipes > 0
                ? `${stats?.totalRecipes - stats?.publicRecipes} bản nháp / ẩn`
                : 'Đã tối ưu trên feed'}
            </div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}>
            <Users size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Thành viên hệ thống</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{stats?.totalUsers ?? 0}</span>
              <span className={s.kpiBadge}>Active</span>
            </div>
            <div className={s.kpiSub}>Tài khoản hoạt động</div>
          </div>
        </div>

        <div className={`${s.kpiCard} ${stats?.pendingRecipes > 0 ? s.kpiCardAlert : ''}`}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}>
            <Clock size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Công thức chờ duyệt</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{stats?.pendingRecipes ?? 0}</span>
              {stats?.pendingRecipes > 0 && <span className={`${s.kpiBadge} ${s.alert}`}>Cần duyệt</span>}
            </div>
            <div className={s.kpiSub}>Bài viết từ cộng đồng</div>
          </div>
        </div>

        <div className={`${s.kpiCard} ${stats?.pendingIngredients > 0 ? s.kpiCardAlert : ''}`}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}>
            <Package size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Nguyên liệu chờ duyệt</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{stats?.pendingIngredients ?? 0}</span>
              <span className={s.kpiBadge}>/ {stats?.totalIngredients ?? 0} kho</span>
            </div>
            <div className={s.kpiSub}>Cần chuẩn hóa calo</div>
          </div>
        </div>
      </section>

      {/* ── STUDIO GRID (3 COLUMNS) ── */}
      <section className={s.studioGrid}>
        {/* Panel 1: Bar Chart - Phân bổ độ khó */}
        <div className={s.panelCard}>
          <div className={s.panelHeader}>
            <div className={s.panelTitleWrap}>
              <Flame size={18} className={s.panelIcon} />
              <h2 className={s.panelTitle}>Phân bổ độ khó</h2>
            </div>
            <span className={s.panelTag}>{totalDiff} công thức</span>
          </div>

          <div className={s.barChartContainer}>
            <svg className={s.barChartSvg} viewBox="0 0 240 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="barEasyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="barMedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="barHardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#a13923" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="10" y1="20" x2="230" y2="20" stroke="#f5f5f4" strokeDasharray="3 3" />
              <line x1="10" y1="60" x2="230" y2="60" stroke="#f5f5f4" strokeDasharray="3 3" />
              <line x1="10" y1="100" x2="230" y2="100" stroke="#e7e5e4" strokeWidth="1.5" />

              {/* Bar 1: Easy */}
              <rect
                x="25"
                y={100 - easyHeight}
                width="45"
                height={easyHeight}
                rx="6"
                fill="url(#barEasyGrad)"
              />
              <text x="47.5" y={92 - easyHeight} textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669">
                {diffEasy} ({Math.round((diffEasy / totalDiff) * 100)}%)
              </text>

              {/* Bar 2: Medium */}
              <rect
                x="97.5"
                y={100 - mediumHeight}
                width="45"
                height={mediumHeight}
                rx="6"
                fill="url(#barMedGrad)"
              />
              <text x="120" y={92 - mediumHeight} textAnchor="middle" fontSize="11" fontWeight="700" fill="#d97706">
                {diffMedium} ({Math.round((diffMedium / totalDiff) * 100)}%)
              </text>

              {/* Bar 3: Hard */}
              <rect
                x="170"
                y={100 - hardHeight}
                width="45"
                height={hardHeight}
                rx="6"
                fill="url(#barHardGrad)"
              />
              <text x="192.5" y={92 - hardHeight} textAnchor="middle" fontSize="11" fontWeight="700" fill="#a13923">
                {diffHard} ({Math.round((diffHard / totalDiff) * 100)}%)
              </text>
            </svg>

            <div className={s.barLegend}>
              <div className={s.legendItem}>
                <span className={`${s.legendDot} ${s.easy}`}></span> Dễ
              </div>
              <div className={s.legendItem}>
                <span className={`${s.legendDot} ${s.medium}`}></span> Trung bình
              </div>
              <div className={s.legendItem}>
                <span className={`${s.legendDot} ${s.hard}`}></span> Khó
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: AI Assistant Activity */}
        <div className={s.panelCard}>
          <div className={s.panelHeader}>
            <div className={s.panelTitleWrap}>
              <Sparkles size={18} className={s.panelIcon} />
              <h2 className={s.panelTitle}>Trợ lý Đầu bếp</h2>
            </div>
            <span className={s.aiTodayBadge}>+{stats?.aiStats?.todayCalls ?? 0} hôm nay</span>
          </div>

          <div className={s.aiMetricsRow}>
            <div className={s.aiBigNum}>
              <span className={s.aiNumber}>{stats?.aiStats?.totalCalls ?? 0}</span>
              <span className={s.aiUnit}>lượt tư vấn</span>
            </div>
            <div className={s.aiSubRate}>
              <span style={{ fontWeight: 700, color: '#a13923' }}>
                {stats?.aiStats?.savedRecipes ?? 0}
              </span> món đã lưu
            </div>
          </div>

          {/* Sparkline wave */}
          <div className={s.sparklineWrap}>
            <svg className={s.sparklineSvg} viewBox="0 0 260 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aiSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a13923" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a13923" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,38 Q 40,10 85,26 T 170,14 T 260,8 L 260,50 L 0,50 Z"
                fill="url(#aiSparkGrad)"
              />
              <path
                d="M 0,38 Q 40,10 85,26 T 170,14 T 260,8"
                fill="none"
                stroke="#a13923"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={s.aiBreakdownList}>
            <div className={s.aiBreakdownItem}>
              <span className={s.aiBreakdownLabel}>
                🌱 Giải cứu tủ lạnh
              </span>
              <span className={s.aiBreakdownVal}>
                {stats?.aiStats?.typeBreakdown?.ZERO_WASTE ?? 0} lượt
              </span>
            </div>
            <div className={s.aiBreakdownItem}>
              <span className={s.aiBreakdownLabel}>
                ✨ Gợi ý thực đơn
              </span>
              <span className={s.aiBreakdownVal}>
                {(stats?.aiStats?.typeBreakdown?.FEASIBLE_FINDER ?? stats?.aiStats?.typeBreakdown?.FEASIBLE_RECIPES ?? 0)} lượt
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Food Waste Prevention Gauge */}
        <div className={s.panelCard}>
          <div className={s.panelHeader}>
            <div className={s.panelTitleWrap}>
              <ShieldAlert size={18} className={s.panelIcon} />
              <h2 className={s.panelTitle}>Bảo quản tủ lạnh</h2>
            </div>
            <span className={s.panelTag}>{stats?.pantryWasteStats?.totalItems ?? 0} lô đồ ăn</span>
          </div>

          <div className={s.gaugeContainer}>
            <svg className={s.gaugeSvg} viewBox="0 0 180 100">
              <path
                d="M 25,90 A 65,65 0 0,1 155,90"
                fill="none"
                stroke="#f0e6e0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 25,90 A 65,65 0 0,1 155,90"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>

            <div className={s.gaugeTextWrap}>
              <span className={s.gaugePercentage}>{wasteRate}%</span>
              <div>
                <span className={`${s.gaugeStatusPill} ${wasteRate >= 60 ? s.good : s.warn}`}>
                  {wasteRate >= 75 ? 'An toàn tối ưu' : wasteRate >= 50 ? 'Bảo quản tốt' : 'Cần kiểm tra'}
                </span>
              </div>
            </div>
          </div>

          <div className={s.pantryAlertBox}>
            {stats?.pantryWasteStats?.expiringItems > 0 ? (
              <>
                <AlertTriangle size={15} />
                <span>
                  <strong>{stats?.pantryWasteStats?.expiringItems}</strong> món cần nấu ngay
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={15} style={{ color: '#10b981' }} />
                <span>Tất cả thực phẩm trong tủ lạnh đều an toàn!</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── MODERATION COCKPIT QUEUE (INTERACTIVE ACTIONS) ── */}
      <section className={s.moderationSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionTitleGroup}>
            <ChefHat size={22} color="#a13923" />
            <h2 className={s.sectionTitle}>Hàng đợi kiểm duyệt trực tiếp (Moderation Queue)</h2>
          </div>
        </div>

        <div className={s.moderationGrid}>
          {/* Cột 1: Công thức chờ duyệt */}
          <div className={s.moderationCard}>
            <div className={s.moderationCardHeader}>
              <h3 className={s.moderationCardTitle}>
                <Clock size={18} color="#d97706" />
                Công thức chờ duyệt
              </h3>
              <span className={s.panelTag}>{stats?.recentPendingRecipes?.length ?? 0} mục mới</span>
            </div>

            <div className={s.itemList}>
              {stats?.recentPendingRecipes && stats.recentPendingRecipes.length > 0 ? (
                stats.recentPendingRecipes.map((r) => (
                  <div key={r.id} className={s.modItem}>
                    <div className={s.modItemLeft}>
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.title} className={s.modThumbnail} />
                      ) : (
                        <div className={s.modThumbFallback}><ChefHat size={22} /></div>
                      )}
                      <div className={s.modItemInfo}>
                        <span className={s.modItemTitle} title={r.title}>{r.title}</span>
                        <div className={s.modItemSub}>
                          <span>@{r.authorUsername}</span>
                          {r.difficulty && (
                            <span className={`${s.modDiffBadge} ${s[r.difficulty]}`}>
                              {r.difficulty === 'EASY' ? 'Dễ' : r.difficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={s.modActions}>
                      <button
                        className={s.btnDetail}
                        onClick={() => setPreviewRecipeId(r.id)}
                        title="Xem chi tiết nguyên liệu & dinh dưỡng"
                      >
                        <Eye size={13} /> Chi tiết
                      </button>
                      <button
                        className={s.btnApprove}
                        onClick={() => handleModerateRecipe(r.id, 'APPROVE')}
                        disabled={moderatingRecipeId === r.id}
                      >
                        <Check size={13} /> Duyệt
                      </button>
                      <button
                        className={s.btnReject}
                        onClick={() => handleModerateRecipe(r.id, 'HIDE')}
                        disabled={moderatingRecipeId === r.id}
                      >
                        <X size={13} /> Ẩn
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={s.emptyQueue}>
                  <CheckCircle size={32} className={s.emptyQueueIcon} />
                  <span>Không có công thức nào đang chờ duyệt. Toàn bộ đã được công khai!</span>
                </div>
              )}
            </div>
          </div>

          {/* Cột 2: Nguyên liệu chờ duyệt */}
          <div className={s.moderationCard}>
            <div className={s.moderationCardHeader}>
              <h3 className={s.moderationCardTitle}>
                <Package size={18} color="#059669" />
                Nguyên liệu cần bổ sung dinh dưỡng
              </h3>
              <span className={s.panelTag}>{stats?.recentPendingIngredients?.length ?? 0} cần xem</span>
            </div>

            <div className={s.itemList}>
              {stats?.recentPendingIngredients && stats.recentPendingIngredients.length > 0 ? (
                stats.recentPendingIngredients.map((ing) => (
                  <div key={ing.id} className={s.modItem}>
                    <div className={s.modItemLeft}>
                      <div className={s.modThumbFallback}><Package size={20} /></div>
                      <div className={s.modItemInfo}>
                        <span className={s.modItemTitle}>{ing.name}</span>
                        <div className={s.modItemSub}>
                          <span>100{ing.baseUnit}</span>
                          {ing.aisleName && <span>• {ing.aisleName}</span>}
                        </div>
                      </div>
                    </div>

                    <div className={s.modActions}>
                      <button
                        className={s.btnReviewModal}
                        onClick={() => setReviewingIngredient(ing)}
                      >
                        <ArrowUpRight size={13} /> Bổ sung
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={s.emptyQueue}>
                  <CheckCircle size={32} className={s.emptyQueueIcon} />
                  <span>Toàn bộ nguyên liệu trong từ điển đã được chuẩn hóa dinh dưỡng!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY & JOURNAL HEALTH FOOTER BANNER ── */}
      <section className={s.communityBanner}>
        <div className={s.communityStatsWrap}>
          <div className={s.commStat}>
            <BookMarked size={24} className={s.commStatIcon} />
            <div>
              <div className={s.commStatVal}>{stats?.cookingStats?.totalJournals ?? 0}</div>
              <div className={s.commStatLabel}>Lượt nấu ăn đã ghi nhật ký</div>
            </div>
          </div>

          <div className={s.commStat}>
            <Star size={24} className={s.commStatIcon} style={{ color: '#f59e0b' }} />
            <div>
              <div className={s.commStatVal}>{stats?.cookingStats?.averageRating ?? '5.0'} ⭐</div>
              <div className={s.commStatLabel}>Điểm đánh giá trung bình công thức</div>
            </div>
          </div>

          <div className={s.commStat}>
            <ShoppingBag size={24} className={s.commStatIcon} />
            <div>
              <div className={s.commStatVal}>{stats?.activeGroceryLists ?? 0}</div>
              <div className={s.commStatLabel}>Danh sách đi chợ đang hoạt động</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DRAWER CHI TIẾT CÔNG THỨC & GÁN DINH DƯỠNG ── */}
      {previewRecipeId && (
        <RecipePreviewDrawer
          id={previewRecipeId}
          onClose={() => setPreviewRecipeId(null)}
          onAction={(id, action) => {
            handleModerateRecipe(id, action);
            setPreviewRecipeId(null);
          }}
          onCalibrateIngredient={(ing) => {
            setReviewingIngredient(ing);
          }}
        />
      )}

      {/* ── MODAL REVIEW NGUYÊN LIỆU (SHARED COMPONENT) ── */}
      {reviewingIngredient && (
        <ReviewModal
          ingredient={reviewingIngredient}
          onClose={() => setReviewingIngredient(null)}
          onSaved={() => {
            setReviewingIngredient(null);
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            if (previewRecipeId) {
              queryClient.invalidateQueries({ queryKey: ['admin-recipe-detail', previewRecipeId] });
            }
          }}
        />
      )}
    </div>
  );
}
