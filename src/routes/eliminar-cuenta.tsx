import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/eliminar-cuenta")({
  beforeLoad: () => {
    throw redirect({
      to: "/legal/$page",
      params: { page: "eliminar-cuenta" },
      replace: true,
    });
  },
});
