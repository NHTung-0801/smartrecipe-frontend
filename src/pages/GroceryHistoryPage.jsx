import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarDays, ChevronDown, CheckCircle2, RefreshCw, Package, Trash2 } from 'lucide-react';
import { groceryService } from '../services/groceryService';
import HistoryDetailModal from '../components/grocery/HistoryDetailModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const GroceryHistoryPage = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const allLists = await groceryService.getAllLists();
        const completed = (allLists || []).filter(l => l.status === 'COMPLETED');
        // Sort by completedAt descending
        completed.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
        setLists(completed);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const handleViewDetails = (listId) => {
    setSelectedListId(listId);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;
    try {
      setIsDeleting(true);
      await groceryService.deleteList(listToDelete);
      setLists(prev => prev.filter(l => l.id !== listToDelete));
      setListToDelete(null);
    } catch (err) {
      console.error("Error deleting history list:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filterOptions = {
    'ALL': 'Tất cả thời gian',
    '7_DAYS': '7 ngày qua',
    '30_DAYS': '30 ngày qua',
  };

  const filteredLists = lists.filter(list => {
    if (dateFilter === 'ALL') return true;
    
    const listDate = new Date(list.completedAt || list.createdAt);
    const now = new Date();
    
    if (dateFilter === '7_DAYS') {
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - 7);
      return listDate >= pastDate;
    }
    
    if (dateFilter === '30_DAYS') {
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - 30);
      return listDate >= pastDate;
    }
    
    if (dateFilter === 'THIS_MONTH') {
      return listDate.getMonth() === now.getMonth() && listDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });

  return (
    <div className="px-4 md:px-12 max-w-[1280px] mx-auto pt-8 pb-32 flex flex-col gap-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface mb-1">
            Lịch sử đi chợ
          </h1>
          <p className="text-[15px] text-on-surface-variant">Xem lại các danh sách mua sắm và chi tiêu của bạn.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          {/* Filter Dropdown */}
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-on-surface bg-white/70 backdrop-blur-md border border-white/40 shadow-[0px_10px_30px_rgba(204,88,63,0.08)] hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <CalendarDays size={20} className="text-primary" />
            <span className="text-sm font-bold">{
              {
                'ALL': 'Tất cả thời gian',
                '7_DAYS': '7 ngày qua',
                '30_DAYS': '30 ngày qua',
                'THIS_MONTH': 'Tháng này'
              }[dateFilter]
            }</span>
            <ChevronDown size={20} className={`text-primary transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-20">
              {['ALL', '7_DAYS', '30_DAYS', 'THIS_MONTH'].map(key => (
                <button
                  key={key}
                  className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-primary/5 transition-colors ${dateFilter === key ? 'text-primary bg-primary/10' : 'text-on-surface'}`}
                  onClick={() => {
                    setDateFilter(key);
                    setShowFilterMenu(false);
                  }}
                >
                  {{
                    'ALL': 'Tất cả thời gian',
                    '7_DAYS': '7 ngày qua',
                    '30_DAYS': '30 ngày qua',
                    'THIS_MONTH': 'Tháng này'
                  }[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw size={32} className="text-primary animate-spin" />
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm">
          <Package size={64} className="text-outline-variant mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">Không tìm thấy danh sách nào</h3>
          <p className="text-on-surface-variant">Chưa có lịch sử đi chợ hoặc không khớp với tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map(list => (
            <div 
              key={list.id}
              className="bg-white/70 backdrop-blur-md border border-white/40 shadow-[0px_10px_30px_rgba(204,88,63,0.08)] rounded-xl p-5 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-primary/80 font-medium">
                    {formatHistoryDate(list.completedAt || list.createdAt)}
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mt-1">
                    {list.name || 'Danh sách mua sắm'}
                  </h3>
                </div>
                <div className="bg-primary/5 text-primary px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">Hoàn tất</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">
                  {list.totalItems || list.items?.length || 0} vật phẩm
                </span>
                <span className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                  {list.items && list.items.length > 0 
                    ? list.items.map(i => i.ingredient?.name || 'Món').slice(0, 3).join(', ') + (list.items.length > 3 ? '...' : '')
                    : 'Không có chi tiết món'}
                </span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <button 
                  onClick={() => setListToDelete(list.id)}
                  className="p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-error hover:shadow-md hover:scale-110 transition-all active:scale-95"
                  title="Xóa danh sách này"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => handleViewDetails(list.id)}
                  className="bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-bold hover:bg-primary/20 transition-colors active:scale-95"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <HistoryDetailModal 
        isOpen={!!selectedListId} 
        listId={selectedListId} 
        onClose={() => setSelectedListId(null)} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!listToDelete}
        onCancel={() => setListToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa danh sách lịch sử?"
        message="Bạn có chắc chắn muốn xóa bản ghi lịch sử này không? Hành động này không thể hoàn tác."
        confirmText={isDeleting ? "Đang xóa..." : "Xóa lịch sử"}
        isDestructive={true}
      />
    </div>
  );
};

export default GroceryHistoryPage;
