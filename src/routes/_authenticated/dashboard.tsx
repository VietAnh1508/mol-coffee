import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { DashboardPage } from "../../pages/DashboardPage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
}
