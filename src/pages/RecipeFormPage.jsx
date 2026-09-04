import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Camera, X, Plus, Trash2, Clock, Zap, Check, Image as ImageIcon, Sparkles, Edit2, Globe, Lock, Tag, Eye, List
} from 'lucide-react';

import { recipeService } from '../services/recipeService';
import { tagService } from '../services/ingredientService';
import IngredientAutocomplete from '../components/ui/IngredientAutocomplete';
import s from '../styles/pages/RecipeFormPage.module.css';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Dễ (Easy)' },
  { value: 'MEDIUM', label: 'Vừa (Medium)' },
  { value: 'HARD', label: 'Khó (Hard)' },
];

const EMPTY_INGREDIENT = { ingredientId: null, ingredientName: '', amount: '', unit: 'g' };
const EMPTY_STEP = { stepNumber: 1, title: '', instruction: '', imageFile: null, imagePreview: null };

const STEPS = [
  { id: 1, title: 'Details', label: 'Thông tin cơ bản' },
  { id: 2, title: 'Ingredients', label: 'Nguyên liệu' },
  { id: 3, title: 'Steps', label: 'Các bước nấu' },
  { id: 4, title: 'Review', label: 'Gắn thẻ & Đăng' },
];

export default function RecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [currentStep, setCurrentStep] = useState(1);

  // Data
  const [allTags, setAllTags] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    baseServings: 4,
    status: 'PUBLIC', // Default to public in wizard
    imageUrl: '',
    prepTime: '',
    cookTime: '',
    difficulty: 'EASY',
  });

  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState({ ...EMPTY_INGREDIENT });
  const [steps, setSteps] = useState([{ ...EMPTY_STEP }]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // Tag management states
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  // ==================== FETCH DATA ====================
  useEffect(() => {
    tagService.getAll().then((res) => {
      setAllTags(res.data || []);
    }).catch(console.error);

    if (!isEdit) return;

    (async () => {
      try {
        const recipe = await recipeService.getById(id);
        setForm({
          title: recipe.title || '',
          description: recipe.description || '',
          baseServings: recipe.baseServings || 4,
          status: recipe.status || 'PUBLIC',
          imageUrl: recipe.imageUrl || '',
          prepTime: recipe.prepTime || '',
          cookTime: recipe.cookTime || '',
          difficulty: recipe.difficulty || 'EASY',
        });

        if (recipe.imageUrl) setImagePreview(recipe.imageUrl);

        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredients(
            recipe.ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              ingredientName: ing.ingredientName || '',
              amount: ing.amount ?? '',
              unit: ing.unit || '',
            }))
          );
        }

        if (recipe.steps && recipe.steps.length > 0) {
          setSteps(
            recipe.steps.map((s, i) => ({
              stepNumber: s.stepNumber || i + 1,
              title: s.title || '',
              instruction: s.instruction || '',
              imageFile: null,
              imagePreview: s.imageUrl || null,
            }))
          );
        }

        if (recipe.tags && recipe.tags.length > 0) {
          setSelectedTagIds(recipe.tags.map((t) => t.id));
        }
      } catch (err) {
        toast.error('Không thể tải thông tin công thức');
        navigate('/recipes');
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ==================== HANDLERS ====================
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh JPG, PNG, WebP, GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImageFile = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    handleFormChange('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Ingredients ---
  const handleCurrentIngredientSelect = (ingredient) => {
    setCurrentIngredient(prev => ({
      ...prev,
      ingredientId: ingredient ? ingredient.id : null,
      ingredientName: ingredient ? ingredient.name : '',
      unit: ingredient ? (ingredient.baseUnit || 'g') : prev.unit,
    }));
  };

  const handleCurrentIngredientChange = (field, value) => {
    setCurrentIngredient(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    if (!currentIngredient.ingredientId && (!currentIngredient.ingredientName || !currentIngredient.ingredientName.trim())) {
      toast.error('Vui lòng chọn hoặc nhập tên nguyên liệu');
      return;
    }
    if (!currentIngredient.amount || parseFloat(currentIngredient.amount) <= 0) {
      toast.error('Vui lòng nhập số lượng lớn hơn 0');
      return;
    }
    setIngredients([...ingredients, currentIngredient]);
    setCurrentIngredient({ ...EMPTY_INGREDIENT });
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // --- Steps ---
  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, title: '', instruction: '', imageFile: null, imagePreview: null }]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  // --- Tags ---
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await tagService.create(newTagName.trim());
      setAllTags([...allTags, res.data]);
      setSelectedTagIds([...selectedTagIds, res.data.id]);
      setNewTagName('');
    } catch (err) {
      toast.error('Lỗi khi tạo thẻ');
    }
  };

  const handleUpdateTag = async (id) => {
    if (!editingTagName.trim()) { setEditingTagId(null); return; }
    try {
      const res = await tagService.update(id, editingTagName.trim());
      setAllTags(allTags.map(t => t.id === id ? res.data : t));
      setEditingTagId(null);
    } catch (err) {
      toast.error('Lỗi khi cập nhật thẻ');
    }
  };

  const handleDeleteTag = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn thẻ này khỏi hệ thống?')) return;
    try {
      await tagService.delete(id);
      setAllTags(allTags.filter(t => t.id !== id));
      setSelectedTagIds(selectedTagIds.filter(tId => tId !== id));
    } catch (err) {
      toast.error('Lỗi khi xóa thẻ');
    }
  };

  // ==================== NAVIGATION & VALIDATION ====================
  const validateStep = (step) => {
    if (step === 1) {
      if (!form.title.trim()) {
        toast.error('Vui lòng nhập tên công thức');
        return false;
      }
      if (!form.baseServings || parseInt(form.baseServings) < 1) {
        handleFormChange('baseServings', 4);
      }
    }
    if (step === 2) {
      if (currentIngredient.ingredientId || (currentIngredient.ingredientName && currentIngredient.ingredientName.trim())) {
        toast.error('Bạn đang nhập dở nguyên liệu, vui lòng bấm "Thêm" hoặc xóa tên nguyên liệu đi');
        return false;
      }
      if (ingredients.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 nguyên liệu');
        return false;
      }
    }
    if (step === 3) {
      for (let i = 0; i < steps.length; i++) {
        if (!steps[i].instruction.trim()) {
          toast.error(`Vui lòng nhập nội dung cho bước ${i + 1}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== SUBMIT ====================
  const handleSave = async (forceStatus = null) => {
    // Validate current step just in case
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const finalStatus = forceStatus || form.status;
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        baseServings: Math.max(1, parseInt(form.baseServings) || 4),
        status: finalStatus,
        imageUrl: form.imageUrl.trim(),
        prepTime: form.prepTime ? parseInt(form.prepTime) : 0,
        cookTime: form.cookTime ? parseInt(form.cookTime) : 0,
        difficulty: form.difficulty || 'EASY',
        tagIds: selectedTagIds,
        ingredients: ingredients.filter(i => i.ingredientId || (i.ingredientName && i.ingredientName.trim())).map((ing) => ({
          ingredientId: ing.ingredientId || null,
          ingredientName: ing.ingredientName?.trim() || null,
          amount: parseFloat(ing.amount),
          unit: ing.unit.trim(),
        })),
        steps: steps.filter(s => s.instruction.trim()).map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          title: s.title?.trim() || null,
          instruction: s.instruction.trim(),
        })),
      };

      let recipeId = isEdit ? parseInt(id) : null;

      if (isEdit) {
        await recipeService.update(recipeId, payload);
        toast.success(finalStatus === 'DRAFT' ? 'Đã lưu bản nháp' : 'Đã cập nhật công thức');
      } else {
        const created = await recipeService.create(payload);
        recipeId = created.id;
        const isPending = finalStatus === 'PENDING_REVIEW';
        toast.success(
          finalStatus === 'DRAFT'
            ? 'Đã lưu bản nháp'
            : isPending
              ? '📤 Bài đăng đã được gửi! Admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.'
              : 'Đăng công thức thành công! 🎉'
        );
      }

      // Upload recipe cover image
      if (recipeId && imageFile) {
        setUploadingImage(true);
        try {
          await recipeService.uploadImage(recipeId, imageFile);
        } catch (uploadErr) {
          toast.warning('Lưu thành công nhưng tải ảnh bìa thất bại.');
        } finally {
          setUploadingImage(false);
        }
      }

      // Upload step images
      if (recipeId) {
        const stepsWithImages = steps.filter(s => s.imageFile && s.instruction.trim());
        for (const step of stepsWithImages) {
          try {
            await recipeService.uploadStepImage(recipeId, step.stepNumber, step.imageFile);
          } catch (err) {
            toast.warning(`Tải ảnh bước ${step.stepNumber} thất bại.`);
          }
        }
      }

      navigate('/recipes');
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER VIEWS ====================
  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>

      {/* HEADER */}
      <div className={s.headerArea}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/recipes')} className={s.backBtn}>
            <ArrowLeft size={20} />
            {isEdit ? 'Chỉnh sửa công thức' : 'Tạo công thức mới'}
          </button>
        </div>
        <button
          onClick={() => handleSave('DRAFT')}
          disabled={loading}
          className={s.saveDraftBtn}
        >
          Lưu bản nháp
        </button>
      </div>

      {/* STEPPER */}
      <div className={s.stepperWrapper}>
        <div className={s.stepperLine}>
          <div
            className={s.stepperProgress}
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`${s.stepItem} ${isActive ? s.active : ''} ${isCompleted ? s.completed : ''}`}
              onClick={() => {
                if (isCompleted || isActive) return; // Prevent skipping ahead freely
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
            >
              <div className={s.stepIcon}>
                {isCompleted ? <Check size={16} /> : step.id}
              </div>
              <span className={s.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: BASICS */}
      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={s.panel}>
            <h2 className={s.panelTitle}>Thông tin cơ bản</h2>

            <div className={s.formGroup}>
              <label className={s.formLabel}>Tên công thức *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Ví dụ: Phở Bò Truyền Thống"
                className={s.formInput}
                autoFocus
              />
            </div>

            <div className={s.basicsGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Thời gian chuẩn bị (phút)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.prepTime}
                    onChange={(e) => handleFormChange('prepTime', e.target.value)}
                    placeholder="15"
                    className={s.formInput}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Thời gian nấu (phút)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.cookTime}
                    onChange={(e) => handleFormChange('cookTime', e.target.value)}
                    placeholder="45"
                    className={s.formInput}
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Khẩu phần (người)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={form.baseServings}
                    onChange={(e) => handleFormChange('baseServings', e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (!val || val < 1) handleFormChange('baseServings', 4);
                    }}
                    placeholder="4"
                    className={s.formInput}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">người</span>
                </div>
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Độ khó</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  className={s.formSelect}
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>Ảnh bìa món ăn</label>
              <div
                className={s.dragDropZone}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className={s.imagePreviewWrapper}>
                    <img src={imagePreview} alt="Preview" className={s.imagePreview} />
                    <button type="button" onClick={clearImageFile} className={s.removeImageBtn}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={s.dragIcon}><Camera size={32} /></div>
                    <span className={s.dragText}>Nhấn để tải ảnh hoặc kéo thả vào đây</span>
                  </>
                )}
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>Mô tả ngắn (Tùy chọn)</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Câu chuyện hoặc bí quyết về món ăn này..."
                className={s.formTextarea}
              />
            </div>
          </div>
        </div>
      )}
      {/* STEP 2: INGREDIENTS */}
      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={s.panel}>
            <h2 className={s.panelTitle}>Chuẩn bị nguyên liệu</h2>

            <div className={s.twoColGrid}>
              {/* Form Add */}
              <div className={s.addIngredientForm}>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <List size={20} className="text-[#a13923]" /> Thêm nguyên liệu
                </h3>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Tên nguyên liệu</label>
                    <IngredientAutocomplete
                      placeholder="VD: Thịt bò tươi..."
                      defaultValue={currentIngredient.ingredientId ? { id: currentIngredient.ingredientId, name: currentIngredient.ingredientName } : (currentIngredient.ingredientName ? { name: currentIngredient.ingredientName } : null)}
                      onSelect={(selected) => handleCurrentIngredientSelect(selected)}
                    />
                  </div>

                  <div className={s.ingrRow}>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Số lượng</label>
                      <input
                        type="number"
                        value={currentIngredient.amount}
                        onChange={(e) => handleCurrentIngredientChange('amount', e.target.value)}
                        placeholder="1"
                        className={s.formInput}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Đơn vị</label>
                      <select
                        value={currentIngredient.unit}
                        onChange={(e) => handleCurrentIngredientChange('unit', e.target.value)}
                        className={s.formSelect}
                      >
                        <optgroup label="Khối lượng">
                          <option value="g">g (gram)</option>
                          <option value="kg">kg</option>
                        </optgroup>
                        <optgroup label="Thể tích">
                          <option value="ml">ml</option>
                          <option value="l">lít</option>
                        </optgroup>
                        <optgroup label="Đếm được">
                          <option value="quả">quả/trái</option>
                          <option value="củ">củ</option>
                          <option value="tép">tép</option>
                          <option value="bó">bó</option>
                          <option value="con">con</option>
                          <option value="lát">lát</option>
                        </optgroup>
                        <optgroup label="Đong đếm">
                          <option value="thìa cafe">thìa cafe (tsp)</option>
                          <option value="thìa canh">thìa canh (tbsp)</option>
                          <option value="chén">chén/bát</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="button" onClick={addIngredient} className={s.btnAddIngredient}>
                  <Plus size={18} /> Thêm vào danh sách
                </button>
              </div>

              {/* Added List Preview */}
              <div className={s.ingredientListPanel}>
                <div className={s.ingredientListHeader}>
                  <h3 className="font-semibold text-gray-800 text-lg">Danh sách đã thêm</h3>
                  <span className={s.ingredientCount}>{ingredients.length} nguyên liệu</span>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {ingredients.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                      Chưa có nguyên liệu nào.<br />Hãy điền form bên cạnh rồi ấn Thêm.
                    </div>
                  ) : (
                    ingredients.map((ing, i) => (
                      <div key={i} className={`${s.ingredientCard} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={s.ingrCardIcon}>
                            <span className="font-bold text-lg text-gray-400">#</span>
                          </div>
                          <div className={s.ingrCardInfo}>
                            <div className={s.ingrCardName}>{ing.ingredientName}</div>
                            <div className={s.ingrCardAmount}>{ing.amount} {ing.unit}</div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeIngredient(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Xóa nguyên liệu này"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: STEPS */}
      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={s.panel}>
            <h2 className={s.panelTitle}>Các bước nấu ăn</h2>
            <p className="text-gray-500 text-sm mb-6">Chia nhỏ công thức của bạn thành các hướng dẫn dễ theo dõi.</p>

            <div className={s.stepList}>
              {steps.map((step, index) => (
                <div key={index} className={s.stepCard}>
                  <div className={s.stepNumberDrag}>
                    <div className={s.stepNumberBadge}>{step.stepNumber}</div>
                  </div>

                  <div className={s.stepContentArea}>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      placeholder={`Tiêu đề bước ${step.stepNumber} (VD: Sơ chế nguyên liệu)`}
                      className={s.formInput}
                      style={{ marginBottom: '8px', fontWeight: 600 }}
                    />
                    <textarea
                      value={step.instruction}
                      onChange={(e) => handleStepChange(index, 'instruction', e.target.value)}
                      placeholder={`Ví dụ: Cho dầu vào chảo đun nóng, phi thơm hành tỏi...`}
                      className={s.formTextarea}
                      style={{ minHeight: '80px' }}
                    />

                    {/* Step image upload */}
                    {step.imagePreview ? (
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <img
                          src={step.imagePreview}
                          alt={`Bước ${step.stepNumber}`}
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...steps];
                            updated[index] = { ...updated[index], imageFile: null, imagePreview: null };
                            setSteps(updated);
                          }}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className={s.btnAddMedia} style={{ cursor: 'pointer' }}>
                        <ImageIcon size={14} /> Thêm ảnh minh họa
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Kích thước ảnh tối đa 5MB');
                              return;
                            }
                            const updated = [...steps];
                            updated[index] = {
                              ...updated[index],
                              imageFile: file,
                              imagePreview: URL.createObjectURL(file)
                            };
                            setSteps(updated);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className={`${s.btnRemoveStep} ${steps.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className={s.btnAddStepRow}>
              <button type="button" onClick={addStep} className={s.btnAddStep}>
                <div className={s.btnAddStepIcon}><Plus size={24} /></div>
                Thêm bước tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & PUBLISH */}
      {currentStep === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={s.panel}>
            <h2 className={s.panelTitle}>Hoàn tất công thức!</h2>
            <p className="text-gray-500 text-sm mb-8">Thêm một số thông tin phụ để công thức của bạn dễ tìm kiếm hơn.</p>

            <div className={s.twoColGrid}>
              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <h3 className="text-[17px] font-semibold text-[#3d271d] mb-4 flex items-center gap-2">
                    <Tag className="text-[#a13923]" size={20} /> Thẻ phân loại
                  </h3>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                      placeholder="Nhập thẻ mới (VD: Bữa sáng, Chay...)"
                      className={`${s.formInput} py-2`}
                    />
                    <button type="button" onClick={handleCreateTag} className="px-5 bg-[#a13923] text-white rounded-xl hover:bg-[#8b311e] font-semibold transition-colors">
                      Thêm
                    </button>
                  </div>

                  <div className="min-h-[100px]">
                    <div className="flex flex-wrap gap-3">
                      {allTags.map((tag) => {
                        const selected = selectedTagIds.includes(tag.id);
                        const isEditing = editingTagId === tag.id;

                        if (isEditing) {
                          return (
                            <div key={tag.id} className="flex items-center gap-1 bg-white border border-[#a13923] rounded-full px-3 py-1.5 shadow-sm">
                              <input
                                autoFocus
                                type="text"
                                value={editingTagName}
                                onChange={e => setEditingTagName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag.id)}
                                className="outline-none text-sm w-24 px-1 bg-transparent text-[#a13923] font-medium"
                              />
                              <button type="button" onClick={() => handleUpdateTag(tag.id)} className="text-[#a13923] hover:text-[#8b311e]"><Check size={16} /></button>
                              <button type="button" onClick={() => setEditingTagId(null)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`group flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold transition-all cursor-pointer ${selected
                                ? 'bg-[#a13923] text-white shadow-md'
                                : 'bg-[#eeebe7] text-[#5c3e33] hover:bg-[#e4ddd6]'
                              }`}
                          >
                            <span style={{ fontFamily: 'var(--sr-font-body)' }}>{tag.name}</span>
                            <span className="font-light text-lg leading-none mt-[-2px]">{selected ? '×' : '+'}</span>

                            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 pl-2 border-l ${selected ? 'border-white/30' : 'border-[#5c3e33]/20'}`}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setEditingTagId(tag.id); setEditingTagName(tag.name); }}
                                className={`hover:scale-110 transition-transform ${selected ? 'text-white/70 hover:text-white' : 'text-[#5c3e33]/60 hover:text-[#5c3e33]'}`}
                                title="Sửa"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTag(tag.id, e)}
                                className={`hover:scale-110 transition-transform ${selected ? 'text-white/70 hover:text-[#ffb4ab]' : 'text-[#5c3e33]/60 hover:text-red-600'}`}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {allTags.length === 0 && <span className="text-sm text-gray-400">Chưa có thẻ nào trong hệ thống.</span>}
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <h3 className="text-[17px] font-semibold text-[#3d271d] mb-4 flex items-center gap-2">
                    <Eye className="text-[#a13923]" size={20} /> Quyền hiển thị
                  </h3>
                  <div className={s.radioGroup}>
                    <label className={`${s.radioLabel} ${form.status === 'PUBLIC' ? s.selected : ''}`}>
                      <div className={s.radioIcon}><div className={s.radioIconInner} /></div>
                      <input
                        type="radio"
                        name="visibility"
                        value="PUBLIC"
                        checked={form.status === 'PUBLIC'}
                        onChange={() => handleFormChange('status', 'PUBLIC')}
                        className="hidden"
                      />
                      <div className={s.radioText}>
                        <span className={s.radioTitle}>Công khai</span>
                        <span className={s.radioDesc}>Bất kỳ ai trên Smart Recipe đều có thể xem và lưu.</span>
                      </div>
                      <Globe size={24} className={form.status === 'PUBLIC' ? "text-[#a13923]" : "text-gray-400"} />
                    </label>

                    <label className={`${s.radioLabel} ${form.status === 'PRIVATE' ? s.selected : ''}`}>
                      <div className={s.radioIcon}><div className={s.radioIconInner} /></div>
                      <input
                        type="radio"
                        name="visibility"
                        value="PRIVATE"
                        checked={form.status === 'PRIVATE'}
                        onChange={() => handleFormChange('status', 'PRIVATE')}
                        className="hidden"
                      />
                      <div className={s.radioText}>
                        <span className={s.radioTitle}>Riêng tư</span>
                        <span className={s.radioDesc}>Chỉ mình bạn mới có thể xem công thức này.</span>
                      </div>
                      <Lock size={24} className={form.status === 'PRIVATE' ? "text-[#a13923]" : "text-gray-400"} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div>
                <div className={s.summaryCard}>
                  <img
                    src={imagePreview || "https://placehold.co/600x400/f6ece5/a13923?text=Smart+Recipe"}
                    alt="Preview"
                    className={s.summaryImage}
                  />
                  <div className={s.summaryContent}>
                    <h3 className={s.summaryTitle}>{form.title || 'Công thức chưa có tên'}</h3>

                    <div className="space-y-1">
                      <div className={s.summaryRow}>
                        <span className={s.summaryLabel}>Nguyên liệu</span>
                        <span className={s.summaryValue}>{ingredients.filter(i => i.ingredientId).length} mục</span>
                      </div>
                      <div className={s.summaryRow}>
                        <span className={s.summaryLabel}>Các bước</span>
                        <span className={s.summaryValue}>{steps.filter(s => s.instruction.trim()).length} bước</span>
                      </div>
                      <div className={s.summaryRow}>
                        <span className={s.summaryLabel}>Thời gian</span>
                        <span className={s.summaryValue}>{(parseInt(form.prepTime || 0) + parseInt(form.cookTime || 0)) || '--'} phút</span>
                      </div>
                      <div className={s.summaryRow}>
                        <span className={s.summaryLabel}>Độ khó</span>
                        <span className={s.badgeDifficulty}>
                          {DIFFICULTIES.find(d => d.value === form.difficulty)?.label || 'Dễ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className={s.footerActions}>
        <div>
          {currentStep > 1 && (
            <button type="button" onClick={handlePrev} className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-800 transition-colors">
              Quay lại
            </button>
          )}
        </div>

        {currentStep < 4 ? (
          <button type="button" onClick={handleNext} className={s.btnNext}>
            Tiếp tục
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={loading}
            className={s.btnNext}
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Đăng công thức')}
          </button>
        )}
      </div>

    </div>
  );
}