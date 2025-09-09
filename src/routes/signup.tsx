import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../hooks";
import { SignUpPage } from "../pages/SignUpPage";

export const Route = createFileRoute("/signup")({
  component: SignUpRoute,
});

function SignUpRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <SignUpPage />;
}
