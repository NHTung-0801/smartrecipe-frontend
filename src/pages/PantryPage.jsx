import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, PackageOpen, Plus, RefreshCw, ScanLine, SearchX } from 'lucide-react';
import { toast } from 'react-toastify';
import { pantryService } from '../services/pantryService';
import PantrySummaryBar from '../components/pantry/PantrySummaryBar';
import ExpiryAlertBanner from '../components/pantry/ExpiryAlertBanner';
import PantryGrid from '../components/pantry/PantryGrid';
import AddPantryItemModal from '../components/pantry/AddPantryItemModal';
import PantryDetailModal from '../components/pantry/PantryDetailModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import s from '../styles/pages/PantryPage.module.css';

const filters = [['ALL', 'Tất cả'], ['EXPIRING_SOON', 'Sắp hết hạn'], ['EXPIRED', 'Đã hết hạn'], ['LOW_STOCK', 'Sắp hết']];
const getError = (error) => error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';

export default function PantryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [addModal, setAddModal] = useState({ open: false, item: null });
  const [detailModal, setDetailModal] = useState({ open: false, item: null });
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const pantryQuery = useQuery({ queryKey: ['pantry', filter], queryFn: () => pantryService.getPantry(filter) });
  const summaryQuery = useQuery({ queryKey: ['pantry-summary'], queryFn: pantryService.getSummary });
  
  // Logic gộp nguyên liệu cùng tên và đơn vị để tính tổng
  const rawGroups = pantryQuery.data?.data || {};
  const groups = {};
  let itemCount = 0;

  Object.entries(rawGroups).forEach(([aisle, items]) => {
    const mergedMap = new Map();
    items.forEach(item => {
      const unit = item.ingredient?.baseUnit || 'g';
      const key = `${item.ingredient?.name?.toLowerCase()}_${unit}`;
      
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.quantityAvailable += item.quantityAvailable;
        if (!existing.ids) existing.ids = [existing.id];
        existing.ids.push(item.id);
        // Giữ lại hạn sử dụng gần nhất
        if (item.expiryDate) {
          if (!existing.expiryDate || new Date(item.expiryDate) < new Date(existing.expiryDate)) {
            existing.expiryDate = item.expiryDate;
            existing.daysUntilExpiry = item.daysUntilExpiry;
            existing.status = item.status;
          }
        }
      } else {
        mergedMap.set(key, { ...item, ids: [item.id] });
      }
    });
    const mergedItems = Array.from(mergedMap.values());
    if (mergedItems.length > 0) {
      groups[aisle] = mergedItems;
      itemCount += mergedItems.length;
    }
  });

  const summary = summaryQuery.data?.data || {};

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pantry'] });
    queryClient.invalidateQueries({ queryKey: ['pantry-summary'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => id ? pantryService.updateItem(id, data) : pantryService.addItem(data),
    onSuccess: (_, variables) => { 
      toast.success(variables.id ? 'Đã cập nhật nguyên liệu!' : 'Đã thêm nguyên liệu vào tủ!'); 
      setAddModal({ open: false, item: null }); 
      setDetailModal({ open: false, item: null });
      refresh(); 
    },
    onError: (error) => toast.error(getError(error)),
  });

  const removeMutation = useMutation({
    mutationFn: pantryService.removeItem,
    onSuccess: () => { 
      toast.success('Đã xóa nguyên liệu khỏi tủ.'); 
      setDetailModal({ open: false, item: null });
      refresh(); 
    },
    onError: (error) => toast.error(getError(error)),
  });

  const cleanupMutation = useMutation({
    mutationFn: pantryService.deleteAllExpired,
    onSuccess: () => { 
      toast.success('Tủ đã sạch! Các nguyên liệu hết hạn đã được xóa.'); 
      setShowCleanupConfirm(false);
      refresh(); 
    },
    onError: (error) => toast.error(getError(error)),
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetail = (item) => setDetailModal({ open: true, item });
  const handleDetailSave = (data) => saveMutation.mutate({ id: detailModal.item?.id, data });
  
  const handleDetailDelete = async (item) => {
    try {
      setIsDeleting(true);
      const idsToDelete = item.ids || [item.id];
      await Promise.all(idsToDelete.map(id => pantryService.removeItem(id)));
      toast.success('Đã xóa nguyên liệu khỏi tủ.');
      setDetailModal({ open: false, item: null });
      refresh();
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const cleanup = () => {
    setShowCleanupConfirm(true);
  };

  const loading = pantryQuery.isLoading || summaryQuery.isLoading;
  return (
    <div className={s.page}>
      <header className={s.pageHeader}>
        <div><span className={s.pageEyebrow}>Không gian bếp của bạn</span><h1>Tủ nguyên liệu</h1><p>Theo dõi độ tươi, số lượng và tận dụng mọi nguyên liệu tốt hơn.</p></div>
        <div className={s.headerActions}><button type="button" className={s.scanButton} title="Tính năng đang phát triển"><ScanLine size={19} /> Quét mã</button><button type="button" className={s.addButton} onClick={() => setAddModal({ open: true, item: null })}><Plus size={20} /> Thêm nguyên liệu</button></div>
      </header>

      <PantrySummaryBar summary={summary} activeFilter={filter} onFilterChange={setFilter} />
      <ExpiryAlertBanner summary={summary} onCleanup={cleanup} isCleaning={cleanupMutation.isPending} />

      <div className={s.contentToolbar}>
        <div className={s.filterTabs}>{filters.map(([value, label]) => <button type="button" key={value} className={filter === value ? s.filterActive : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
        <button type="button" className={s.refreshButton} onClick={refresh} aria-label="Làm mới"><RefreshCw size={17} className={pantryQuery.isFetching ? s.spinning : ''} /></button>
      </div>

      {loading ? <PantrySkeleton /> : pantryQuery.isError ? (
        <div className={s.stateCard}><AlertCircle size={40} /><h2>Không thể tải tủ nguyên liệu</h2><p>{getError(pantryQuery.error)}</p><button type="button" onClick={() => pantryQuery.refetch()}><RefreshCw size={17} /> Thử lại</button></div>
      ) : itemCount > 0 ? (
        <PantryGrid groups={groups} onViewDetail={handleViewDetail} />
      ) : (
        <div className={s.emptyState}><div className={s.emptyIllustration}><PackageOpen size={58} /><span>🌿</span></div><h2>{filter === 'ALL' ? 'Tủ nguyên liệu đang trống' : 'Không có nguyên liệu phù hợp'}</h2><p>{filter === 'ALL' ? 'Thêm những nguyên liệu đầu tiên để Smart Recipe giúp bạn theo dõi độ tươi và lên món.' : 'Tuyệt vời! Không có mục nào trong trạng thái này.'}</p>{filter === 'ALL' ? <button type="button" onClick={() => setAddModal({ open: true, item: null })}><Plus size={18} /> Thêm nguyên liệu đầu tiên</button> : <button type="button" onClick={() => setFilter('ALL')}><SearchX size={18} /> Xem tất cả</button>}</div>
      )}

      <AddPantryItemModal isOpen={addModal.open} item={addModal.item} isSaving={saveMutation.isPending} onClose={() => setAddModal({ open: false, item: null })} onSubmit={(data) => saveMutation.mutate({ id: addModal.item?.id, data })} />
      <PantryDetailModal isOpen={detailModal.open} item={detailModal.item} isSaving={saveMutation.isPending} isDeleting={isDeleting} onClose={() => setDetailModal({ open: false, item: null })} onSave={handleDetailSave} onDelete={handleDetailDelete} />

      <ConfirmModal
        isOpen={showCleanupConfirm}
        title="Xóa nguyên liệu hết hạn"
        message={`Bạn có chắc chắn muốn dọn dẹp ${summary.expiredCount || 0} nguyên liệu đã hết hạn khỏi tủ?`}
        confirmText="Dọn dẹp ngay"
        isDestructive={true}
        isLoading={cleanupMutation.isPending}
        onConfirm={() => cleanupMutation.mutate()}
        onCancel={() => setShowCleanupConfirm(false)}
      />
    </div>
  );
}

function PantrySkeleton() {
  return <div className={s.skeletonGroups}>{[1, 2].map((group) => <div key={group}><div className={s.skeletonTitle} /><div className={s.skeletonGrid}>{[1, 2, 3].map((card) => <div className={s.skeletonCard} key={card}><i /><b /><span /><small /></div>)}</div></div>)}</div>;
}