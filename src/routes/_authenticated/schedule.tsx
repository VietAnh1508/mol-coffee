import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { SchedulePage } from "../../pages/SchedulePage";

export const Route = createFileRoute("/_authenticated/schedule")({
  component: ScheduleRoute,
});

function ScheduleRoute() {
  return (
    <Layout>
      <SchedulePage />
    </Layout>
  );
}
