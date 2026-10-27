import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/appointments")({
  head: () => ({ meta: [{ title: "Citas — Piddop" }] }),
  component: AppointmentsPanel,
});

function AppointmentsPanel() {
  return <PanelShell moduleKey="apt" />;
}
