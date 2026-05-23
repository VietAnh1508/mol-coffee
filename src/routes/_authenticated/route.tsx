import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { Spinner } from "../../components/Spinner";
import { useAuth } from "../../hooks/useAuth";

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
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
