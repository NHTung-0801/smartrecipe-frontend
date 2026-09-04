import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChefHat, CheckCircle, EyeOff, Trash2, RefreshCw,
  AlertCircle, X, Clock, Users, Tag, ChevronRight, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import s from '../../styles/pages/admin/AdminRecipes.module.css';

// ─── Status helpers ───────────────────────────────────────────────────────────
const TAB_STATUS = {
  pending:  'PENDING_REVIEW',
  approved: 'PUBLIC',
  hidden:   'PRIVATE',
};

const TABS = [
  { id: 'pending',  label: '🔴 Chờ duyệt' },
  { id: 'approved', label: '✅ Đã duyệt' },
  { id: 'hidden',   label: '🙈 Đang ẩn' },
];

const DIFFICULTY_LABEL = { EASY: 'Dễ', MEDIUM: 'Vừa', HARD: 'Khó' };

// ─── Recipe Detail Drawer ─────────────────────────────────────────────────────
function RecipeDrawer({ id, onClose, onAction }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-recipe-detail', id],
    queryFn: () => adminService.getAdminRecipeDetail(id),
    select: (res) => res.data,
    enabled: !!id,
  });

  return (
    <div className={s.drawerOverlay} onClick={onClose}>
      <aside className={s.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={s.drawerHeader}>
          <h3>Chi tiết công thức</h3>
          <button className={s.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {isLoading ? (
          <div className={s.drawerLoading}><RefreshCw size={22} className={s.spin} /></div>
        ) : data ? (
          <div className={s.drawerBody}>
            {/* Cover */}
            {data.imageUrl && (
              <img src={data.imageUrl} alt={data.title} className={s.drawerImg} />
            )}

            {/* Title & meta */}
            <div className={s.drawerMeta}>
              <h2 className={s.drawerTitle}>{data.title}</h2>
              <div className={s.drawerAuthor}>
                <Users size={14} /> {data.authorDisplayName || data.authorUsername}
              </div>
              <div className={s.drawerMetaRow}>
                {data.difficulty && <span className={s.pill}>{DIFFICULTY_LABEL[data.difficulty] ?? data.difficulty}</span>}
                {data.prepTime  && <span className={s.pill}><Clock size={12} /> {data.prepTime}p chuẩn bị</span>}
                {data.cookTime  && <span className={s.pill}><Clock size={12} /> {data.cookTime}p nấu</span>}
              </div>
              {data.tags?.length > 0 && (
                <div className={s.drawerTags}>
                  <Tag size={13} />
                  {data.tags.map(t => <span key={t} className={s.tag}>{t}</span>)}
                </div>
              )}
            </div>

            {/* Description */}
            {data.description && (
              <div className={s.section}>
                <h4 className={s.sectionTitle}>Mô tả</h4>
                <p className={s.desc}>{data.description}</p>
              </div>
            )}

            {/* Ingredients */}
            {data.ingredients?.length > 0 && (
              <div className={s.section}>
                <h4 className={s.sectionTitle}>Nguyên liệu ({data.ingredients.length})</h4>
                <ul className={s.ingList}>
                  {data.ingredients.map((i, idx) => (
                    <li key={idx}>{i.name} — {i.amount} {i.unit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {data.steps?.length > 0 && (
              <div className={s.section}>
                <h4 className={s.sectionTitle}>Các bước ({data.steps.length})</h4>
                <ol className={s.stepList}>
                  {data.steps.map((step) => (
                    <li key={step.stepNumber} className={s.step}>
                      <span className={s.stepNum}>{step.stepNumber}</span>
                      <div>
                        {step.title && <strong>{step.title}</strong>}
                        <p>{step.instruction}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className={s.drawerActions}>
              {data.status !== 'PUBLIC' && (
                <button className={s.approveBtn} onClick={() => onAction(id, 'APPROVE')}>
                  <CheckCircle size={16} /> Duyệt công khai
                </button>
              )}
              {data.status !== 'PRIVATE' && data.status !== 'DELETED' && (
                <button className={s.hideBtn} onClick={() => onAction(id, 'HIDE')}>
                  <EyeOff size={16} /> Ẩn bài
                </button>
              )}
              <button className={s.deleteBtn} onClick={() => onAction(id, 'DELETE')}>
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

// ─── Recipe Table ─────────────────────────────────────────────────────────────
function RecipeTable({ status, onOpenDrawer }) {
  const [page, setPage] = useState(0);
  const qc = useQueryClient();
  const PAGE_SIZE = 20;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-recipes', status, page],
    queryFn: () => adminService.getAdminRecipes(status, page, PAGE_SIZE),
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }) => adminService.updateRecipeStatus(id, action),
    onSuccess: (_, { action }) => {
      const msg = { APPROVE: 'Đã duyệt công thức ✅', HIDE: 'Đã ẩn công thức', DELETE: 'Đã xóa công thức' };
      toast.success(msg[action] ?? 'Thành công');
      qc.invalidateQueries({ queryKey: ['admin-recipes'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Thao tác thất bại. Vui lòng thử lại.'),
  });

  const handleAction = (id, action) => {
    if (action === 'DELETE' && !window.confirm('Bạn có chắc muốn xóa công thức này?')) return;
    mutation.mutate({ id, action });
  };

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  if (isLoading) return (
    <div className={s.stateBox}><RefreshCw size={22} className={s.spin} /><span>Đang tải...</span></div>
  );
  if (isError) return (
    <div className={s.stateBox}><AlertCircle size={22} /><span>Lỗi tải dữ liệu.<button onClick={refetch}>Thử lại</button></span></div>
  );
  if (items.length === 0) return (
    <div className={s.emptyBox}>
      <ChefHat size={44} className={s.emptyIcon} />
      <h3>Không có bài nào trong mục này</h3>
      <p>Sẽ cập nhật khi user gửi bài mới.</p>
    </div>
  );

  return (
    <>
      <div className={s.tableInfo}>Tổng: <strong>{totalElements}</strong> công thức</div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th style={{ width: 52 }}></th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Độ khó</th>
              <th>Tags</th>
              <th>Ngày gửi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                {/* Thumbnail */}
                <td>
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.title} className={s.thumb} />
                  ) : (
                    <div className={s.thumbFallback}><ChefHat size={18} /></div>
                  )}
                </td>

                {/* Title */}
                <td>
                  <button className={s.titleBtn} onClick={() => onOpenDrawer(r.id)}>
                    {r.title} <ChevronRight size={14} />
                  </button>
                  {r.description && (
                    <div className={s.descSnippet}>{r.description}</div>
                  )}
                </td>

                {/* Author */}
                <td className={s.authorCell}>
                  <span className={s.authorAvatar}>{r.authorDisplayName?.[0] ?? 'U'}</span>
                  <div>
                    <div className={s.authorName}>{r.authorDisplayName || r.authorUsername}</div>
                    <div className={s.authorSub}>@{r.authorUsername}</div>
                  </div>
                </td>

                {/* Difficulty */}
                <td>
                  {r.difficulty && (
                    <span className={`${s.diffBadge} ${s[r.difficulty.toLowerCase()]}`}>
                      {DIFFICULTY_LABEL[r.difficulty] ?? r.difficulty}
                    </span>
                  )}
                </td>

                {/* Tags */}
                <td>
                  <div className={s.tagsCell}>
                    {r.tags?.slice(0, 2).map(t => <span key={t} className={s.tag}>{t}</span>)}
                    {r.tags?.length > 2 && <span className={s.tagMore}>+{r.tags.length - 2}</span>}
                  </div>
                </td>

                {/* Date */}
                <td className={s.dateCell}>
                  {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                </td>

                {/* Actions */}
                <td>
                  <div className={s.actionRow}>
                    <button className={s.previewBtn} title="Xem chi tiết" onClick={() => onOpenDrawer(r.id)}>
                      <Eye size={15} />
                    </button>
                    {status !== 'PUBLIC' && (
                      <button className={s.approveBtn2} title="Duyệt" onClick={() => handleAction(r.id, 'APPROVE')}
                        disabled={mutation.isPending}>
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {status !== 'PRIVATE' && status !== 'DELETED' && (
                      <button className={s.hideBtn2} title="Ẩn" onClick={() => handleAction(r.id, 'HIDE')}
                        disabled={mutation.isPending}>
                        <EyeOff size={15} />
                      </button>
                    )}
                    {status === 'PUBLIC' && (
                      <button className={s.hideBtn2} title="Ẩn bài đã duyệt" onClick={() => handleAction(r.id, 'HIDE')}
                        disabled={mutation.isPending}>
                        <EyeOff size={15} />
                      </button>
                    )}
                    <button className={s.deleteBtn2} title="Xóa" onClick={() => handleAction(r.id, 'DELETE')}
                      disabled={mutation.isPending}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={s.pagination}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className={s.pageBtn}>← Trước</button>
          <span className={s.pageInfo}>Trang {page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className={s.pageBtn}>Sau →</button>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRecipes() {
  const [activeTab, setActiveTab] = useState('pending');
  const [drawerRecipeId, setDrawerRecipeId] = useState(null);
  const qc = useQueryClient();

  const handleDrawerAction = (id, action) => {
    if (action === 'DELETE' && !window.confirm('Bạn có chắc muốn xóa công thức này?')) return;
    adminService.updateRecipeStatus(id, action)
      .then(() => {
        const msg = { APPROVE: 'Đã duyệt công thức ✅', HIDE: 'Đã ẩn công thức', DELETE: 'Đã xóa công thức' };
        toast.success(msg[action] ?? 'Thành công');
        setDrawerRecipeId(null);
        qc.invalidateQueries({ queryKey: ['admin-recipes'] });
        qc.invalidateQueries({ queryKey: ['admin-stats'] });
      })
      .catch(() => toast.error('Thao tác thất bại'));
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Kiểm duyệt Công thức</h1>
          <p className={s.subtitle}>Xem xét và phê duyệt bài đăng của người dùng trước khi công khai</p>
        </div>
      </div>

      <div className={s.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${s.tab} ${activeTab === tab.id ? s.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={s.content}>
        <RecipeTable
          status={TAB_STATUS[activeTab]}
          onOpenDrawer={setDrawerRecipeId}
        />
      </div>

      {drawerRecipeId && (
        <RecipeDrawer
          id={drawerRecipeId}
          onClose={() => setDrawerRecipeId(null)}
          onAction={handleDrawerAction}
        />
      )}
    </div>
  );
}
