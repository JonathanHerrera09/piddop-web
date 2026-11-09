import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-privacidad")({
  beforeLoad: () => {
    throw redirect({
      to: "/legal/$page",
      params: { page: "privacidad" },
      replace: true,
    });
  },
});
