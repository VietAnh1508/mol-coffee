import { createFileRoute, Navigate } from "@tanstack/react-router";
import { USER_ROLES } from "../../../constants/userRoles";
import { useAuth } from "../../../hooks";
import { PayrollEmployeeListPage } from "../../../pages/PayrollEmployeeListPage";
import { getCurrentYearMonth } from "../../../utils/payrollUtils";

export const Route = createFileRoute("/_authenticated/payroll/")({
  component: PayrollIndexRoute,
});

function PayrollIndexRoute() {
  const { user } = useAuth();

  // Auto-redirect employees to their own payroll detail page
  if (user?.role === USER_ROLES.EMPLOYEE) {
    const currentPeriod = getCurrentYearMonth();
    return (
      <Navigate
        to="/payroll/employee/$employeeId"
        params={{ employeeId: user.id }}
        search={{ period: currentPeriod }}
      />
    );
  }

  return <PayrollEmployeeListPage />;
}
