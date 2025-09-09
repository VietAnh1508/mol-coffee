import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // We'll check authentication in the component since beforeLoad doesn't have access to hooks
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
