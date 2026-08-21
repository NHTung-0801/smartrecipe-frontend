import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { journalService } from '../services/journalService';
import { toast } from 'react-toastify';
import { 
  ChefHat, Star, Loader2, ChevronLeft, ChevronRight, Search 
} from 'lucide-react';
import AddJournalModal from '../components/recipe/AddJournalModal';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600';

function formatTimeAndDay(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  
  // Calculate if it's today or yesterday or a weekday
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = (today - dateOnly) / (1000 * 60 * 60 * 24);
  
  let dayStr = '';
  if (diffDays === 0) dayStr = 'HÔM NAY';
  else if (diffDays === 1) dayStr = 'HÔM QUA';
  else {
    const days = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    dayStr = days[d.getDay()];
  }

  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${dayStr} • ${timeStr}`;
}

const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function CookingJournalPage() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState(null);
  const navigate = useNavigate();

  const fetchJournals = async (p = 0) => {
    setLoading(true);
    try {
      const result = await journalService.getAll(p, 10);
      setJournals(result.data?.content || []);
      setTotalPages(result.data?.totalPages || 0);
      setPage(p);
    } catch (error) {
      toast.error('Có lỗi khi tải nhật ký nấu ăn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals(0);
  }, []);

  const groupedJournals = journals.reduce((acc, journal) => {
    const d = new Date(journal.cookedAt);
    const key = `THÁNG ${d.getMonth() + 1}, ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(journal);
    return acc;
  }, {});

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-10 relative">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#a13923] mb-3">Hành Trình Ẩm Thực</h1>
          <p className="text-gray-600">Hành trình lưu giữ những hương vị và kỷ niệm ẩm thực của riêng bạn.</p>
        </div>
      </FadeIn>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#a13923]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && journals.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-[#f0e8df]">
          <div className="w-20 h-20 bg-[#efebe7] rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat size={36} className="text-[#a13923] opacity-60" />
          </div>
          <h3 className="text-xl font-bold text-[#3d271d] mb-2">Chưa có nhật ký nào</h3>
          <p className="text-gray-500 mb-6">Hãy ghi lại những khoảnh khắc nấu nướng tuyệt vời của bạn.</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && journals.length > 0 && (
        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#a13923]/30 -translate-x-1/2"></div>

          {Object.entries(groupedJournals).map(([monthYear, items]) => (
            <div key={monthYear} className="mb-12 relative">
              {/* Month Pill */}
              <FadeIn delay={100}>
                <div className="flex justify-center mb-10 relative z-10">
                  <div className="px-6 py-2 bg-white text-[#a13923] font-bold text-sm tracking-wider rounded-full shadow-md border border-[#a13923]/10">
                    {monthYear}
                  </div>
                </div>
              </FadeIn>

              {/* Items */}
              <div className="flex flex-col gap-12">
                {items.map((journal, index) => {
                  const isEven = index % 2 === 0;
                  const imageUrl = journal.imageUrl || journal.recipe?.imageUrl || DEFAULT_IMAGE;
                  
                  return (
                    <FadeIn key={journal.id} delay={150}>
                      <div className="relative flex items-center justify-center group cursor-pointer" onClick={() => navigate(`/journal/${journal.id}`)}>
                        {/* Dot */}
                        <div className="absolute left-1/2 w-4 h-4 rounded-full bg-[#a13923] border-4 border-[#fff5f2] -translate-x-1/2 z-10 group-hover:scale-125 transition-transform shadow-md"></div>

                        <div className={`w-full flex ${isEven ? 'flex-row' : 'flex-row-reverse'} items-center gap-12`}>
                          {/* Text Card */}
                          <div className={`w-1/2 flex ${isEven ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-[90%] bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-[#f0e8df] text-center ${isEven ? 'mr-4' : 'ml-4'}`}>
                              <div className="text-xs font-bold text-[#a13923] tracking-widest uppercase mb-3">
                                {formatTimeAndDay(journal.cookedAt)}
                              </div>
                              <h3 className="text-xl font-bold text-[#3d271d] mb-3 line-clamp-2">
                                {journal.recipe?.title}
                              </h3>
                              {journal.iterationNotes && (
                                <p className="text-gray-600 text-sm italic line-clamp-3 mb-4">
                                  "{journal.iterationNotes}"
                                </p>
                              )}
                              {journal.rating > 0 && (
                                <div className="flex items-center justify-center gap-1 text-sm font-bold text-[#3d271d]">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < journal.rating ? "text-[#a13923] fill-[#a13923]" : "text-gray-300"} />
                                  ))}
                                  <span className="ml-2">{journal.rating.toFixed(1)}</span>
                                </div>
                              )}
                              {(!journal.rating && !journal.iterationNotes) && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setJournalToEdit(journal); }}
                                  className="mt-2 text-xs md:text-sm text-gray-500 hover:text-[#a13923] hover:bg-orange-50 border border-dashed border-gray-300 hover:border-[#a13923] rounded-xl px-4 py-3 transition-colors w-full"
                                >
                                  Chưa có đánh giá & nhận xét. 
                                  <br />Nhấn vào để thêm
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Image Card */}
                          <div className={`w-1/2 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                            <div className={`w-[90%] aspect-[4/3] rounded-3xl overflow-hidden shadow-md ${isEven ? 'ml-4' : 'mr-4'}`}>
                              <img src={imageUrl} alt="Food" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-16 relative z-10">
          <button
            onClick={() => fetchJournals(page - 1)}
            disabled={page === 0}
            className="w-10 h-10 rounded-xl bg-white shadow text-[#3d271d] flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-xl shadow">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchJournals(page + 1)}
            disabled={page >= totalPages - 1}
            className="w-10 h-10 rounded-xl bg-white shadow text-[#3d271d] flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 bg-[#a13923] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-[#8b311e] transition-all hover:-translate-y-1 font-bold flex items-center gap-2 z-50 border-4 border-white"
      >
        <ChefHat size={20} />
        New Entry
      </button>

      <AddJournalModal
        isOpen={isModalOpen || !!journalToEdit}
        onClose={() => { setIsModalOpen(false); setJournalToEdit(null); }}
        recipe={null} 
        editJournal={journalToEdit}
        onSuccess={() => fetchJournals(page)}
      />
    </div>
  );
}
