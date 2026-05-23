import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { SignUpPage } from "../pages/SignUpPage";

export const Route = createFileRoute("/signup")({
  component: SignUpRoute,
});

function SignUpRoute() {
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

  return <SignUpPage />;
}
