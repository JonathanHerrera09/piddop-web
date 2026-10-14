import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DashboardWorkspace } from '@/features/dashboard/DashboardWorkspace';
import {
  getDefaultNavigationKey,
  getNavigationForSession,
  NavigationKey
} from '@/features/dashboard/navigation';
import { ToastHost } from '@/components/ToastHost';
import { logoutSession } from '@/services/auth.service';
import { createWebSocketClient } from '@/services/socket';
import { showToast } from '@/services/toast.service';
import { ThemeMode } from '@/services/theme.service';
import { UserCompanyMembership, WebSession } from '@/types/auth';

function SvgIcon({ children }: { children: ReactNode }) {
  return <svg aria-hidden="true" className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

function MenuIcon() { return <SvgIcon><path d="M4 6h16M4 12h16M4 18h16" /></SvgIcon>; }
function CloseIcon() { return <SvgIcon><path d="m6 6 12 12M18 6 6 18" /></SvgIcon>; }
function SunIcon() { return <SvgIcon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></SvgIcon>; }
function MoonIcon() { return <SvgIcon><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></SvgIcon>; }
function LogoutIcon() { return <SvgIcon><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></SvgIcon>; }

let orderAlertAudioContext: AudioContext | null = null;

async function playOrderAlert() {
  try {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return false;
    orderAlertAudioContext ||= new AudioContextConstructor();
    const context = orderAlertAudioContext;
    if (context.state === 'suspended') await context.resume();
    // Tres llamadas ascendentes: más urgentes y reconocibles que el tono anterior,
    // sin usar un volumen agresivo ni un archivo de audio externo.
    const gain = context.createGain();
    const start = context.currentTime;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.018);
    gain.gain.setValueAtTime(0.16, start + 0.46);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.56);
    gain.connect(context.destination);

    [0, 0.19, 0.38].forEach((offset) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(720, start + offset);
      oscillator.frequency.exponentialRampToValueAtTime(1540, start + offset + 0.145);
      oscillator.connect(gain);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.16);
    });
    return true;
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    orders: <><path d="M6 3h12v18H6z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    products: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    companies: <><path d="M3 21h18M5 21V5h10v16M15 9h4v12M8 8h4M8 12h4M8 16h4" /></>,
    company_users: <><path d="M3 21h18M5 21V5h10v16M15 10h4v11M8 9h4M8 13h4" /><circle cx="17" cy="6" r="2" /><path d="M14 10c.4-2 1.4-3 3-3s2.6 1 3 3" /></>,
    commissions: <><circle cx="12" cy="12" r="9" /><path d="M8 15h8M9 9h6M12 6v12" /></>,
    settlements: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></>,
    coverage: <><path d="M4 5h16v14H4z" /><path d="M8 15c1.5-3 3-3 4-6 1.5 3 2.5 4 4 1" /><circle cx="8" cy="9" r="1" /></>,
    customers: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.5-3.2 2.5-5 6-5s5.5 1.8 6 5M16 11a3 3 0 1 0 0-6M17 15c2.4.4 3.7 2 4 5" /></>,
    categories: <><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" /></>,
    coupons: <><path d="M4 7a2 2 0 0 0 0-4h16v4a2 2 0 0 0 0 4v4a2 2 0 0 0 0 4H4a2 2 0 0 0 0-4V7Z" /><path d="M12 7v.01M12 17v.01" /></>,
    promotions: <><path d="M3 6h18v12H3z" /><path d="m3 15 5-5 4 4 3-3 6 5" /></>,
    popups: <><path d="M4 5h16v12H4z" /><path d="m8 21 4-4 4 4M8 9h8M8 12h5" /></>,
    drivers: <><path d="M5 16h14l-1-6H6l-1 6ZM8 16v2M16 16v2M7 10l1-3h8l1 3" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></>,
    roles: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.5-3.2 2.5-5 6-5s5.5 1.8 6 5M16 8h5M18.5 5.5v5" /></>,
    variants: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="17" r="2" /></>,
    team: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 20c.5-3.2 2.5-5 6-5s5.5 1.8 6 5M15 15c2.8.3 4.5 1.8 5 4" /></>,
    appointments: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" /></>,
    services: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="8" cy="7" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="17" r="2" /></>,
    professionals: <><circle cx="12" cy="8" r="3" /><path d="M5 21c.6-4.2 2.9-6 7-6s6.4 1.8 7 6M18 4l.8 1.7L20.5 6l-1.7.8L18 8.5l-.8-1.7L15.5 6l1.7-.8L18 4Z" /></>,
    schedules: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2M5 4l-2 2M19 4l2 2" /></>,
    notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    email_templates: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6M17 3v4M15 5h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>,
  };
  return <SvgIcon>{paths[name] || <path d="M5 12h14M12 5l7 7-7 7" />}</SvgIcon>;
}

function navigationGroup(key: string) {
  if (['dashboard', 'notifications'].includes(key)) return 'General';
  if (['orders', 'appointments', 'commissions', 'settlements', 'drivers'].includes(key)) return 'Operación';
  if (['products', 'variants', 'categories', 'coupons', 'promotions', 'popups', 'services', 'professionals', 'schedules'].includes(key)) return 'Catálogo y servicios';
  return 'Administración';
}

interface DashboardShellProps {
  onCompanyChange: (companyId: number) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  session: WebSession;
  themeMode: ThemeMode;
}

export function DashboardShell({
  onCompanyChange,
  onLogout,
  onThemeToggle,
  session,
  themeMode
}: DashboardShellProps) {
  const activeCompany =
    session.companies.find((membership) => membership.company.id === session.activeCompanyId) || null;
  const [activeModule, setActiveModule] = useState<NavigationKey>(
    getDefaultNavigationKey(session, activeCompany)
  );
  const [realtimeSignal, setRealtimeSignal] = useState(0);
  const [socketMessage, setSocketMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('allora-order-sound-enabled') === 'true');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveModule(getDefaultNavigationKey(session, activeCompany));
    setMobileNavOpen(false);
  }, [activeCompany, session.user.role?.name]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('button, select')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const socket = createWebSocketClient(session.tokens.accessToken);

    function handleRealtimeMessage(message: string, title = 'Nuevo pedido') {
      setRealtimeSignal((current) => current + 1);
      setSocketMessage(message);
      showToast({ title, message, kind: 'info' });
      void playOrderAlert();
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, tag: 'allora-new-order' });
      }
    }

    function handleOrderCreated(payload: { order_id?: number }) {
      setRealtimeSignal((current) => current + 1);
      // El evento notification:new contiene el texto y activa el aviso. Este refresca los datos
      // incluso si una versión anterior del servidor solo enviara order:created.
      window.setTimeout(() => {
        setSocketMessage((message) => {
          if (message) return message;
          const fallback = `Tienes un pedido nuevo${payload.order_id ? ` #${payload.order_id}` : ''}.`;
          showToast({ title: 'Nuevo pedido', message: fallback, kind: 'info' });
          void playOrderAlert();
          return fallback;
        });
      }, 0);
    }

    function handleNotification(notification: { type?: string; title?: string; message?: string; data?: { order_id?: number } }) {
      if (notification.type !== 'ORDER_CREATED') return;
      handleRealtimeMessage(
        notification.message || `Tienes un pedido nuevo${notification.data?.order_id ? ` #${notification.data.order_id}` : ''}.`,
        notification.title || 'Nuevo pedido'
      );
    }

    socket.on('order:created', handleOrderCreated);
    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('notification:new', handleNotification);
      socket.disconnect();
    };
  }, [session.tokens.accessToken]);

  async function handleLogout() {
    await logoutSession(session.tokens.refreshToken);
    onLogout();
  }

  const navigationItems = getNavigationForSession(session, activeCompany);
  const roleTitle =
    session.user.role?.name === 'SUPER_ADMIN'
      ? 'Super Admin'
      : activeCompany?.company.type === 'services'
        ? 'Empresa de Servicios'
        : 'Empresa de Catalogo';

  const activeNavigationItem = navigationItems.find((item) => item.key === activeModule);

  function closeMobileNav() {
    setMobileNavOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  function companyMeta(company: UserCompanyMembership | null) {
    if (!company) {
      return 'Sin empresa seleccionada';
    }

    return `${company.company.name} | ${company.company.type}`;
  }

  function selectModule(key: NavigationKey) {
    setActiveModule(key);
    setMobileNavOpen(false);
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('.dashboard-main h1, .workspace-title')?.focus());
  }

  async function enableDesktopAlerts() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  async function enableOrderSound() {
    const played = await playOrderAlert();
    if (!played) {
      showToast({ title: 'No pudimos activar el sonido', message: 'Revisa que el navegador no esté silenciado.', kind: 'error' });
      return;
    }
    localStorage.setItem('allora-order-sound-enabled', 'true');
    setSoundEnabled(true);
    showToast({ title: 'Sonido activado', message: 'Escucharás esta alerta cuando llegue un pedido.', kind: 'success' });
  }

  function notificationActionLabel() {
    if (notificationPermission === 'granted') return 'Alertas activadas';
    if (notificationPermission === 'denied') return 'Alertas bloqueadas';
    // Aunque el navegador no admita notificaciones nativas, los avisos dentro
    // del panel (toast, sonido y tiempo real) siguen estando disponibles.
    if (notificationPermission === 'unsupported') return 'Avisos del panel activos';
    return 'Activar alertas';
  }

  return (
    <main className="dashboard-layout">
      <button
        className={`dashboard-backdrop ${mobileNavOpen ? 'is-visible' : ''}`}
        aria-label="Cerrar menú de navegación"
        onClick={closeMobileNav}
        tabIndex={mobileNavOpen ? 0 : -1}
        type="button"
      />
      <aside ref={drawerRef} className={`dashboard-sidebar ${mobileNavOpen ? 'is-open' : ''}`} id="dashboard-navigation" aria-label="Navegación principal">
        <div className="dashboard-sidebar__brand">
          <img className="dashboard-sidebar__logo" src="/piddop-icon.png" alt="Piddop" />
          <div>
            <p>Piddop</p>
            <strong>{roleTitle}</strong>
          </div>
          <button className="dashboard-sidebar__close" aria-label="Cerrar menú" onClick={closeMobileNav} type="button">
            <CloseIcon />
          </button>
        </div>

        {session.user.role?.name === 'COMPANY' ? (
          <div className="dashboard-company-panel">
            <label className="dashboard-company-panel__label" htmlFor="company-selector">
              Empresa activa
            </label>
            <select
              className="dashboard-company-panel__select"
              id="company-selector"
              onChange={(event) => {
                closeMobileNav();
                onCompanyChange(Number(event.target.value));
              }}
              value={session.activeCompanyId ?? ''}
            >
              {session.companies.map((membership) => (
                <option key={membership.company.id} value={membership.company.id}>
                  {membership.company.name}
                </option>
              ))}
            </select>
            <p className="dashboard-company-panel__meta">{companyMeta(activeCompany)}</p>
          </div>
        ) : null}

        <nav className="dashboard-nav" aria-label="Módulos del panel">
          {navigationItems.map((item, index) => (
            <div className="dashboard-nav__group" key={item.key}>
              {(index === 0 || navigationGroup(navigationItems[index - 1].key) !== navigationGroup(item.key)) ? <p className="dashboard-nav__group-title">{navigationGroup(item.key)}</p> : null}
              <button
                className={`dashboard-nav__item ${activeModule === item.key ? 'is-active' : ''}`}
                onClick={() => selectModule(item.key as NavigationKey)}
                type="button"
              >
                <span className="dashboard-nav__label"><NavIcon name={item.key} /><span>{item.label}</span></span>
                <small>{item.description}</small>
              </button>
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar__footer">
          <section className="dashboard-sidebar__alert-controls" aria-label="Preferencias de alertas">
            <p>Alertas</p>
            <button className="dashboard-sidebar__footer-action" onClick={() => void enableOrderSound()} type="button">
              {soundEnabled ? 'Probar sonido' : 'Activar sonido'}
            </button>
            <button
              className="dashboard-sidebar__footer-action"
              disabled={notificationPermission !== 'default'}
              onClick={() => void enableDesktopAlerts()}
              title={notificationPermission === 'unsupported' ? 'Este navegador no admite notificaciones nativas. Los avisos seguirán apareciendo dentro del panel.' : undefined}
              type="button"
            >
              {notificationActionLabel()}
            </button>
          </section>
          <button className="dashboard-sidebar__footer-action" onClick={onThemeToggle} type="button">
            {themeMode === 'dark' ? <SunIcon /> : <MoonIcon />}<span>{themeMode === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          <button className="dashboard-sidebar__footer-action dashboard-sidebar__footer-action--danger" onClick={() => void handleLogout()} type="button">
            <LogoutIcon /><span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-mobile-header">
          <button
            ref={menuButtonRef}
            className="icon-button dashboard-mobile-header__menu"
            aria-controls="dashboard-navigation"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            onClick={() => setMobileNavOpen((open) => !open)}
            type="button"
          >
            {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div className="dashboard-mobile-header__context">
            <strong>Piddop</strong>
            <span>{activeNavigationItem?.label || 'Panel'}</span>
          </div>
          <img className="dashboard-sidebar__logo dashboard-mobile-header__logo" src="/piddop-icon.png" alt="" aria-hidden="true" />
        </header>
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__eyebrow">Sesion activa</p>
            <h1 tabIndex={-1}>Hola, {session.user.name}</h1>
          </div>

          <div className="dashboard-header__actions">
            <button className="secondary-button" onClick={() => void enableOrderSound()} type="button">
              {soundEnabled ? 'Probar sonido' : 'Activar sonido'}
            </button>
            <button
              className="secondary-button"
              disabled={notificationPermission !== 'default'}
              onClick={() => void enableDesktopAlerts()}
              type="button"
            >
              {notificationActionLabel()}
            </button>
            <button className="theme-toggle" onClick={onThemeToggle} type="button">
              <span aria-hidden="true">{themeMode === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
              <strong>{themeMode === 'dark' ? 'Claro' : 'Oscuro'}</strong>
            </button>

            <button className="secondary-button" onClick={() => void handleLogout()} type="button">
              Cerrar sesion
            </button>
          </div>
        </header>

        {socketMessage ? (
          <section className="workspace-state" style={{ marginBottom: 20 }}>
            <div>
              <h2>Nuevo pedido</h2>
              <p>{socketMessage}</p>
            </div>
            <button className="secondary-button" onClick={() => setSocketMessage(null)} type="button">
              Cerrar
            </button>
          </section>
        ) : null}

        <DashboardWorkspace
          activeCompany={activeCompany}
          activeModule={activeModule}
          realtimeSignal={realtimeSignal}
          session={session}
        />
        <ToastHost />
      </section>
    </main>
  );
}
