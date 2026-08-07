import { X, Globe, Download, Link, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { recipeService } from '../../services/recipeService';

export default function ShareRecipeModal({ isOpen, onClose, recipe, onStatusChanged }) {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !recipe) return null;

  const isPublic = recipe.status === 'PUBLIC';

  const handlePublish = async () => {
    if (isPublic) return; // Already public
    setLoadingStatus(true);
    try {
      const updated = await recipeService.changeStatus(recipe.id, 'PUBLIC');
      toast.success('Đã đăng công thức lên cộng đồng thành công!');
      if (onStatusChanged) onStatusChanged(updated);
      onClose();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi đăng tải');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleDownloadWord = async () => {
    setDownloading(true);
    try {
      const blob = await recipeService.exportToWord(recipe.id);
      // Create a link element, use it to download the blob, and then remove it
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cong_thuc_${recipe.title.replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải xuống file Word!');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xuất file Word');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Đã sao chép liên kết');
    });
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Chia sẻ công thức</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          
          {/* Đăng lên cộng đồng */}
          <button 
            onClick={handlePublish}
            disabled={isPublic || loadingStatus}
            className={`w-full flex items-center p-4 rounded-2xl transition-all border-2
              ${isPublic 
                ? 'bg-blue-50 border-blue-100 cursor-default opacity-80' 
                : 'bg-white border-gray-100 hover:border-[#a13923] hover:shadow-md'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 
              ${isPublic ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-[#a13923]'}`}>
              <Globe size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">Đăng lên cộng đồng</h4>
              <p className="text-sm text-gray-500">
                {isPublic ? 'Công thức đã được công khai' : 'Cho phép mọi người cùng xem và khám phá'}
              </p>
            </div>
            {isPublic && <Check className="text-blue-600" size={24} />}
          </button>

          {/* Tải file Word */}
          <button 
            onClick={handleDownloadWord}
            disabled={downloading}
            className="w-full flex items-center p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
              <Download size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-gray-900">Tải về file Word</h4>
              <p className="text-sm text-gray-500">{downloading ? 'Đang tạo file...' : 'Lưu trữ tài liệu và in ấn dễ dàng'}</p>
            </div>
          </button>

          {/* Mạng xã hội & Link */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 mb-2">
                {copied ? <Check size={20} className="text-green-500" /> : <Link size={20} />}
              </div>
              <span className="text-sm font-semibold text-gray-700">{copied ? 'Đã chép' : 'Copy Link'}</span>
            </button>

            <button 
              onClick={handleShareFacebook}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] shadow-sm flex items-center justify-center text-white mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <span className="text-sm font-semibold text-blue-800">Facebook</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
