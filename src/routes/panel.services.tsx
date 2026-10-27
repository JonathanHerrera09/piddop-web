import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/services")({
  head: () => ({
    meta: [{ title: "Servicios — Piddop" }],
  }),
  component: ServicesPanel,
});

function ServicesPanel() {
  return <PanelShell moduleKey="srv" />;
}
