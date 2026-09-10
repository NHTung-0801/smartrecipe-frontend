import React, { useState, useEffect } from 'react';
import { BookOpen, X, Sparkles, ChefHat, Flame, Clock, CheckCircle2 } from 'lucide-react';

export default function EditorialStoryBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpenModal(false);
    };
    if (isOpenModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpenModal]);

  return (
    <>
      {/* ─── Editorial Banner ─── */}
      <section className="relative my-8 rounded-[28px] overflow-hidden shadow-xl border border-stone-800 bg-stone-950 text-white">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
            alt="Nghệ thuật áp chảo bít tết"
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-transparent to-stone-950/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-10 max-w-2xl flex flex-col justify-between min-h-[300px]">
          <div className="space-y-3.5">
            {/* Category Pill */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                <ChefHat size={14} className="text-amber-400" />
                Góc Bếp Trưởng • Kỹ thuật nấu nướng
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock size={12} /> 3 phút đọc
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-2xl md:text-3xl font-extrabold text-stone-50 leading-snug tracking-tight font-[family-name:var(--sr-font-heading)]">
              Bí quyết từ Bếp trưởng: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Nghệ thuật kiểm soát nhiệt</span> khi áp chảo bít tết
            </h3>

            {/* Excerpt */}
            <p className="text-sm md:text-base text-stone-300 line-clamp-2 md:line-clamp-3 leading-relaxed">
              Bít tết mềm mọng không chỉ đến từ thăn bò đắt tiền, mà cốt lõi nằm ở nhiệt độ chảo gang, thời điểm hạ bơ tỏi thảo mộc và khoảng "thời gian nghỉ" vàng (resting time) giúp giữ trọn vẹn từng giọt nước ngọt tự nhiên.
            </p>
          </div>

          {/* Footer with Chef Info & CTA */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-bold text-amber-300 text-sm shadow-md">
                TA
              </div>
              <div>
                <div className="text-sm font-bold text-stone-100">Chef Tuấn Anh</div>
                <div className="text-xs text-stone-400">Cố vấn ẩm thực Smart Recipe</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--sr-primary)] to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              <BookOpen size={16} />
              Đọc bài viết chuyên sâu
            </button>
          </div>
        </div>
      </section>

      {/* ─── Read Article Modal ─── */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-[zoomIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 md:p-8 bg-stone-900 text-white flex-shrink-0">
              <div className="absolute inset-0 opacity-25 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80"
                  alt="Steak cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors shadow-md z-20"
                aria-label="Đóng bài viết"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40">
                  <ChefHat size={14} /> Chuyên mục Bí Quyết Bếp Nhà
                </div>
                <h2 className="text-xl md:text-2xl font-bold leading-snug font-[family-name:var(--sr-font-heading)]">
                  Bí quyết từ Bếp trưởng: Nghệ thuật kiểm soát nhiệt độ khi áp chảo bít tết
                </h2>
                <div className="flex items-center gap-4 text-xs text-stone-300 pt-1">
                  <span>Tác giả: <strong>Chef Tuấn Anh</strong></span>
                  <span>•</span>
                  <span>Thời gian đọc: 3 phút</span>
                  <span>•</span>
                  <span>Kỹ năng: Trung cấp</span>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-stone-700 leading-relaxed font-[family-name:var(--sr-font-body)]">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                <Sparkles size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 font-medium italic">
                  "Một miếng bít tết hoàn hảo phải sở hữu lớp vỏ ngoài nâu cánh gián giòn thơm (phản ứng Maillard) nhưng bên trong vẫn giữ nguyên màu hồng ngọc mọng nước. Dưới đây là 4 quy tắc vàng bất biến."
                </p>
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--sr-primary)] text-white text-xs flex items-center justify-center font-bold">1</span>
                  Đưa thịt về nhiệt độ phòng trước khi áp chảo (Room Temperature)
                </h3>
                <p className="text-sm text-stone-600 pl-8">
                  Sai lầm phổ biến nhất là lấy thịt từ ngăn mát tủ lạnh và cho ngay lên chảo. Miếng thịt lạnh buốt sẽ lập tức kéo tụt nhiệt độ chảo gang, làm nước thịt tiết ra và thịt bị luộc chín thay vì áp chảo xém vàng. Hãy lấy thịt ra trước <strong>20 - 30 phút</strong>, dùng khăn giấy thấm thật khô bề mặt thịt.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--sr-primary)] text-white text-xs flex items-center justify-center font-bold">2</span>
                  Chảo gang bốc khói nhẹ (Smoking Hot Pan)
                </h3>
                <p className="text-sm text-stone-600 pl-8">
                  Sử dụng chảo gang hoặc chảo đáy dày giữ nhiệt tốt. Làm nóng chảo đến khi bắt đầu thấy làn khói mỏng bốc lên. Cho một muỗng dầu ăn có điểm khói cao (như dầu hướng dương hoặc bơ Ghee). Đặt miếng thịt xuống và bạn sẽ nghe thấy tiếng "xèo" vang ròn rã - đó là âm thanh của lớp vỏ giòn caramel hóa. Áp chảo mỗi mặt khoảng <strong>2 đến 2.5 phút</strong> tuỳ độ dày.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--sr-primary)] text-white text-xs flex items-center justify-center font-bold">3</span>
                  Kỹ thuật Arrosé (Rưới bơ tỏi & thảo mộc nóng)
                </h3>
                <p className="text-sm text-stone-600 pl-8">
                  Khi lật mặt thịt thứ hai được 1 phút, hãy hạ nhỏ lửa. Thả vào chảo 2-3 thìa bơ lạt nguyên chất, vài tép tỏi đập dập nguyên vỏ và 2 nhánh hương thảo (rosemary) hoặc cỏ xạ hương (thyme). Nghiêng chảo và dùng muỗng liên tục múc bơ thơm sôi sủi bọt rưới đều lên mặt thịt. Hương thảo mộc và bơ ngậy sẽ ngấm sâu vào từng thớ thịt.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--sr-primary)] text-white text-xs flex items-center justify-center font-bold">4</span>
                  Thời gian nghỉ (Resting Time) - Bí mật giữ trọn nước ngọt
                </h3>
                <p className="text-sm text-stone-600 pl-8">
                  Tuyệt đối <strong>không cắt thịt ngay</strong> khi vừa nhấc ra khỏi chảo! Nhiệt độ cao đang dồn toàn bộ nước ngọt vào tâm miếng thịt. Hãy gắp thịt ra đĩa hoặc thớt gỗ ấm và để nghỉ <strong>5 - 7 phút</strong>. Trong thời gian này, các sợi cơ thư giãn và phân bổ nước ngọt đều khắp miếng thịt. Khi thái, nước ngọt sẽ không bị chảy lênh láng ra ngoài.
                </p>
              </div>

              {/* Bottom Pro Tip */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-1">
                <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Mẹo nêm gia vị chuẩn
                </div>
                <p className="text-xs text-stone-600">
                  Chỉ nên rắc muối biển hạt to (kosher salt) và tiêu đen xay vỡ ngay trước khi cho vào chảo tối đa 2 phút. Rắc muối quá sớm sẽ hút ẩm ra bề mặt khiến thịt bị ướt và khó tạo lớp vỏ giòn.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Chia sẻ từ Bếp trưởng Tuấn Anh • Smart Recipe Culinary Team
              </span>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold transition-colors"
              >
                Đã hiểu, đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
