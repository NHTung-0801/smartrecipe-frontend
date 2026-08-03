import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { recipeService } from '../services/recipeService';
import { ingredientService, tagService } from '../services/ingredientService';
import IngredientAutocomplete from '../components/ui/IngredientAutocomplete';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
];

const STATUSES = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PRIVATE', label: 'Riêng tư' },
  { value: 'PUBLIC', label: 'Công khai' },
];

const EMPTY_INGREDIENT = { ingredientId: null, ingredientName: '', amount: '', unit: 'g' };
const EMPTY_STEP = { stepNumber: 1, instruction: '' };

export default function RecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // undefined khi tạo mới, có giá trị khi sửa
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [allTags, setAllTags] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    baseServings: 4,
    status: 'DRAFT',
    imageUrl: '',
    prepTime: '',
    cookTime: '',
    difficulty: '',
  });

  const [ingredients, setIngredients] = useState([{ ...EMPTY_INGREDIENT }]);
  const [steps, setSteps] = useState([{ ...EMPTY_STEP }]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // ==================== FETCH DATA FOR EDIT ====================
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
          status: recipe.status || 'DRAFT',
          imageUrl: recipe.imageUrl || '',
          prepTime: recipe.prepTime || '',
          cookTime: recipe.cookTime || '',
          difficulty: recipe.difficulty || '',
        });

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
              instruction: s.instruction || '',
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

  // --- Ingredients ---
  const handleIngredientSelect = (index, ingredient) => {
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      ingredientId: ingredient ? ingredient.id : null,
      ingredientName: ingredient ? ingredient.name : '',
      unit: ingredient ? ingredient.baseUnit || '' : updated[index].unit,
    };
    setIngredients(updated);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ...EMPTY_INGREDIENT }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // --- Steps ---
  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== index);
    // re-number
    setSteps(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  // --- Image Upload ---
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh JPG, PNG, WebP, GIF');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImageFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Tags ---
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const res = await tagService.create(newTagName.trim());
      const createdTag = res.data;
      setAllTags((prev) => [...prev, createdTag]);
      setSelectedTagIds((prev) => [...prev, createdTag.id]);
      setNewTagName('');
      toast.success('Đã tạo thẻ mới');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể tạo thẻ');
    } finally {
      setCreatingTag(false);
    }
  };

  // ==================== VALIDATION ====================
  const validate = () => {
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công thức');
      return false;
    }
    if (!form.baseServings || form.baseServings < 1) {
      toast.error('Số suất ăn phải lớn hơn 0');
      return false;
    }

    // Validate ingredients
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.ingredientId) {
        toast.error(`Vui lòng chọn nguyên liệu cho dòng ${i + 1}`);
        return false;
      }
      if (!ing.amount || parseFloat(ing.amount) <= 0) {
        toast.error(`Vui lòng nhập số lượng cho nguyên liệu dòng ${i + 1}`);
        return false;
      }
      if (!ing.unit.trim()) {
        toast.error(`Vui lòng nhập đơn vị cho nguyên liệu dòng ${i + 1}`);
        return false;
      }
    }

    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].instruction.trim()) {
        toast.error(`Vui lòng nhập hướng dẫn cho bước ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        baseServings: parseInt(form.baseServings),
        status: form.status,
        imageUrl: form.imageUrl.trim(),
        prepTime: form.prepTime ? parseInt(form.prepTime) : 0,
        cookTime: form.cookTime ? parseInt(form.cookTime) : 0,
        difficulty: form.difficulty || null,
        tagIds: selectedTagIds,
        ingredients: ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          amount: parseFloat(ing.amount),
          unit: ing.unit.trim(),
        })),
        steps: steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          instruction: s.instruction.trim(),
        })),
      };

      let recipeId = isEdit ? parseInt(id) : null;

      if (isEdit) {
        await recipeService.update(recipeId, payload);
        toast.success('Cập nhật công thức thành công!');
      } else {
        const created = await recipeService.create(payload);
        recipeId = created.id;
        toast.success('Tạo công thức thành công!');
      }

      // Upload image if a file is selected
      if (recipeId && imageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await recipeService.uploadImage(recipeId, imageFile);
          // Update imageUrl in form (if user stays on page) via update call
          await recipeService.update(recipeId, {
            ...payload,
            imageUrl: uploadResult.imageUrl,
          });
          toast.success('Tải ảnh lên thành công!');
        } catch (uploadErr) {
          toast.warning('Công thức đã lưu nhưng tải ảnh thất bại. Vui lòng thử lại sau.');
        } finally {
          setUploadingImage(false);
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

  // ==================== RENDER ====================
  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? '✏️ Chỉnh sửa công thức' : '🆕 Tạo công thức mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======== SECTION 1: BASIC INFO ======== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Tên công thức của bạn"
                maxLength={255}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Mô tả ngắn về công thức..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Base Servings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số suất ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.baseServings}
                onChange={(e) => handleFormChange('baseServings', e.target.value)}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Image URL + Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hoặc tải ảnh lên (Cloudinary)</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={clearImageFile}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Xóa ảnh đã chọn"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
              {uploadingImage && (
                <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  Đang tải ảnh lên...
                </p>
              )}
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian chuẩn bị (phút)</label>
              <input
                type="number"
                value={form.prepTime}
                onChange={(e) => handleFormChange('prepTime', e.target.value)}
                min={0}
                placeholder="15"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Cook Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian nấu (phút)</label>
              <input
                type="number"
                value={form.cookTime}
                onChange={(e) => handleFormChange('cookTime', e.target.value)}
                min={0}
                placeholder="30"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
              <select
                value={form.difficulty}
                onChange={(e) => handleFormChange('difficulty', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn --</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ======== SECTION 2: INGREDIENTS ======== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🥕 Nguyên liệu</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              + Thêm nguyên liệu
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                {/* Index */}
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                  {index + 1}
                </span>

                {/* Ingredient search */}
                <div className="flex-1 min-w-0">
                  <IngredientAutocomplete
                    placeholder="Tìm nguyên liệu..."
                    defaultValue={
                      ing.ingredientId
                        ? { id: ing.ingredientId, name: ing.ingredientName }
                        : null
                    }
                    onSelect={(selected) => handleIngredientSelect(index, selected)}
                  />
                </div>

                {/* Amount */}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  placeholder="SL"
                  className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />

                {/* Unit */}
                <select
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
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

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length <= 1}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Xóa nguyên liệu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {ingredients.length === 0 && (
            <p className="text-center text-gray-400 py-4">Chưa có nguyên liệu nào</p>
          )}
        </div>

        {/* ======== SECTION 3: STEPS ======== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📝 Các bước thực hiện</h2>
            <button
              type="button"
              onClick={addStep}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              + Thêm bước
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                {/* Step number */}
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-2">
                  {step.stepNumber}
                </span>

                {/* Instruction */}
                <textarea
                  value={step.instruction}
                  onChange={(e) => handleStepChange(index, 'instruction', e.target.value)}
                  placeholder={`Mô tả bước ${step.stepNumber}...`}
                  rows={2}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={steps.length <= 1}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                  title="Xóa bước"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {steps.length === 0 && (
            <p className="text-center text-gray-400 py-4">Chưa có bước nào</p>
          )}
        </div>

        {/* ======== SECTION 4: TAGS ======== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Thẻ phân loại</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                placeholder="Nhập tên thẻ mới (VD: Món chay, Ăn kiêng...)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={creatingTag || !newTagName.trim()}
                className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creatingTag ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[100px]">
            {allTags.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Chưa có thẻ nào được tạo. Hãy thêm thẻ đầu tiên của bạn!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                        selected
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag.name}
                      {selected && <span className="ml-1 opacity-70 hover:opacity-100">×</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======== SUBMITS ======== */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isEdit ? 'Cập nhật' : 'Tạo công thức'}
          </button>
        </div>
      </form>
    </div>
  );
}