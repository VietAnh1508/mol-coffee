import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../../../components/Layout";
import { PayrollEmployeeDetailPage } from "../../../../pages/PayrollEmployeeDetailPage";
import { getCurrentYearMonth } from "../../../../utils/payrollUtils";

interface PayrollEmployeeSearchParams {
  period?: string;
}

export const Route = createFileRoute(
  "/_authenticated/payroll/employee/$employeeId"
)({
  validateSearch: (
    search: Record<string, unknown>
  ): PayrollEmployeeSearchParams => {
    return {
      period: (search.period as string) || getCurrentYearMonth(),
    };
  },
  component: PayrollEmployeeDetailRoute,
});

function PayrollEmployeeDetailRoute() {
  const { employeeId } = Route.useParams();
  const { period } = Route.useSearch();

  return (
    <Layout>
      <PayrollEmployeeDetailPage employeeId={employeeId} period={period!} />
    </Layout>
  );
}
