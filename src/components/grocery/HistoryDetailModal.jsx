import React, { useState, useEffect, useRef } from 'react';
import { 
  X, CalendarDays, CheckCircle2, Check, Download, 
  Beef, LeafyGreen, Wheat, UtensilsCrossed, Egg, 
  Snowflake, CupSoda, Cookie, Archive, Package, ClipboardList,
  Loader2
} from 'lucide-react';
import { groceryService } from '../../services/groceryService';
import { useReactToPrint } from 'react-to-print';

const getAisleIcon = (name) => {
  const lower = name.toLowerCase();
  
  if (lower.includes('thịt') || lower.includes('cá') || lower.includes('hải sản') || lower.includes('bò') || lower.includes('gà')) {
    return Beef;
  }
  if (lower.includes('rau') || lower.includes('củ') || lower.includes('quả') || lower.includes('trái cây')) {
    return LeafyGreen;
  }
  if (lower.includes('khô') || lower.includes('gạo') || lower.includes('mì')) {
    return Wheat;
  }
  if (lower.includes('gia vị') || lower.includes('nước chấm')) {
    return UtensilsCrossed;
  }
  if (lower.includes('sữa') || lower.includes('trứng') || lower.includes('bơ')) {
    return Egg;
  }
  if (lower.includes('đông lạnh')) {
    return Snowflake;
  }
  if (lower.includes('uống') || lower.includes('nước')) {
    return CupSoda;
  }
  if (lower.includes('vặt') || lower.includes('bánh')) {
    return Cookie;
  }
  if (lower.includes('đóng hộp')) {
    return Archive;
  }
  if (lower.includes('khác')) {
    return ClipboardList;
  }
  return Package;
};

const HistoryDetailModal = ({ isOpen, listId, onClose }) => {
  const [listDetails, setListDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && listId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const data = await groceryService.getList(listId);
          setListDetails(data);
        } catch (error) {
          console.error("Error fetching list details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, listId]);

  const contentRef = useRef(null);

  const handleDownloadPdf = useReactToPrint({
    contentRef,
    documentTitle: `DanhSachMuaSam_${listDetails?.id || 'LichSu'}`,
  });

  if (!isOpen) return null;

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const groupedItems = (listDetails?.items || []).reduce((groups, item) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-opacity">
      {/* Modal Content */}
      <div 
        className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'rgba(255, 248, 244, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 10px 40px rgba(161, 57, 35, 0.12)'
        }}
      >
        <div ref={contentRef} id="history-pdf-content" className="flex flex-col overflow-y-auto flex-1 bg-surface">
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline-variant/30 flex justify-between items-start shrink-0">
            <div>
            <h2 className="text-xl font-bold text-primary mb-1">
              Chi tiết lịch sử: {listDetails?.name || 'Danh sách mua sắm'}
            </h2>
            <div className="flex items-center gap-2 text-on-surface-variant flex-wrap">
              <CalendarDays size={16} />
              <span className="text-sm font-bold">{formatHistoryDate(listDetails?.completedAt || listDetails?.createdAt)}</span>
              <span className="mx-1">•</span>
              <span className="inline-flex items-center gap-1 bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full text-primary">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold">Đã hoàn thành</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-highest pdf-hide-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            sortedAisles.map(aisle => {
              const IconComponent = getAisleIcon(aisle);
              return (
                <div key={aisle}>
                  <h3 className="text-sm font-bold text-primary/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IconComponent size={18} /> {aisle}
                  </h3>
                  <div className="space-y-3">
                    {groupedItems[aisle].map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-sm line-through text-on-surface-variant">
                            {item.ingredient?.name || 'Món'} 
                            {item.totalNeeded ? ` (${item.finalToBuy || item.totalNeeded} ${item.unit || ''})` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface/95 backdrop-blur-md shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm font-bold flex items-center gap-2"
          >
            Đóng
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 text-sm font-bold flex items-center gap-2"
          >
            <Download size={18} />
            Tải danh sách (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
