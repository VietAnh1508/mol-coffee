import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../hooks";
import { LoginPage } from "../pages/LoginPage";
import { Spinner } from "../components/Spinner";

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
