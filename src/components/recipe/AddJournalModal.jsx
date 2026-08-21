import { useState, useEffect } from 'react';
import { Star, ChefHat, X, NotebookPen, Image, Users, Loader2, Search, ArrowLeft } from 'lucide-react';
import { journalService } from '../../services/journalService';
import { recipeService } from '../../services/recipeService';
import { toast } from 'react-toastify';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600';

export default function AddJournalModal({ isOpen, onClose, recipe, editJournal, onSuccess }) {
  const [selectedRecipe, setSelectedRecipe] = useState(editJournal?.recipe || recipe || null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [actualServings, setActualServings] = useState(2);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [iterationNotes, setIterationNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset khi mở
  useEffect(() => {
    if (isOpen) {
      if (editJournal) {
        setSelectedRecipe(editJournal.recipe);
        setActualServings(editJournal.actualServings || 2);
        setRating(editJournal.rating || 0);
        setHoverRating(0);
        setIterationNotes(editJournal.iterationNotes || '');
        setImageUrl(editJournal.imageUrl || '');
        setImageFile(null);
        setSearchKeyword('');
        setSearchResults([]);
      } else {
        setSelectedRecipe(recipe || null);
        setSearchKeyword('');
        setSearchResults([]);
        setActualServings(recipe?.baseServings || 2);
        setRating(0);
        setHoverRating(0);
        setIterationNotes('');
        setImageUrl('');
        setImageFile(null);
      }
    }
  }, [isOpen, recipe, editJournal]);

  // Debounce search
  useEffect(() => {
    if (selectedRecipe) return;
    const timer = setTimeout(async () => {
      if (!searchKeyword.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await recipeService.search(searchKeyword, 0, 5);
        setSearchResults(res.data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword, selectedRecipe]);

  // Đóng khi bấm Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe) return;
    if (actualServings < 1) {
      toast.error('Số khẩu phần phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    try {
      if (editJournal) {
        let result = await journalService.update(editJournal.id, {
          recipeId: selectedRecipe.id,
          actualServings,
          rating: rating || null,
          iterationNotes: iterationNotes.trim() || null,
        });

        if (imageFile) {
          result = await journalService.uploadImage(editJournal.id, imageFile);
        }

        toast.success('🎉 Đã cập nhật nhận xét thành công!');
        onSuccess?.(result.data || result);
        onClose();
      } else {
        let result = await journalService.create({
          recipeId: selectedRecipe.id,
          actualServings,
          rating: rating || null,
          iterationNotes: iterationNotes.trim() || null,
        });

        const deductions = result.data?.deductionSummary || [];

        if (imageFile) {
          result = await journalService.uploadImage(result.data.id, imageFile);
        }

        const journal = result.data || result;

        if (deductions.length > 0) {
          toast.success(
            <div>
              <strong>🎉 Đã ghi nhận nấu ăn!</strong>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Đã trừ khỏi tủ lạnh:</div>
                {deductions.map((d, i) => (
                  <div key={i}>• {d.ingredientName}: -{d.deductedAmount} {d.unit}</div>
                ))}
              </div>
            </div>,
            { autoClose: 6000 }
          );
        } else {
          toast.success('🎉 Đã ghi nhận nấu ăn thành công!');
        }

        onSuccess?.(journal);
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu nhật ký';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh phải nhỏ hơn 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ');
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-[modalSlideUp_0.3s_ease-out] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-36 shrink-0 bg-gray-900">
          <img
            src={selectedRecipe ? (selectedRecipe.imageUrl || DEFAULT_IMAGE) : DEFAULT_IMAGE}
            alt="Hero"
            className={`w-full h-full object-cover transition-opacity duration-500 ${!selectedRecipe ? 'opacity-40 grayscale' : 'opacity-80'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              {selectedRecipe && !recipe && !editJournal && (
                <button 
                  onClick={() => { setSelectedRecipe(null); setSearchKeyword(''); }}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <ChefHat size={16} className="text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {editJournal ? 'Nhận xét món ăn' : (selectedRecipe ? 'Ghi nhận nấu ăn' : 'Chọn công thức')}
              </span>
            </div>
            <h3 className="text-xl font-bold leading-snug line-clamp-1">
              {selectedRecipe ? selectedRecipe.title : 'Bạn vừa nấu món gì?'}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5">
          {!selectedRecipe ? (
            // ================= SEARCH VIEW =================
            <div className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Gõ tên công thức..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#efebe7] rounded-xl focus:border-[#a13923] outline-none text-[#3d271d]"
                  autoFocus
                />
                {searching && (
                  <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a13923] animate-spin" />
                )}
              </div>

              <div className="space-y-2">
                {searchKeyword && searchResults.length === 0 && !searching && (
                  <p className="text-center text-gray-500 py-4 text-sm">Không tìm thấy công thức nào.</p>
                )}
                {searchResults.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRecipe(r);
                      setActualServings(r.baseServings || 2);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-orange-100"
                  >
                    <img src={r.imageUrl || DEFAULT_IMAGE} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-[#3d271d] text-sm line-clamp-1">{r.title}</h4>
                      <p className="text-xs text-gray-500">{r.baseServings} khẩu phần</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ================= FORM VIEW =================
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Khẩu phần thực tế */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#3d271d] mb-2">
                  <Users size={16} className="text-[#a13923]" />
                  Số khẩu phần đã nấu
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!!editJournal}
                    onClick={() => setActualServings(Math.max(1, actualServings - 1))}
                    className="w-10 h-10 rounded-xl bg-[#efebe7] text-[#3d271d] font-bold text-lg hover:bg-[#e4dfd9] flex items-center justify-center disabled:opacity-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    disabled={!!editJournal}
                    value={actualServings}
                    onChange={(e) => setActualServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center text-xl font-bold text-[#3d271d] border-2 border-[#efebe7] rounded-xl py-2 focus:border-[#a13923] outline-none disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    disabled={!!editJournal}
                    onClick={() => setActualServings(actualServings + 1)}
                    className="w-10 h-10 rounded-xl bg-[#efebe7] text-[#3d271d] font-bold text-lg hover:bg-[#e4dfd9] flex items-center justify-center disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-1">
                    người <span className="text-xs opacity-60">(gốc: {selectedRecipe.baseServings})</span>
                  </span>
                </div>
              </div>

              {/* Đánh giá sao */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#3d271d] mb-2">
                  <Star size={16} className="text-[#a13923]" />
                  Đánh giá lần nấu này
                  <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(rating === star ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={28}
                        className={star <= displayRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-[#a13923] font-bold">
                      {rating === 1 && 'Chưa ổn lắm'}
                      {rating === 2 && 'Tạm được'}
                      {rating === 3 && 'Khá ngon'}
                      {rating === 4 && 'Rất ngon!'}
                      {rating === 5 && 'Xuất sắc! 🔥'}
                    </span>
                  )}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#3d271d] mb-2">
                  <NotebookPen size={16} className="text-[#a13923]" />
                  Ghi chú cá nhân
                  <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
                </label>
                <textarea
                  value={iterationNotes}
                  onChange={(e) => setIterationNotes(e.target.value)}
                  placeholder="Ký ức, câu chuyện, thay đổi nguyên liệu..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-[#efebe7] rounded-xl text-[#3d271d] placeholder-gray-400 focus:border-[#a13923] outline-none resize-none text-sm"
                />
              </div>

              {/* URL ảnh (chuyển thành File Upload) */}
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-[#3d271d] mb-2">
                  <div className="flex items-center gap-2">
                    <Image size={16} className="text-[#a13923]" />
                    Ảnh thành quả
                    <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
                  </div>
                  {imageUrl && (
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImageUrl(''); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </label>
                
                {!imageUrl ? (
                  <label className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-[#efebe7] rounded-xl cursor-pointer hover:border-[#a13923] hover:bg-orange-50 transition-colors group">
                    <Image size={32} className="text-gray-300 group-hover:text-[#a13923] mb-2 transition-colors" />
                    <span className="text-sm text-gray-500 font-medium">Nhấn để chọn ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <label className="relative mt-2 block rounded-xl overflow-hidden h-40 bg-gray-100 border border-[#f0e8df] cursor-pointer group">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium text-sm border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        Đổi ảnh khác
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#a13923] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#8b311e] transition-all disabled:opacity-60 shadow-lg shadow-[#a13923]/20 hover:-translate-y-0.5"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ChefHat size={18} />}
                Lưu vào Nhật ký
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
