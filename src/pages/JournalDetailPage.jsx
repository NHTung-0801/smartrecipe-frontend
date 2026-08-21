import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { journalService } from '../services/journalService';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, Star, Calendar, Clock, NotebookPen, ExternalLink, Loader2, Users, Image, Edit2
} from 'lucide-react';
import AddJournalModal from '../components/recipe/AddJournalModal';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200';

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { 
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const getDirectionClasses = () => {
    switch (direction) {
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      case 'up': default: return 'translate-y-12';
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${getDirectionClasses()}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchJournal = async () => {
    try {
      const res = await journalService.getById(id);
      setJournal(res.data || res);
    } catch (error) {
      toast.error('Không tìm thấy nhật ký nấu ăn');
      navigate('/journal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 size={40} className="animate-spin text-[#a13923]" />
      </div>
    );
  }

  if (!journal) return null;

  const recipe = journal.recipe;
  const heroImage = recipe?.imageUrl || DEFAULT_IMAGE;
  const rating = journal.rating || 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-8 pb-20">
      {/* Header Actions */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/journal')}
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-600 hover:text-[#a13923] border border-[#f0e8df] hover:border-[#a13923] rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại Hành Trình
          </button>

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="group flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#a13923] to-[#8b311e] text-white hover:from-[#8b311e] hover:to-[#7a2a1a] rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
            {rating === 0 && !journal.iterationNotes && !journal.imageUrl ? 'Cập nhật khoảnh khắc' : 'Chỉnh sửa nhật ký'}
          </button>
        </div>
      </FadeIn>

      {/* Hero Banner (Recipe Image) */}
      <FadeIn delay={100}>
        <div className="relative w-full aspect-[21/9] md:aspect-[28/9] rounded-[1.5rem] overflow-hidden mb-6 shadow-lg">
          <img 
            src={heroImage} 
            alt={recipe?.title || "Công thức"} 
            className="w-full h-full object-cover"
          />
        
        {/* Glassmorphism Card inside Image */}
        <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 p-5 md:p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3d271d] mb-2 leading-tight">
              {recipe?.title || 'Món ăn không tên'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-[#3d271d]/80">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {formatDate(journal.cookedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {formatTime(journal.cookedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                {journal.actualServings} khẩu phần
              </span>
            </div>
          </div>

          {/* Rating (Lần nấu này) */}
          <div className="flex items-center gap-1 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                className={i < rating ? "text-[#a13923] fill-[#a13923]" : "text-[#a13923] opacity-20"} 
              />
            ))}
          </div>
        </div>
        </div>
      </FadeIn>

      {/* Thành quả sau khi nấu (User's Image) */}
      <FadeIn delay={200}>
        <div className="relative w-full aspect-[21/9] md:aspect-[28/9] rounded-[1.5rem] overflow-hidden mb-8 shadow-sm bg-[#fcf9f5] border border-[#f0e8df] flex items-center justify-center">
          {journal.imageUrl ? (
            <>
              <img 
                src={journal.imageUrl} 
                alt="Thành quả của tôi" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-[#a13923] shadow-sm">
                Thành quả sau khi nấu
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Image size={48} className="mb-2 opacity-30 text-[#3d271d]" />
              <span className="text-sm font-medium text-[#3d271d]/50">Chưa có ảnh thành quả</span>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Detail Blocks */}
      <div className="flex flex-col md:flex-row gap-6 items-start overflow-hidden">
        {/* Left Column: Notes */}
        <FadeIn delay={300} direction="left" className="flex-1 w-full min-w-0">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#f0e8df] h-full">
            <div className="flex items-center gap-2 mb-4">
              <NotebookPen size={20} className="text-[#a13923]" />
              <h2 className="text-xl font-bold text-[#3d271d]">Ghi chú chung</h2>
            </div>
            
            {journal.iterationNotes ? (
              <p className="text-[#3d271d]/80 leading-relaxed whitespace-pre-wrap text-[15px] font-medium break-words">
                {journal.iterationNotes}
              </p>
            ) : (
              <p className="text-gray-400 italic">Không có ghi chú nào cho lần nấu này.</p>
            )}
          </div>
        </FadeIn>

        {/* Right Column: Rating & Recipe Link */}
        <FadeIn delay={400} direction="right" className="w-full md:w-[320px] shrink-0">
          <div className="flex flex-col gap-6">
          
          {/* Average Rating Block */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#f0e8df]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Đánh giá tổng thể</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => {
                  const avg = journal.averageRating || 0;
                  const diff = avg - i;
                  if (diff >= 1) return <Star key={i} size={18} className="text-[#a13923] fill-[#a13923]" />;
                  if (diff > 0) return <Star key={i} size={18} className="text-[#a13923] fill-[#a13923] opacity-50" />;
                  return <Star key={i} size={18} className="text-gray-200" />;
                })}
              </div>
              <span className="text-xl font-black text-[#a13923]">
                {journal.averageRating ? `${journal.averageRating.toFixed(1)}/5` : '0/5'}
              </span>
            </div>
          </div>

          {/* Original Recipe Block */}
          {recipe && (
            <Link 
              to={`/recipes/${recipe.id}`}
              className="group bg-white p-5 rounded-3xl shadow-sm border border-[#f0e8df] hover:border-[#a13923] hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="text-xs font-bold text-[#a13923] mb-1 group-hover:text-[#8b311e] transition-colors">Công thức gốc</h3>
                <p className="text-[#3d271d] font-semibold text-sm line-clamp-1">{recipe.title}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#a13923] group-hover:bg-[#a13923] group-hover:text-white transition-colors">
                <ExternalLink size={16} />
              </div>
            </Link>
          )}

          </div>
        </FadeIn>
      </div>

      {/* Modal Cập nhật */}
      <AddJournalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        recipe={recipe}
        editJournal={journal}
        onSuccess={fetchJournal}
      />
    </div>
  );
}
