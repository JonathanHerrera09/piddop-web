import { createFileRoute, notFound } from "@tanstack/react-router";
import { moduleSlugs, PanelShell } from "./panel";
import type { ModuleKey } from "@/lib/navigation";

const keyBySlug = Object.fromEntries(
  Object.entries(moduleSlugs).map(([key, slug]) => [slug, key as ModuleKey]),
);

export const Route = createFileRoute("/panel/$module")({
  component: ModulePanel,
});

function ModulePanel() {
  const { module } = Route.useParams();
  const moduleKey = keyBySlug[module];
  if (!moduleKey) throw notFound();
  return <PanelShell moduleKey={moduleKey} />;
}
