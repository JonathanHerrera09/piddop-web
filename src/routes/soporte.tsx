import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/soporte")({
  beforeLoad: () => {
    throw redirect({
      to: "/legal/$page",
      params: { page: "soporte" },
      replace: true,
    });
  },
});
