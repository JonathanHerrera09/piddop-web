import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terminos-y-condiciones")({
  beforeLoad: () => {
    throw redirect({
      to: "/legal/$page",
      params: { page: "terminos" },
      replace: true,
    });
  },
});
