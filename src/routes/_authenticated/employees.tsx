import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { USER_ROLES } from "../../constants/userRoles";
import { useAuth } from "../../hooks";
import { EmployeesPage } from "../../pages/EmployeesPage";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesRoute,
});

function EmployeesRoute() {
  const { user } = useAuth();

  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <EmployeesPage />
    </Layout>
  );
}
