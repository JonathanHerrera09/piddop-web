import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  loginWithEmail,
  logoutSession,
  restoreWebSession,
  updateStoredSession,
} from "@/services/auth.service";
import type { WebSession } from "@/types/auth";

type SessionStatus = "booting" | "authenticated" | "anonymous";
type SessionContextValue = {
  session: WebSession | null;
  status: SessionStatus;
  login: (email: string, password: string) => Promise<WebSession>;
  logout: () => Promise<void>;
  setActiveCompany: (companyId: number) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WebSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("booting");

  useEffect(() => {
    let mounted = true;
    void restoreWebSession()
      .then((nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        setStatus(nextSession ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (mounted) setStatus("anonymous");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      status,
      async login(email, password) {
        const nextSession = await loginWithEmail(email, password);
        setSession(nextSession);
        setStatus("authenticated");
        return nextSession;
      },
      async logout() {
        await logoutSession(session);
        setSession(null);
        setStatus("anonymous");
      },
      setActiveCompany(companyId) {
        if (!session?.companies.some((membership) => membership.company.id === companyId)) return;
        const nextSession = { ...session, activeCompanyId: companyId };
        updateStoredSession(nextSession);
        setSession(nextSession);
      },
    }),
    [session, status],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider.");
  return context;
}
