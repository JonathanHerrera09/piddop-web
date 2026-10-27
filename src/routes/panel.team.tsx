import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/team")({
  head: () => ({ meta: [{ title: "Equipo — Piddop" }] }),
  component: TeamPanel,
});

function TeamPanel() {
  return <PanelShell moduleKey="team" />;
}
