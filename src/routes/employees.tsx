import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks";
import { EmployeesPage } from "../pages/EmployeesPage";

export const Route = createFileRoute("/employees")({
  component: EmployeesRoute,
});

function EmployeesRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <EmployeesPage />
    </Layout>
  );
}