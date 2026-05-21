import { createFileRoute } from "@tanstack/react-router";
import { ShiftRegistrationPage } from "../../pages/ShiftRegistrationPage";

export const Route = createFileRoute("/_authenticated/shift-registration")({
  component: ShiftRegistrationPage,
});
