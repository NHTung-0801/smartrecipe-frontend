import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isLoading ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-[24px] shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-outline-variant/20">
        {/* Icon */}
        <div
          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDestructive ? 'bg-primary/15' : 'bg-primary/10'
          }`}
        >
          <AlertTriangle
            size={24}
            className="text-primary"
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-base text-gray-600 text-center mb-8 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all disabled:opacity-50 shadow-sm active:translate-y-0.5 border border-outline-variant/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:translate-y-0.5 bg-primary hover:brightness-90"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}