import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChefHat, CheckCircle, CheckCircle2, Lock, EyeOff, Trash2, RefreshCw,
  AlertCircle, X, Clock, Users, Tag, ChevronRight, Eye,
  Search, BookOpen, AlertTriangle, ShieldCheck, Flame, Utensils, Sparkles, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import ReviewModal from '../../components/admin/ReviewModal';
import s from '../../styles/pages/admin/AdminRecipes.module.css';

// ─── Status Mapping ──────────────────────────────────────────────────────────
const TAB_STATUS = {
  pending:  'PENDING_REVIEW',
  approved: 'PUBLIC',
  hidden:   'PRIVATE',
};

const DIFFICULTY_LABEL = { EASY: 'Dễ', MEDIUM: 'Vừa', HARD: 'Khó' };

function formatTime(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}p`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}p` : `${h}h`;
}

// ─── Recipe Review Drawer Panel (Slide-out từ bên phải) ───────────────────────
function RecipeReviewPanel({ id, isClosing, onClose, onAction, onCalibrateIngredient }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-recipe-detail', id],
    queryFn: () => adminService.getAdminRecipeDetail(id),
    select: (res) => res.data,
    enabled: !!id,
  });

  if (!id) return null;

  return (
    <div className={`${s.studioPanel} ${isClosing ? s.drawerClosing : ''}`}>
      {/* Studio Header */}
      <div className={s.studioHeader}>
        <div className={s.studioTitleWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <BookOpen size={18} style={{ color: '#a13923' }} />
            <h3 className={s.studioTitle}>Kiểm duyệt #{id}</h3>
          </div>
          <span className={`${s.studioStatusBadge} ${s[data?.status?.toLowerCase() || 'pending_review']}`}>
            {data?.status === 'PUBLIC'
              ? 'Đã công khai'
              : data?.status === 'PENDING_REVIEW'
              ? 'Chờ duyệt bài'
              : 'Riêng tư & Ẩn'}
          </span>
        </div>
        <button className={s.closeBtn} onClick={onClose} title="Đóng bảng kiểm duyệt">
          <X size={16} />
        </button>
      </div>

      {/* Studio Body (Scrollable Frame) */}
      {isLoading ? (
        <div className={s.stateBox} style={{ padding: '3rem 1rem' }}>
          <RefreshCw size={22} className={s.spin} />
          <span>Đang nạp dữ liệu công thức #{id}...</span>
        </div>
      ) : data ? (
        <div className={s.studioScrollBody}>
          {/* Cover Image */}
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.title} className={s.studioCover} />
          ) : (
            <div className={s.studioCoverFallback}>
              <ChefHat size={32} style={{ color: '#a13923' }} />
              <span>Chưa có ảnh món ăn</span>
            </div>
          )}

          {/* Title & Author Meta */}
          <div className={s.studioMetaBox}>
            <h2 className={s.studioRecipeTitle}>{data.title}</h2>
            <div className={s.studioMetaRow}>
              <div className={s.authorCell}>
                <span className={s.authorAvatar}>
                  {(data.authorDisplayName || data.authorUsername || 'U')[0].toUpperCase()}
                </span>
                <div className={s.authorDetails}>
                  <span className={s.authorName}>{data.authorDisplayName || data.authorUsername}</span>
                  <span className={s.authorSub}>@{data.authorUsername}</span>
                </div>
              </div>

              {data.difficulty && (
                <span className={`${s.diffPill} ${s[data.difficulty.toLowerCase()] || ''}`}>
                  {DIFFICULTY_LABEL[data.difficulty] ?? data.difficulty}
                </span>
              )}

              {data.prepTime > 0 && (
                <span className={s.metaBadge}>
                  <Clock size={11} /> {data.prepTime}p chuẩn bị
                </span>
              )}

              {data.cookTime > 0 && (
                <span className={s.metaBadge}>
                  <Flame size={11} /> {data.cookTime}p nấu
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className={s.sectionBox}>
              <h4 className={s.sectionTitle}>Mô tả món ăn</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#57534e', lineHeight: 1.5 }}>
                {data.description}
              </p>
            </div>
          )}

          {/* Ingredients with Calorie Checker */}
          <div className={s.sectionBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 className={s.sectionTitle}>
                <Utensils size={14} style={{ color: '#a13923' }} />
                Nguyên liệu ({data.ingredients?.length || 0})
              </h4>
              <span style={{ fontSize: '0.7rem', color: '#78716c' }}>
                Chuẩn hóa calo
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              {data.ingredients?.map((ing, idx) => {
                const hasCalo = ing.caloriesPer100g && Number(ing.caloriesPer100g) > 0;
                return (
                  <div key={ing.id || idx} className={s.ingRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <strong style={{ color: '#292524', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ing.name}
                      </strong>
                      <span style={{ color: '#78716c', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                        {ing.amount} {ing.unit}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {hasCalo ? (
                        <span className={`${s.ingCaloBadge} ${s.hasCalo}`}>
                          {Math.round(ing.caloriesPer100g)} kcal
                        </span>
                      ) : (
                        <span className={`${s.ingCaloBadge} ${s.missing}`}>
                          <AlertCircle size={10} /> Thiếu calo
                        </span>
                      )}

                      <button
                        type="button"
                        className={s.btnCalibrateSmall}
                        onClick={() => onCalibrateIngredient({
                          id: ing.id,
                          name: ing.name,
                          baseUnit: ing.baseUnit || ing.unit || 'g',
                          caloriesPer100g: ing.caloriesPer100g || 0,
                          protein: ing.protein || 0,
                          fat: ing.fat || 0,
                          carbs: ing.carbs || 0,
                          aisleId: ing.aisleId,
                          aisleName: ing.aisleName
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

          {/* Cooking Steps */}
          {data.steps?.length > 0 && (
            <div className={s.sectionBox}>
              <h4 className={s.sectionTitle}>
                <BookOpen size={14} style={{ color: '#a13923' }} />
                Các bước thực hiện ({data.steps.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {data.steps.map((step) => (
                  <div key={step.stepNumber} className={s.stepItem}>
                    <span className={s.stepIndex}>{step.stepNumber}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                      {step.title && <strong style={{ color: '#292524', fontSize: '0.8rem' }}>{step.title}</strong>}
                      <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.45 }}>{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Studio Footer Actions */}
      {data && (
        <div className={s.studioFooter}>
          <button className={s.btnStudioClose} onClick={onClose}>
            Đóng
          </button>

          {data.status !== 'PUBLIC' && (
            <button
              className={s.btnStudioApprove}
              onClick={() => onAction(id, 'APPROVE')}
            >
              <CheckCircle size={15} /> Duyệt công khai
            </button>
          )}

          {data.status !== 'PRIVATE' && (
            <button
              className={s.btnStudioHide}
              onClick={() => onAction(id, 'HIDE')}
            >
              <EyeOff size={15} /> Ẩn bài
            </button>
          )}

          <button
            className={s.btnStudioDelete}
            onClick={() => onAction(id, 'DELETE')}
          >
            <Trash2 size={15} /> Xóa
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Recipes Page ──────────────────────────────────────────────────
export default function AdminRecipes() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [reviewingIngredient, setReviewingIngredient] = useState(null);

  const qc = useQueryClient();
  const PAGE_SIZE = 15;

  const currentStatus = TAB_STATUS[activeTab];

  // Fetch recipe list & KPI stats
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-recipes', currentStatus, page, searchKeyword],
    queryFn: () => adminService.getAdminRecipes(currentStatus, page, PAGE_SIZE, searchKeyword),
    select: (res) => res.data,
  });

  // Action mutation
  const mutation = useMutation({
    mutationFn: ({ id, action }) => adminService.updateRecipeStatus(id, action),
    onSuccess: (_, { action }) => {
      const msg = {
        APPROVE: 'Đã duyệt và công khai công thức! 🎉',
        HIDE: 'Đã đưa bài về riêng tư (Ẩn bài)',
        DELETE: 'Đã xóa công thức thành công'
      };
      toast.success(msg[action] ?? 'Thao tác thành công');
      setSelectedRecipeId(null);
      qc.invalidateQueries({ queryKey: ['admin-recipes'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Thao tác thất bại. Vui lòng thử lại.'),
  });

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setSelectedRecipeId(null);
      setIsDrawerClosing(false);
    }, 240);
  }, []);

  const handleOpenRecipe = useCallback((id) => {
    setIsDrawerClosing(false);
    setSelectedRecipeId(id);
  }, []);

  const handleAction = (id, action) => {
    if (action === 'DELETE' && !window.confirm('Bạn có chắc muốn xóa công thức này?')) return;
    mutation.mutate({ id, action });
  };

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Real KPI stats from backend response
  const totalCount   = data?.totalCount ?? 0;
  const pendingCount = data?.pendingCount ?? 0;
  const publicCount  = data?.publicCount ?? 0;
  const privateCount = data?.privateCount ?? 0;

  return (
    <div className={s.page}>
      {/* ─── Header ──────────────────────────────────── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Kiểm duyệt Công thức</h1>
            <span className={s.titleBadge}>
              <ShieldCheck size={13} /> RECIPE MODERATION
            </span>
          </div>
          <p className={s.subtitle}>
            Xem xét, đối chiếu dinh dưỡng và kiểm duyệt bài đăng của người dùng trước khi công khai
          </p>
        </div>
      </div>

      {/* ─── KPI Cards Row ─────────────────────────── */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}>
            <BookOpen size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Tổng công thức</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{totalCount}</span>
            </div>
            <div className={s.kpiSub}>Toàn bộ kho công thức</div>
          </div>
        </div>

        <div className={`${s.kpiCard} ${pendingCount > 0 ? s.kpiCardAlert : ''}`}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}>
            <Clock size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Công thức chờ duyệt</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{pendingCount}</span>
              {pendingCount > 0 && <span className={`${s.kpiBadge} ${s.alert}`}>Cần duyệt</span>}
            </div>
            <div className={s.kpiSub}>Công thức user gửi công khai</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}>
            <CheckCircle2 size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Đã công khai</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{publicCount}</span>
              <span className={s.kpiBadge} style={{ background: '#ecfdf5', color: '#059669' }}>Cộng đồng</span>
            </div>
            <div className={s.kpiSub}>Đang hiển thị trên Bảng tin</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}>
            <Lock size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Riêng tư & đang ẩn</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{privateCount}</span>
              <span className={s.kpiBadge} style={{ background: '#eff6ff', color: '#2563eb' }}>Lưu trữ</span>
            </div>
            <div className={s.kpiSub}>Công thức lưu cá nhân / bị ẩn</div>
          </div>
        </div>
      </div>

      {/* ─── Full-Width List Panel ────────────────────────────────── */}
      <div className={s.listPanel}>
          {/* Filter Bar */}
          <div className={s.filterBar}>
            <div className={s.searchWrap}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPage(0);
                }}
                placeholder="Tìm theo tên công thức, tác giả..."
                className={s.searchInput}
              />
            </div>

            <div className={s.tabsRow}>
              <button
                type="button"
                className={`${s.tabBtn} ${activeTab === 'pending' ? s.active : ''}`}
                onClick={() => {
                  setActiveTab('pending');
                  setPage(0);
                }}
              >
                <Clock size={15} />
                <span>Chờ duyệt</span>
                <span className={`${s.tabBadge} ${pendingCount > 0 ? s.alert : ''}`}>{pendingCount}</span>
              </button>
              <button
                type="button"
                className={`${s.tabBtn} ${activeTab === 'approved' ? s.active : ''}`}
                onClick={() => {
                  setActiveTab('approved');
                  setPage(0);
                }}
              >
                <CheckCircle2 size={15} />
                <span>Đã công khai</span>
                <span className={s.tabBadge}>{publicCount}</span>
              </button>
              <button
                type="button"
                className={`${s.tabBtn} ${activeTab === 'hidden' ? s.active : ''}`}
                onClick={() => {
                  setActiveTab('hidden');
                  setPage(0);
                }}
              >
                <Lock size={15} />
                <span>Riêng tư & Ẩn</span>
                <span className={s.tabBadge}>{privateCount}</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className={s.stateBox}>
              <RefreshCw size={24} className={s.spin} />
              <span>Đang tải danh sách công thức...</span>
            </div>
          ) : isError ? (
            <div className={s.stateBox}>
              <AlertCircle size={24} style={{ color: '#ef4444' }} />
              <span>Lỗi khi tải dữ liệu.</span>
              <button
                type="button"
                onClick={() => refetch()}
                style={{ background: 'none', border: 'none', color: '#a13923', fontWeight: 700, cursor: 'pointer' }}
              >
                Thử lại
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={s.stateBox}>
              <ChefHat size={40} style={{ color: '#d6d3d1' }} />
              <p style={{ margin: 0, fontWeight: 700, color: '#2b130c' }}>
                Không có công thức nào trong mục này
              </p>
              <span style={{ fontSize: '0.8rem', color: '#a8a29e' }}>
                {activeTab === 'pending'
                  ? 'Tuyệt vời! Toàn bộ công thức công khai đã được xem xét và phê duyệt.'
                  : 'Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab khác.'}
              </span>
            </div>
          ) : (
            <div className={s.tableContainer}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Công thức</th>
                    <th style={{ width: '20%' }}>Tác giả</th>
                    <th style={{ width: '16%' }}>Thông số</th>
                    <th style={{ width: '12%' }}>Ngày gửi</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr
                      key={r.id}
                      className={r.id === selectedRecipeId ? s.activeRow : ''}
                      onClick={() => handleOpenRecipe(r.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* 1. Recipe info */}
                      <td>
                        <div className={s.recipeCell}>
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.title} className={s.thumb} />
                          ) : (
                            <div className={s.thumbFallback}>🍲</div>
                          )}
                          <div className={s.recipeInfo}>
                            <button
                              type="button"
                              className={s.recipeTitleBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRecipe(r.id);
                              }}
                              title="Bấm để xem xét chi tiết"
                            >
                              <span>{r.title}</span>
                              <ChevronRight size={14} />
                            </button>
                            {r.description && (
                              <span className={s.recipeDesc}>{r.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Author */}
                      <td>
                        <div className={s.authorCell}>
                          <span className={s.authorAvatar}>
                            {(r.authorDisplayName || r.authorUsername || 'U')[0].toUpperCase()}
                          </span>
                          <div className={s.authorDetails}>
                            <span className={s.authorName}>{r.authorDisplayName || r.authorUsername}</span>
                            <span className={s.authorSub}>@{r.authorUsername}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Stats (Difficulty, Time, Ingredients) */}
                      <td>
                        <div className={s.statsWrap}>
                          <div className={s.statsRow}>
                            {r.difficulty && (
                              <span className={`${s.diffPill} ${s[r.difficulty.toLowerCase()] || ''}`}>
                                {DIFFICULTY_LABEL[r.difficulty] ?? r.difficulty}
                              </span>
                            )}
                            <span>•</span>
                            <span>{formatTime((r.prepTime || 0) + (r.cookTime || 0)) || '30p'}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#78716c' }}>
                            {r.ingredientCount != null ? `${r.ingredientCount} nguyên liệu` : 'Đã kèm nguyên liệu'}
                          </span>
                        </div>
                      </td>

                       {/* 4. Date */}
                       <td>
                         <span className={s.dateText}>
                           {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                         </span>
                       </td>

                      {/* 5. Actions */}
                      <td>
                        <div className={s.actionGroup} style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={`${s.btnAction} ${s.preview}`}
                            title="Xem xét chi tiết"
                            onClick={(e) => {
                               e.stopPropagation();
                               handleOpenRecipe(r.id);
                             }}
                          >
                            <Eye size={14} />
                          </button>

                          {currentStatus !== 'PUBLIC' && (
                            <button
                              type="button"
                              className={`${s.btnAction} ${s.approve}`}
                              title="Duyệt công khai"
                              disabled={mutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(r.id, 'APPROVE');
                              }}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}

                          {currentStatus !== 'PRIVATE' && (
                            <button
                              type="button"
                              className={`${s.btnAction} ${s.hide}`}
                              title="Đưa về riêng tư / Ẩn bài"
                              disabled={mutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(r.id, 'HIDE');
                              }}
                            >
                              <EyeOff size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            className={`${s.btnAction} ${s.delete}`}
                            title="Xóa công thức"
                            disabled={mutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(r.id, 'DELETE');
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={s.pagination}>
              <span className={s.pageInfo}>
                Trang {page + 1} / {totalPages} ({totalElements} công thức)
              </span>
              <div className={s.pageBtnGroup}>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className={s.pageBtn}
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className={s.pageBtn}
                >
                  Sau →
                </button>
                </div>
            </div>
          )}
        </div>

      {/* ─── Drawer Overlay + Slide-out Studio Panel ───────── */}
      {selectedRecipeId && (
        <>
          <div
            className={`${s.drawerOverlay} ${isDrawerClosing ? s.drawerClosing : ''}`}
            onClick={handleCloseDrawer}
          />
          <RecipeReviewPanel
            id={selectedRecipeId}
            isClosing={isDrawerClosing}
            onClose={handleCloseDrawer}
            onAction={handleAction}
            onCalibrateIngredient={(ing) => setReviewingIngredient(ing)}
          />
        </>
      )}

      {/* ─── Ingredient Calibration Modal ────────────── */}
      {reviewingIngredient && (
        <ReviewModal
          ingredient={reviewingIngredient}
          onClose={() => setReviewingIngredient(null)}
          onSaved={() => {
            setReviewingIngredient(null);
            qc.invalidateQueries({ queryKey: ['admin-recipe-detail'] });
            qc.invalidateQueries({ queryKey: ['admin-recipes'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
          }}
        />
      )}
    </div>
  );
}
