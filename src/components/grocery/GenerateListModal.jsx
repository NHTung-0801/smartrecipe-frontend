import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, ShoppingBag, Wand2, Loader2, PackageOpen } from 'lucide-react';
import { recipeService } from '../../services/recipeService';
import { groceryService } from '../../services/groceryService';
import { pantryService } from '../../services/pantryService';

const GenerateListModal = ({ isOpen, onClose, onSuccess }) => {
  const [recipes, setRecipes] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch user's recipes (summaries)
      const data = await recipeService.getMyRecipes(0, 10);
      let detailedRecipes = [];
      if (data && data.content) {
        // Fetch detailed recipes to get ingredients
        detailedRecipes = await Promise.all(
          data.content.map(summary => recipeService.getById(summary.id))
        );
        setRecipes(detailedRecipes);
        setSelectedRecipes(new Set(detailedRecipes.map(r => r.id)));
      }

      // Fetch pantry items to calculate missing ingredients
      const response = await pantryService.getPantry('ALL');
      let flatPantry = [];
      const groupedData = response?.data || response || {};
      // Flatten the grouped pantry object (which maps Aisle names to arrays of items)
      Object.values(groupedData).forEach(group => {
        if (Array.isArray(group)) {
          flatPantry = flatPantry.concat(group);
        }
      });
      setPantry(flatPantry);

    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(recipes.map(r => r.id)));
    }
  };

  const handleToggleRecipe = (id) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipes(newSelected);
  };

  const handleGenerate = async () => {
    if (selectedRecipes.size === 0) {
      setError('Vui lòng chọn ít nhất 1 công thức');
      return;
    }
    try {
      setGenerating(true);
      setError('');
      for (const recipeId of selectedRecipes) {
        await groceryService.generateFromRecipe(recipeId, 1);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo danh sách');
    } finally {
      setGenerating(false);
    }
  };

  // Tính toán chính xác số nguyên liệu cần và thiếu
  const { totalIngredientsNeeded, missingIngredients } = useMemo(() => {
    const requiredMap = new Map(); // ingredientId -> { name, amountNeeded }
    
    // Tổng hợp nguyên liệu từ các công thức đã chọn
    selectedRecipes.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          const existing = requiredMap.get(ing.ingredientId);
          if (existing) {
            existing.amountNeeded += (ing.amount || 1);
          } else {
            requiredMap.set(ing.ingredientId, {
              id: ing.ingredientId,
              name: ing.ingredientName,
              amountNeeded: (ing.amount || 1)
            });
          }
        });
      }
    });

    const missingList = [];
    requiredMap.forEach((req) => {
      // Sum all non-expired pantry items for this ingredient
      const validPantryItems = pantry.filter(p => p.ingredient?.id === req.id && p.status !== 'EXPIRED');
      const available = validPantryItems.reduce((sum, p) => sum + (p.quantityAvailable || 0), 0);
      
      if (available < req.amountNeeded) {
        missingList.push(req);
      }
    });

    return {
      totalIngredientsNeeded: requiredMap.size,
      missingIngredients: missingList
    };
  }, [selectedRecipes, recipes, pantry]);

  // Hàm helper để tính số món thiếu cho từng công thức riêng lẻ (hiển thị ở list)
  const getMissingForRecipe = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe || !recipe.ingredients) return 0;
    
    let missing = 0;
    recipe.ingredients.forEach(ing => {
      // Sum all non-expired pantry items for this ingredient
      const validPantryItems = pantry.filter(p => p.ingredient?.id === ing.ingredientId && p.status !== 'EXPIRED');
      const available = validPantryItems.reduce((sum, p) => sum + (p.quantityAvailable || 0), 0);
      
      if (available < (ing.amount || 1)) {
        missing++;
      }
    });
    return missing;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--sr-on-surface)]/30 backdrop-blur-sm"
      style={{ animation: 'sr-fadeIn 0.2s ease-out' }}
    >
      <div 
        className="w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] bg-surface-container relative"
        style={{ animation: 'sr-slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Modal Header */}
        <div className="pt-8 pb-4 px-8 flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-3xl font-bold text-primary tracking-tight">Tự động tạo danh sách</h3>
            <p className="text-on-surface-variant text-base mt-2">Chọn thực đơn tuần để đồng bộ với giỏ hàng của bạn.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-2xl text-sm font-semibold animate-pulse">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={36} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Recipe Selection Section */}
              <section>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Thực đơn sắp tới</h4>
                  <button 
                    onClick={handleToggleSelectAll}
                    className="text-primary text-sm font-bold hover:opacity-80 transition-opacity"
                  >
                    {selectedRecipes.size === recipes.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recipes.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant bg-white/40 rounded-[24px]">
                      Không có công thức nào được lưu.
                    </div>
                  ) : (
                    recipes.map((recipe) => {
                      const isSelected = selectedRecipes.has(recipe.id);
                      const missingCount = getMissingForRecipe(recipe.id); 
                      
                      return (
                        <label 
                          key={recipe.id}
                          className={`flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 cursor-pointer border-2 ${
                            isSelected 
                              ? 'bg-white border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.03)] scale-[1.01]' 
                              : 'bg-white/50 border-white hover:bg-white/80 scale-100'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleRecipe(recipe.id)}
                            className="w-6 h-6 rounded-md accent-primary cursor-pointer border-2 border-outline-variant focus:ring-primary/20 transition-all duration-200"
                          />
                          <div className={`w-[72px] h-[72px] rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-500 ${!isSelected ? 'grayscale opacity-60 scale-95' : 'scale-100'}`}>
                            <img 
                              src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200'} 
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold transition-colors ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              {recipe.title}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant">
                                {recipe.difficulty === 'EASY' ? 'Dễ' : recipe.difficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
                              </span>
                              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                                <Users size={14} /> {recipe.baseServings || 2} người
                              </span>
                            </div>
                          </div>
                          <div className="text-right pl-2">
                            {missingCount > 0 ? (
                              <p className={`text-sm font-bold ${isSelected ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>
                                Thiếu {missingCount} món
                              </p>
                            ) : (
                              <p className="text-sm text-on-surface-variant italic">Đã có đủ</p>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Inventory Summary Section */}
              {selectedRecipes.size > 0 && (
                <section className="bg-[var(--sr-surface-container-high)] rounded-[24px] p-6 transition-all animate-sr-fadeIn">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <PackageOpen size={20} strokeWidth={2.5} />
                    <h4 className="text-sm font-bold uppercase tracking-widest">So sánh với tủ nguyên liệu</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/70 backdrop-blur p-4 rounded-[16px]">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Tổng nguyên liệu cần</p>
                      <p className="text-3xl font-extrabold text-on-surface mt-1">{totalIngredientsNeeded}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur p-4 rounded-[16px]">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Nguyên liệu cần mua thêm</p>
                      <p className="text-3xl font-extrabold text-primary mt-1">{missingIngredients.length}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-on-surface">Danh sách dự kiến mua:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingIngredients.length > 0 ? (
                        missingIngredients.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-white rounded-full text-xs font-semibold flex items-center gap-1.5 text-on-surface shadow-sm">
                            <ShoppingBag size={14} className="text-primary" /> {item.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-on-surface-variant italic">Bạn đã có đủ mọi nguyên liệu cần thiết!</span>
                      )}
                      
                      {missingIngredients.length > 3 && (
                        <span className="px-4 py-1.5 bg-white/50 rounded-full text-xs font-semibold text-on-surface-variant italic">
                          + {missingIngredients.length - 3} món khác...
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-4 flex items-center justify-between gap-4 shrink-0 bg-surface-container">
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-full border-2 border-outline-variant text-on-surface-variant text-base font-bold hover:bg-white/50 transition-all active:scale-95"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleGenerate}
            disabled={generating || selectedRecipes.size === 0}
            className="flex-[2] py-4 px-6 rounded-full bg-primary text-white text-base font-bold shadow-[0_8px_20px_rgba(161,57,35,0.25)] hover:bg-primary-container hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {generating ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Wand2 size={24} strokeWidth={2.5} />
                Xác nhận & Tạo danh sách
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateListModal;
