import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <ForgotPasswordPage />;
}
