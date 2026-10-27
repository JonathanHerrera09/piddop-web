import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/schedules")({
  head: () => ({ meta: [{ title: "Horarios — Piddop" }] }),
  component: SchedulesPanel,
});

function SchedulesPanel() {
  return <PanelShell moduleKey="sch" />;
}
