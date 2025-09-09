import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordPage } from "../../pages/ChangePasswordPage";

export const Route = createFileRoute("/_authenticated/change-password")({
  component: ChangePasswordRoute,
});

function ChangePasswordRoute() {
  return <ChangePasswordPage />;
}
