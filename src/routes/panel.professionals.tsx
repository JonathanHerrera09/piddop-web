import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/professionals")({
  head: () => ({ meta: [{ title: "Profesionales — Piddop" }] }),
  component: ProfessionalsPanel,
});

function ProfessionalsPanel() {
  return <PanelShell moduleKey="prf" />;
}
