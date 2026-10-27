import type { UserCompanyMembership, WebSession } from "@/types/auth";

export type ModuleKey =
  | "rat"
  | "sum"
  | "co"
  | "usr"
  | "pse"
  | "cov"
  | "lnk"
  | "sup"
  | "cli"
  | "cat"
  | "cup"
  | "pop"
  | "pro"
  | "dom"
  | "rol"
  | "not"
  | "pay"
  | "mail"
  | "com"
  | "ord"
  | "prd"
  | "var"
  | "team"
  | "set"
  | "apt"
  | "srv"
  | "prf"
  | "sch";

type NavigationRule = {
  key: ModuleKey;
  label: string;
  permission?: string;
  ownerManagerOnly?: boolean;
};

const adminItems: NavigationRule[] = [
  { key: "rat", label: "Calificaciones" },
  { key: "sum", label: "Resumen general" },
  { key: "co", label: "Empresas" },
  { key: "usr", label: "Usuarios de empresas" },
  { key: "pse", label: "Liquidaciones PSE" },
  { key: "cov", label: "Cobertura general" },
  { key: "lnk", label: "Enlaces de la app" },
  { key: "sup", label: "Soporte" },
  { key: "cli", label: "Clientes" },
  { key: "cat", label: "Categorías" },
  { key: "cup", label: "Cupones" },
  { key: "pop", label: "Popups" },
  { key: "pro", label: "Promociones" },
  { key: "dom", label: "Domiciliarios" },
  { key: "rol", label: "Roles y permisos" },
  { key: "not", label: "Notificaciones" },
  { key: "pay", label: "Medios de pago" },
  { key: "mail", label: "Centro de correos" },
];

const catalogItems: NavigationRule[] = [
  { key: "rat", label: "Mis calificaciones", permission: "orders" },
  { key: "sum", label: "Resumen del negocio", permission: "dashboard" },
  { key: "com", label: "Comisiones y cartera", ownerManagerOnly: true },
  { key: "ord", label: "Pedidos", permission: "orders" },
  { key: "prd", label: "Productos", permission: "products" },
  { key: "var", label: "Variantes", permission: "variants" },
  { key: "team", label: "Equipo", permission: "company_team" },
  { key: "set", label: "Configuración", permission: "company_settings" },
  { key: "not", label: "Notificaciones" },
];

const servicesItems: NavigationRule[] = [
  { key: "rat", label: "Mis calificaciones", permission: "orders" },
  { key: "sum", label: "Resumen del negocio", permission: "dashboard" },
  { key: "com", label: "Comisiones y cartera", ownerManagerOnly: true },
  { key: "apt", label: "Citas", permission: "appointments" },
  { key: "srv", label: "Servicios", permission: "services" },
  { key: "prf", label: "Profesionales", permission: "professionals" },
  { key: "sch", label: "Horarios", permission: "schedules" },
  { key: "team", label: "Equipo", permission: "company_team" },
  { key: "set", label: "Configuración", permission: "company_settings" },
  { key: "not", label: "Notificaciones" },
];

function canView(company: UserCompanyMembership, permissionCode: string) {
  return company.roles.some((role) =>
    role.permissions?.some(
      (permission) => permission.code === permissionCode && permission.view_permission !== false,
    ),
  );
}

export function isSuperAdmin(session: WebSession) {
  return session.user.role?.name === "SUPER_ADMIN";
}

export function navigationFor(
  session: WebSession,
  company: UserCompanyMembership | null,
): NavigationRule[] {
  if (isSuperAdmin(session)) return adminItems;
  if (!company) return [];
  const base = company.company.type === "services" ? servicesItems : catalogItems;
  const primaryRole = company.primary_role.toLowerCase();
  return base.filter((item) => {
    if (item.key === "not") return true;
    if (item.ownerManagerOnly) return ["owner", "manager"].includes(primaryRole);
    return Boolean(item.permission && canView(company, item.permission));
  });
}

export function defaultModule(
  session: WebSession,
  company: UserCompanyMembership | null,
): ModuleKey | null {
  const items = navigationFor(session, company);
  const preferred = isSuperAdmin(session)
    ? "sum"
    : company?.company.type === "services"
      ? "apt"
      : "ord";
  return items.find((item) => item.key === preferred)?.key ?? items[0]?.key ?? null;
}
