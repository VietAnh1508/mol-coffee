import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ToastContext,
  type ToastState,
  type ToastType,
} from "./ToastContextDefinition";

const initialToastState: ToastState = {
  message: "",
  type: "success",
  isVisible: false,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(initialToastState);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({
        message,
        type,
        isVisible: true,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const showError = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  const value = useMemo(
    () => ({
      toast,
      showToast,
      hideToast,
      showSuccess,
      showError,
      showInfo,
    }),
    [toast, showToast, hideToast, showSuccess, showError, showInfo]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
