import { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Layers,
  Tag,
  Scale,
  Boxes,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import s from '../../styles/pages/admin/AdminMasterData.module.css';

export default function AdminMasterData() {
  const [activeTab, setActiveTab] = useState('aisles'); // 'aisles' | 'tags' | 'conversions'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [aisles, setAisles] = useState([]);
  const [tags, setTags] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [conversionFilter, setConversionFilter] = useState('ALL'); // 'ALL' | 'GENERIC' | 'INGREDIENT'

  // Add / Edit Modal state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [modalType, setModalType] = useState('aisle');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fromUnit: '',
    toUnit: '',
    multiplier: '',
    scope: 'GENERIC',
    ingredientId: '',
  });

  // Delete Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, item: null });

  // ── Load All Master Data ─────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [aisleRes, tagRes, convRes, ingRes] = await Promise.all([
        adminService.getAisles().catch(() => ({ data: [] })),
        adminService.getTags().catch(() => ({ data: [] })),
        adminService.getUnitConversions().catch(() => ({ data: [] })),
        adminService.getAllIngredients(0, 200).catch(() => ({ data: { content: [] } })),
      ]);
      setAisles(aisleRes?.data || []);
      setTags(tagRes?.data || []);
      setConversions(convRes?.data || []);
      setIngredients(ingRes?.data?.content || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Master Data:', err);
      toast.error('Không thể tải toàn bộ dữ liệu Master Data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // ── Date Formatter ───────────────────────────────────────
  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return isoStr; }
  };

  // ── Computed Filtered Data ───────────────────────────────
  const filteredAisles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return aisles;
    return aisles.filter((a) => a.name?.toLowerCase().includes(q));
  }, [aisles, search]);

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name?.toLowerCase().includes(q));
  }, [tags, search]);

  const filteredConversions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversions.filter((c) => {
      if (conversionFilter === 'GENERIC' && c.ingredientId) return false;
      if (conversionFilter === 'INGREDIENT' && !c.ingredientId) return false;
      if (!q) return true;
      return (
        c.fromUnit?.toLowerCase().includes(q) ||
        c.toUnit?.toLowerCase().includes(q) ||
        c.ingredientName?.toLowerCase().includes(q)
      );
    });
  }, [conversions, search, conversionFilter]);

  // ── KPI Counts ───────────────────────────────────────────
  const kpiData = useMemo(() => ({
    totalAisles: aisles.length,
    totalTags: tags.length,
    genericConversions: conversions.filter((c) => !c.ingredientId).length,
    ingredientConversions: conversions.filter((c) => !!c.ingredientId).length,
  }), [aisles, tags, conversions]);

  // ── Open Add / Edit Modal ────────────────────────────────
  const handleOpenAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({ name: '', fromUnit: '', toUnit: '', multiplier: '', scope: 'GENERIC', ingredientId: '' });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'aisle' || type === 'tag') {
      setFormData({ name: item.name || '', fromUnit: '', toUnit: '', multiplier: '', scope: 'GENERIC', ingredientId: '' });
    } else if (type === 'conversion') {
      setFormData({
        name: '',
        fromUnit: item.fromUnit || '',
        toUnit: item.toUnit || '',
        multiplier: item.multiplier !== undefined ? String(item.multiplier) : '',
        scope: item.ingredientId ? 'INGREDIENT' : 'GENERIC',
        ingredientId: item.ingredientId ? String(item.ingredientId) : '',
      });
    }
    setIsAddEditOpen(true);
  };

  // ── Submit Form ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalType === 'aisle') {
        const trimmed = formData.name.trim();
        if (!trimmed) { toast.warning('Tên quầy hàng không được để trống'); setSubmitting(false); return; }
        if (editingItem) {
          const res = await adminService.updateAisle(editingItem.id, trimmed);
          toast.success('Cập nhật quầy hàng thành công!');
          setAisles((prev) => prev.map((a) => (a.id === editingItem.id ? res.data : a)));
        } else {
          const res = await adminService.createAisle(trimmed);
          toast.success('Thêm quầy hàng mới thành công!');
          setAisles((prev) => [...prev, res.data]);
        }
      } else if (modalType === 'tag') {
        const trimmed = formData.name.trim();
        if (!trimmed) { toast.warning('Tên tag không được để trống'); setSubmitting(false); return; }
        if (editingItem) {
          const res = await adminService.updateTag(editingItem.id, trimmed);
          toast.success('Cập nhật thẻ thành công!');
          setTags((prev) => prev.map((t) => (t.id === editingItem.id ? res.data : t)));
        } else {
          const res = await adminService.createTag(trimmed);
          toast.success('Thêm thẻ công thức thành công!');
          setTags((prev) => [...prev, res.data]);
        }
      } else if (modalType === 'conversion') {
        const fromUnit = formData.fromUnit.trim();
        const toUnit = formData.toUnit.trim();
        const multiplier = parseFloat(formData.multiplier);
        if (!fromUnit || !toUnit) { toast.warning('Đơn vị gốc và đích không được để trống'); setSubmitting(false); return; }
        if (isNaN(multiplier) || multiplier <= 0) { toast.warning('Hệ số nhân phải là số lớn hơn 0'); setSubmitting(false); return; }
        const payload = {
          fromUnit, toUnit, multiplier,
          ingredientId: formData.scope === 'INGREDIENT' && formData.ingredientId ? Number(formData.ingredientId) : null,
        };
        if (editingItem) {
          const res = await adminService.updateUnitConversion(editingItem.id, payload);
          toast.success('Cập nhật quy đổi đơn vị thành công!');
          setConversions((prev) => prev.map((c) => (c.id === editingItem.id ? res.data : c)));
        } else {
          const res = await adminService.createUnitConversion(payload);
          toast.success('Thêm quy đổi đơn vị thành công!');
          setConversions((prev) => [...prev, res.data]);
        }
      }
      setIsAddEditOpen(false);
    } catch (err) {
      console.error('Lỗi khi lưu dữ liệu:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleOpenDelete = (type, item) => setDeleteModal({ isOpen: true, type, item });

  const handleConfirmDelete = async () => {
    const { type, item } = deleteModal;
    if (!item) return;
    setSubmitting(true);
    try {
      if (type === 'aisle') {
        await adminService.deleteAisle(item.id);
        toast.success(`Đã xóa quầy hàng "${item.name}"`);
        setAisles((prev) => prev.filter((a) => a.id !== item.id));
      } else if (type === 'tag') {
        await adminService.deleteTag(item.id);
        toast.success(`Đã xóa thẻ "${item.name}"`);
        setTags((prev) => prev.filter((t) => t.id !== item.id));
      } else if (type === 'conversion') {
        await adminService.deleteUnitConversion(item.id);
        toast.success(`Đã xóa quy đổi 1 ${item.fromUnit} = ${item.multiplier} ${item.toUnit}`);
        setConversions((prev) => prev.filter((c) => c.id !== item.id));
      }
      setDeleteModal({ isOpen: false, type: null, item: null });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể xóa do dữ liệu đang được sử dụng.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────
  const getAddLabel = () => {
    if (activeTab === 'aisles') return 'Thêm quầy hàng';
    if (activeTab === 'tags') return 'Thêm thẻ mới';
    return 'Thêm quy đổi';
  };

  const handleTabSwitch = (tab) => { setActiveTab(tab); setSearch(''); };

  return (
    <div className={s.page}>
      {/* ── Header ── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <span className={s.titleBadge}><Database size={13} /> Master Data</span>
            <h1 className={s.title}>Dữ Liệu Nền Tảng</h1>
          </div>
          <p className={s.subtitle}>
            Quản lý chuẩn hóa quầy hàng nguyên liệu, thẻ phân loại công thức và hệ thống quy đổi đơn vị đo lường.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}><Layers size={20} /></div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Quầy hàng</div>
            <div className={s.kpiValue}>{loading ? '—' : kpiData.totalAisles}</div>
            <div className={s.kpiSub}>Ngành hàng nguyên liệu</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}><Tag size={20} /></div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Thẻ công thức</div>
            <div className={s.kpiValue}>{loading ? '—' : kpiData.totalTags}</div>
            <div className={s.kpiSub}>Nhãn phân loại món ăn</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}><Scale size={20} /></div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Quy đổi chung</div>
            <div className={s.kpiValue}>{loading ? '—' : kpiData.genericConversions}</div>
            <div className={s.kpiSub}>Áp dụng toàn hệ thống</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}><Boxes size={20} /></div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Theo nguyên liệu</div>
            <div className={s.kpiValue}>{loading ? '—' : kpiData.ingredientConversions}</div>
            <div className={s.kpiSub}>Tùy biến riêng từng loại</div>
          </div>
        </div>
      </div>

      {/* ── Hàng 1: Tab Navigation (trải đều 3 cột) ── */}
      <div className={s.tabsBar}>
        <button
          className={`${s.tabBtn} ${activeTab === 'aisles' ? s.activeTab : ''}`}
          onClick={() => handleTabSwitch('aisles')}
        >
          <Layers size={16} />
          Quầy hàng nguyên liệu
          <span className={s.tabCount}>{aisles.length}</span>
        </button>
        <button
          className={`${s.tabBtn} ${activeTab === 'tags' ? s.activeTab : ''}`}
          onClick={() => handleTabSwitch('tags')}
        >
          <Tag size={16} />
          Thẻ công thức
          <span className={s.tabCount}>{tags.length}</span>
        </button>
        <button
          className={`${s.tabBtn} ${activeTab === 'conversions' ? s.activeTab : ''}`}
          onClick={() => handleTabSwitch('conversions')}
        >
          <Scale size={16} />
          Quy đổi đơn vị
          <span className={s.tabCount}>{conversions.length}</span>
        </button>
      </div>

      {/* ── Hàng 2: Toolbar (search + filter + add) ── */}
      <div className={s.toolbar}>
        {activeTab === 'conversions' && (
          <div className={s.subFilters}>
            <button className={`${s.subFilterBtn} ${conversionFilter === 'ALL' ? s.subFilterActive : ''}`} onClick={() => setConversionFilter('ALL')}>
              Tất cả
            </button>
            <button className={`${s.subFilterBtn} ${conversionFilter === 'GENERIC' ? s.subFilterActive : ''}`} onClick={() => setConversionFilter('GENERIC')}>
              Chung ({kpiData.genericConversions})
            </button>
            <button className={`${s.subFilterBtn} ${conversionFilter === 'INGREDIENT' ? s.subFilterActive : ''}`} onClick={() => setConversionFilter('INGREDIENT')}>
              Theo NL ({kpiData.ingredientConversions})
            </button>
          </div>
        )}

        <div className={s.searchWrap}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            className={s.searchInput}
            placeholder={
              activeTab === 'aisles' ? 'Tìm kiếm theo tên quầy hàng nguyên liệu...' :
              activeTab === 'tags' ? 'Tìm kiếm theo tên thẻ phân loại công thức...' :
              'Tìm kiếm theo đơn vị quy đổi (kg, g, muỗng...), tên nguyên liệu áp dụng...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={s.clearBtn} onClick={() => setSearch('')} title="Xóa tìm kiếm">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={s.btnAdd}
          onClick={() => {
            if (activeTab === 'aisles') handleOpenAdd('aisle');
            else if (activeTab === 'tags') handleOpenAdd('tag');
            else handleOpenAdd('conversion');
          }}
        >
          <Plus size={16} />
          {getAddLabel()}
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className={s.tableContainer}>
        {/* TAB 1: AISLES */}
        {activeTab === 'aisles' && (
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tên Quầy Hàng / Ngành Hàng</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3}><div className={s.stateBox}><div>Đang tải dữ liệu...</div></div></td></tr>
              ) : filteredAisles.length === 0 ? (
                <tr><td colSpan={3}>
                  <div className={s.stateBox}>
                    <Layers size={36} className={s.stateIcon} />
                    <p className={s.stateTitle}>Không có quầy hàng nào</p>
                    <p className={s.stateSub}>{search ? 'Không tìm thấy kết quả phù hợp.' : 'Bắt đầu bằng cách thêm quầy hàng đầu tiên.'}</p>
                  </div>
                </td></tr>
              ) : filteredAisles.map((aisle) => (
                <tr key={aisle.id}>
                  <td className={s.idCell}>#{aisle.id}</td>
                  <td><span className={s.nameText}>{aisle.name}</span></td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={`${s.btnAction} ${s.edit}`} title="Chỉnh sửa" onClick={() => handleOpenEdit('aisle', aisle)}><Pencil size={15} /></button>
                      <button className={`${s.btnAction} ${s.delete}`} title="Xóa" onClick={() => handleOpenDelete('aisle', aisle)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 2: TAGS */}
        {activeTab === 'tags' && (
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '300px' }}>Thẻ Phân Loại</th>
                <th>Ngày Tạo</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}><div className={s.stateBox}><div>Đang tải dữ liệu...</div></div></td></tr>
              ) : filteredTags.length === 0 ? (
                <tr><td colSpan={4}>
                  <div className={s.stateBox}>
                    <Tag size={36} className={s.stateIcon} />
                    <p className={s.stateTitle}>Không có thẻ nào</p>
                    <p className={s.stateSub}>{search ? 'Không tìm thấy kết quả phù hợp.' : 'Thêm thẻ phân loại để gắn nhãn công thức.'}</p>
                  </div>
                </td></tr>
              ) : filteredTags.map((tag) => (
                <tr key={tag.id}>
                  <td className={s.idCell}>#{tag.id}</td>
                  <td>
                    <span className={s.tagBadge}><Tag size={12} />{tag.name}</span>
                  </td>
                  <td className={s.dateText}>{formatDate(tag.createdAt)}</td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={`${s.btnAction} ${s.edit}`} title="Chỉnh sửa" onClick={() => handleOpenEdit('tag', tag)}><Pencil size={15} /></button>
                      <button className={`${s.btnAction} ${s.delete}`} title="Xóa" onClick={() => handleOpenDelete('tag', tag)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 3: UNIT CONVERSIONS */}
        {activeTab === 'conversions' && (
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th style={{ width: '240px' }}>Công thức</th>
                <th style={{ width: '120px' }}>Từ</th>
                <th style={{ width: '120px' }}>Sang</th>
                <th style={{ width: '100px' }}>Hệ số</th>
                <th>Phạm vi</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className={s.stateBox}><div>Đang tải dữ liệu...</div></div></td></tr>
              ) : filteredConversions.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className={s.stateBox}>
                    <Scale size={36} className={s.stateIcon} />
                    <p className={s.stateTitle}>Không có quy đổi nào</p>
                    <p className={s.stateSub}>{search ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có quy đổi đơn vị nào trong hệ thống.'}</p>
                  </div>
                </td></tr>
              ) : filteredConversions.map((conv) => (
                <tr key={conv.id}>
                  <td className={s.idCell}>#{conv.id}</td>
                  <td>
                    <div className={s.formulaBox}>
                      <span className={s.formulaFrom}>1 {conv.fromUnit}</span>
                      <span className={s.formulaEq}>=</span>
                      <span className={s.formulaValue}>{conv.multiplier}</span>
                      <span className={s.formulaTo}>{conv.toUnit}</span>
                    </div>
                  </td>
                  <td><span className={s.nameText}>{conv.fromUnit}</span></td>
                  <td><span className={s.nameText}>{conv.toUnit}</span></td>
                  <td style={{ fontWeight: 700, color: '#292524' }}>{conv.multiplier}</td>
                  <td>
                    {conv.ingredientId ? (
                      <span className={s.scopeBadgeIng} title={conv.ingredientName}>
                        <Boxes size={12} />
                        {conv.ingredientName || `NL #${conv.ingredientId}`}
                      </span>
                    ) : (
                      <span className={s.scopeBadgeGeneric}>
                        <Scale size={12} />
                        Chung
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={`${s.btnAction} ${s.edit}`} title="Chỉnh sửa" onClick={() => handleOpenEdit('conversion', conv)}><Pencil size={15} /></button>
                      <button className={`${s.btnAction} ${s.delete}`} title="Xóa" onClick={() => handleOpenDelete('conversion', conv)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isAddEditOpen && (
        <div className={s.modalOverlay} onClick={() => setIsAddEditOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                {editingItem ? 'Chỉnh Sửa' : 'Thêm Mới'}&nbsp;
                {modalType === 'aisle' && 'Quầy Hàng'}
                {modalType === 'tag' && 'Thẻ Công Thức'}
                {modalType === 'conversion' && 'Quy Đổi Đơn Vị'}
              </h3>
              <button className={s.modalCloseBtn} onClick={() => setIsAddEditOpen(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={s.modalBody}>
                {/* AISLE & TAG */}
                {(modalType === 'aisle' || modalType === 'tag') && (
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>
                      {modalType === 'aisle' ? 'Tên quầy hàng' : 'Tên thẻ công thức'}
                      <span className={s.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={s.formInput}
                      placeholder={modalType === 'aisle' ? 'Ví dụ: Rau củ tươi, Gia vị, Thịt cá...' : 'Ví dụ: Món chay, Ăn sáng, Healthy...'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      autoFocus
                    />
                    <span className={s.formHint}>
                      {modalType === 'aisle' ? 'Dùng để phân loại nhóm nguyên liệu và gợi ý khi đi chợ.' : 'Dùng để gắn nhãn và lọc công thức nhanh.'}
                    </span>
                  </div>
                )}

                {/* UNIT CONVERSION */}
                {modalType === 'conversion' && (
                  <>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Phạm vi áp dụng</label>
                      <div className={s.radioGroup}>
                        <label className={s.radioLabel}>
                          <input type="radio" name="scope" value="GENERIC" checked={formData.scope === 'GENERIC'}
                            onChange={() => setFormData({ ...formData, scope: 'GENERIC', ingredientId: '' })} />
                          Chung toàn hệ thống
                        </label>
                        <label className={s.radioLabel}>
                          <input type="radio" name="scope" value="INGREDIENT" checked={formData.scope === 'INGREDIENT'}
                            onChange={() => setFormData({ ...formData, scope: 'INGREDIENT' })} />
                          Theo nguyên liệu riêng
                        </label>
                      </div>
                    </div>

                    {formData.scope === 'INGREDIENT' && (
                      <div className={s.formGroup}>
                        <label className={s.formLabel}>Nguyên liệu áp dụng<span className={s.required}>*</span></label>
                        <select className={s.formSelect} value={formData.ingredientId}
                          onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })} required>
                          <option value="">-- Chọn nguyên liệu --</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.baseUnit || 'g'})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={s.formRow}>
                      <div className={s.formGroup}>
                        <label className={s.formLabel}>Đơn vị gốc (From)<span className={s.required}>*</span></label>
                        <input type="text" className={s.formInput} placeholder="Ví dụ: kg, cup, muỗng..."
                          value={formData.fromUnit} onChange={(e) => setFormData({ ...formData, fromUnit: e.target.value })} required />
                      </div>
                      <div className={s.formGroup}>
                        <label className={s.formLabel}>Đơn vị đích (To)<span className={s.required}>*</span></label>
                        <input type="text" className={s.formInput} placeholder="Ví dụ: g, ml..."
                          value={formData.toUnit} onChange={(e) => setFormData({ ...formData, toUnit: e.target.value })} required />
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Hệ số nhân (Multiplier)<span className={s.required}>*</span></label>
                      <input type="number" step="any" className={s.formInput} placeholder="Ví dụ: 1000, 15, 240..."
                        value={formData.multiplier} onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })} required />
                    </div>

                    {formData.fromUnit && formData.toUnit && formData.multiplier && (
                      <div className={s.formulaPreview}>
                        <span className={s.formulaFrom}>1 {formData.fromUnit}</span>
                        <span className={s.formulaEq}>=</span>
                        <span className={s.formulaValue}>{formData.multiplier}</span>
                        <span className={s.formulaFrom}>{formData.toUnit}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={s.modalFooter}>
                <button type="button" className={s.btnSecondary} onClick={() => setIsAddEditOpen(false)} disabled={submitting}>Hủy bỏ</button>
                <button type="submit" className={s.btnPrimary} disabled={submitting}>
                  <Check size={15} />
                  {submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className={s.modalOverlay} onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })}>
          <div className={`${s.modal} ${s.deleteModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>Xác Nhận Xóa</h3>
              <button className={s.modalCloseBtn} onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })}><X size={16} /></button>
            </div>
            <div className={s.deleteModalBody}>
              <div className={s.deleteIconWrap}><AlertTriangle size={26} /></div>
              <p className={s.deleteModalTitle}>
                Xóa&nbsp;
                {deleteModal.type === 'aisle' && 'quầy hàng'}
                {deleteModal.type === 'tag' && 'thẻ công thức'}
                {deleteModal.type === 'conversion' && 'quy đổi đơn vị'}
                ?
              </p>
              <p className={s.deleteWarning}>
                Bạn có chắc chắn muốn xóa&nbsp;
                <span className={s.deleteHighlight}>
                  {deleteModal.type === 'conversion'
                    ? `1 ${deleteModal.item.fromUnit} = ${deleteModal.item.multiplier} ${deleteModal.item.toUnit}`
                    : `"${deleteModal.item.name}"`}
                </span>
                ? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className={s.modalFooter}>
              <button type="button" className={s.btnSecondary}
                onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })} disabled={submitting}>
                Hủy bỏ
              </button>
              <button type="button" className={s.btnDanger} onClick={handleConfirmDelete} disabled={submitting}>
                <Trash2 size={15} />
                {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
