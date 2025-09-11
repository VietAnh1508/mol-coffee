import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../hooks";
import { SignUpPage } from "../pages/SignUpPage";
import { Spinner } from "../components/Spinner";

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
