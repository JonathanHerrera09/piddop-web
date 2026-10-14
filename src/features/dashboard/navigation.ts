import { UserCompanyMembership, WebSession } from '@/types/auth';

export interface NavigationItem {
  key: string;
  label: string;
  description: string;
}

export type NavigationKey =
  | 'dashboard'
  | 'commissions'
  | 'settlements'
  | 'companies'
  | 'company_users'
  | 'coverage'
  | 'customer_links'
  | 'customers'
  | 'categories'
  | 'coupons'
  | 'popups'
  | 'promotions'
  | 'drivers'
  | 'roles'
  | 'notifications'
  | 'email_templates'
  | 'payment_settings'
  | 'orders'
  | 'products'
  | 'variants'
  | 'team'
  | 'settings'
  | 'appointments'
  | 'services'
  | 'professionals'
  | 'schedules'
  | 'reviews';

const superAdminNavigation: NavigationItem[] = [
  { key: 'reviews', label: 'Calificaciones', description: 'Opiniones y comentarios de clientes' },
  { key: 'dashboard', label: 'Resumen', description: 'Metricas generales de plataforma' },
  { key: 'companies', label: 'Empresas', description: 'Activacion, comision y supervision' },
  { key: 'company_users', label: 'Usuarios de empresas', description: 'Propietarios, administradores y equipo' },
  { key: 'settlements', label: 'Liquidaciones', description: 'Pagos PSE, soportes PDF y trazabilidad' },
  { key: 'coverage', label: 'Cobertura', description: 'Mapa general de la vereda y area valida' },
  { key: 'customer_links', label: 'Enlaces de la app', description: 'Soporte, tienda, politicas y terminos' },
  { key: 'customers', label: 'Clientes', description: 'Actividad, bloqueos y datos del usuario final' },
  { key: 'categories', label: 'Categorias', description: 'Estructura publica del catalogo' },
  { key: 'coupons', label: 'Cupones', description: 'Promociones y descuentos' },
  { key: 'promotions', label: 'Promociones', description: 'Banners de inicio en la app' },
  { key: 'popups', label: 'Popups', description: 'Ventanas emergentes en la app' },
  { key: 'drivers', label: 'Domiciliarios', description: 'Gestion operativa de entregas' },
  { key: 'roles', label: 'Roles y permisos', description: 'Control de acceso de la plataforma' },
  { key: 'notifications', label: 'Notificaciones', description: 'Mensajes y alertas' },
  { key: 'payment_settings', label: 'Medios de pago', description: 'Wompi, PSE y URL de eventos' },
  { key: 'email_templates', label: 'Correos', description: 'Plantillas y pruebas de envío' }
];

const commerceNavigation: NavigationItem[] = [
  { key: 'reviews', label: 'Mis calificaciones y comentarios', description: 'Opiniones recibidas de clientes' },
  { key: 'dashboard', label: 'Resumen', description: 'Lectura diaria del negocio' },
  { key: 'commissions', label: 'Comisiones', description: 'Saldo, descuentos y detalle de cartera' },
  { key: 'orders', label: 'Pedidos', description: 'Estados y detalle de ordenes' },
  { key: 'products', label: 'Productos', description: 'Catalogo y disponibilidad' },
  { key: 'variants', label: 'Variantes', description: 'Opciones y combinaciones' },
  { key: 'team', label: 'Equipo', description: 'Usuarios y permisos internos' },
  { key: 'settings', label: 'Configuracion', description: 'Datos visibles de empresa' },
  { key: 'notifications', label: 'Notificaciones', description: 'Avisos del negocio' }
];

const servicesNavigation: NavigationItem[] = [
  { key: 'reviews', label: 'Mis calificaciones y comentarios', description: 'Opiniones recibidas de clientes' },
  { key: 'dashboard', label: 'Resumen', description: 'Lectura diaria del negocio' },
  { key: 'commissions', label: 'Comisiones', description: 'Saldo, descuentos y detalle de cartera' },
  { key: 'appointments', label: 'Citas', description: 'Reservas y estados del servicio' },
  { key: 'services', label: 'Servicios', description: 'Oferta y duraciones' },
  { key: 'professionals', label: 'Profesionales', description: 'Equipo operativo y perfiles' },
  { key: 'schedules', label: 'Horarios', description: 'Disponibilidad por profesional' },
  { key: 'team', label: 'Equipo', description: 'Usuarios y permisos internos' },
  { key: 'settings', label: 'Configuracion', description: 'Datos visibles de empresa' },
  { key: 'notifications', label: 'Notificaciones', description: 'Avisos del negocio' }
];

export function getNavigationForSession(session: WebSession, activeCompany: UserCompanyMembership | null) {
  if (session.user.role?.name === 'SUPER_ADMIN') {
    return superAdminNavigation;
  }

  const navigation = activeCompany?.company.type === 'services' ? servicesNavigation : commerceNavigation;
  if (!activeCompany) return [];

  return navigation.filter((item) => {
    if (item.key === 'notifications') return true;
    if (item.key === 'commissions') return ['owner', 'manager'].includes(String(activeCompany.primary_role || '').toLowerCase());
    const permissionCode: Partial<Record<NavigationKey, string>> = {
      dashboard: 'dashboard',
      orders: 'orders',
      products: 'products',
      variants: 'variants',
      appointments: 'appointments',
      services: 'services',
      professionals: 'professionals',
      schedules: 'schedules',
      settings: 'company_settings',
      team: 'company_team',
      reviews: 'orders'
    };
    const code = permissionCode[item.key as NavigationKey];
    return Boolean(code && activeCompany.roles.some((role) =>
      role.permissions?.some((permission) => permission.code === code && permission.view_permission !== false)
    ));
  });
}

export function getDefaultNavigationKey(
  session: WebSession,
  activeCompany: UserCompanyMembership | null
): NavigationKey {
  if (session.user.role?.name === 'SUPER_ADMIN') return 'companies';
  const visible = getNavigationForSession(session, activeCompany);
  const preferred = activeCompany?.company.type === 'services' ? 'appointments' : 'orders';
  return (visible.find((item) => item.key === preferred)?.key || visible[0]?.key || 'dashboard') as NavigationKey;
}
