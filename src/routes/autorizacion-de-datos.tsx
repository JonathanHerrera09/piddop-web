import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/autorizacion-de-datos")({
  beforeLoad: () => {
    throw redirect({
      to: "/legal/$page",
      params: { page: "datos" },
      replace: true,
    });
  },
});
