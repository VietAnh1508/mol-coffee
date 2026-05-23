import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <LoginPage />;
}
