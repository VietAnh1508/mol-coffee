import { createFileRoute, Navigate } from "@tanstack/react-router";
import { canAccessManagement } from "../../constants/userRoles";
import { useAuth } from "../../hooks";
import { SettingsPage } from "../../pages/SettingsPage";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsRoute,
});

function SettingsRoute() {
  const { user } = useAuth();

  if (!canAccessManagement(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <SettingsPage />;
}
