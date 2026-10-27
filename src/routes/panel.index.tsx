import { createFileRoute } from "@tanstack/react-router";
import { PanelShell } from "./panel";

export const Route = createFileRoute("/panel/")({
  component: PanelIndex,
});

function PanelIndex() {
  return <PanelShell />;
}
