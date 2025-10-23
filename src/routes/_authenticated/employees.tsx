import { createFileRoute, Navigate } from "@tanstack/react-router";
import { canAccessManagement } from "../../constants/userRoles";
import { useAuth } from "../../hooks";
import { EmployeesPage } from "../../pages/EmployeesPage";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesRoute,
});

function EmployeesRoute() {
  const { user } = useAuth();

  if (!canAccessManagement(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <EmployeesPage />;
}
