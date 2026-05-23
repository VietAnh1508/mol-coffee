import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";

function RootComponent() {
  const { toast, hideToast } = useToast();

  return (
    <>
      <Outlet />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <p className="text-gray-600">Đã xảy ra lỗi. Vui lòng tải lại trang.</p>
      <button
        className="px-4 py-2 bg-amber-600 text-white rounded-lg"
        onClick={() => window.location.reload()}
      >
        Tải lại
      </button>
    </div>
  ),
});
