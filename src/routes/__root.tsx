import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks";

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
});
