import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Edit2, Save, Share2, ShoppingCart, Plus, Trash2, CheckCircle2, ChevronRight, Wand2, ArrowUpDown, Filter, Clock, Calendar, Package } from 'lucide-react';
import { groceryService } from '../services/groceryService';
import ConfirmModal from '../components/ui/ConfirmModal';
import AisleGroupHeader from '../components/grocery/AisleGroupHeader';
import GroceryItemRow from '../components/grocery/GroceryItemRow';
import AddGroceryItemModal from '../components/grocery/AddGroceryItemModal';
import GenerateListModal from '../components/grocery/GenerateListModal';
import HistoryDetailModal from '../components/grocery/HistoryDetailModal';
import CompleteConfetti from '../components/grocery/CompleteConfetti';
import ShoppingModeView from '../components/grocery/ShoppingModeView';
import styles from '../styles/pages/GroceryPage.module.css';

const GroceryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [groceryList, setGroceryList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listName, setListName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedLists, setCompletedLists] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchGroceryList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groceryService.getActiveList();
      setGroceryList(data);
      setListName(data.name || 'Danh sách mua sắm');
      setItems(data.items || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          // Auto-increment title: find highest existing number
          let allLists = [];
          try { allLists = await groceryService.getAllLists() || []; } catch (_) {}
          const defaultPrefix = 'Danh sách mua sắm';
          let maxNum = 0;
          allLists.forEach(l => {
            if (l.name && l.name.startsWith(defaultPrefix)) {
              const suffix = l.name.replace(defaultPrefix, '').trim();
              const num = parseInt(suffix.replace('#', ''), 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          });
          const newName = `${defaultPrefix} #${maxNum + 1}`;
          const newList = await groceryService.createList({ name: newName });
          setGroceryList(newList);
          setListName(newList.name);
          setItems([]);
          setShoppingMode(false);
        } catch (createErr) {
          setError('Không thể tạo danh sách mua sắm mới');
        }
      } else {
        setError('Không thể tải danh sách mua sắm');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const allLists = await groceryService.getAllLists();
      const completed = (allLists || []).filter(l => l.status === 'COMPLETED');
      // Sort by completedAt descending, take recent 6
      completed.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
      setCompletedLists(completed.slice(0, 6));
    } catch (err) {
      // Silently fail — history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.historyListId) {
      const loadHistory = async (id) => {
        try {
          setLoading(true);
          const data = await groceryService.getList(id);
          setGroceryList(data);
          setListName(data.name || 'Danh sách mua sắm');
          setItems(data.items || []);
          setShoppingMode(false);
        } catch (err) {
          setError('Không thể tải chi tiết lịch sử');
        } finally {
          setLoading(false);
        }
      };
      loadHistory(location.state.historyListId);
      // Xóa state để không bị load lại khi refresh trang
      window.history.replaceState({}, document.title);
    } else {
      fetchGroceryList();
    }
    fetchHistory();
  }, [fetchGroceryList, fetchHistory, location.state]);

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hôm nay, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diffDays === 1) {
      return `Hôm qua, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return `${date.getDate().toString().padStart(2, '0')} Tháng ${date.getMonth() + 1}`;
  };

  const groupedItems = items.reduce((groups, item) => {
    // Map 'Khác' or missing aisle to 'Các nguyên liệu khác'
    const aisle = (item.aisleName && item.aisleName !== 'Khác') ? item.aisleName : 'Các nguyên liệu khác';
    if (!groups[aisle]) groups[aisle] = [];
    groups[aisle].push(item);
    return groups;
  }, {});

  const sortedAisles = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Các nguyên liệu khác') return 1;
    if (b === 'Các nguyên liệu khác') return -1;
    return a.localeCompare(b);
  });

  const progress = items.length > 0
    ? Math.round((items.filter(i => i.isBought).length / items.length) * 100)
    : 0;

  const handleToggleItem = async (item) => {
    try {
      await groceryService.togglePurchased(item.id, groceryList.id);
      setItems(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, isBought: !i.isBought } : i
        )
      );
    } catch (err) {
      setError('Không thể cập nhật trạng thái');
    }
  };

  const handleAddItem = async (data) => {
    await groceryService.addItem(groceryList.id, data);
    await fetchGroceryList();
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleEditSubmit = async (data) => {
    await groceryService.updateItem(editingItem.id, groceryList.id, data);
    setEditingItem(null);
    await fetchGroceryList();
  };

  const handleRemoveItem = async (item) => {
    try {
      await groceryService.removeItem(item.id, groceryList.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError('Không thể xóa nguyên liệu');
    }
  };



  const handleClearAll = async () => {
    try {
      await groceryService.clearItems(groceryList.id);
      setItems([]);
      setShowClearConfirm(false);
    } catch (err) {
      setError('Không thể xóa tất cả');
    }
  };

  const handleComplete = async () => {
    try {
      const updatedList = await groceryService.completeList(groceryList.id);
      setShowConfetti(true);
      setShoppingMode(false);
      // Giữ nguyên list hiện tại làm bản tóm tắt thay vì tải list mới trống
      setGroceryList({ ...groceryList, status: 'COMPLETED', completedAt: new Date().toISOString() });
      if (updatedList && updatedList.items) {
        setItems(updatedList.items);
      }
      setTimeout(() => {
        fetchHistory();
      }, 2500);
    } catch (err) {
      setError('Không thể hoàn tất danh sách');
    }
  };

  const handleViewHistory = (list) => {
    setSelectedHistoryId(list.id);
    setShowHistoryModal(true);
  };

  const handleCreateNewList = () => {
    fetchGroceryList(); // This will auto-create a new active list because the current active one is completed
  };

  const handleCancelList = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelList = async () => {
    try {
      setLoading(true);
      setShowCancelConfirm(false);
      await groceryService.deleteList(groceryList.id);
      setShoppingMode(false);
      await fetchGroceryList();
    } catch (err) {
      setError('Không thể xóa danh sách mua sắm');
      setLoading(false);
    }
  };

  const handleUpdateName = async (newName) => {
    try {
      await groceryService.updateList(groceryList.id, { name: newName });
      setListName(newName);
    } catch (err) {
      setError('Không thể cập nhật tên danh sách');
    }
  };

  const handleShare = () => {
    const text = items.map(i =>
      `${i.isBought ? '✅' : '⬜'} ${i.ingredient?.name || ''} - ${i.finalToBuy || i.totalNeeded} ${i.unit || ''}`
    ).join('\n');
    navigator.clipboard.writeText(text)
      .then(() => alert('Đã sao chép danh sách vào clipboard!'))
      .catch(() => alert('Không thể sao chép'));
  };

  const handleModalSubmit = async (data) => {
    if (editingItem) {
      await handleEditSubmit(data);
    } else {
      await handleAddItem(data);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spin} />
        <p>Đang tải danh sách mua sắm...</p>
      </div>
    );
  }

  /* ── Shopping Mode View ── */
  if (shoppingMode && items.length > 0) {
    return (
      <>
        <CompleteConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <ShoppingModeView
          groceryList={groceryList}
          items={items}
          listName={listName}
          onToggleItem={handleToggleItem}
          onComplete={handleComplete}
          onUpdateName={handleUpdateName}
          onBack={() => setShoppingMode(false)}
          onCancel={handleCancelList}
        />

        <ConfirmModal
          isOpen={showCancelConfirm}
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={confirmCancelList}
          title="Hủy phiên đi chợ?"
          message="Bạn có chắc chắn muốn hủy và xóa TOÀN BỘ danh sách đi chợ hiện tại không? Hành động này không thể hoàn tác."
          confirmText="Hủy danh sách"
          isDestructive={true}
        />
      </>
    );
  }

  return (
    <div className="md:px-12 max-w-[1280px] mx-auto pb-32 pt-8">
      <CompleteConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      {error && (
        <div className={styles.errorBar}>
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Hero Card Section */}
      <section className="mb-10">
        <div className={`relative rounded-[32px] overflow-hidden h-48 md:h-64 ${styles.glassCard} p-8 flex items-end shadow-lg`}>
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-60" 
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop" 
              alt="Grocery Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fff8f4] via-[#fff8f4]/60 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full flex justify-between items-end">
            <div className="flex-1 max-w-xl">
              <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Trang chủ đi chợ
              </h3>
              
              <p className="text-on-surface-variant text-sm md:text-base max-w-md mt-2">
                Kiểm tra nguyên liệu và mua sắm chuẩn bị cho các bữa ăn ngon miệng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Checklist Column */}
        <div className="space-y-6 lg:col-span-8">
          
          {groceryList?.status === 'COMPLETED' ? (
            <div className={`${styles.glassCard} rounded-[24px] p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/5 border-2 border-primary/20`}>
              <div>
                <h4 className="font-bold text-primary flex items-center gap-2 text-lg mb-1">
                  <CheckCircle2 size={24} />
                  Phiên đi chợ đã hoàn tất
                </h4>
                <p className="text-sm text-on-surface-variant">Bạn đang xem lại tóm tắt của danh sách này.</p>
              </div>
              <button 
                onClick={handleCreateNewList}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> TẠO DANH SÁCH MỚI
              </button>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-2 mb-6 flex items-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-md cursor-pointer" onClick={() => setShowAddModal(true)}>
              <div className="flex-1 flex items-center gap-3 px-4">
                <Plus size={20} className="text-on-surface-variant" />
                <input 
                  className="w-full bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/60 font-medium cursor-pointer" 
                  placeholder="Thêm nguyên liệu thủ công..." 
                  type="text"
                  readOnly
                />
              </div>
              <button 
                className="bg-primary text-white font-bold px-8 py-3 rounded-[18px] hover:bg-orange-800 transition-colors active:scale-95 text-sm shadow-sm"
              >
                THÊM
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className={`${styles.glassCard} rounded-[24px] p-12 text-center flex flex-col items-center justify-center my-6`}>
              <ShoppingCart size={64} className="text-on-surface-variant/30 mb-6" />
              <h3 className="text-2xl font-bold text-on-surface mb-3">Danh sách trống</h3>
              <p className="text-on-surface-variant text-lg mb-8">Bạn chưa có nguyên liệu nào cần mua.</p>
              <button
                className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-lg"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={24} />
                Thêm nguyên liệu đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2 mt-2 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={22} className="text-primary" />
                  <h3 className="text-2xl font-bold text-on-surface">{listName || 'Danh sách mua sắm'}</h3>
                </div>
                <div className="text-on-surface-variant text-sm font-semibold bg-surface-container px-3 py-1.5 rounded-full hidden sm:block shadow-sm">
                  Tiến độ: <span className="text-primary font-bold text-base mx-1">{items.filter(i => i.isBought).length}/{items.length}</span> món ({progress}%)
                </div>
              </div>
              {sortedAisles.map(aisle => (
              <div key={aisle} className={`${styles.glassCard} rounded-[24px] p-5 md:p-6 mb-6`}>
                <AisleGroupHeader
                  name={aisle}
                  itemCount={groupedItems[aisle].length}
                  boughtCount={groupedItems[aisle].filter(i => i.isBought).length}
                />
                <div className="space-y-2">
                  {groupedItems[aisle].map(item => (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onToggle={groceryList?.status !== 'COMPLETED' ? handleToggleItem : undefined}
                      onEdit={groceryList?.status !== 'COMPLETED' ? handleEditItem : undefined}
                      onRemove={groceryList?.status !== 'COMPLETED' ? handleRemoveItem : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}

        </div>

        {/* Summary & Actions Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Phiên đi chợ đang diễn ra */}
          {groceryList?.status !== 'COMPLETED' && items.length > 0 && (
            <div className={`${styles.glassCard} rounded-[24px] p-6 bg-primary/5 border border-primary/20`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-primary font-bold text-base flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Đang đi chợ
                </h4>
              </div>
              <h3 className="font-bold text-xl text-on-surface mb-2">{listName || 'Danh sách mua sắm'}</h3>
              <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-on-surface-variant mb-5">Tiến độ: {items.filter(i => i.isBought).length} / {items.length} món</p>
              
              <button 
                onClick={() => setShoppingMode(true)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                TIẾP TỤC ĐI CHỢ
              </button>
            </div>
          )}

            {/* Lịch sử đi chợ - Timeline */}
            <div className={`${styles.glassCard} rounded-[24px] p-6`}>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-primary font-bold text-base flex items-center gap-2">
                  <Clock size={18} />
                  Lịch sử đi chợ
                </h4>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={20} className={styles.spin} />
                </div>
              ) : completedLists.length === 0 ? (
                <div className="text-center py-4">
                  <Package size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
                  <p className="text-on-surface-variant text-sm">Chưa có lịch sử đi chợ.</p>
                </div>
              ) : (
                <div className="relative pl-5">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-primary/15 rounded-full"></div>

                  <div className="space-y-5">
                    {completedLists.map((list, idx) => (
                      <div
                        key={list.id}
                        onClick={() => handleViewHistory(list)}
                        className={`relative cursor-pointer group p-2 rounded-xl transition-colors ${groceryList?.id === list.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                        style={{ animationDelay: `${idx * 100}ms`, animation: 'sr-slideUpFade 0.4s ease-out both' }}
                      >
                        {/* Timeline dot */}
                        <div className={`absolute -left-[28px] top-4 w-3.5 h-3.5 rounded-full border-2 border-primary z-10 transition-all duration-300 ${groceryList?.id === list.id ? 'bg-primary scale-125' : 'bg-white group-hover:bg-primary group-hover:scale-125'}`}></div>

                        <div className="group-hover:translate-x-1 transition-transform duration-300">
                          <p className="text-xs font-bold text-primary mb-0.5">
                            {formatHistoryDate(list.completedAt || list.createdAt)}
                          </p>
                          <h5 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors leading-snug">
                            {list.name || 'Danh sách mua sắm'}
                          </h5>
                          <p className="text-on-surface-variant text-xs mt-0.5">
                            {list.totalItems || list.items?.length || 0} món
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completedLists.length > 0 && (
                <button 
                  onClick={() => navigate('/grocery/history')}
                  className="w-full mt-5 pt-4 border-t border-outline-variant/30 text-primary text-sm font-bold flex items-center justify-center gap-1 hover:opacity-80 transition-opacity"
                >
                  Xem tất cả lịch sử <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className={`${styles.glassCard} rounded-[24px] p-6 border-2 border-dashed border-primary/30 flex flex-col items-center text-center gap-3`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Wand2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">Tự động tạo danh sách</h4>
                <p className="text-sm text-on-surface-variant">Dựa trên thực đơn tuần của bạn</p>
              </div>
              <button 
                className="w-full mt-2 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors"
                onClick={() => setShowGenerateModal(true)}
              >
                BẮT ĐẦU QUÉT
              </button>
            </div>

          </div>

        {/* Hoàn tất đi chợ — full width across grid */}
        {groceryList?.status !== 'COMPLETED' && items.length > 0 && (
          <div className="lg:col-span-12">
            <div className="bg-primary text-white rounded-[24px] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute left-1/3 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <CheckCircle2 size={28} />
                    Hoàn tất đi chợ
                  </h4>
                  <p className="text-white/80 text-base leading-relaxed max-w-xl">
                    Sau khi mua xong, nhấn nút bên dưới để tự động cập nhật danh sách này vào Tủ Lạnh Ảo của bạn.
                  </p>
                </div>
                <button 
                  onClick={handleComplete}
                  disabled={items.length === 0}
                  className="md:min-w-[260px] py-4 px-8 bg-white text-primary rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all active:scale-95 duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  CẬP NHẬT KHO LƯU TRỮ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddGroceryItemModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        listId={groceryList?.id}
        editingItem={editingItem}
      />

      <GenerateListModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={async () => {
          await fetchGroceryList();
          setShoppingMode(true);
        }}
      />
      
      <HistoryDetailModal 
        isOpen={showHistoryModal}
        listId={selectedHistoryId}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedHistoryId(null);
        }}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Xóa tất cả nguyên liệu?"
        message="Hành động này không thể hoàn tác. Bạn có chắc muốn xóa tất cả nguyên liệu khỏi danh sách?"
        confirmText="Xóa tất cả"
        isDestructive={true}
      />
    </div>
  );
};

export default GroceryPage;