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
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      button: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-400",
    },
    success: {
      button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
  } as const;

  const { button: actionButtonClasses } =
    actionStyles[actionType] ?? actionStyles.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${actionButtonClasses}`}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
