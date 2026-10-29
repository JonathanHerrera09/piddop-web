import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  Star,
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  Map,
  Link2,
  LifeBuoy,
  UserRound,
  Tags,
  Ticket,
  MessageSquare,
  Megaphone,
  Bike,
  ShieldCheck,
  Bell,
  CreditCard,
  Mail,
  Wallet,
  ShoppingBag,
  Package,
  Layers,
  UsersRound,
  Settings,
  CalendarCheck,
  Scissors,
  UserCog,
  CalendarClock,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Volume2,
  BellRing,
} from "lucide-react";
import * as A from "@/components/panel/modules-admin";
import * as B from "@/components/panel/modules-business";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { PanelAccessGate } from "@/components/auth/panel-access-gate";
import { EmptyState } from "@/components/panel/async-state";
import { useSession } from "@/providers/session-provider";
import { z } from "zod";
import { defaultModule, isSuperAdmin, navigationFor, type ModuleKey } from "@/lib/navigation";
import { createWebSocketClient } from "@/services/socket";
import {
  notificationPermissionGranted,
  requestNotificationPermission,
  showNotification,
} from "@/lib/notifications";

export const Route = createFileRoute("/panel")({
  validateSearch: z.object({ module: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Panel — Piddop" },
      {
        name: "description",
        content: "Módulos de administración Piddop para Super Admin y empresas.",
      },
      { property: "og:title", content: "Panel — Piddop" },
      {
        property: "og:description",
        content: "Módulos de administración Piddop para Super Admin y empresas.",
      },
    ],
  }),
  component: PanelLayout,
});

type Item = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  render: () => JSX.Element;
};

export const moduleSlugs: Record<ModuleKey, string> = {
  rat: "ratings",
  sum: "summary",
  co: "companies",
  usr: "users",
  pse: "settlements",
  cov: "coverage",
  lnk: "app-links",
  sup: "support",
  cli: "customers",
  cat: "categories",
  cup: "coupons",
  pop: "popups",
  pro: "promotions",
  dom: "couriers",
  rol: "roles",
  not: "notifications",
  pay: "payment-methods",
  mail: "email-center",
  com: "commissions",
  ord: "orders",
  prd: "products",
  var: "variants",
  team: "team",
  set: "settings",
  apt: "appointments",
  srv: "services",
  prf: "professionals",
  sch: "schedules",
};
function useItems(
  isAdmin: boolean,
  isServices: boolean,
  companyName: string,
  go: (k: ModuleKey) => void,
): Item[] {
  if (isAdmin)
    return [
      { key: "rat", label: "Calificaciones", icon: Star, render: () => <A.Ratings /> },
      {
        key: "sum",
        label: "Resumen general",
        icon: LayoutDashboard,
        render: () => <A.AdminSummary />,
      },
      {
        key: "co",
        label: "Empresas",
        icon: Building2,
        render: () => <A.Companies openUsers={() => go("usr")} />,
      },
      {
        key: "usr",
        label: "Usuarios de empresas",
        icon: Users,
        render: () => <A.TeamUsers admin />,
      },
      { key: "pse", label: "Liquidaciones PSE", icon: Receipt, render: () => <A.Settlements /> },
      { key: "cov", label: "Cobertura general", icon: Map, render: () => <A.Coverage /> },
      { key: "lnk", label: "Enlaces de la app", icon: Link2, render: () => <A.AppLinks /> },
      { key: "sup", label: "Soporte", icon: LifeBuoy, render: () => <A.Support /> },
      { key: "cli", label: "Clientes", icon: UserRound, render: () => <A.Clients /> },
      { key: "cat", label: "Categorías", icon: Tags, render: () => <A.Categories /> },
      { key: "cup", label: "Cupones", icon: Ticket, render: () => <A.Coupons /> },
      { key: "pop", label: "Popups", icon: MessageSquare, render: () => <A.Popups /> },
      { key: "pro", label: "Promociones", icon: Megaphone, render: () => <A.Popups banner /> },
      { key: "dom", label: "Domiciliarios", icon: Bike, render: () => <A.Couriers /> },
      { key: "rol", label: "Roles y permisos", icon: ShieldCheck, render: () => <A.RolesPerms /> },
      { key: "not", label: "Notificaciones", icon: Bell, render: () => <A.Notifications /> },
      { key: "pay", label: "Medios de pago", icon: CreditCard, render: () => <A.PaymentMethods /> },
      { key: "mail", label: "Centro de correos", icon: Mail, render: () => <A.EmailCenter /> },
    ];
  const svc = isServices;
  const name = companyName;
  return [
    {
      key: "rat",
      label: "Mis calificaciones",
      icon: Star,
      render: () => <A.Ratings scope={name} />,
    },
    {
      key: "sum",
      label: "Resumen del negocio",
      icon: LayoutDashboard,
      render: () => <B.BizSummary services={svc} />,
    },
    { key: "com", label: "Comisiones y cartera", icon: Wallet, render: () => <B.Commissions /> },
    ...(svc
      ? [
          { key: "apt", label: "Citas", icon: CalendarCheck, render: () => <B.Appointments /> },
          { key: "srv", label: "Servicios", icon: Scissors, render: () => <B.Services /> },
          { key: "prf", label: "Profesionales", icon: UserCog, render: () => <B.Professionals /> },
          { key: "sch", label: "Horarios", icon: CalendarClock, render: () => <B.Schedules /> },
        ]
      : [
          { key: "ord", label: "Pedidos", icon: ShoppingBag, render: () => <B.Orders /> },
          { key: "prd", label: "Productos", icon: Package, render: () => <B.Products /> },
          { key: "var", label: "Variantes", icon: Layers, render: () => <B.Variants /> },
        ]),
    { key: "team", label: "Equipo", icon: UsersRound, render: () => <A.TeamUsers /> },
    {
      key: "set",
      label: "Configuración",
      icon: Settings,
      render: () => <B.BizSettings name={name} />,
    },
    { key: "not", label: "Notificaciones", icon: Bell, render: () => <A.Notifications /> },
  ];
}

function PanelLayout() {
  return (
    <PanelAccessGate>
      <Outlet />
    </PanelAccessGate>
  );
}

export function PanelShell({ moduleKey }: { moduleKey?: ModuleKey }) {
  const nav = useNavigate();
  const location = useLocation();
  const { logout, session: restoredSession, setActiveCompany } = useSession();
  const module = moduleKey ?? new URLSearchParams(location.search).get("module") ?? undefined;
  const { dark, toggle } = useTheme();
  const [active, setActive] = useState<ModuleKey | null>((module as ModuleKey | undefined) ?? null);
  const [menu, setMenu] = useState(false);
  const [sound, setSound] = useState(false);
  const [alerts, setAlerts] = useState<"off" | "on">("off");

  // PanelAccessGate only renders this component after a session was restored.
  const session = restoredSession!;
  const activeCompany =
    session.companies.find((membership) => membership.company.id === session.activeCompanyId) ??
    null;
  const admin = isSuperAdmin(session);
  const services = activeCompany?.company.type === "services";
  const companyName = activeCompany?.company.name ?? "Plataforma";
  const allowedNavigation = navigationFor(session, activeCompany);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    setSound(window.localStorage.getItem("piddop-panel-sound") === "on");
    void notificationPermissionGranted().then((granted) => setAlerts(granted ? "on" : "off"));
  }, []);

  const playAlert = () => {
    try {
      const alertAudio = new Audio("/alerta-piddop.wav");
      alertAudio.volume = 0.7;
      void alertAudio.play().catch(() => undefined);
    } catch {
      // The visual toast remains available if the browser blocks audio.
    }
  };

  const openModule = (key: ModuleKey) => {
    setActive(key);
    setMenu(false);
    void nav({ to: "/panel/$module", params: { module: moduleSlugs[key] } });
  };
  const allItems = useItems(admin, Boolean(services), companyName, openModule);
  const items = allItems.filter((item) =>
    allowedNavigation.some((navigation) => navigation.key === item.key),
  );
  // A URL directa debe representar exactamente el módulo solicitado. Si el rol perdió
  // permiso, el API mostrará su mensaje de acceso en vez de redirigir silenciosamente
  // a otra pantalla y aparentar que Servicios no existe.
  const forcedItem = moduleKey ? allItems.find((item) => item.key === moduleKey) : undefined;
  const current = forcedItem ?? items.find((item) => item.key === active) ?? items[0];

  useEffect(() => {
    const requested = module as ModuleKey | undefined;
    if (moduleKey) {
      setActive(moduleKey);
      return;
    }
    const next = allowedNavigation.some((item) => item.key === requested)
      ? requested
      : defaultModule(session, activeCompany);
    setActive(next);
    if (next && next !== requested) {
      void nav({ to: "/panel/$module", params: { module: moduleSlugs[next] }, replace: true });
    }
  }, [activeCompany, allowedNavigation, module, moduleKey, nav, session]);

  useEffect(() => {
    if (activeCompany || admin) return;
    void nav({ to: "/", replace: true });
  }, [activeCompany, admin, nav]);

  useEffect(() => {
    const socket = createWebSocketClient(session.tokens.accessToken);
    const notify = (payload: {
      title?: string;
      message?: string;
      data?: { order_id?: number };
    }) => {
      toast.info(payload.title ?? "Nueva notificación", {
        description:
          payload.message ??
          (payload.data?.order_id
            ? `Nuevo pedido #${payload.data.order_id}`
            : "Tienes una novedad en el panel."),
      });
    };
    const notifyWithPreferences = (payload: Parameters<typeof notify>[0]) => {
      notify(payload);
      if (sound) playAlert();
      if (alerts === "on")
        void showNotification(
          payload.title ?? "Nueva notificación",
          payload.message ?? "Tienes una novedad en el panel.",
        );
    };
    socket.on("notification:new", notifyWithPreferences);
    socket.on("order:created", (payload: { order_id?: number }) =>
      notifyWithPreferences({ title: "Nuevo pedido", data: payload }),
    );
    return () => {
      socket.off("notification:new", notifyWithPreferences);
      socket.off("order:created");
      socket.disconnect();
    };
  }, [alerts, session.tokens.accessToken, sound]);

  if (!current) {
    return (
      <main className="p-4 md:p-8">
        <EmptyState
          title="No tienes módulos disponibles"
          description="Tu cuenta no tiene permisos de visualización para esta empresa."
        />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {menu && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          menu ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="font-display text-2xl font-bold">
            pidd<span className="text-primary">o</span>p<span className="text-accent">.</span>
          </span>
          <button className="lg:hidden" onClick={() => setMenu(false)} aria-label="Cerrar menú">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest opacity-50">
            {admin ? "Perfil activo" : "Empresa activa"}
          </p>
          {admin ? (
            <div className="flex h-10 items-center rounded-lg border border-sidebar-border bg-sidebar-accent px-3 text-sm text-sidebar-foreground">
              Super Admin · Plataforma
            </div>
          ) : session.companies.length > 1 ? (
            <select
              value={activeCompany?.company.id ?? ""}
              onChange={(event) => setActiveCompany(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-sidebar-border bg-sidebar-accent px-3 text-sm text-sidebar-foreground outline-none"
            >
              {session.companies.map((membership) => (
                <option key={membership.company.id} value={membership.company.id}>
                  {membership.company.name} ·{" "}
                  {membership.company.type === "services" ? "Servicios" : "Catálogo"}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-sidebar-border bg-sidebar-accent px-3 text-sm text-sidebar-foreground">
              {companyName}
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={() => {
                openModule(i.key);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                current.key === i.key
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "opacity-75 hover:bg-sidebar-accent hover:opacity-100",
              )}
            >
              <i.icon className="size-4" />
              {i.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => {
              void logout().finally(() => nav({ to: "/", replace: true }));
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-75 hover:bg-sidebar-accent hover:opacity-100"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <button
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
            onClick={() => setMenu(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
          <p className="truncate text-sm text-muted-foreground">
            {admin ? "Plataforma" : companyName} /{" "}
            <span className="font-semibold text-foreground">{current.label}</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                const enabled = !sound;
                setSound(enabled);
                window.localStorage.setItem("piddop-panel-sound", enabled ? "on" : "off");
                if (enabled) playAlert();
                toast(enabled ? "Sonido activado" : "Sonido desactivado");
              }}
              className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted sm:flex"
            >
              <Volume2 className="size-3.5" />
              {sound ? "Desactivar sonido" : "Activar sonido"}
            </button>
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission();
                setAlerts(granted ? "on" : "off");
                if (granted) toast.success("Alertas activadas");
                else toast.error("No se concedió permiso para las alertas.");
              }}
              className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted sm:flex"
            >
              <BellRing className="size-3.5" />
              {alerts === "on" ? "Alertas activadas" : "Activar alertas"}
            </button>
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              {dark ? "Claro" : "Oscuro"}
            </button>
          </div>
        </header>
        <main
          key={`${activeCompany?.company.id ?? "platform"}-${current.key}`}
          className="flex-1 p-4 animate-in fade-in slide-in-from-bottom-2 md:p-8"
        >
          {current.render()}
        </main>
      </div>
    </div>
  );
}
