import { useEffect, useState } from 'react';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { DashboardShell } from '@/features/dashboard/DashboardShell';
import { restoreWebSession, subscribeToSessionUpdates, updateStoredSession } from '@/services/auth.service';
import { applyThemeMode, readThemeMode, saveThemeMode, ThemeMode } from '@/services/theme.service';
import { WebSession } from '@/types/auth';
import { LegalPages } from '@/features/legal/LegalPages';

export function App() {
  const legalRoute = window.location.pathname.replace(/\/+$/, '') || '/';
  if (legalRoute === '/terminos-condiciones') return <LegalPages page="terms" />;
  if (legalRoute === '/politica-privacidad') return <LegalPages page="privacy" />;
  if (legalRoute === '/autorizacion-datos') return <LegalPages page="data-authorization" />;
  if (legalRoute === '/eliminar-cuenta') return <LegalPages page="account-deletion" />;
  if (legalRoute === '/soporte') return <LegalPages page="support" />;

  const [session, setSession] = useState<WebSession | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => subscribeToSessionUpdates((nextSession) => setSession(nextSession)), []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const nextThemeMode = readThemeMode();
        const nextSession = await restoreWebSession();

        if (mounted) {
          setThemeMode(nextThemeMode);
          applyThemeMode(nextThemeMode);
          setSession(nextSession);
        }
      } finally {
        if (mounted) {
          setIsBooting(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  function handleThemeToggle() {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    saveThemeMode(nextMode);
  }

  function handleCompanyChange(companyId: number) {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextSession = { ...current, activeCompanyId: companyId };
      updateStoredSession(nextSession);
      return nextSession;
    });
  }

  useEffect(() => {
    if (session) {
      updateStoredSession(session);
    }
  }, [session]);

  if (isBooting) {
    return (
      <main className="boot-screen">
        <img className="boot-screen__mark" src="/piddop-icon.png" alt="Piddop" />
        <h1>Piddop</h1>
        <p>Preparando tu panel...</p>
      </main>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} onThemeToggle={handleThemeToggle} themeMode={themeMode} />;
  }

  return (
    <DashboardShell
      onCompanyChange={handleCompanyChange}
      onLogout={() => setSession(null)}
      onThemeToggle={handleThemeToggle}
      session={session}
      themeMode={themeMode}
    />
  );
}
