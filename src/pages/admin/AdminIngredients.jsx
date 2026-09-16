import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { aisleService } from '../../services/ingredientService';
import s from '../../styles/pages/admin/AdminIngredients.module.css';

const QUICK_PRESETS = [
  { label: 'Gia vị', calo: 15, pro: 0.5, fat: 0.1, carb: 3.0 },
  { label: 'Rau củ', calo: 35, pro: 2.0, fat: 0.2, carb: 7.0 },
  { label: 'Thịt nạc', calo: 140, pro: 22.0, fat: 5.0, carb: 0.0 },
  { label: 'Hải sản', calo: 85, pro: 18.0, fat: 1.0, carb: 0.0 },
  { label: 'Trái cây', calo: 55, pro: 0.8, fat: 0.2, carb: 13.0 },
  { label: 'Tinh bột', calo: 350, pro: 8.0, fat: 1.5, carb: 75.0 },
  { label: 'Dầu mỡ', calo: 880, pro: 0.0, fat: 100.0, carb: 0.0 },
];

const BASE_UNITS = ['g', 'ml', 'quả', 'củ', 'thìa', 'chén', 'lát'];

export default function AdminIngredients() {
  const queryClient = useQueryClient();

  // Navigation tabs: 'pending' (Chờ duyệt) | 'all' (Kho nguyên liệu)
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPage, setPendingPage] = useState(0);
  const [allPage, setAllPage] = useState(0);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterAisle, setFilterAisle] = useState('');

  // Right Studio Panel state
  const [mode, setMode] = useState('EDIT'); // 'EDIT' | 'CREATE'
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    aisleId: '',
    baseUnit: 'g',
    caloriesPer100g: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  // 1. Fetch Aisles
  const { data: aislesData } = useQuery({
    queryKey: ['admin-aisles'],
    queryFn: () => aisleService.getAll(),
  });
  const aisles = useMemo(() => {
    return aislesData?.data || aislesData || [];
  }, [aislesData]);

  // 2. Fetch Pending Review Ingredients
  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['admin-pending-ingredients', pendingPage],
    queryFn: () => adminService.getPendingIngredients(pendingPage, 20),
  });

  // 3. Fetch All Ingredients
  const {
    data: allData,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['admin-all-ingredients', allPage, searchKeyword, filterAisle],
    queryFn: () => adminService.getAllIngredients(allPage, 20, searchKeyword, filterAisle),
  });

  const pendingItems = pendingData?.data?.content ?? [];
  const pendingTotal = pendingData?.data?.totalElements ?? 0;
  const pendingPages = pendingData?.data?.totalPages ?? 0;

  const allItems = allData?.data?.content ?? [];
  const allTotal = allData?.data?.totalElements ?? 0;
  const allPages = allData?.data?.totalPages ?? 0;

  // KPI Metrics
  const totalIngredientsCount = allData?.data?.totalIngredients ?? pendingData?.data?.totalIngredients ?? (allTotal || 297);
  const pendingReviewCount = pendingData?.data?.pendingCount ?? pendingTotal;
  const verifiedCount = Math.max(0, totalIngredientsCount - pendingReviewCount);
  const totalAislesCount = aisles.length || (pendingData?.data?.totalAisles ?? 12);

  // Automatically select the first item on initial load or tab switch
  useEffect(() => {
    if (mode === 'EDIT') {
      if (activeTab === 'pending' && pendingItems.length > 0 && (!selectedIngredient || !pendingItems.some(i => i.id === selectedIngredient.id))) {
        loadIngredientIntoStudio(pendingItems[0]);
      } else if (activeTab === 'all' && allItems.length > 0 && !selectedIngredient) {
        loadIngredientIntoStudio(allItems[0]);
      }
    }
  }, [pendingItems, allItems, selectedIngredient, mode, activeTab]);

  // Load an ingredient into the Studio panel
  const loadIngredientIntoStudio = (ing) => {
    setMode('EDIT');
    setSelectedIngredient(ing);
    setForm({
      name: ing.name || '',
      aisleId: ing.aisleId || '',
      baseUnit: ing.baseUnit || 'g',
      caloriesPer100g: ing.caloriesPer100g ?? 0,
      protein: ing.protein ?? 0,
      fat: ing.fat ?? 0,
      carbs: ing.carbs ?? 0,
    });
  };

  // Switch Studio to "Create New" mode
  const handleStartCreate = () => {
    setMode('CREATE');
    setSelectedIngredient(null);
    setForm({
      name: '',
      aisleId: aisles.length > 0 ? aisles[0].id : '',
      baseUnit: 'g',
      caloriesPer100g: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Quick Preset click handler
  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      caloriesPer100g: preset.calo,
      protein: preset.pro,
      fat: preset.fat,
      carbs: preset.carb,
    }));
    toast.info(`Đã áp dụng định mức dinh dưỡng mẫu: ${preset.label}`);
  };

  // Macro calculations for SVG Donut
  const macroStats = useMemo(() => {
    const p = parseFloat(form.protein) || 0;
    const f = parseFloat(form.fat) || 0;
    const c = parseFloat(form.carbs) || 0;

    const pKcal = p * 4;
    const fKcal = f * 9;
    const cKcal = c * 4;
    const totalMacroKcal = pKcal + fKcal + cKcal;

    if (totalMacroKcal <= 0) {
      return { pPct: 0, fPct: 0, cPct: 0, totalMacroKcal: 0 };
    }

    const pPct = Math.round((pKcal / totalMacroKcal) * 100);
    const fPct = Math.round((fKcal / totalMacroKcal) * 100);
    const cPct = Math.max(0, 100 - pPct - fPct);

    return { pPct, fPct, cPct, totalMacroKcal };
  }, [form.protein, form.fat, form.carbs]);

  // Donut geometry (R = 40, C = 251.33)
  const CIRCUMFERENCE = 251.33;
  const pOffset = 0;
  const pDash = (macroStats.pPct / 100) * CIRCUMFERENCE;
  const fOffset = -pDash;
  const fDash = (macroStats.fPct / 100) * CIRCUMFERENCE;
  const cOffset = -(pDash + fDash);
  const cDash = (macroStats.cPct / 100) * CIRCUMFERENCE;

  // Save / Approve ingredient
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        baseUnit: form.baseUnit || 'g',
        caloriesPer100g: parseFloat(form.caloriesPer100g) || 0,
        protein: parseFloat(form.protein) || 0,
        fat: parseFloat(form.fat) || 0,
        carbs: parseFloat(form.carbs) || 0,
        aisleId: form.aisleId ? Number(form.aisleId) : null,
      };

      if (mode === 'CREATE') {
        const res = await adminService.createIngredient(payload);
        toast.success(`Đã thêm nguyên liệu "${payload.name}" vào hệ thống!`);
        queryClient.invalidateQueries({ queryKey: ['admin-pending-ingredients'] });
        queryClient.invalidateQueries({ queryKey: ['admin-all-ingredients'] });

        if (res?.data?.id) {
          loadIngredientIntoStudio({ ...payload, id: res.data.id });
        } else {
          handleStartCreate();
        }
      } else {
        await adminService.updateIngredient(selectedIngredient.id, payload);
        toast.success(`Đã chuẩn hóa & lưu "${payload.name}" thành công!`);
        queryClient.invalidateQueries({ queryKey: ['admin-pending-ingredients'] });
        queryClient.invalidateQueries({ queryKey: ['admin-all-ingredients'] });

        // Update active selection
        setSelectedIngredient((prev) => ({ ...prev, ...payload }));
      }
    } catch {
      toast.error('Thao tác thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  // Delete ingredient
  const handleDelete = async (ing) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${ing.name}" (#${ing.id}) khỏi hệ thống?`)) {
      return;
    }

    try {
      await adminService.deleteIngredient(ing.id);
      toast.success(`Đã xóa nguyên liệu "${ing.name}"`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-ingredients'] });

      if (selectedIngredient?.id === ing.id) {
        setSelectedIngredient(null);
        handleStartCreate();
      }
    } catch {
      toast.error('Xóa nguyên liệu thất bại.');
    }
  };

  const currentList = activeTab === 'pending' ? pendingItems : allItems;
  const currentTotal = activeTab === 'pending' ? pendingTotal : allTotal;
  const currentPage = activeTab === 'pending' ? pendingPage : allPage;
  const currentTotalPages = activeTab === 'pending' ? pendingPages : allPages;
  const setCurrentPage = activeTab === 'pending' ? setPendingPage : setAllPage;
  const isLoading = activeTab === 'pending' ? pendingLoading : allLoading;

  return (
    <div className={s.page}>
      {/* ─── Header ────────────────────────────────── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.titleRow}>
            <h1 className={s.title}>Quản lý Nguyên liệu</h1>
            <span className={s.titleBadge}>
              <Sparkles size={13} /> Nutrition Studio
            </span>
          </div>
          <p className={s.subtitle}>
            Kiểm duyệt, bổ sung dinh dưỡng chuẩn hóa và quản lý toàn bộ kho thực phẩm
          </p>
        </div>

        <button className={s.btnCreateNew} onClick={handleStartCreate}>
          <Plus size={18} /> Thêm nguyên liệu mới
        </button>
      </div>

      {/* ─── KPI Cards Row ─────────────────────────── */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.terracotta}`}>
            <Package size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Tổng nguyên liệu</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{totalIngredientsCount}</span>
            </div>
            <div className={s.kpiSub}>Kho nguyên liệu hệ thống</div>
          </div>
        </div>

        <div className={`${s.kpiCard} ${pendingReviewCount > 0 ? s.kpiCardAlert : ''}`}>
          <div className={`${s.kpiIconWrap} ${s.amber}`}>
            <Clock size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Chờ duyệt dinh dưỡng</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{pendingReviewCount}</span>
              {pendingReviewCount > 0 && <span className={`${s.kpiBadge} ${s.alert}`}>Cần duyệt</span>}
            </div>
            <div className={s.kpiSub}>Calo = 0 • Cần chuẩn hóa</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.emerald}`}>
            <CheckCircle size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Đã chuẩn hóa</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{verifiedCount}</span>
              <span className={s.kpiBadge} style={{ background: '#ecfdf5', color: '#059669' }}>100% Sẵn sàng</span>
            </div>
            <div className={s.kpiSub}>100% Calo & Macro hoàn chỉnh</div>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={`${s.kpiIconWrap} ${s.blue}`}>
            <Layers size={20} />
          </div>
          <div className={s.kpiBody}>
            <div className={s.kpiLabel}>Kệ hàng siêu thị</div>
            <div className={s.kpiValueRow}>
              <span className={s.kpiValue}>{totalAislesCount}</span>
              <span className={s.kpiBadge} style={{ background: '#eff6ff', color: '#2563eb' }}>Phân loại</span>
            </div>
            <div className={s.kpiSub}>Danh mục Aisle lưu trữ</div>
          </div>
        </div>
      </div>

      {/* ─── Studio Grid (Split-Panel: 60% Left, 40% Right) ─── */}
      <div className={s.studioGrid}>
        {/* ─── Cột Trái: Danh sách & Bộ lọc ──────────── */}
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
                  setAllPage(0);
                }}
                placeholder="Tìm tên nguyên liệu..."
                className={s.searchInput}
              />
            </div>

            <select
              value={filterAisle}
              onChange={(e) => {
                setFilterAisle(e.target.value);
                setAllPage(0);
              }}
              className={s.aisleSelect}
            >
              <option value="">Tất cả kệ hàng</option>
              {aisles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className={s.tabsRow}>
            <button
              className={`${s.tabBtn} ${activeTab === 'pending' ? s.active : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={15} />
              <span>Chờ duyệt</span>
              <span className={`${s.tabBadge} ${pendingTotal > 0 ? s.alert : ''}`}>{pendingTotal}</span>
            </button>
            <button
              className={`${s.tabBtn} ${activeTab === 'all' ? s.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Package size={15} />
              <span>Kho nguyên liệu</span>
              <span className={s.tabBadge}>{allTotal}</span>
            </button>
          </div>

          {/* Card List */}
          <div className={s.cardList}>
            {isLoading ? (
              <div className={s.stateBox}>
                <RefreshCw size={24} className={s.spin} />
                <span>Đang tải danh sách nguyên liệu...</span>
              </div>
            ) : currentList.length === 0 ? (
              <div className={s.stateBox}>
                {activeTab === 'pending' ? (
                  <>
                    <CheckCircle size={36} style={{ color: '#10b981' }} />
                    <p style={{ margin: 0, fontWeight: 700, color: '#2b130c' }}>
                      Tuyệt vời! Không có nguyên liệu nào chờ duyệt
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#a8a29e' }}>
                      Toàn bộ nguyên liệu trong kho đã được chuẩn hóa dinh dưỡng.
                    </span>
                  </>
                ) : (
                  <>
                    <Search size={32} style={{ color: '#a8a29e' }} />
                    <p style={{ margin: 0, fontWeight: 700, color: '#2b130c' }}>
                      Không tìm thấy nguyên liệu phù hợp
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#a8a29e' }}>
                      Hãy thử từ khóa tìm kiếm hoặc chọn kệ hàng khác.
                    </span>
                  </>
                )}
              </div>
            ) : (
              currentList.map((ing) => {
                const isSelected = selectedIngredient?.id === ing.id && mode === 'EDIT';
                const isPending = parseFloat(ing.caloriesPer100g) === 0;

                return (
                  <div
                    key={ing.id}
                    className={`${s.ingCard} ${isPending ? s.pending : ''} ${isSelected ? s.active : ''}`}
                    onClick={() => loadIngredientIntoStudio(ing)}
                  >
                    <div className={s.ingLeft}>
                      <div className={s.ingIconBox}>
                        <Package size={18} />
                      </div>
                      <div className={s.ingInfo}>
                        <div className={s.ingNameRow}>
                          <span className={s.ingName}>{ing.name}</span>
                          <span className={s.ingId}>#{ing.id}</span>
                        </div>
                        <div className={s.ingMeta}>
                          <span className={s.aislePill}>{ing.aisleName || 'Chưa phân kệ'}</span>
                          <span>•</span>
                          {isPending ? (
                            <span className={s.nutriAlert}>
                              <AlertTriangle size={12} /> Thiếu Calo & Macro
                            </span>
                          ) : (
                            <span className={s.nutriSummary}>
                              {ing.caloriesPer100g} kcal • P:{ing.protein}g • F:{ing.fat}g • C:{ing.carbs}g
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={s.ingActions} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`${s.btnSelect} ${isSelected ? s.activeBtn : ''}`}
                        onClick={() => loadIngredientIntoStudio(ing)}
                      >
                        <Edit3 size={14} />
                        {isPending ? 'Duyệt & Bổ sung' : 'Hiệu chỉnh'}
                      </button>
                      <button
                        className={s.btnDelete}
                        title="Xóa nguyên liệu"
                        onClick={() => handleDelete(ing)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {currentTotalPages > 1 && (
            <div className={s.pagination}>
              <span className={s.pageInfo}>
                Trang {currentPage + 1} / {currentTotalPages} ({currentTotal} mục)
              </span>
              <div className={s.pageBtnGroup}>
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className={s.pageBtn}
                >
                  ← Trước
                </button>
                <button
                  disabled={currentPage >= currentTotalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={s.pageBtn}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Cột Phải: Trạm chuẩn hóa Dinh dưỡng ──── */}
        <div className={s.studioPanel}>
          <div className={s.studioHeader}>
            <div className={s.studioTitleWrap}>
              <h2 className={s.studioTitle}>
                <Sliders size={18} style={{ color: '#a13923' }} />
                {mode === 'CREATE' ? 'Thêm Nguyên liệu mới' : 'Trạm Chuẩn hóa Dinh dưỡng'}
              </h2>
              <span className={`${s.studioModeBadge} ${mode === 'CREATE' ? s.create : s.edit}`}>
                {mode === 'CREATE'
                  ? 'Chế độ: Thêm mới vào kho'
                  : `Đang hiệu chỉnh: ${selectedIngredient ? `#${selectedIngredient.id} - ${selectedIngredient.name}` : 'Chưa chọn'}`}
              </span>
            </div>

            {mode === 'CREATE' && selectedIngredient && (
              <button
                className={s.btnReset}
                style={{ height: '30px', fontSize: '0.74rem', padding: '0 0.6rem' }}
                onClick={() => loadIngredientIntoStudio(selectedIngredient)}
              >
                <RotateCcw size={13} /> Quay lại mục đang chọn
              </button>
            )}
          </div>

          {/* Macro Donut Gauge */}
          <div className={s.donutSection}>
            <div className={s.donutSvgWrap}>
              <svg className={s.donutSvg} viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f5ede8"
                  strokeWidth="11"
                />

                {macroStats.totalMacroKcal > 0 ? (
                  <>
                    {/* Protein Arc (Emerald) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="11"
                      strokeDasharray={`${pDash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={pOffset}
                      strokeLinecap="round"
                    />
                    {/* Fat Arc (Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray={`${fDash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={fOffset}
                      strokeLinecap="round"
                    />
                    {/* Carbs Arc (Blue) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="11"
                      strokeDasharray={`${cDash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={cOffset}
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e7e5e4"
                    strokeWidth="11"
                    strokeDasharray="6 6"
                  />
                )}
              </svg>

              <div className={s.donutCenter}>
                <span className={s.donutKcal}>{form.caloriesPer100g || 0}</span>
                <span className={s.donutUnit}>kcal / 100{form.baseUnit || 'g'}</span>
              </div>
            </div>

            <div className={s.donutLegend}>
              <div className={s.legendItem}>
                <span className={s.legendLabel}>
                  <span className={`${s.legendDot} ${s.protein}`}></span> Đạm (Protein)
                </span>
                <span className={s.legendPercent}>{macroStats.pPct}%</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendLabel}>
                  <span className={`${s.legendDot} ${s.fat}`}></span> Chất béo (Fat)
                </span>
                <span className={s.legendPercent}>{macroStats.fPct}%</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendLabel}>
                  <span className={`${s.legendDot} ${s.carbs}`}></span> Tinh bột (Carbs)
                </span>
                <span className={s.legendPercent}>{macroStats.cPct}%</span>
              </div>
            </div>
          </div>

          {/* Studio Form */}
          <form className={s.studioForm} onSubmit={handleSave}>
            <div className={s.fieldRow}>
              <label className={s.fieldLabel}>Tên nguyên liệu *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Bột ngọt, Ức gà, Cà rốt..."
                required
                className={s.textInput}
              />
            </div>

            <div className={s.twoCols}>
              <div className={s.fieldRow}>
                <label className={s.fieldLabel}>
                  <Layers size={14} /> Kệ hàng (Aisle)
                </label>
                <select
                  name="aisleId"
                  value={form.aisleId}
                  onChange={handleInputChange}
                  className={s.selectInput}
                >
                  <option value="">-- Chưa gắn kệ --</option>
                  {aisles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={s.fieldRow}>
                <label className={s.fieldLabel}>Đơn vị cơ bản</label>
                <select
                  name="baseUnit"
                  value={form.baseUnit}
                  onChange={handleInputChange}
                  className={s.selectInput}
                >
                  {BASE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 Nutrition Inputs (per 100g / 100ml) */}
            <div className={s.fieldRow}>
              <label className={s.fieldLabel}>
                <Sparkles size={14} style={{ color: '#a13923' }} /> Định mức dinh dưỡng (trên 100{form.baseUnit || 'g'})
              </label>
              <div className={s.nutriGrid}>
                <div className={s.nutriBox}>
                  <span className={s.nutriLabel}>Calories (kcal)</span>
                  <input
                    type="number"
                    name="caloriesPer100g"
                    value={form.caloriesPer100g}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={s.nutriInput}
                  />
                </div>
                <div className={s.nutriBox}>
                  <span className={s.nutriLabel} style={{ color: '#059669' }}>
                    Protein (g)
                  </span>
                  <input
                    type="number"
                    name="protein"
                    value={form.protein}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={s.nutriInput}
                  />
                </div>
                <div className={s.nutriBox}>
                  <span className={s.nutriLabel} style={{ color: '#d97706' }}>
                    Chất béo / Fat (g)
                  </span>
                  <input
                    type="number"
                    name="fat"
                    value={form.fat}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={s.nutriInput}
                  />
                </div>
                <div className={s.nutriBox}>
                  <span className={s.nutriLabel} style={{ color: '#2563eb' }}>
                    Tinh bột / Carbs (g)
                  </span>
                  <input
                    type="number"
                    name="carbs"
                    value={form.carbs}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={s.nutriInput}
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className={s.presetSection}>
              <span className={s.presetTitle}>
                <Sparkles size={13} /> Áp dụng định mức mẫu nhanh:
              </span>
              <div className={s.presetList}>
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={s.presetBtn}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={s.studioActions}>
              <button
                type="button"
                className={s.btnReset}
                onClick={() => {
                  if (mode === 'CREATE') {
                    handleStartCreate();
                  } else if (selectedIngredient) {
                    loadIngredientIntoStudio(selectedIngredient);
                  }
                }}
              >
                Đặt lại
              </button>
              <button type="submit" className={s.btnSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw size={16} className={s.spin} />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>
                      {mode === 'CREATE'
                        ? 'Thêm vào kho nguyên liệu'
                        : selectedIngredient && parseFloat(selectedIngredient.caloriesPer100g) === 0
                        ? 'Lưu & Phê duyệt'
                        : 'Cập nhật dinh dưỡng'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
