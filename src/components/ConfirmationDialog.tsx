import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  actionType?: "danger" | "warning" | "success";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isLoading = false,
  loadingText = "Đang xóa...",
  actionType = "danger",
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const actionStyles = {
    danger: {
      button:
        "bg-rose-600 hover:bg-rose-500 focus:ring-rose-400 focus:ring-offset-surface",
    },
    warning: {
      button:
        "bg-amber-500 hover:bg-amber-400 focus:ring-amber-300 focus:ring-offset-surface",
    },
    success: {
      button:
        "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 focus:ring-offset-surface",
    },
  } as const;

  const { button: actionButtonClasses } =
    actionStyles[actionType] ?? actionStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-subtle bg-surface shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-300" />
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-surface-muted hover:text-primary"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 text-sm text-subtle">{message}</div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-subtle px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${actionButtonClasses}`}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
