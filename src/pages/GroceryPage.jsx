import React, { useState, useEffect, useCallback } from 'react';
import { Save, Share2, ShoppingCart, Trash2, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { groceryService } from '../services/groceryService';
import ConfirmModal from '../components/ui/ConfirmModal';
import AisleGroupHeader from '../components/grocery/AisleGroupHeader';
import GroceryItemRow from '../components/grocery/GroceryItemRow';
import AddGroceryItemModal from '../components/grocery/AddGroceryItemModal';
import CompleteConfetti from '../components/grocery/CompleteConfetti';
import styles from '../styles/pages/GroceryPage.module.css';

const GroceryPage = () => {
  const [groceryList, setGroceryList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listName, setListName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch grocery list
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
        // No active list - create one
        try {
          const newList = await groceryService.createList({ name: 'Danh sách mua sắm của tôi' });
          setGroceryList(newList);
          setListName(newList.name);
          setItems([]);
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

  useEffect(() => {
    fetchGroceryList();
  }, [fetchGroceryList]);

  // Group items by aisle
  const groupedItems = items.reduce((groups, item) => {
    const aisle = item.aisleName || 'Khác';
    if (!groups[aisle]) groups[aisle] = [];
    groups[aisle].push(item);
    return groups;
  }, {});

  const sortedAisles = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b);
  });

  const progress = items.length > 0
    ? Math.round((items.filter(i => i.isBought).length / items.length) * 100)
    : 0;

  // Toggle item bought status
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

  // Add item
  const handleAddItem = async (data) => {
    await groceryService.addItem(groceryList.id, data);
    await fetchGroceryList();
  };

  // Edit item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleEditSubmit = async (data) => {
    await groceryService.updateItem(editingItem.id, groceryList.id, data);
    setEditingItem(null);
    await fetchGroceryList();
  };

  // Remove item
  const handleRemoveItem = async (item) => {
    try {
      await groceryService.removeItem(item.id, groceryList.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError('Không thể xóa nguyên liệu');
    }
  };

  // Save list name
  const handleSaveName = async () => {
    if (!listName.trim()) return;
    try {
      setSaving(true);
      await groceryService.updateList(groceryList.id, { name: listName.trim() });
      setIsEditingName(false);
      setError('');
    } catch (err) {
      setError('Không thể lưu tên danh sách');
    } finally {
      setSaving(false);
    }
  };

  // Clear all items
  const handleClearAll = async () => {
    try {
      await groceryService.clearItems(groceryList.id);
      setItems([]);
      setShowClearConfirm(false);
    } catch (err) {
      setError('Không thể xóa tất cả');
    }
  };

  // Complete shopping
  const handleComplete = async () => {
    try {
      await groceryService.completeList(groceryList.id);
      setShowConfetti(true);
      // Refresh after confetti
      setTimeout(() => {
        fetchGroceryList();
      }, 2500);
    } catch (err) {
      setError('Không thể hoàn tất danh sách');
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

  return (
    <div className={styles.page}>
      <CompleteConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ShoppingCart size={24} className={styles.headerIcon} />
          {isEditingName ? (
            <div className={styles.nameEdit}>
              <input
                type="text"
                className={styles.nameInput}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
              />
              <button
                className={styles.saveNameBtn}
                onClick={handleSaveName}
                disabled={saving}
              >
                {saving ? <Loader2 size={14} className={styles.spin} /> : <Save size={14} />}
              </button>
            </div>
          ) : (
            <h1
              className={styles.title}
              onClick={() => setIsEditingName(true)}
              title="Nhấn để đổi tên"
            >
              {listName}
            </h1>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.shareBtn} onClick={handleShare} title="Sao chép danh sách">
            <Share2 size={16} />
          </button>
          <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)} title="Xóa tất cả">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressText}>
            {items.filter(i => i.isBought).length}/{items.length} ({progress}%)
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.errorBar}>
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={48} className={styles.emptyIcon} />
            <h3>Danh sách trống</h3>
            <p>Thêm nguyên liệu vào danh sách mua sắm của bạn</p>
            <button
              className={styles.addFirstBtn}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Thêm nguyên liệu đầu tiên
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {sortedAisles.map(aisle => (
              <div key={aisle} className={styles.aisleGroup}>
                <AisleGroupHeader
                  name={aisle}
                  itemCount={groupedItems[aisle].length}
                  boughtCount={groupedItems[aisle].filter(i => i.isBought).length}
                />
                {groupedItems[aisle].map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onEdit={handleEditItem}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className={styles.bottomBar}>
        <button
          className={styles.addBtn}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          Thêm nguyên liệu
        </button>
        {items.length > 0 && (
          <button
            className={styles.completeBtn}
            onClick={handleComplete}
          >
            <CheckCircle2 size={18} />
            Hoàn tất mua sắm
          </button>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddGroceryItemModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        listId={groceryList?.id}
        editingItem={editingItem}
      />

      {/* Clear Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Xóa tất cả nguyên liệu?"
        message="Hành động này không thể hoàn tác. Bạn có chắc muốn xóa tất cả nguyên liệu khỏi danh sách?"
        confirmText="Xóa tất cả"
        variant="danger"
      />
    </div>
  );
};

export default GroceryPage;