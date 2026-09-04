import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertCircle, RefreshCw, Search, CheckCircle, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import s from '../../styles/pages/admin/AdminIngredients.module.css';

const TABS = [
  { id: 'pending', label: '🔴 Chờ duyệt' },
  { id: 'all', label: '📋 Tất cả' },
];

function ReviewModal({ ingredient, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: ingredient.name,
    baseUnit: ingredient.baseUnit,
    caloriesPer100g: ingredient.caloriesPer100g ?? 0,
    protein: ingredient.protein ?? 0,
    fat: ingredient.fat ?? 0,
    carbs: ingredient.carbs ?? 0,
    aisleId: ingredient.aisleId ?? null,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateIngredient(ingredient.id, {
        ...form,
        caloriesPer100g: parseFloat(form.caloriesPer100g),
        protein: parseFloat(form.protein),
        fat: parseFloat(form.fat),
        carbs: parseFloat(form.carbs),
      });
      toast.success(`Đã cập nhật dinh dưỡng cho "${ingredient.name}"`);
      onSaved();
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h3>Bổ sung dinh dưỡng</h3>
          <button onClick={onClose} className={s.modalClose}><X size={20} /></button>
        </div>

        <div className={s.modalBody}>
          <div className={s.ingredientTag}>
            <Package size={16} /> {ingredient.name}
            <span className={s.tagUnit}>/ 100{ingredient.baseUnit}</span>
          </div>

          <div className={s.formGrid}>
            {[
              { name: 'caloriesPer100g', label: 'Calories (kcal)' },
              { name: 'protein',         label: 'Protein (g)' },
              { name: 'fat',             label: 'Chất béo (g)' },
              { name: 'carbs',           label: 'Tinh bột (g)' },
            ].map(({ name, label }) => (
              <div key={name} className={s.formField}>
                <label className={s.formLabel}>{label}</label>
                <input
                  type="number"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={s.formInput}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Hủy</button>
          <button className={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={16} className={s.spin} /> : <CheckCircle size={16} />}
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingTab() {
  const [page, setPage] = useState(0);
  const [reviewing, setReviewing] = useState(null);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-pending-ingredients', page],
    queryFn: () => adminService.getPendingIngredients(page, PAGE_SIZE),
  });

  const items = data?.data?.content ?? [];
  const totalElements = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  const handleDelete = async (ing) => {
    if (!window.confirm(`Xóa nguyên liệu "${ing.name}"?`)) return;
    try {
      await adminService.deleteIngredient(ing.id);
      toast.success(`Đã xóa "${ing.name}"`);
      refetch();
    } catch {
      toast.error('Xóa thất bại.');
    }
  };

  if (isLoading) return (
    <div className={s.stateBox}><RefreshCw size={22} className={s.spin} /><span>Đang tải...</span></div>
  );
  if (isError) return (
    <div className={s.stateBox}><AlertCircle size={22} /><span>Lỗi tải dữ liệu.<button onClick={refetch}>Thử lại</button></span></div>
  );

  return (
    <>
      {reviewing && (
        <ReviewModal
          ingredient={reviewing}
          onClose={() => setReviewing(null)}
          onSaved={() => { setReviewing(null); refetch(); }}
        />
      )}

      {items.length === 0 ? (
        <div className={s.emptyBox}>
          <CheckCircle size={40} className={s.emptyIcon} />
          <h3>Không có nguyên liệu nào chờ duyệt!</h3>
          <p>Tất cả nguyên liệu đều đã có thông tin dinh dưỡng đầy đủ.</p>
        </div>
      ) : (
        <>
          <div className={s.tableInfo}>
            Hiển thị <strong>{items.length}</strong> / {totalElements} nguyên liệu chờ duyệt
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Tên nguyên liệu</th>
                  <th>Kệ hàng</th>
                  <th>Đơn vị</th>
                  <th>Ngày ID</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ing) => (
                  <tr key={ing.id}>
                    <td className={s.nameCell}>
                      <Package size={15} className={s.rowIcon} /> {ing.name}
                    </td>
                    <td>{ing.aisleName ?? <span className={s.na}>—</span>}</td>
                    <td>{ing.baseUnit}</td>
                    <td className={s.idCell}>#{ing.id}</td>
                    <td>
                      <div className={s.actions}>
                        <button className={s.reviewBtn} onClick={() => setReviewing(ing)}>
                          <CheckCircle size={15} /> Duyệt
                        </button>
                        <button className={s.deleteBtn} onClick={() => handleDelete(ing)}>
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
      )}
    </>
  );
}

function AllTab() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const PAGE_SIZE = 50;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-all-ingredients', page, search],
    queryFn: () => adminService.getAllIngredients(page, PAGE_SIZE, search),
  });

  const items = data?.data?.content ?? [];
  const totalElements = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(keyword);
  };

  if (isLoading) return (
    <div className={s.stateBox}><RefreshCw size={22} className={s.spin} /><span>Đang tải...</span></div>
  );
  if (isError) return (
    <div className={s.stateBox}><AlertCircle size={22} /><span>Lỗi.<button onClick={refetch}>Thử lại</button></span></div>
  );

  return (
    <>
      <form onSubmit={handleSearch} className={s.searchBar}>
        <div className={s.searchWrap}>
          <Search size={17} className={s.searchIcon} />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm theo tên nguyên liệu..."
            className={s.searchInput}
          />
        </div>
        <button type="submit" className={s.searchBtn}>Tìm kiếm</button>
      </form>

      <div className={s.tableInfo}>Tổng: <strong>{totalElements}</strong> nguyên liệu</div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Kệ hàng</th>
              <th className={s.numCol}>Cal (kcal)</th>
              <th className={s.numCol}>Protein</th>
              <th className={s.numCol}>Fat</th>
              <th className={s.numCol}>Carbs</th>
              <th>Đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ing) => (
              <tr key={ing.id} className={parseFloat(ing.caloriesPer100g) === 0 ? s.rowPending : ''}>
                <td>{ing.name}</td>
                <td>{ing.aisleName}</td>
                <td className={s.numCol}>{ing.caloriesPer100g}</td>
                <td className={s.numCol}>{ing.protein}</td>
                <td className={s.numCol}>{ing.fat}</td>
                <td className={s.numCol}>{ing.carbs}</td>
                <td>{ing.baseUnit}</td>
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

export default function AdminIngredients() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Quản lý Nguyên liệu</h1>
          <p className={s.subtitle}>Kiểm duyệt và quản lý toàn bộ nguyên liệu trong hệ thống</p>
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
        {activeTab === 'pending' && <PendingTab />}
        {activeTab === 'all'     && <AllTab />}
      </div>
    </div>
  );
}
