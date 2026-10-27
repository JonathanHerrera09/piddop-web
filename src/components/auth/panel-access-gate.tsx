import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoadingState } from "@/components/panel/async-state";
import { useSession } from "@/providers/session-provider";

export function PanelAccessGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { status } = useSession();

  useEffect(() => {
    if (status === "anonymous") void navigate({ to: "/", replace: true });
  }, [navigate, status]);

  if (status !== "authenticated")
    return (
      <main className="p-4 md:p-8">
        <LoadingState label="Verificando tu sesión..." />
      </main>
    );
  return <>{children}</>;
}
