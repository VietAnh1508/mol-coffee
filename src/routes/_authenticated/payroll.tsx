import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { PayrollPage } from "../../pages/PayrollPage";

export const Route = createFileRoute("/_authenticated/payroll")({
  component: PayrollRoute,
});

function PayrollRoute() {
  return (
    <Layout>
      <PayrollPage />
    </Layout>
  );
}
