import { useEffect } from "react";

export interface ToastProps {
  readonly message: string;
  readonly type: "success" | "error" | "info";
  readonly isVisible: boolean;
  readonly onClose: () => void;
  readonly duration?: number;
}

export function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [isVisible, onClose, duration]);

  if (!isVisible) {
    return null;
  }

  const bgColor = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-sky-600",
  }[type];

  const iconColor = {
    success: "text-emerald-100",
    error: "text-rose-100",
    info: "text-sky-100",
  }[type];

  return (
    <div className="fixed inset-x-0 top-6 z-[1050] flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl px-5 py-4 text-white shadow-xl shadow-black/10 transition-all duration-300 ${bgColor}`}
      >
        <span className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ${iconColor}`}>
          {type === "success" && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.78-9.47a.75.75 0 00-1.06-1.06L9 11.19 7.28 9.47a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "error" && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 10-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === "info" && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5.25a1 1 0 100 2 1 1 0 000-2zM9 9a1 1 0 000 2h.25v3a1 1 0 001 1H11a1 1 0 100-2h-.75v-3A1 1 0 009 9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>

        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring focus-visible:ring-white/50"
        >
          <span className="sr-only">Đóng thông báo</span>
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
