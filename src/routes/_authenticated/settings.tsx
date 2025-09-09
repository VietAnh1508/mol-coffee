import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Layout } from "../../components/Layout";
import { USER_ROLES } from "../../constants/userRoles";
import { useAuth } from "../../hooks";
import { SettingsPage } from "../../pages/SettingsPage";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsRoute,
});

function SettingsRoute() {
  const { user } = useAuth();

  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
}
