import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PaginationControls, } from '@/components/PaginationControls';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CopyActionButton } from '@/components/CopyActionButton';
import { DestructiveButton } from '@/components/DestructiveButton';
import { RolesPanel as ExtractedRolesPanel } from '@/features/dashboard/RolesPanel';
import { TeamPanel as ExtractedTeamPanel } from '@/features/dashboard/TeamPanel';
import { CoverageMapEditor } from '@/features/dashboard/CoverageMapEditor';
import { CompanyLocationPicker } from '@/features/dashboard/CompanyLocationPicker';
import { isPointWithinCoverage } from '@/features/dashboard/coverage.utils';
import { InvoiceOrdersPanel } from '@/features/dashboard/InvoiceOrdersPanel';
import { AdminCompanyTeamPanel, AdminCompanyUsersModule } from '@/features/dashboard/AdminCompanyTeamPanel';
import { EmailTemplatesPanel } from '@/features/dashboard/EmailTemplatesPanel';
import { WompiSettingsPanel } from '@/features/dashboard/WompiSettingsPanel';
import { IngredientLibraryPicker } from '@/features/dashboard/IngredientLibraryPicker';
import { ReviewsPanel } from '@/features/dashboard/ReviewsPanel';
import { NavigationKey } from '@/features/dashboard/navigation';
import { API_URL } from '@/services/http';
import {
  activateAdminCustomer,
  clearAdminCustomerOrders,
  eraseAdminCustomerData,
  createAdminCompany,
  createAdminCoupon,
  createAdminCategory,
  getAdminCustomers,
  getAdminCoverageSettings,
  getAdminCustomerLinksSettings,
  getAdminWompiSettings,
  createAdminDriver,
  createAdminPopup,
  createAdminHomePromotion,
  createCompanyProfessional,
  createCompanyProfessionalSchedule,
  createCompanyProduct,
  createCompanyProductIngredient,
  createCompanyService,
  createCompanyVariant,
  deleteAdminCoupon,
  deleteAdminCategory,
  deleteAdminPopup,
  deleteAdminHomePromotion,
  deleteCompanyProfessional,
  deleteCompanyProfessionalSchedule,
  deleteCompanyVariant,
  deleteCompanyProductImage,
  deleteCompanyProductIngredient,
  duplicateCompanyProduct,
  duplicateCompanyVariant,
  getAdminCompanies,
  getAllAdminCompanies,
  getAdminCoupons,
  getAdminCategories,
  getAdminDashboard,
  getAdminDrivers,
  getAdminPopups,
  getAdminHomePromotions,
  getAdminRoles,
  getAdminReviews,
  getAdminPermissions,
  getCompanyTeam,
  getCompanyAssignableRoles,
  getCompanyAppointments,
  getCompanyDashboard,
  getCompanyIngredientLibrary,
  getCompanyOrders,
  getCompanyReviews,
  getCompanyProfessionals,
  getCompanyProducts,
  getCompanyServices,
  getCompanyWalletTransactions,
  getAdminSettlements,
  getCompanyVariants,
  getOwnCompanyProfile,
  getPublicCoverageSettings,
  getPublicCategories,
  getUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
  transitionCompanyOrderStatus,
  uploadAdminCategoryIcon,
  uploadAdminPopupImage,
  uploadAdminHomePromotionImage,
  uploadOwnCompanyLogo,
  uploadCompanyProfessionalPhoto,
  uploadCompanyProductImages,
  updateAdminCoverageSettings,
  updateAdminCustomerLinksSettings,
  updateCompanyAppointmentStatus,
  updateOwnCompanyProfile,
  updateAdminCompany,
  updateAdminCompanyCommission,
  updateAdminCompanyStatus,
  updateAdminCoupon,
  updateAdminCategory,
  updateAdminPopup,
  updateAdminHomePromotion,
  updateCompanyProfessional,
  updateCompanyProfessionalSchedule,
  updateCompanyProduct,
  updateCompanyProductIngredient,
  updateCompanyService,
  updateCompanyVariant,
  getAdminSupportTickets,
  updateAdminSupportTicketStatus
} from '@/services/dashboard.service';
import type { AdminPermission, AdminRole, CompanyAssignableRole, CompanyTeamMember, ListOptions, PaginationMeta, SupportTicket } from '@/services/dashboard.service';

type PaginationContextValue = { meta?: PaginationMeta; search: string; onSearch: (search: string) => void; onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void };
const PaginationContext = createContext<PaginationContextValue>({ search: '', onSearch: () => undefined, onPageChange: () => undefined, onPageSizeChange: () => undefined });
import { ApiError } from '@/services/http';
import { showToast } from '@/services/toast.service';
import { UserCompanyMembership, WebSession } from '@/types/auth';
import {
  AdminCompanyPayload,
  AdminCustomerSummary,
  AdminCoupon,
  AdminDriver,
  AdminPopup,
  AdminHomePromotion,
  AdminDashboardData,
  AppointmentSummary,
  CompanyVariant,
  CompanyDashboardData,
  CompanyCoverageBoundary,
  CompanyOrder,
  CompanyProduct,
  IngredientLibraryItem,
  CompanyService,
  CompanySummary,
  GlobalCoverageSettings,
  ProfessionalSchedule,
  ProfessionalSummary,
  PublicCategory,
  UserNotification,
  WalletTransactionSummary,
  CompanySettlement,
  WompiSettings
  , CompanyReview
} from '@/types/dashboard';

interface DashboardWorkspaceProps {
  activeCompany: UserCompanyMembership | null;
  activeModule: NavigationKey;
  realtimeSignal: number;
  session: WebSession;
}

interface WorkspaceState {
  adminCompanies: CompanySummary[];
  adminCustomers: AdminCustomerSummary[];
  adminCoupons: AdminCoupon[];
  adminDrivers: AdminDriver[];
  adminPopups: AdminPopup[];
  adminPromotions: AdminHomePromotion[];
  adminDashboard: AdminDashboardData | null;
  globalCoverage: GlobalCoverageSettings | null;
  appointments: AppointmentSummary[];
  categories: PublicCategory[];
  companyDashboard: CompanyDashboardData | null;
  companyCoverage: CompanyCoverageBoundary | null;
  companyProfile: CompanySummary | null;
  notifications: UserNotification[];
  orders: CompanyOrder[];
  professionals: ProfessionalSummary[];
  products: CompanyProduct[];
  services: CompanyService[];
  variants: CompanyVariant[];
  walletTransactions: WalletTransactionSummary[];
  adminRoles: AdminRole[];
  permissions: AdminPermission[];
  team: CompanyTeamMember[];
  companyRoles: CompanyAssignableRole[];
  settlements: CompanySettlement[];
  wompiSettings: WompiSettings | null;
  reviews: CompanyReview[];
  reviewSummary: { count: number; average: number; distribution: Record<number, number> } | null;
}

const initialState: WorkspaceState = {
  adminCompanies: [],
  adminCustomers: [],
  adminCoupons: [],
  adminDrivers: [],
  adminPopups: [],
  adminPromotions: [],
  adminDashboard: null,
  globalCoverage: null,
  appointments: [],
  categories: [],
  companyDashboard: null,
  companyCoverage: null,
  companyProfile: null,
  notifications: [],
  orders: [],
  professionals: [],
  products: [],
  services: [],
  variants: [],
  walletTransactions: [],
  adminRoles: [],
  permissions: [],
  team: [],
  companyRoles: [],
  settlements: [],
  wompiSettings: null,
  reviews: [],
  reviewSummary: null
};

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const dayFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium'
});

const scheduleDayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' }
] as const;

function formatMoney(value: number | string | null | undefined) {
  return currency.format(Number(value || 0));
}

function formatDate(value: string | undefined) {
  if (!value) {
    return '--';
  }

  return dateFormatter.format(new Date(value));
}

function formatAppointmentDay(date: string, startTime: string) {
  return dayFormatter.format(new Date(`${date}T${startTime}`));
}

function companyVisibleOrderTotal(order: Pick<CompanyOrder, 'subtotal' | 'discount' | 'total'>) {
  if (order.subtotal == null) {
    return Number(order.total || 0);
  }

  return Number(order.subtotal || 0) - Number(order.discount || 0);
}

function formatPercent(value: number | string | null | undefined) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function walletStatusCopy(status: string) {
  if (status === 'active') return 'Saldo saludable';
  if (status === 'low_balance') return 'Saldo bajo';
  if (status === 'insufficient_balance') return 'Sin saldo';
  return status;
}

function walletTransactionLabel(type: WalletTransactionSummary['type']) {
  const labels: Record<WalletTransactionSummary['type'], string> = {
    adjustment: 'Ajuste',
    bonus: 'Bono',
    manual_credit: 'Credito manual',
    manual_debit: 'Debito manual',
    order_commission: 'Comision cobrada',
    refund: 'Reintegro',
    topup: 'Recarga'
  };

  return labels[type] || type;
}

function walletTransactionDetail(transaction: WalletTransactionSummary) {
  if (transaction.type !== 'order_commission') return null;

  const metadata = transaction.metadata || {};
  const saleAmount = Number(metadata.sale_amount);
  const commissionRate = Number(metadata.commission_percentage);
  const orderNumber = typeof metadata.order_number === 'string' ? metadata.order_number : null;

  if (!Number.isFinite(saleAmount)) {
    return orderNumber ? `Pedido ${orderNumber}. El domicilio no se incluye en esta comision.` : null;
  }

  const rateText = Number.isFinite(commissionRate) ? ` x ${formatPercent(commissionRate)}` : '';
  return `Venta del negocio: ${formatMoney(saleAmount)}${rateText}. El domicilio no se incluye.`;
}

function orderSummary(order: CompanyOrder) {
  if (!order.items?.length) {
    return 'Sin detalle';
  }

  return order.items.map((item) => `${item.quantity}x ${item.product_name}`).join(', ');
}

export function DashboardWorkspace(props: DashboardWorkspaceProps) {
  const [listOptions, setListOptions] = useState<ListOptions>({ page: 1, page_size: 20 });
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const value = { meta: pagination, search: listOptions.search || '', onSearch: (search: string) => setListOptions((current) => ({ ...current, search, page: 1 })), onPageChange: (page: number) => setListOptions((current) => ({ ...current, page })), onPageSizeChange: (page_size: number) => setListOptions((current) => ({ ...current, page: 1, page_size })) };
  return <PaginationContext.Provider value={value}><DashboardWorkspaceContent {...props} listOptions={listOptions} setListOptions={setListOptions} setPagination={setPagination} /></PaginationContext.Provider>;
}

function DashboardWorkspaceContent({
  activeCompany,
  activeModule,
  realtimeSignal,
  session,
  listOptions,
  setListOptions,
  setPagination
}: DashboardWorkspaceProps & { listOptions: ListOptions; setListOptions: React.Dispatch<React.SetStateAction<ListOptions>>; setPagination: React.Dispatch<React.SetStateAction<PaginationMeta | undefined>> }) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => { setListOptions({ page: 1, page_size: 20 }); setPagination(undefined); }, [activeCompany?.company.id, activeModule]);

  useEffect(() => {
    let isMounted = true;

    async function loadModule() {
      setIsLoading(true);
      setError(null);
      if (['dashboard', 'coverage', 'settings'].includes(activeModule)) setPagination(undefined);

      try {
        if (session.user.role?.name === 'SUPER_ADMIN') {
          if (activeModule === 'reviews') {
            const [reviews, adminCompanies] = await Promise.all([
              getAdminReviews(session.tokens.accessToken, listOptions),
              getAllAdminCompanies(session.tokens.accessToken)
            ]);
            setPagination(reviews.pagination);
            if (isMounted) setState((current) => ({ ...current, reviews, adminCompanies }));
          } else if (activeModule === 'dashboard') {
            const adminDashboard = await getAdminDashboard(session.tokens.accessToken);
            if (isMounted) {
              setState((current) => ({ ...current, adminDashboard }));
            }
          } else if (activeModule === 'companies') {
            const adminCompanies = await getAdminCompanies(session.tokens.accessToken, listOptions); setPagination(adminCompanies.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, adminCompanies }));
            }
          } else if (activeModule === 'company_users') {
            const adminCompanies = await getAdminCompanies(session.tokens.accessToken, { page: 1, page_size: 100, sort: 'name' });
            if (isMounted) setState((current) => ({ ...current, adminCompanies }));
          } else if (activeModule === 'settlements') {
            const [settlements, adminCompanies] = await Promise.all([
              getAdminSettlements(session.tokens.accessToken, listOptions),
              getAdminCompanies(session.tokens.accessToken, { page: 1, page_size: 100 })
            ]);
            if (isMounted) {
              setPagination(settlements.pagination);
              setState((current) => ({ ...current, settlements, adminCompanies }));
            }
          } else if (activeModule === 'categories') {
            const categories = await getAdminCategories(session.tokens.accessToken, listOptions); setPagination(categories.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, categories }));
            }
          } else if (activeModule === 'coverage') {
            const globalCoverage = await getAdminCoverageSettings(session.tokens.accessToken);
            if (isMounted) {
              setState((current) => ({ ...current, globalCoverage }));
            }
          } else if (activeModule === 'customers') {
            const adminCustomers = await getAdminCustomers(session.tokens.accessToken, listOptions); setPagination(adminCustomers.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, adminCustomers }));
            }
          } else if (activeModule === 'coupons') {
            const [adminCoupons, adminCompanies, categories] = await Promise.all([
              getAdminCoupons(session.tokens.accessToken, listOptions),
              getAdminCompanies(session.tokens.accessToken, { page: 1, page_size: 100 }),
              getAdminCategories(session.tokens.accessToken, { page: 1, page_size: 100 })
            ]);
            if (isMounted) {
              setPagination(adminCoupons.pagination); setState((current) => ({ ...current, adminCompanies, adminCoupons, categories }));
            }
          } else if (activeModule === 'popups') {
            const adminPopups = await getAdminPopups(session.tokens.accessToken, listOptions); setPagination(adminPopups.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, adminPopups }));
            }
          } else if (activeModule === 'promotions') {
            const adminPromotions = await getAdminHomePromotions(session.tokens.accessToken);
            if (isMounted) {
              setState((current) => ({ ...current, adminPromotions }));
            }
          } else if (activeModule === 'drivers') {
            const adminDrivers = await getAdminDrivers(session.tokens.accessToken, listOptions); setPagination(adminDrivers.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, adminDrivers }));
            }
          } else if (activeModule === 'roles') {
            const [adminRoles, permissions] = await Promise.all([getAdminRoles(session.tokens.accessToken, listOptions), getAdminPermissions(session.tokens.accessToken)]);
            setPagination(adminRoles.pagination);
            if (isMounted) setState((current) => ({ ...current, adminRoles, permissions }));
          } else if (activeModule === 'notifications') {
            const notifications = await getUserNotifications(session.tokens.accessToken, 50, listOptions); setPagination(notifications.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, notifications }));
            }
          } else if (activeModule === 'payment_settings') {
            const wompiSettings = await getAdminWompiSettings(session.tokens.accessToken);
            if (isMounted) setState((current) => ({ ...current, wompiSettings }));
          }
        } else if (activeCompany) {
          if (activeModule === 'notifications') {
            const notifications = await getUserNotifications(session.tokens.accessToken, 50, listOptions); setPagination(notifications.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, notifications }));
            }
          } else
          if (activeModule === 'dashboard' || activeModule === 'commissions') {
            const walletOptions = activeModule === 'commissions' ? listOptions : { page: 1, page_size: 5 };
            const [companyDashboard, walletTransactions] = await Promise.all([
              getCompanyDashboard(session.tokens.accessToken, activeCompany.company.id),
              getCompanyWalletTransactions(session.tokens.accessToken, activeCompany.company.id, walletOptions)
            ]);
            if (isMounted) { setPagination(activeModule === 'commissions' ? walletTransactions.pagination : undefined); setState((current) => ({ ...current, companyDashboard, walletTransactions })); }

            if (activeCompany.company.type === 'services') {
              const appointments = await getCompanyAppointments(
                session.tokens.accessToken,
                activeCompany.company.id, listOptions
              );

              if (isMounted) {
                setState((current) => ({ ...current, appointments }));
              }
            }
          } else if (activeModule === 'reviews') {
            const reviews = await getCompanyReviews(session.tokens.accessToken, activeCompany.company.id, listOptions); setPagination(reviews.pagination);
            if (isMounted) setState((current) => ({ ...current, reviews: reviews.reviews, reviewSummary: reviews.summary }));
          } else if (activeModule === 'orders') {
            const orders = await getCompanyOrders(session.tokens.accessToken, activeCompany.company.id, listOptions); setPagination(orders.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, orders }));
            }
          } else if (activeModule === 'products') {
            const products = await getCompanyProducts(
              session.tokens.accessToken,
              activeCompany.company.id, listOptions
            );
            const categories = await getPublicCategories();
            const variants = await getCompanyVariants(
              session.tokens.accessToken,
              activeCompany.company.id, { page: 1, page_size: 100 }
            );
            setPagination(products.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, categories, products, variants }));
            }
          } else if (activeModule === 'variants') {
            const variants = await getCompanyVariants(
              session.tokens.accessToken,
              activeCompany.company.id, listOptions
            );
            setPagination(variants.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, variants }));
            }
          } else if (activeModule === 'appointments') {
            const appointments = await getCompanyAppointments(
              session.tokens.accessToken,
              activeCompany.company.id, listOptions
            );
            setPagination(appointments.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, appointments }));
            }
          } else if (activeModule === 'services') {
            const services = await getCompanyServices(
              session.tokens.accessToken,
              activeCompany.company.id, listOptions
            );
            const professionals = await getCompanyProfessionals(
              session.tokens.accessToken,
              activeCompany.company.id, { page: 1, page_size: 100 }
            );
            setPagination(services.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, professionals, services }));
            }
          } else if (activeModule === 'professionals' || activeModule === 'schedules') {
            const professionals = await getCompanyProfessionals(
              session.tokens.accessToken,
              activeCompany.company.id, listOptions
            );
            setPagination(professionals.pagination);
            if (isMounted) {
              setState((current) => ({ ...current, professionals }));
            }
          } else if (activeModule === 'settings') {
            const [companyProfile, companyCoverage] = await Promise.all([
              getOwnCompanyProfile(session.tokens.accessToken, activeCompany.company.id),
              getPublicCoverageSettings()
            ]);
            if (isMounted) {
              setState((current) => ({ ...current, companyCoverage, companyProfile }));
            }
          } else if (activeModule === 'team') {
            const [team, companyRoles] = await Promise.all([getCompanyTeam(session.tokens.accessToken, activeCompany.company.id, listOptions), getCompanyAssignableRoles(session.tokens.accessToken, activeCompany.company.id)]);
            setPagination(team.pagination);
            if (isMounted) setState((current) => ({ ...current, team, companyRoles }));
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : 'No pudimos cargar este modulo en este momento.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadModule();

    return () => {
      isMounted = false;
    };
  }, [activeCompany, activeModule, listOptions, localRefresh, realtimeSignal, session.tokens.accessToken, session.user.role?.name]);

  if (isLoading) {
    return (
      <section className="workspace-state" aria-busy="true" aria-live="polite" role="status">
        <div className="workspace-state__spinner" />
        <div>
          <h2>Cargando modulo</h2>
          <p>Estamos preparando la información de esta sección.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="workspace-state workspace-state--error" role="alert">
        <div>
          <h2>No pudimos cargar este modulo</h2>
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={() => { setError(null); setLocalRefresh((value) => value + 1); }}>Reintentar</button>
        </div>
      </section>
    );
  }

  if (session.user.role?.name === 'SUPER_ADMIN') {
    if (activeModule === 'reviews') return <ModuleSection description="Consulta y filtra las calificaciones y comentarios hechos por clientes." title="Calificaciones de empresas"><ReviewsPanel admin companies={state.adminCompanies} onCompanyChange={(companyId) => setListOptions((current) => ({ ...current, company_id: companyId || undefined, page: 1 }))} reviews={state.reviews} selectedCompanyId={listOptions.company_id ? Number(listOptions.company_id) : undefined} /></ModuleSection>;
    if (activeModule === 'dashboard' && state.adminDashboard) {
      return (
        <ModuleSection
          description="Vista ejecutiva de la plataforma, comisiones y actividad reciente."
          title="Resumen general"
        >
          <AdminDashboardPanel data={state.adminDashboard} />
        </ModuleSection>
      );
    }

    if (activeModule === 'companies') {
      return (
        <ModuleSection
          description="Gestion centralizada de negocios registrados en la plataforma."
          title="Empresas"
        >
          <AdminCompaniesPanel
            accessToken={session.tokens.accessToken}
            companies={state.adminCompanies}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'company_users') {
      return (
        <ModuleSection
          description="Crea las cuentas que administran cada negocio y asigna sus responsabilidades."
          title="Usuarios de empresas"
        >
          <AdminCompanyUsersModule accessToken={session.tokens.accessToken} companies={state.adminCompanies} />
        </ModuleSection>
      );
    }

    if (activeModule === 'settlements') {
      return (
        <ModuleSection description="Emite liquidaciones por periodo, evita pagos duplicados y conserva el soporte PDF." title="Liquidaciones PSE">
          <InvoiceOrdersPanel accessToken={session.tokens.accessToken} onChanged={() => setLocalRefresh((value) => value + 1)} />
        </ModuleSection>
      );
    }

    if (activeModule === 'categories') {
      return (
        <ModuleSection
          description="Categorias globales para comida, productos y servicios."
          title="Categorias"
        >
          <AdminCategoriesPanel
            accessToken={session.tokens.accessToken}
            categories={state.categories}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'coverage') {
      return (
        <ModuleSection
          description="Configuracion global del poligono valido para pedidos en la vereda."
          title="Cobertura general"
        >
          <AdminCoveragePanel
            accessToken={session.tokens.accessToken}
            initialCoverage={state.globalCoverage}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'customer_links') {
      return <ModuleSection description="Enlaces que verán los clientes en Configuración." title="Enlaces de la app"><CustomerLinksPanel accessToken={session.tokens.accessToken} /></ModuleSection>;
    }

    if (activeModule === 'support_tickets') {
      return <ModuleSection description="Solicitudes enviadas desde la app. Solo Super Admin tiene acceso." title="Soporte"><SupportTicketsPanel accessToken={session.tokens.accessToken} /></ModuleSection>;
    }

    if (activeModule === 'customers') {
      return (
        <ModuleSection
          description="Lectura centralizada de clientes, direcciones y actividad reciente."
          title="Clientes"
        >
          <AdminCustomersPanel
            accessToken={session.tokens.accessToken}
            customers={state.adminCustomers}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'coupons') {
      return (
        <ModuleSection
          description="Promociones globales con alcance por empresa o categoria."
          title="Cupones"
        >
          <AdminCouponsPanel
            accessToken={session.tokens.accessToken}
            categories={state.categories}
            companies={state.adminCompanies}
            coupons={state.adminCoupons}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'popups') {
      return (
        <ModuleSection
          description="Ventanas emergentes promocionales para la app, con imagen, enlace y vigencia."
          title="Popups"
        >
          <AdminPopupsPanel
            accessToken={session.tokens.accessToken}
            popups={state.adminPopups}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'promotions') {
      return (
        <ModuleSection
          description="Banners del inicio de la app, con destino interno o enlace web, imagen y vigencia."
          title="Promociones"
        >
          <AdminPopupsPanel
            accessToken={session.tokens.accessToken}
            kind="promotion"
            popups={state.adminPromotions}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'drivers') {
      return (
        <ModuleSection
          description="Creacion y control base de domiciliarios desde Super Admin."
          title="Domiciliarios"
        >
          <AdminDriversPanel
            accessToken={session.tokens.accessToken}
            drivers={state.adminDrivers}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'roles') {
      return <ModuleSection description="Gestiona roles personalizados y sus permisos de plataforma." title="Roles y permisos"><ExtractedRolesPanel accessToken={session.tokens.accessToken} permissions={state.permissions} roles={state.adminRoles} onChanged={() => setLocalRefresh((value) => value + 1)} /></ModuleSection>;
    }

    if (activeModule === 'notifications') {
      return (
        <ModuleSection
          description="Mensajes operativos y eventos recientes para el usuario actual."
          title="Notificaciones"
        >
          <NotificationsPanel
            accessToken={session.tokens.accessToken}
            notifications={state.notifications}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'email_templates') {
      return (
        <ModuleSection description="Diseña, previsualiza y prueba los correos transaccionales de Piddop antes de conectarlos a la app del cliente." title="Centro de correos">
          <EmailTemplatesPanel accessToken={session.tokens.accessToken} />
        </ModuleSection>
      );
    }

    if (activeModule === 'payment_settings' && state.wompiSettings) {
      return (
        <ModuleSection description="Configura PSE, rota las llaves y copia la URL de eventos." title="Medios de pago">
          <WompiSettingsPanel accessToken={session.tokens.accessToken} settings={state.wompiSettings} onChanged={(wompiSettings) => setState((current) => ({ ...current, wompiSettings }))} />
        </ModuleSection>
      );
    }

  }

  if (activeCompany?.company.type === 'services') {
    if (activeModule === 'commissions' && state.companyDashboard) {
      return (
        <ModuleSection
          description="Controla las ventas, el saldo de cartera y cada comision descontada. El domicilio no se incluye."
          title="Comisiones y cartera"
        >
          <CompanyCommissionsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            data={state.companyDashboard}
            walletTransactions={state.walletTransactions}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'dashboard' && state.companyDashboard) {
      return (
        <ModuleSection
          description="Lectura rapida del negocio y sus citas mas recientes."
          title="Resumen del negocio"
        >
          <CompanyDashboardPanel
            appointments={state.appointments}
            companyType="services"
            data={state.companyDashboard}
            walletTransactions={state.walletTransactions}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'reviews') return <ModuleSection description="Consulta las calificaciones y comentarios que han dejado tus clientes." title="Mis calificaciones y comentarios"><ReviewsPanel reviews={state.reviews} summary={state.reviewSummary} /></ModuleSection>;

    if (activeModule === 'appointments') {
      return (
        <ModuleSection
          description="Agenda operativa con el estado real de las reservas."
          title="Citas"
        >
          <AppointmentsPanel
            accessToken={session.tokens.accessToken}
            appointments={state.appointments}
            companyId={activeCompany.company.id}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'services') {
      return (
        <ModuleSection
          description="Servicios activos del negocio en formato compacto."
          title="Servicios"
        >
          <ServicesPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            professionals={state.professionals}
            services={state.services}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'professionals') {
      return (
        <ModuleSection
          description="Perfiles del equipo operativo que atiende los servicios."
          title="Profesionales"
        >
          <ProfessionalsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            professionals={state.professionals}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'schedules') {
      return (
        <ModuleSection
          description="Disponibilidad semanal por profesional con bloques editables."
          title="Horarios"
        >
          <SchedulesPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            professionals={state.professionals}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'team') {
      return <ModuleSection description="Administra usuarios vinculados a esta empresa y sus roles." title="Equipo"><ExtractedTeamPanel accessToken={session.tokens.accessToken} companyId={activeCompany.company.id} members={state.team} roles={state.companyRoles} onChanged={() => setLocalRefresh((value) => value + 1)} /></ModuleSection>;
    }

    if (activeModule === 'settings') {
      return (
        <ModuleSection
          description="Datos visibles del negocio, contacto y logo principal."
          title="Configuracion"
        >
          <CompanySettingsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            coverage={state.companyCoverage}
            fallbackCompany={activeCompany.company}
            profile={state.companyProfile}
          />
        </ModuleSection>
      );
    }

  }

  if (activeCompany && activeCompany.company.type !== 'services') {
    if (activeModule === 'reviews') return <ModuleSection description="Consulta las calificaciones y comentarios que han dejado tus clientes." title="Mis calificaciones y comentarios"><ReviewsPanel reviews={state.reviews} summary={state.reviewSummary} /></ModuleSection>;
    if (activeModule === 'commissions' && state.companyDashboard) {
      return (
        <ModuleSection
          description="Controla las ventas, el saldo de cartera y cada comision descontada. El domicilio no se incluye."
          title="Comisiones y cartera"
        >
          <CompanyCommissionsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            data={state.companyDashboard}
            walletTransactions={state.walletTransactions}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'dashboard' && state.companyDashboard) {
      return (
        <ModuleSection
          description="Resumen corto de ventas, comision y ultimos pedidos."
          title="Resumen del negocio"
        >
          <CompanyDashboardPanel
            companyType={activeCompany.company.type}
            data={state.companyDashboard}
            walletTransactions={state.walletTransactions}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'orders') {
      return (
        <ModuleSection
          description="Listado de pedidos con sus datos clave para operar rapido."
          title="Pedidos"
        >
          <OrdersPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            company={activeCompany.company}
            orders={state.orders}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'products') {
      return (
        <ModuleSection
          description="Catalogo compacto de productos con categoria, estado y precio."
          title="Productos"
        >
          <ProductsPanel
            accessToken={session.tokens.accessToken}
            categories={state.categories.filter((category) => category.type === activeCompany.company.type)}
            companyId={activeCompany.company.id}
            products={state.products}
            variants={state.variants}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'variants') {
      return (
        <ModuleSection
          description="Adiciones, extras y combinaciones del catalogo en un solo lugar."
          title="Variantes"
        >
          <VariantsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            variants={state.variants}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'notifications') {
      return (
        <ModuleSection
          description="Mensajes operativos y eventos recientes para el usuario actual."
          title="Notificaciones"
        >
          <NotificationsPanel
            accessToken={session.tokens.accessToken}
            notifications={state.notifications}
          />
        </ModuleSection>
      );
    }

    if (activeModule === 'team') {
      return <ModuleSection description="Administra usuarios vinculados a esta empresa y sus roles." title="Equipo"><ExtractedTeamPanel accessToken={session.tokens.accessToken} companyId={activeCompany.company.id} members={state.team} roles={state.companyRoles} onChanged={() => setLocalRefresh((value) => value + 1)} /></ModuleSection>;
    }

    if (activeModule === 'settings') {
      return (
        <ModuleSection
          description="Datos visibles del negocio, contacto y logo principal."
          title="Configuracion"
        >
          <CompanySettingsPanel
            accessToken={session.tokens.accessToken}
            companyId={activeCompany.company.id}
            coverage={state.companyCoverage}
            fallbackCompany={activeCompany.company}
            profile={state.companyProfile}
          />
        </ModuleSection>
      );
    }
  }

  return (
    <section className="module-placeholder">
      <span>Modulo no disponible</span>
      <div>
        <h2>{moduleLabel(activeModule)}</h2>
        <p>No tienes una empresa activa o permisos suficientes para consultar este modulo.</p>
      </div>
    </section>
  );
}

function ModuleSection({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  const pagination = useContext(PaginationContext);
  return (
    <section className="module-section">
      <header className="module-section__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {pagination.meta && (
        <div className="module-search-wrap">
          <label htmlFor="module-search" className="sr-only">Buscar en este listado</label>
          <input id="module-search" type="search" value={pagination.search} onChange={(event) => pagination.onSearch(event.target.value)} placeholder="Buscar..." className="module-search" />
        </div>
      )}
      {pagination.meta?.total_items === 0 && <p role="status" aria-live="polite" className="empty-results">No hay resultados para este listado.</p>}
      {children}
      {pagination.meta && (
        <PaginationControls
          pagination={pagination.meta}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </section>
  );
}

function moduleLabel(moduleKey: NavigationKey) {
  const labels: Record<NavigationKey, string> = {
    dashboard: 'Resumen',
    commissions: 'Comisiones',
    settlements: 'Liquidaciones',
    companies: 'Empresas',
    company_users: 'Usuarios de empresas',
    categories: 'Categorias',
    coverage: 'Cobertura',
    customer_links: 'Enlaces de la app',
    support_tickets: 'Soporte',
    customers: 'Clientes',
    coupons: 'Cupones',
    promotions: 'Promociones',
    popups: 'Popups',
    drivers: 'Domiciliarios',
    roles: 'Roles y permisos',
    notifications: 'Notificaciones',
    email_templates: 'Correos',
    payment_settings: 'Medios de pago',
    orders: 'Pedidos',
    products: 'Productos',
    variants: 'Variantes',
    team: 'Equipo',
    settings: 'Configuracion',
    appointments: 'Citas',
    services: 'Servicios',
    professionals: 'Profesionales',
    schedules: 'Horarios',
    reviews: 'Calificaciones'
  };

  return labels[moduleKey];
}

function AdminCategoriesPanel({
  accessToken,
  categories
}: {
  accessToken: string;
  categories: PublicCategory[];
}) {
  const [draftCategories, setDraftCategories] = useState(categories);
  const [editingCategory, setEditingCategory] = useState<PublicCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [selectedIconPreview, setSelectedIconPreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>(() => emptyCategoryForm());

  useEffect(() => {
    setDraftCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (!selectedIconFile) {
      setSelectedIconPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedIconFile);
    setSelectedIconPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedIconFile]);

  const filteredCategories = draftCategories.filter((category) => {
    const target = `${category.name} ${category.type} ${category.icon || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateCategory() {
    setEditingCategory(null);
    setIsCreating(true);
    setCategoryError(null);
    setSelectedIconFile(null);
    setFormValues(emptyCategoryForm());
  }

  function openEditCategory(category: PublicCategory) {
    setEditingCategory(category);
    setIsCreating(false);
    setCategoryError(null);
    setSelectedIconFile(null);
    setFormValues({
      icon: category.icon || '',
      name: category.name,
      status: category.status,
      type: category.type
    });
  }

  function closeCategoryForm() {
    setEditingCategory(null);
    setIsCreating(false);
    setCategoryError(null);
    setSelectedIconFile(null);
    setFormValues(emptyCategoryForm());
  }

  async function handleSubmitCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        icon: emptyToNull(formValues.icon),
        name: formValues.name.trim(),
        status: formValues.status,
        type: formValues.type
      };

      if (!payload.name) {
        throw new Error('El nombre de la categoria es obligatorio.');
      }

      let savedCategory: PublicCategory;

      if (editingCategory) {
        savedCategory = await updateAdminCategory(accessToken, editingCategory.id, payload);
        if (selectedIconFile) {
          savedCategory = await uploadAdminCategoryIcon(accessToken, editingCategory.id, selectedIconFile);
        }
        setDraftCategories((current) =>
          current.map((category) => (category.id === savedCategory.id ? savedCategory : category))
        );
      } else {
        savedCategory = await createAdminCategory(accessToken, payload);
        if (selectedIconFile) {
          savedCategory = await uploadAdminCategoryIcon(accessToken, savedCategory.id, selectedIconFile);
        }
        setDraftCategories((current) => [...current, savedCategory]);
      }

      closeCategoryForm();
    } catch (error) {
      setCategoryError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar la categoria.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    setCategoryError(null);

    try {
      await deleteAdminCategory(accessToken, categoryId);
      setDraftCategories((current) => current.filter((category) => category.id !== categoryId));
      if (editingCategory?.id === categoryId) {
        closeCategoryForm();
      }
    } catch (error) {
      setCategoryError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos eliminar la categoria.');
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o tipo"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateCategory} type="button">
          Nueva categoria
        </button>
      </section>

      {(isCreating || editingCategory) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingCategory ? 'Editar categoria' : 'Crear categoria'}</h2>
              <p>Define nombre, tipo, estado e icono de referencia.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeCategoryForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitCategory(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Tipo</span>
              <select
                disabled={Boolean(editingCategory)}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, type: event.target.value as PublicCategory['type'] }))
                }
                value={formValues.type}
              >
                <option value="food">food</option>
                <option value="products">products</option>
                <option value="services">services</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Referencia icono</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, icon: event.target.value }))}
                placeholder="burger, cart, scissors..."
                value={formValues.icon}
              />
            </label>
            <div className="field field--compact field--span-2">
              <span>Archivo visual</span>
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => setSelectedIconFile(event.target.files?.[0] || null)}
                type="file"
              />
              <p className="field-help">
                Usa JPG, PNG o WEBP. Recomendado: `512x512 px`,
                fondo transparente y margen interno de 12% para que no se vea apretada.
              </p>
            </div>
            <div className="field field--compact field--span-2">
              <span>Vista previa</span>
              <div className="category-asset-preview">
                <ProductImagePreview
                  alt={formValues.name || editingCategory?.name || 'Categoria'}
                  src={selectedIconPreview || resolveMediaUrl(editingCategory?.icon || null)}
                />
              </div>
            </div>

            {categoryError ? <p className="form-error field--span-2">{categoryError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeCategoryForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingCategory ? 'Guardar cambios' : 'Crear categoria'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {categoryError && !editingCategory && !isCreating ? <p className="form-error" role="alert">{categoryError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredCategories.map((category) => (
          <article className="catalog-card catalog-card--compact" key={category.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{category.name}</h2>
                <p>{category.type}</p>
              </div>
              <span className={`status-badge status-badge--${category.status}`}>{category.status}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              <span>Icono: {category.icon || 'sin icono'}</span>
            </div>
            <div className="category-card-preview">
              <ProductImagePreview alt={category.name} src={resolveMediaUrl(category.icon)} />
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">#{category.id}</strong>
              <div className="row-actions">
                <button className="secondary-button inline-action" onClick={() => openEditCategory(category)} type="button">
                  Editar
                </button>
                <DestructiveButton label="Eliminar" title="Eliminar categoría" impact="Esta acción eliminará la categoría y puede afectar productos asociados." onConfirm={() => handleDeleteCategory(category.id)} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function AdminCouponsPanel({
  accessToken,
  categories,
  companies,
  coupons
}: {
  accessToken: string;
  categories: PublicCategory[];
  companies: CompanySummary[];
  coupons: AdminCoupon[];
}) {
  const [draftCoupons, setDraftCoupons] = useState(coupons);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CouponFormValues>(() => emptyCouponForm());

  useEffect(() => {
    setDraftCoupons(coupons);
  }, [coupons]);

  const filteredCoupons = draftCoupons.filter((coupon) => {
    const companyName = companies.find((company) => company.id === coupon.company_id)?.name || '';
    const categoryName = categories.find((category) => category.id === coupon.category_id)?.name || '';
    const target = `${coupon.code} ${coupon.discount_type} ${companyName} ${categoryName}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateCoupon() {
    setEditingCoupon(null);
    setIsCreating(true);
    setCouponError(null);
    setFormValues(emptyCouponForm());
  }

  function openEditCoupon(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setIsCreating(false);
    setCouponError(null);
    setFormValues({
      category_id: coupon.category_id ? String(coupon.category_id) : '',
      code: coupon.code,
      company_id: coupon.company_id ? String(coupon.company_id) : '',
      discount_type: coupon.discount_type,
      discount_value: String(Number(coupon.discount_value || 0)),
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
      max_discount: coupon.max_discount != null ? String(Number(coupon.max_discount)) : '',
      minimum_order_amount: coupon.minimum_order_amount != null ? String(Number(coupon.minimum_order_amount)) : '',
      per_user_limit: coupon.per_user_limit != null ? String(coupon.per_user_limit) : '',
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 16) : '',
      status: coupon.status,
      usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : ''
    });
  }

  function closeCouponForm() {
    setEditingCoupon(null);
    setIsCreating(false);
    setCouponError(null);
    setFormValues(emptyCouponForm());
  }

  async function handleSubmitCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCouponError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        category_id: formValues.category_id ? Number(formValues.category_id) : null,
        code: formValues.code.trim().toUpperCase(),
        company_id: formValues.company_id ? Number(formValues.company_id) : null,
        discount_type: formValues.discount_type,
        discount_value: Number(formValues.discount_value),
        expires_at: emptyToNull(formValues.expires_at),
        max_discount: formValues.max_discount ? Number(formValues.max_discount) : null,
        minimum_order_amount: formValues.minimum_order_amount ? Number(formValues.minimum_order_amount) : null,
        per_user_limit: formValues.per_user_limit ? Number(formValues.per_user_limit) : null,
        starts_at: emptyToNull(formValues.starts_at),
        status: formValues.status,
        usage_limit: formValues.usage_limit ? Number(formValues.usage_limit) : null
      };

      if (!payload.code) {
        throw new Error('El codigo del cupon es obligatorio.');
      }

      if (!payload.discount_value || payload.discount_value <= 0) {
        throw new Error('El valor del descuento debe ser mayor a cero.');
      }

      if (editingCoupon) {
        const updated = await updateAdminCoupon(accessToken, editingCoupon.id, payload);
        setDraftCoupons((current) =>
          current.map((coupon) => (coupon.id === updated.id ? updated : coupon))
        );
      } else {
        const created = await createAdminCoupon(accessToken, payload);
        setDraftCoupons((current) => [created, ...current]);
      }

      closeCouponForm();
    } catch (error) {
      setCouponError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el cupon.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCoupon(couponId: number) {
    setCouponError(null);

    try {
      await deleteAdminCoupon(accessToken, couponId);
      setDraftCoupons((current) => current.filter((coupon) => coupon.id !== couponId));
      if (editingCoupon?.id === couponId) {
        closeCouponForm();
      }
    } catch (error) {
      setCouponError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos eliminar el cupon.');
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por codigo, empresa o categoria"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateCoupon} type="button">
          Nuevo cupon
        </button>
      </section>

      {(isCreating || editingCoupon) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingCoupon ? 'Editar cupon' : 'Crear cupon'}</h2>
              <p>Configura descuento, limites, fechas y alcance por empresa o categoria.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeCouponForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitCoupon(event)}>
            <label className="field field--compact">
              <span>Codigo</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                value={formValues.code}
              />
            </label>
            <label className="field field--compact">
              <span>Tipo</span>
              <select
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, discount_type: event.target.value as CouponFormValues['discount_type'] }))
                }
                value={formValues.discount_type}
              >
                <option value="percentage">percentage</option>
                <option value="fixed">fixed</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Valor descuento</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, discount_value: event.target.value }))}
                type="number"
                value={formValues.discount_value}
              />
            </label>
            <label className="field field--compact">
              <span>Max descuento</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, max_discount: event.target.value }))}
                type="number"
                value={formValues.max_discount}
              />
            </label>
            <label className="field field--compact">
              <span>Compra minima</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, minimum_order_amount: event.target.value }))}
                type="number"
                value={formValues.minimum_order_amount}
              />
            </label>
            <label className="field field--compact">
              <span>Limite total</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, usage_limit: event.target.value }))}
                type="number"
                value={formValues.usage_limit}
              />
            </label>
            <label className="field field--compact">
              <span>Limite por usuario</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, per_user_limit: event.target.value }))}
                type="number"
                value={formValues.per_user_limit}
              />
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Empresa</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, company_id: event.target.value }))}
                value={formValues.company_id}
              >
                <option value="">Todas</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--compact">
              <span>Categoria</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, category_id: event.target.value }))}
                value={formValues.category_id}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} | {category.type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--compact">
              <span>Inicia</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, starts_at: event.target.value }))}
                type="datetime-local"
                value={formValues.starts_at}
              />
            </label>
            <label className="field field--compact">
              <span>Expira</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, expires_at: event.target.value }))}
                type="datetime-local"
                value={formValues.expires_at}
              />
            </label>

            {couponError ? <p className="form-error field--span-2">{couponError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeCouponForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingCoupon ? 'Guardar cambios' : 'Crear cupon'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {couponError && !editingCoupon && !isCreating ? <p className="form-error" role="alert">{couponError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredCoupons.map((coupon) => (
          <article className="catalog-card catalog-card--compact" key={coupon.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{coupon.code}</h2>
                <p>{coupon.discount_type === 'percentage' ? 'Porcentaje' : 'Valor fijo'}</p>
              </div>
              <span className={`status-badge status-badge--${coupon.status}`}>{coupon.status}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              <span>
                Descuento: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatMoney(coupon.discount_value)}
              </span>
              <span>Min: {formatMoney(coupon.minimum_order_amount)}</span>
              <span>Uso: {coupon.usage_count || 0}/{coupon.usage_limit || 'inf'}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              {coupon.company_id ? <span>Empresa: {companies.find((company) => company.id === coupon.company_id)?.name || coupon.company_id}</span> : null}
              {coupon.category_id ? <span>Categoria: {categories.find((category) => category.id === coupon.category_id)?.name || coupon.category_id}</span> : null}
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">
                {coupon.expires_at ? `Hasta ${formatDate(coupon.expires_at)}` : 'Sin vencimiento'}
              </strong>
              <div className="row-actions">
                <button className="secondary-button inline-action" onClick={() => openEditCoupon(coupon)} type="button">
                  Editar
                </button>
                <DestructiveButton label="Eliminar" title="Eliminar cupón" impact="El cupón dejará de estar disponible inmediatamente." onConfirm={() => handleDeleteCoupon(coupon.id)} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function AdminPopupsPanel({
  accessToken,
  kind = 'popup',
  popups
}: {
  accessToken: string;
  kind?: 'popup' | 'promotion';
  popups: AdminPopup[];
}) {
  const singular = kind === 'promotion' ? 'promocion' : 'popup';
  const [draftPopups, setDraftPopups] = useState(popups);
  const [editingPopup, setEditingPopup] = useState<AdminPopup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [popupError, setPopupError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PopupFormValues>(() => emptyPopupForm());
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setDraftPopups(popups);
  }, [popups]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const filteredPopups = draftPopups.filter((popup) => {
    const target = `${popup.title} ${popup.message || ''} ${popup.link_url || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreatePopup() {
    setEditingPopup(null);
    setIsCreating(true);
    setPopupError(null);
    setFormValues(emptyPopupForm());
    setSelectedImage(null);
  }

  function openEditPopup(popup: AdminPopup) {
    setEditingPopup(popup);
    setIsCreating(false);
    setPopupError(null);
    setFormValues({
      destination_type: getCampaignDestinationType(popup.link_url),
      display_order: popup.display_order != null ? String(popup.display_order) : '1',
      ends_at: popup.ends_at ? popup.ends_at.slice(0, 16) : '',
      link_url: popup.link_url || '',
      message: popup.message || '',
      starts_at: popup.starts_at ? popup.starts_at.slice(0, 16) : '',
      status: popup.status,
      title: popup.title
    });
    setSelectedImage(null);
  }

  function closePopupForm() {
    setEditingPopup(null);
    setIsCreating(false);
    setPopupError(null);
    setFormValues(emptyPopupForm());
    setSelectedImage(null);
  }

  async function handleSubmitPopup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPopupError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        display_order: formValues.display_order ? Number(formValues.display_order) : null,
        ends_at: emptyToNull(formValues.ends_at),
        link_url: formValues.destination_type === 'none' ? null : emptyToNull(formValues.link_url.trim()),
        message: emptyToNull(formValues.message),
        starts_at: emptyToNull(formValues.starts_at),
        status: formValues.status,
        title: formValues.title.trim()
      };

      if (!payload.title) {
        throw new Error(`El titulo de la ${singular} es obligatorio.`);
      }

      if (formValues.destination_type === 'external') validateExternalCampaignUrl(formValues.link_url);

      let savedPopup: AdminPopup;

      if (editingPopup) {
        savedPopup = kind === 'promotion'
          ? await updateAdminHomePromotion(accessToken, editingPopup.id, payload)
          : await updateAdminPopup(accessToken, editingPopup.id, payload);
        if (selectedImage) {
          savedPopup = kind === 'promotion'
            ? await uploadAdminHomePromotionImage(accessToken, editingPopup.id, selectedImage)
            : await uploadAdminPopupImage(accessToken, editingPopup.id, selectedImage);
        }
        setDraftPopups((current) => current.map((popup) => (popup.id === savedPopup.id ? savedPopup : popup)));
      } else {
        if (!selectedImage) {
          throw new Error(`Debes seleccionar una imagen para crear la ${singular}.`);
        }

        savedPopup = kind === 'promotion'
          ? await createAdminHomePromotion(accessToken, payload, selectedImage)
          : await createAdminPopup(accessToken, payload, selectedImage);
        setDraftPopups((current) => [savedPopup, ...current]);
      }

      closePopupForm();
    } catch (error) {
      setPopupError(error instanceof ApiError || error instanceof Error ? error.message : `No pudimos guardar la ${singular}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePopup(popupId: number) {
    setPopupError(null);

    try {
      if (kind === 'promotion') await deleteAdminHomePromotion(accessToken, popupId);
      else await deleteAdminPopup(accessToken, popupId);
      setDraftPopups((current) => current.filter((popup) => popup.id !== popupId));
      if (editingPopup?.id === popupId) {
        closePopupForm();
      }
    } catch (error) {
      setPopupError(error instanceof ApiError || error instanceof Error ? error.message : `No pudimos eliminar la ${singular}.`);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por titulo, mensaje o link"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreatePopup} type="button">
          Nueva {singular}
        </button>
      </section>

      {(isCreating || editingPopup) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingPopup ? `Editar ${singular}` : `Crear ${singular}`}</h2>
              <p>Define la imagen, el mensaje, el destino al tocar y la vigencia.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closePopupForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitPopup(event)}>
            <label className="field field--compact">
              <span>Titulo</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
                value={formValues.title}
              />
            </label>
            <label className="field field--compact">
              <span>Orden</span>
              <input
                min="1"
                onChange={(event) => setFormValues((current) => ({ ...current, display_order: event.target.value }))}
                type="number"
                value={formValues.display_order}
              />
            </label>
            <label className="field field--span-2">
              <span>Mensaje</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, message: event.target.value }))}
                rows={4}
                value={formValues.message}
              />
            </label>
            <label className="field field--compact">
              <span>Accion al tocar</span>
              <select
                onChange={(event) => {
                  const destinationType = event.target.value as PopupFormValues['destination_type'];
                  setFormValues((current) => ({
                    ...current,
                    destination_type: destinationType,
                    link_url: destinationType === 'internal' ? 'allora-customer://home' : ''
                  }));
                }}
                value={formValues.destination_type}
              >
                <option value="none">Sin redireccionamiento</option>
                <option value="internal">Ir a una seccion de la app</option>
                <option value="external">Abrir un enlace externo</option>
              </select>
            </label>
            {formValues.destination_type === 'internal' ? (
              <label className="field field--compact">
                <span>Seccion de la app</span>
                <select
                  onChange={(event) => setFormValues((current) => ({ ...current, link_url: event.target.value }))}
                  value={formValues.link_url}
                >
                  {campaignInternalDestinations.map((destination) => (
                    <option key={destination.value} value={destination.value}>{destination.label}</option>
                  ))}
                </select>
              </label>
            ) : null}
            {formValues.destination_type === 'external' ? (
              <label className="field field--compact">
                <span>Enlace externo</span>
                <input
                  onChange={(event) => setFormValues((current) => ({ ...current, link_url: event.target.value }))}
                  placeholder="https://ejemplo.com/oferta"
                  type="url"
                  value={formValues.link_url}
                />
                <small className="field-hint">Debe comenzar por https:// o http://.</small>
              </label>
            ) : null}
            <label className="field field--compact">
              <span>Inicia</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, starts_at: event.target.value }))}
                type="datetime-local"
                value={formValues.starts_at}
              />
            </label>
            <label className="field field--compact">
              <span>Termina</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, ends_at: event.target.value }))}
                type="datetime-local"
                value={formValues.ends_at}
              />
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value as PopupFormValues['status'] }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--span-2">
              <span>Imagen</span>
              <input
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                type="file"
              />
              <small className="field-hint">
                Usa una imagen horizontal, idealmente 1600x900 o proporcion 16:9.
              </small>
            </label>

            <div className="field field--span-2">
              <span>Vista previa</span>
              <div className="category-card-preview category-card-preview--wide">
                <ProductImagePreview
                  alt={formValues.title || singular}
                  src={previewUrl || resolveMediaUrl(editingPopup?.image_url)}
                />
              </div>
            </div>

            {popupError ? <p className="form-error field--span-2">{popupError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closePopupForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingPopup ? 'Guardar cambios' : `Crear ${singular}`}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {popupError && !editingPopup && !isCreating ? <p className="form-error" role="alert">{popupError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredPopups.map((popup) => (
          <article className="catalog-card catalog-card--compact" key={popup.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{popup.title}</h2>
                <p>{popup.message || 'Sin mensaje adicional'}</p>
              </div>
              <span className={`status-badge status-badge--${popup.status}`}>{popup.status}</span>
            </div>
            <div className="category-card-preview category-card-preview--wide">
              <ProductImagePreview alt={popup.title} src={resolveMediaUrl(popup.image_url)} />
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              <span>Orden: {popup.display_order ?? '--'}</span>
              <span>{popup.starts_at ? `Desde ${formatDate(popup.starts_at)}` : 'Inicio libre'}</span>
              <span>{popup.ends_at ? `Hasta ${formatDate(popup.ends_at)}` : 'Sin vencimiento'}</span>
            </div>
            {popup.link_url ? (
              <div className="catalog-meta catalog-meta--wrap">
                <span>{popup.link_url}</span>
              </div>
            ) : null}
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">#{popup.id}</strong>
              <div className="row-actions">
                <button className="secondary-button inline-action" onClick={() => openEditPopup(popup)} type="button">
                  Editar
                </button>
                <DestructiveButton label="Eliminar" title={`Eliminar ${singular}`} impact={`Se eliminara la ${singular} y su imagen de la plataforma.`} onConfirm={() => handleDeletePopup(popup.id)} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function AdminDriversPanel({
  accessToken,
  drivers
}: {
  accessToken: string;
  drivers: AdminDriver[];
}) {
  const [draftDrivers, setDraftDrivers] = useState(drivers);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [driverError, setDriverError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<DriverFormValues>(() => emptyDriverForm());

  useEffect(() => {
    setDraftDrivers(drivers);
  }, [drivers]);

  const filteredDrivers = draftDrivers.filter((driver) => {
    const target = `${driver.user.name} ${driver.user.last_name} ${driver.user.email} ${driver.user.phone} ${driver.vehicle_type} ${driver.vehicle_plate || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateDriver() {
    setDriverError(null);
    setFormValues(emptyDriverForm());
    setIsCreating(true);
  }

  function closeCreateDriver() {
    setDriverError(null);
    setFormValues(emptyDriverForm());
    setIsCreating(false);
  }

  async function handleSubmitDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDriverError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        email: formValues.email.trim().toLowerCase(),
        last_name: formValues.last_name.trim(),
        name: formValues.name.trim(),
        password: formValues.password,
        phone: formValues.phone.trim(),
        vehicle_plate: emptyToNull(formValues.vehicle_plate),
        vehicle_type: formValues.vehicle_type
      };

      if (!payload.name || !payload.last_name || !payload.email || !payload.phone || !payload.password) {
        throw new Error('Todos los campos obligatorios del domiciliario deben completarse.');
      }

      if (payload.password.length < 8) {
        throw new Error('La contrasena debe tener al menos 8 caracteres.');
      }

      const created = await createAdminDriver(accessToken, payload);
      setDraftDrivers((current) => [
        {
          ...created.driver,
          user: {
            ...created.user,
            phone: payload.phone,
            status: 'active'
          }
        },
        ...current
      ]);
      closeCreateDriver();
    } catch (error) {
      setDriverError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos crear el domiciliario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo, celular o vehiculo"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateDriver} type="button">
          Nuevo domiciliario
        </button>
      </section>

      {isCreating ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>Crear domiciliario</h2>
              <p>Solo Super Admin puede registrar usuarios del flujo de domicilios.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeCreateDriver} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitDriver(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Apellido</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, last_name: event.target.value }))}
                value={formValues.last_name}
              />
            </label>
            <label className="field field--compact">
              <span>Correo</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={formValues.email}
              />
            </label>
            <label className="field field--compact">
              <span>Celular</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
                value={formValues.phone}
              />
            </label>
            <label className="field field--compact">
              <span>Contrasena</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, password: event.target.value }))}
                type="password"
                value={formValues.password}
              />
            </label>
            <label className="field field--compact">
              <span>Vehiculo</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, vehicle_type: event.target.value as DriverFormValues['vehicle_type'] }))}
                value={formValues.vehicle_type}
              >
                <option value="motorcycle">motorcycle</option>
                <option value="bicycle">bicycle</option>
                <option value="car">car</option>
                <option value="other">other</option>
              </select>
            </label>
            <label className="field field--compact field--span-2">
              <span>Placa o referencia</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, vehicle_plate: event.target.value }))}
                placeholder="Opcional"
                value={formValues.vehicle_plate}
              />
            </label>

            {driverError ? <p className="form-error field--span-2">{driverError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeCreateDriver} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : 'Crear domiciliario'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {driverError && !isCreating ? <p className="form-error" role="alert">{driverError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredDrivers.map((driver) => (
          <article className="catalog-card catalog-card--compact" key={driver.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{driver.user.name} {driver.user.last_name}</h2>
                <p>{driver.user.email}</p>
              </div>
              <span className={`status-badge status-badge--${driver.availability_status}`}>{driver.availability_status}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              <span>Celular: {driver.user.phone}</span>
              <span>Vehiculo: {driver.vehicle_type}</span>
              <span>{driver.vehicle_plate ? `Placa: ${driver.vehicle_plate}` : 'Sin placa registrada'}</span>
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">Usuario #{driver.user.id}</strong>
              <span className={`soft-pill ${driver.user.status === 'active' ? '' : 'soft-pill--warning'}`}>
                {driver.user.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function AdminCustomersPanel({
  accessToken,
  customers
}: {
  accessToken: string;
  customers: AdminCustomerSummary[];
}) {
  const [draftCustomers, setDraftCustomers] = useState(customers);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [activatingCustomerId, setActivatingCustomerId] = useState<number | null>(null);
  const [clearingCustomerOrdersId, setClearingCustomerOrdersId] = useState<number | null>(null);
  const [erasingCustomerId, setErasingCustomerId] = useState<number | null>(null);

  useEffect(() => {
    setDraftCustomers(customers);
  }, [customers]);

  const filteredCustomers = draftCustomers.filter((customer) => {
    const target = `${customer.name} ${customer.last_name} ${customer.email} ${customer.phone}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  async function handleActivate(customer: AdminCustomerSummary) {
    try {
      setActivatingCustomerId(customer.id);
      setActionError(null);
      const updated = await activateAdminCustomer(accessToken, customer.id);
      setDraftCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No pudimos activar al cliente.');
    } finally {
      setActivatingCustomerId(null);
    }
  }

  async function handleErase(customer: AdminCustomerSummary) {
    try {
      setErasingCustomerId(customer.id);
      setActionError(null);
      await eraseAdminCustomerData(accessToken, customer.id);
      setDraftCustomers((current) => current.filter((item) => item.id !== customer.id));
      if (expandedId === customer.id) setExpandedId(null);
      showToast({ kind: 'success', title: 'Datos eliminados', message: 'La cuenta fue desactivada y sus datos personales fueron eliminados.' });
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No pudimos eliminar los datos del cliente.');
    } finally {
      setErasingCustomerId(null);
    }
  }

  async function handleClearOrders(customer: AdminCustomerSummary) {
    try {
      setClearingCustomerOrdersId(customer.id);
      setActionError(null);
      const result = await clearAdminCustomerOrders(accessToken, customer.id);
      setDraftCustomers((current) => current.map((item) => (item.id === customer.id ? result.customer : item)));
      showToast({ kind: 'success', title: 'Pedidos vaciados', message: `Se eliminaron ${result.deleted_orders} pedido(s) de ${customer.name}.` });
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No pudimos vaciar los pedidos del cliente.');
    } finally {
      setClearingCustomerOrdersId(null);
    }
  }

  return (
    <section className="workspace-stack">
      {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o celular"
            value={query}
          />
        </label>
      </section>

      <section className="list-shell">
        <div className="list-head list-head--customers">
          <span>Cliente</span>
          <span>Actividad</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        <div className="list-body">
          {filteredCustomers.map((customer) => {
            const isExpanded = expandedId === customer.id;
            return (
              <article className="order-block" key={customer.id}>
                <div className="list-row list-row--customers">
                  <div className="list-main">
                    <strong>{customer.name} {customer.last_name}</strong>
                    <p>{customer.email}</p>
                    <small>{customer.phone}</small>
                  </div>
                  <div className="list-main list-main--stacked" data-label="Actividad">
                    <small>{customer.stats.orders_count} pedidos · {customer.stats.appointments_count} citas</small>
                    <small>{customer.stats.addresses_count} direcciones · {customer.stats.cancellations_this_month} cancelaciones este mes</small>
                  </div>
                  <div className="list-side" data-label="Estado">
                    <span className={`status-badge status-badge--${customer.status}`}>{customer.status}</span>
                    {customer.stats.active_orders_count > 0 ? (
                      <small>{customer.stats.active_orders_count} pedidos activos</small>
                    ) : customer.stats.pending_appointments_count > 0 ? (
                      <small>{customer.stats.pending_appointments_count} citas pendientes</small>
                    ) : (
                      <small>Sin actividad pendiente</small>
                    )}
                  </div>
                  <div className="row-actions" data-label="Acciones">
                    <button
                      className="secondary-button inline-action"
                      onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                      type="button"
                    >
                      {isExpanded ? 'Ocultar' : 'Ver detalle'}
                    </button>
                    {customer.status !== 'active' ? (
                      <button
                        className="primary-button inline-action"
                        disabled={activatingCustomerId === customer.id}
                        onClick={() => void handleActivate(customer)}
                        type="button"
                      >
                        {activatingCustomerId === customer.id ? 'Activando...' : 'Activar'}
                      </button>
                    ) : null}
                    <DestructiveButton
                      className="danger-link inline-action"
                      disabled={erasingCustomerId === customer.id}
                      label={erasingCustomerId === customer.id ? 'Eliminando...' : 'Borrar datos'}
                      title="Eliminar datos del cliente"
                      impact="Se revocará el acceso y se eliminarán sus datos personales, direcciones, citas, reseñas y solicitudes. Los pedidos históricos se conservarán anonimizados por motivos contables. Esta acción no se puede deshacer."
                      onConfirm={() => handleErase(customer)}
                    />
                  </div>
                </div>

                {isExpanded ? (
                  <section className="order-detail">
                    <div className="order-detail__actions">
                      <DestructiveButton
                        className="danger-link inline-action"
                        disabled={clearingCustomerOrdersId === customer.id || customer.stats.orders_count === 0}
                        label={clearingCustomerOrdersId === customer.id ? 'Vaciando pedidos...' : 'Vaciar pedidos'}
                        title="Vaciar pedidos del cliente"
                        impact="Se eliminarán todos los pedidos no activos y sin movimientos financieros de este cliente, incluidos sus comprobantes y calificaciones asociadas. Esta acción no se puede deshacer."
                        onConfirm={() => handleClearOrders(customer)}
                      />
                    </div>
                    <div className="order-detail__grid">
                      <article className="order-detail__card">
                        <h3>Direcciones</h3>
                        <div className="detail-list detail-list--compact">
                          {customer.addresses.length ? customer.addresses.map((address) => (
                            <div className="detail-row detail-row--compact detail-row--stacked" key={address.id}>
                              <div>
                                <strong>
                                  {address.label || 'Direccion'} {address.is_default ? '· Principal' : ''}
                                </strong>
                                <p>{address.address_line}</p>
                              </div>
                              <div className="detail-row__aside">
                                <strong>{address.recipient_name}</strong>
                                <span>{address.recipient_phone}</span>
                              </div>
                            </div>
                          )) : (
                            <div className="detail-row detail-row--compact">
                              <span>Sin direcciones registradas</span>
                            </div>
                          )}
                        </div>
                      </article>

                      <article className="order-detail__card">
                        <h3>Resumen del cliente</h3>
                        <div className="detail-list detail-list--compact">
                          <div className="detail-row detail-row--compact">
                            <span>Pedidos entregados</span>
                            <strong>{customer.stats.delivered_orders_count}</strong>
                          </div>
                          <div className="detail-row detail-row--compact">
                            <span>Pedidos en curso</span>
                            <strong>{customer.stats.active_orders_count}</strong>
                          </div>
                          <div className="detail-row detail-row--compact">
                            <span>Citas pendientes</span>
                            <strong>{customer.stats.pending_appointments_count}</strong>
                          </div>
                          <div className="detail-row detail-row--compact">
                            <span>Cancelaciones del mes</span>
                            <strong>{customer.stats.cancellations_this_month}</strong>
                          </div>
                        </div>
                      </article>
                    </div>

                    <div className="order-detail__grid">
                      <article className="order-detail__card">
                        <h3>Ultimos pedidos</h3>
                        <div className="detail-list detail-list--compact">
                          {customer.recent_orders.length ? customer.recent_orders.map((order) => (
                            <div className="detail-row detail-row--compact" key={order.id}>
                              <div>
                                <strong>{order.order_number}</strong>
                                <p>{order.company?.name || 'Sin empresa'} · {formatDate(order.created_at)}</p>
                              </div>
                              <div className="detail-row__aside">
                                <span className={`status-badge status-badge--${order.order_status}`}>{order.order_status}</span>
                                <strong>{formatMoney(order.total)}</strong>
                              </div>
                            </div>
                          )) : (
                            <div className="detail-row detail-row--compact">
                              <span>Sin pedidos todavia</span>
                            </div>
                          )}
                        </div>
                      </article>

                      <article className="order-detail__card">
                        <h3>Ultimas citas</h3>
                        <div className="detail-list detail-list--compact">
                          {customer.recent_appointments.length ? customer.recent_appointments.map((appointment) => (
                            <div className="detail-row detail-row--compact" key={appointment.id}>
                              <div>
                                <strong>{appointment.appointment_number}</strong>
                                <p>
                                  {appointment.company?.name || 'Sin empresa'} · {formatAppointmentDay(appointment.scheduled_date, appointment.start_time)} · {appointment.start_time.slice(0, 5)}
                                </p>
                              </div>
                              <div className="detail-row__aside">
                                <span className={`status-badge status-badge--${appointment.status}`}>{appointment.status}</span>
                                <strong>{formatMoney(appointment.price)}</strong>
                              </div>
                            </div>
                          )) : (
                            <div className="detail-row detail-row--compact">
                              <span>Sin citas registradas</span>
                            </div>
                          )}
                        </div>
                      </article>
                    </div>
                  </section>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function NotificationsPanel({
  accessToken,
  notifications
}: {
  accessToken: string;
  notifications: UserNotification[];
}) {
  const [draftNotifications, setDraftNotifications] = useState(notifications);
  const [query, setQuery] = useState('');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    setDraftNotifications(notifications);
  }, [notifications]);

  const filteredNotifications = draftNotifications.filter((item) => {
    const target = `${item.title || ''} ${item.message || ''} ${item.type || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  const unreadCount = draftNotifications.filter((item) => !item.read_at).length;

  async function handleMarkRead(notificationId: number) {
    setNotificationError(null);
    setLoadingId(notificationId);

    try {
      const updated = await markUserNotificationRead(accessToken, notificationId);
      setDraftNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      setNotificationError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos actualizar la notificacion.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleMarkAllRead() {
    setNotificationError(null);
    setIsMarkingAll(true);

    try {
      await markAllUserNotificationsRead(accessToken);
      const now = new Date().toISOString();
      setDraftNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || now }))
      );
    } catch (error) {
      setNotificationError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos marcar todas como leidas.');
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por titulo, mensaje o tipo"
            value={query}
          />
        </label>
        <button
          className="primary-button toolbar-button"
          disabled={!unreadCount || isMarkingAll}
          onClick={() => void handleMarkAllRead()}
          type="button"
        >
          {isMarkingAll ? 'Actualizando...' : `Marcar todas (${unreadCount})`}
        </button>
      </section>

      <section className="metric-strip">
        <article className="metric-card metric-card--compact">
          <span>No leidas</span>
          <strong>{unreadCount}</strong>
          <small>Pendientes por revisar</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Total</span>
          <strong>{draftNotifications.length}</strong>
          <small>Ultimos eventos</small>
        </article>
      </section>

      {notificationError ? <p className="form-error" role="alert">{notificationError}</p> : null}

      <section className="workspace-stack">
        {filteredNotifications.map((item) => (
          <article
            className={`catalog-card catalog-card--compact notification-card${item.read_at ? '' : ' notification-card--unread'}`}
            key={item.id}
          >
            <div className="catalog-card__header">
              <div>
                <h2>{item.title || 'Notificacion'}</h2>
                <p>{item.type || 'general'}</p>
              </div>
              <span className={`status-badge ${item.read_at ? 'status-badge--inactive' : 'status-badge--active'}`}>
                {item.read_at ? 'Leida' : 'Nueva'}
              </span>
            </div>
            <p className="catalog-card__copy">{item.message || 'Sin mensaje adicional.'}</p>
            <div className="catalog-meta catalog-meta--wrap">
              <span>{formatDate(item.created_at)}</span>
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">{item.read_at ? 'Revisada' : 'Pendiente'}</strong>
              {!item.read_at ? (
                <button
                  className="secondary-button inline-action"
                  disabled={loadingId === item.id}
                  onClick={() => void handleMarkRead(item.id)}
                  type="button"
                >
                  {loadingId === item.id ? 'Guardando...' : 'Marcar leida'}
                </button>
              ) : null}
            </div>
          </article>
        ))}
        {!filteredNotifications.length ? (
          <section className="workspace-state">
            <div>
              <h2>Sin notificaciones</h2>
              <p>No encontramos eventos con ese filtro.</p>
            </div>
          </section>
        ) : null}
      </section>
    </section>
  );
}

function CompanySettingsPanel({
  accessToken,
  companyId,
  coverage,
  fallbackCompany,
  profile
}: {
  accessToken: string;
  companyId: number;
  coverage: CompanyCoverageBoundary | null;
  fallbackCompany: UserCompanyMembership['company'];
  profile: CompanySummary | null;
}) {
  const [draftProfile, setDraftProfile] = useState<CompanySummary | null>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CompanySettingsFormValues>(() =>
    companyToSettingsForm(profile || fallbackCompany)
  );

  useEffect(() => {
    const nextProfile = profile || null;
    setDraftProfile(nextProfile);
    setFormValues(companyToSettingsForm(nextProfile || fallbackCompany));
    setSelectedLogoFile(null);
  }, [fallbackCompany, profile]);

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedLogoFile);
    setSelectedLogoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedLogoFile]);

  async function handleSubmitSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError(null);

    const selectedLatitude = formValues.latitude.trim() ? Number(formValues.latitude) : null;
    const selectedLongitude = formValues.longitude.trim() ? Number(formValues.longitude) : null;
    if (
      selectedLatitude != null &&
      selectedLongitude != null &&
      !isPointWithinCoverage({ latitude: selectedLatitude, longitude: selectedLongitude }, coverage)
    ) {
      setSettingsError('La ubicacion de la tienda debe estar dentro de la zona habilitada para domicilios.');
      return;
    }

    setIsSubmitting(true);

    try {
      let updatedCompany = await updateOwnCompanyProfile(accessToken, companyId, {
        address: emptyToNull(formValues.address),
        description: emptyToNull(formValues.description),
        email: emptyToNull(formValues.email),
        latitude: selectedLatitude,
        longitude: selectedLongitude,
        name: formValues.name.trim(),
        phone: emptyToNull(formValues.phone),
        availability_mode: formValues.availability_mode,
        business_hours: formValues.business_hours
      });

      if (selectedLogoFile) {
        updatedCompany = await uploadOwnCompanyLogo(accessToken, companyId, selectedLogoFile);
      }

      setDraftProfile(updatedCompany);
      setFormValues(companyToSettingsForm(updatedCompany));
      setSelectedLogoFile(null);
    } catch (error) {
      setSettingsError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar la configuracion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentCompany = {
    address: fallbackCompany.address || null,
    description: fallbackCompany.description || null,
    email: fallbackCompany.email || null,
    latitude: fallbackCompany.latitude || null,
    longitude: fallbackCompany.longitude || null,
    phone: fallbackCompany.phone || null,
    ...draftProfile,
    logo: draftProfile?.logo ?? fallbackCompany.logo,
    name: draftProfile?.name ?? fallbackCompany.name,
    status: draftProfile?.status ?? fallbackCompany.status
  };
  const currentLogo = selectedLogoPreview || resolveMediaUrl(currentCompany.logo);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <section className="workspace-stack">
      <section className="module-grid settings-layout">
        <section className="panel-card panel-card--compact settings-preview-card">
          <div className="panel-card__header">
            <h2>Vista previa</h2>
            <p>Asi se reflejan los datos principales del negocio.</p>
          </div>

          <div className="settings-preview">
            <div className="settings-preview__logo">
              <ProductImagePreview alt={currentCompany.name} src={currentLogo} />
            </div>
            <div className="settings-preview__content">
              <h3>{currentCompany.name}</h3>
              <p>{currentCompany.description || 'Agrega una descripcion corta para tu negocio.'}</p>
              <span className={`settings-status settings-status--${formValues.availability_mode}`}>
                {formValues.availability_mode === 'open'
                  ? 'Abierto manualmente'
                  : formValues.availability_mode === 'closed'
                    ? 'Cerrado manualmente'
                    : 'Horario automatico'}
              </span>
              <div className="catalog-meta catalog-meta--wrap">
                {currentCompany.phone ? <span>{currentCompany.phone}</span> : null}
                {currentCompany.email ? <span>{currentCompany.email}</span> : null}
                {currentCompany.address ? <span>{currentCompany.address}</span> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="form-card">
          <div className="panel-card__header">
            <h2>Editar datos</h2>
            <p>Actualiza logo, contacto, ubicacion y descripcion visible.</p>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitSettings(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Telefono</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
                value={formValues.phone}
              />
            </label>
            <label className="field field--compact">
              <span>Email</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                value={formValues.email}
              />
            </label>
            <label className="field field--compact">
              <span>Logo</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setSelectedLogoFile(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <label className="field field--compact field--span-2">
              <span>Direccion</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
                value={formValues.address}
              />
            </label>
            <div className="field field--span-2">
              {googleMapsApiKey ? (
                <CompanyLocationPicker
                  apiKey={googleMapsApiKey}
                  coverage={coverage}
                  latitude={formValues.latitude.trim() ? Number(formValues.latitude) : null}
                  longitude={formValues.longitude.trim() ? Number(formValues.longitude) : null}
                  onChange={({ latitude, longitude }) =>
                    setFormValues((current) => ({ ...current, latitude: String(latitude), longitude: String(longitude) }))
                  }
                />
              ) : (
                <div className="coverage-map-card coverage-map-card--empty">
                  <strong>Google Maps no esta configurado</strong>
                  <p>Agrega VITE_GOOGLE_MAPS_API_KEY para seleccionar la ubicacion de la tienda.</p>
                </div>
              )}
            </div>
            <label className="field field--compact field--span-2">
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                value={formValues.description}
              />
            </label>
            <section className="settings-availability field--span-2">
              <div className="settings-section-heading">
                <span className="settings-section-kicker">Disponibilidad</span>
                <h3>¿Cómo quieres recibir pedidos?</h3>
                <p>Usa el horario normalmente o cambia el estado de forma manual cuando lo necesites.</p>
              </div>

              <div className="availability-mode-grid">
                {([
                  { value: 'automatic', title: 'Según horario', description: 'Abre y cierra automáticamente' },
                  { value: 'open', title: 'Abierto', description: 'Acepta pedidos ahora' },
                  { value: 'closed', title: 'Cerrado', description: 'Pausa temporalmente los pedidos' }
                ] as const).map((mode) => (
                  <button
                    aria-pressed={formValues.availability_mode === mode.value}
                    className={`availability-mode-card${formValues.availability_mode === mode.value ? ' is-active' : ''} availability-mode-card--${mode.value}`}
                    key={mode.value}
                    onClick={() => setFormValues((current) => ({ ...current, availability_mode: mode.value }))}
                    type="button"
                  >
                    <span className="availability-mode-card__dot" />
                    <strong>{mode.title}</strong>
                    <small>{mode.description}</small>
                  </button>
                ))}
              </div>

              <div className="business-hours-heading">
                <div>
                  <h3>Horario semanal</h3>
                  <p>Activa los días de atención y define la apertura y el cierre.</p>
                </div>
                <span className="timezone-pill">Hora Colombia</span>
              </div>

              <div className="business-hours-grid">
                {[...scheduleDayOptions.slice(1), scheduleDayOptions[0]].map((day) => {
                  const schedule = formValues.business_hours.find((entry) => entry.day_of_week === day.value)!;
                  return (
                    <div className={`business-hours-row${schedule.enabled ? '' : ' is-disabled'}`} key={day.value}>
                      <label className="business-hours-day">
                        <input
                          checked={schedule.enabled}
                          onChange={(event) => setFormValues((current) => ({
                            ...current,
                            business_hours: current.business_hours.map((entry) => entry.day_of_week === day.value ? { ...entry, enabled: event.target.checked } : entry)
                          }))}
                          type="checkbox"
                        />
                        <span className="business-hours-switch" aria-hidden="true" />
                        <span>
                          <strong>{day.label}</strong>
                          <small>{schedule.enabled ? 'Atención disponible' : 'Cerrado'}</small>
                        </span>
                      </label>
                      <div className="business-hours-range">
                        <label>
                          <span>Abre</span>
                          <input
                            aria-label={`Apertura ${day.label}`}
                            disabled={!schedule.enabled}
                            onChange={(event) => setFormValues((current) => ({
                              ...current,
                              business_hours: current.business_hours.map((entry) => entry.day_of_week === day.value ? { ...entry, start_time: event.target.value } : entry)
                            }))}
                            type="time"
                            value={schedule.start_time}
                          />
                        </label>
                        <span className="business-hours-separator">—</span>
                        <label>
                          <span>Cierra</span>
                          <input
                            aria-label={`Cierre ${day.label}`}
                            disabled={!schedule.enabled}
                            onChange={(event) => setFormValues((current) => ({
                              ...current,
                              business_hours: current.business_hours.map((entry) => entry.day_of_week === day.value ? { ...entry, end_time: event.target.value } : entry)
                            }))}
                            type="time"
                            value={schedule.end_time}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="business-hours-note">Las jornadas pueden terminar después de medianoche.</p>
            </section>
            {settingsError ? <p className="form-error field--span-2">{settingsError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : 'Guardar configuracion'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </section>
  );
}

function VariantsPanel({
  accessToken,
  companyId,
  variants
}: {
  accessToken: string;
  companyId: number;
  variants: CompanyVariant[];
}) {
  const [draftVariants, setDraftVariants] = useState(variants);
  const [editingVariant, setEditingVariant] = useState<CompanyVariant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicatingVariantId, setDuplicatingVariantId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [variantError, setVariantError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<VariantFormValues>(() => emptyVariantForm());

  useEffect(() => {
    setDraftVariants(variants);
  }, [variants]);

  const filteredVariants = draftVariants.filter((variant) => {
    const optionsLabel = variant.options.map((option) => {
      const children = (option.childVariants || option.child_variants || [])
        .flatMap((child) => [child.name, ...child.options.map((childOption) => childOption.name)])
        .join(' ');
      return `${option.name} ${children}`;
    }).join(' ');
    const target = `${variant.name} ${variant.selection_type} ${optionsLabel}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateVariant() {
    setEditingVariant(null);
    setIsCreating(true);
    setVariantError(null);
    setFormValues(emptyVariantForm());
  }

  function openEditVariant(variant: CompanyVariant) {
    setEditingVariant(variant);
    setIsCreating(false);
    setVariantError(null);
    setFormValues(companyVariantToForm(variant));
  }

  function closeVariantForm() {
    setEditingVariant(null);
    setIsCreating(false);
    setVariantError(null);
    setFormValues(emptyVariantForm());
  }

  function patchVariantOption(
    index: number,
    patch: Partial<VariantFormValues['options'][number]>
  ) {
    setFormValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option
      )
    }));
  }

  function addVariantOptionField() {
    setFormValues((current) => ({
      ...current,
      options: [...current.options, { child_variants: [], name: '', status: 'active' }]
    }));
  }

  function removeVariantOptionField(index: number) {
    setFormValues((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index)
    }));
  }

  function addChildVariant(optionIndex: number) {
    const child = { ...emptyVariantForm(), min_selections: '1', required: true };
    setFormValues((current) => ({
      ...current,
      options: current.options.map((option, index) =>
        index === optionIndex ? { ...option, child_variants: [child] } : option
      )
    }));
  }

  function removeChildVariant(optionIndex: number) {
    setFormValues((current) => ({
      ...current,
      options: current.options.map((option, index) =>
        index === optionIndex ? { ...option, child_variants: [] } : option
      )
    }));
  }

  function patchChildVariant(optionIndex: number, patch: Partial<VariantFormValues>) {
    setFormValues((current) => ({
      ...current,
      options: current.options.map((option, index) => {
        if (index !== optionIndex || !option.child_variants[0]) return option;
        return { ...option, child_variants: [{ ...option.child_variants[0], ...patch }] };
      })
    }));
  }

  function patchChildOption(
    optionIndex: number,
    childOptionIndex: number,
    patch: Partial<VariantFormValues['options'][number]>
  ) {
    const child = formValues.options[optionIndex]?.child_variants[0];
    if (!child) return;
    patchChildVariant(optionIndex, {
      options: child.options.map((option, index) => index === childOptionIndex ? { ...option, ...patch } : option)
    });
  }

  function addChildOption(optionIndex: number) {
    const child = formValues.options[optionIndex]?.child_variants[0];
    if (!child) return;
    patchChildVariant(optionIndex, {
      options: [...child.options, { child_variants: [], name: '', status: 'active' }]
    });
  }

  function removeChildOption(optionIndex: number, childOptionIndex: number) {
    const child = formValues.options[optionIndex]?.child_variants[0];
    if (!child || child.options.length === 1) return;
    patchChildVariant(optionIndex, {
      options: child.options.filter((_, index) => index !== childOptionIndex)
    });
  }

  async function handleSubmitVariant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVariantError(null);
    setIsSubmitting(true);

    try {
      const payload = variantFormToPayload(formValues);

      if (!payload.name) {
        throw new Error('El nombre de la adicion es obligatorio.');
      }

      if (!payload.options.length) {
        throw new Error('Debes agregar al menos una opcion valida.');
      }

      if (payload.max_selections < 1) {
        throw new Error('La cantidad maxima de selecciones debe ser mayor a cero.');
      }

      if (payload.min_selections < 0 || payload.min_selections > payload.max_selections) {
        throw new Error('La cantidad minima no puede ser negativa ni mayor a la maxima.');
      }

      if (editingVariant) {
        const updated = await updateCompanyVariant(accessToken, companyId, editingVariant.id, payload);
        setDraftVariants((current) =>
          current.map((variant) => (variant.id === updated.id ? updated : variant))
        );
      } else {
        const created = await createCompanyVariant(accessToken, companyId, payload);
        setDraftVariants((current) => [created, ...current]);
      }

      closeVariantForm();
    } catch (error) {
      setVariantError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar la adicion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteVariant(variantId: number) {
    setVariantError(null);

    try {
      await deleteCompanyVariant(accessToken, companyId, variantId);
      setDraftVariants((current) => current.filter((variant) => variant.id !== variantId));

      if (editingVariant?.id === variantId) {
        closeVariantForm();
      }
    } catch (error) {
      setVariantError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos eliminar la adicion.');
    }
  }

  async function handleDuplicateVariant(variant: CompanyVariant) {
    setVariantError(null);
    setDuplicatingVariantId(variant.id);
    try {
      const copy = await duplicateCompanyVariant(accessToken, companyId, variant.id);
      setDraftVariants((current) => [copy, ...current]);
      showToast({ kind: 'success', title: 'Variante copiada', message: `${copy.name} está lista para editarse.` });
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos copiar la variante.';
      setVariantError(message);
      showToast({ kind: 'error', title: 'No pudimos copiar la variante', message });
    } finally {
      setDuplicatingVariantId(null);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por adicion u opcion"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateVariant} type="button">
          Nueva adicion
        </button>
      </section>

      {(isCreating || editingVariant) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingVariant ? 'Editar adicion' : 'Crear adicion'}</h2>
              <p>Define una estructura reutilizable. Los precios se configuran en cada producto.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeVariantForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitVariant(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Tipo</span>
              <select
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    selection_type: event.target.value as VariantFormValues['selection_type'],
                    max_selections:
                      event.target.value === 'single' ? '1' : current.max_selections
                  }))
                }
                value={formValues.selection_type}
              >
                <option value="single">Una opcion</option>
                <option value="multiple">Multiple</option>
              </select>
            </label>
            <label className="selector-chip">
              <input
                checked={formValues.required}
                onChange={(event) => setFormValues((current) => ({ ...current, required: event.target.checked }))}
                type="checkbox"
              />
              <span>Obligatoria</span>
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Min selecciones</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, min_selections: event.target.value }))}
                type="number"
                value={formValues.min_selections}
              />
            </label>
            <label className="field field--compact">
              <span>Max selecciones</span>
              <input
                disabled={formValues.selection_type === 'single'}
                onChange={(event) => setFormValues((current) => ({ ...current, max_selections: event.target.value }))}
                type="number"
                value={formValues.max_selections}
              />
            </label>
            <div className="field field--compact field--span-2">
              <span>Opciones</span>
              <div className="variant-option-list">
                {formValues.options.map((option, index) => (
                  <div className="variant-option-block" key={index}>
                    <div className="variant-option-row">
                      <input
                        onChange={(event) => patchVariantOption(index, { name: event.target.value })}
                        placeholder="Ej. Combo 3"
                        value={option.name}
                      />
                      <button
                        className="secondary-button inline-action"
                        disabled={formValues.options.length === 1}
                        onClick={() => removeVariantOptionField(index)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>

                    {option.child_variants[0] ? (() => {
                      const child = option.child_variants[0];
                      return (
                        <section className="subvariant-editor">
                          <div className="subvariant-editor__header">
                            <div>
                              <strong>Subvariación de {option.name || `opción ${index + 1}`}</strong>
                              <p>Solo aparecerá cuando el cliente elija esta opción.</p>
                            </div>
                            <button className="secondary-button inline-action" onClick={() => removeChildVariant(index)} type="button">
                              Quitar subvariación
                            </button>
                          </div>
                          <div className="subvariant-editor__fields">
                            <label className="field field--compact">
                              <span>Pregunta o título</span>
                              <input
                                onChange={(event) => patchChildVariant(index, { name: event.target.value })}
                                placeholder="Ej. Elige tu bebida"
                                value={child.name}
                              />
                            </label>
                            <label className="field field--compact">
                              <span>Tipo de selección</span>
                              <select
                                onChange={(event) => patchChildVariant(index, {
                                  selection_type: event.target.value as VariantFormValues['selection_type'],
                                  max_selections: event.target.value === 'single' ? '1' : child.max_selections
                                })}
                                value={child.selection_type}
                              >
                                <option value="single">Una opción</option>
                                <option value="multiple">Varias opciones</option>
                              </select>
                            </label>
                          </div>
                          <div className="variant-option-list">
                            {child.options.map((childOption, childOptionIndex) => (
                              <div className="variant-option-row" key={childOptionIndex}>
                                <input
                                  onChange={(event) => patchChildOption(index, childOptionIndex, { name: event.target.value })}
                                  placeholder="Ej. Gaseosa"
                                  value={childOption.name}
                                />
                                <button
                                  className="secondary-button inline-action"
                                  disabled={child.options.length === 1}
                                  onClick={() => removeChildOption(index, childOptionIndex)}
                                  type="button"
                                >
                                  Quitar
                                </button>
                              </div>
                            ))}
                          </div>
                          <button className="secondary-button inline-action subvariant-editor__add" onClick={() => addChildOption(index)} type="button">
                            Agregar bebida u opción
                          </button>
                        </section>
                      );
                    })() : (
                      <button className="subvariant-trigger" onClick={() => addChildVariant(index)} type="button">
                        + Agregar subvariación condicional
                        <small>Ejemplo: si eligen Combo 3, pedir la bebida.</small>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="form-actions field--span-2">
                <button className="secondary-button toolbar-button" onClick={addVariantOptionField} type="button">
                  Agregar opcion
                </button>
              </div>
            </div>

            {variantError ? <p className="form-error field--span-2">{variantError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeVariantForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingVariant ? 'Guardar cambios' : 'Crear adicion'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {variantError && !editingVariant && !isCreating ? <p className="form-error" role="alert">{variantError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredVariants.map((variant) => (
          <article className="catalog-card catalog-card--compact" key={variant.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{variant.name}</h2>
                <p>{variant.selection_type === 'multiple' ? 'Seleccion multiple' : 'Seleccion unica'}</p>
              </div>
              <span className={`status-badge status-badge--${variant.status}`}>{variant.status}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              <span>{variant.required ? 'Obligatoria' : 'Opcional'}</span>
              <span>Min {variant.min_selections}</span>
              <span>Max {variant.max_selections}</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              {variant.options.map((option) => (
                <div className="variant-tree-option" key={option.id}>
                  <span className="soft-pill soft-pill--tiny">
                    {option.name}
                  </span>
                  {(option.childVariants || option.child_variants || []).map((child) => (
                    <div className="variant-tree-option__child" key={child.id}>
                      <strong>↳ {child.name}</strong>
                      <span>
                        {child.options.map((childOption) => childOption.name).join(' · ')}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">{variant.options.length} opciones</strong>
              <div className="row-actions">
                <CopyActionButton
                  disabled={duplicatingVariantId !== null}
                  message={`¿Quieres copiar “${variant.name}” con todas sus opciones y subvariantes? La copia será independiente de la original.`}
                  onConfirm={() => handleDuplicateVariant(variant)}
                  title="Copiar variante"
                />
                <button className="secondary-button inline-action" onClick={() => openEditVariant(variant)} type="button">
                  Editar
                </button>
                <DestructiveButton label="Eliminar" title="Eliminar variante" impact="La variante se retirará del catálogo y no podrá seleccionarse." onConfirm={() => handleDeleteVariant(variant.id)} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function ProfessionalsPanel({
  accessToken,
  companyId,
  professionals
}: {
  accessToken: string;
  companyId: number;
  professionals: ProfessionalSummary[];
}) {
  const [draftProfessionals, setDraftProfessionals] = useState(professionals);
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalSummary | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [professionalError, setProfessionalError] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProfessionalFormValues>(() => emptyProfessionalForm());

  useEffect(() => {
    setDraftProfessionals(professionals);
  }, [professionals]);

  useEffect(() => {
    if (!selectedPhotoFile) {
      setSelectedPhotoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedPhotoFile);
    setSelectedPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedPhotoFile]);

  const filteredProfessionals = draftProfessionals.filter((professional) => {
    const target = `${professional.name} ${professional.specialty || ''} ${professional.email || ''} ${professional.phone || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateProfessional() {
    setEditingProfessional(null);
    setIsCreating(true);
    setProfessionalError(null);
    setSelectedPhotoFile(null);
    setFormValues(emptyProfessionalForm());
  }

  function openEditProfessional(professional: ProfessionalSummary) {
    setEditingProfessional(professional);
    setIsCreating(false);
    setProfessionalError(null);
    setSelectedPhotoFile(null);
    setFormValues({
      description: professional.description || '',
      email: professional.email || '',
      name: professional.name,
      phone: professional.phone || '',
      specialty: professional.specialty || '',
      status: professional.status
    });
  }

  function closeProfessionalForm() {
    setEditingProfessional(null);
    setIsCreating(false);
    setProfessionalError(null);
    setSelectedPhotoFile(null);
    setFormValues(emptyProfessionalForm());
  }

  async function handleSubmitProfessional(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfessionalError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        description: emptyToNull(formValues.description),
        email: emptyToNull(formValues.email),
        name: formValues.name.trim(),
        phone: emptyToNull(formValues.phone),
        specialty: emptyToNull(formValues.specialty),
        status: formValues.status
      };

      if (!payload.name) {
        throw new Error('El nombre del profesional es obligatorio.');
      }

      let savedProfessional: ProfessionalSummary;

      if (editingProfessional) {
        savedProfessional = await updateCompanyProfessional(accessToken, companyId, editingProfessional.id, payload);
        if (selectedPhotoFile) {
          savedProfessional = await uploadCompanyProfessionalPhoto(
            accessToken,
            companyId,
            editingProfessional.id,
            selectedPhotoFile
          );
        }
        setDraftProfessionals((current) =>
          current.map((professional) =>
            professional.id === savedProfessional.id
              ? { ...professional, ...savedProfessional, schedules: professional.schedules || [] }
              : professional
          )
        );
      } else {
        savedProfessional = await createCompanyProfessional(accessToken, companyId, payload);
        if (selectedPhotoFile) {
          savedProfessional = await uploadCompanyProfessionalPhoto(
            accessToken,
            companyId,
            savedProfessional.id,
            selectedPhotoFile
          );
        }
        setDraftProfessionals((current) => [{ ...savedProfessional, schedules: [] }, ...current]);
      }

      closeProfessionalForm();
    } catch (error) {
      setProfessionalError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el profesional.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProfessional(professionalId: number) {
    setProfessionalError(null);

    try {
      await deleteCompanyProfessional(accessToken, companyId, professionalId);
      setDraftProfessionals((current) => current.filter((professional) => professional.id !== professionalId));
      if (editingProfessional?.id === professionalId) {
        closeProfessionalForm();
      }
    } catch (error) {
      setProfessionalError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos eliminar el profesional.');
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, especialidad o contacto"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateProfessional} type="button">
          Nuevo profesional
        </button>
      </section>

      {(isCreating || editingProfessional) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingProfessional ? 'Editar profesional' : 'Crear profesional'}</h2>
              <p>Completa los datos visibles en la app y deja el perfil listo para asignaciones.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeProfessionalForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitProfessional(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Especialidad</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, specialty: event.target.value }))}
                value={formValues.specialty}
              />
            </label>
            <label className="field field--compact">
              <span>Telefono</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
                value={formValues.phone}
              />
            </label>
            <label className="field field--compact">
              <span>Email</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                value={formValues.email}
              />
            </label>
            <label className="field field--compact field--span-2">
              <span>Foto</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setSelectedPhotoFile(event.target.files?.[0] || null)}
                type="file"
              />
            </label>
            <div className="field field--compact field--span-2">
              <span>Vista previa</span>
              <div className="professional-photo-upload">
                <div className="professional-photo-upload__preview">
                  <ProductImagePreview
                    alt={formValues.name || editingProfessional?.name || 'Profesional'}
                    src={selectedPhotoPreview || resolveMediaUrl(editingProfessional?.photo || null)}
                  />
                </div>
              </div>
            </div>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact field--span-2">
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                value={formValues.description}
              />
            </label>

            {professionalError ? <p className="form-error field--span-2">{professionalError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeProfessionalForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingProfessional ? 'Guardar cambios' : 'Crear profesional'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {professionalError && !editingProfessional && !isCreating ? <p className="form-error" role="alert">{professionalError}</p> : null}

      <section className="card-grid card-grid--dense">
        {filteredProfessionals.map((professional) => (
          <article className="catalog-card catalog-card--compact" key={professional.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{professional.name}</h2>
                <p>{professional.specialty || 'Sin especialidad todavia'}</p>
              </div>
              <span className={`status-badge status-badge--${professional.status}`}>{professional.status}</span>
            </div>
            <p className="catalog-card__copy">{professional.description || 'Sin descripcion todavia.'}</p>
            <div className="catalog-meta catalog-meta--wrap">
              {professional.phone ? <span>{professional.phone}</span> : null}
              {professional.email ? <span>{professional.email}</span> : null}
              <span>{professional.schedules?.length || 0} horarios</span>
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">{professional.specialty || 'Perfil listo'}</strong>
              <div className="row-actions">
                <button
                  className="secondary-button inline-action"
                  onClick={() => openEditProfessional(professional)}
                  type="button"
                >
                  Editar
                </button>
                <DestructiveButton label="Eliminar" title="Eliminar profesional" impact="Se eliminará el perfil y no podrá recibir nuevas citas." onConfirm={() => handleDeleteProfessional(professional.id)} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function SchedulesPanel({
  accessToken,
  companyId,
  professionals
}: {
  accessToken: string;
  companyId: number;
  professionals: ProfessionalSummary[];
}) {
  const [draftProfessionals, setDraftProfessionals] = useState(professionals);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number>(professionals[0]?.id || 0);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ScheduleFormValues>(() => emptyScheduleForm());

  useEffect(() => {
    setDraftProfessionals(professionals);
    if (!selectedProfessionalId && professionals[0]?.id) {
      setSelectedProfessionalId(professionals[0].id);
    }
  }, [professionals, selectedProfessionalId]);

  const selectedProfessional =
    draftProfessionals.find((professional) => professional.id === selectedProfessionalId) || null;

  function resetScheduleForm() {
    setEditingScheduleId(null);
    setFormValues(emptyScheduleForm());
  }

  function startEditSchedule(schedule: ProfessionalSchedule) {
    setEditingScheduleId(schedule.id);
    setFormValues({
      day_of_week: String(schedule.day_of_week),
      end_time: schedule.end_time.slice(0, 5),
      start_time: schedule.start_time.slice(0, 5),
      status: schedule.status
    });
  }

  function patchProfessionalSchedules(professionalId: number, updater: (items: ProfessionalSchedule[]) => ProfessionalSchedule[]) {
    setDraftProfessionals((current) =>
      current.map((professional) =>
        professional.id === professionalId
          ? { ...professional, schedules: updater(professional.schedules || []) }
          : professional
      )
    );
  }

  async function handleSaveSchedule() {
    if (!selectedProfessional) {
      setScheduleError('Primero crea o selecciona un profesional.');
      return;
    }

    setScheduleError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        day_of_week: Number(formValues.day_of_week),
        end_time: formValues.end_time,
        start_time: formValues.start_time,
        status: formValues.status
      };

      if (Number.isNaN(payload.day_of_week) || payload.day_of_week < 0 || payload.day_of_week > 6) {
        throw new Error('Debes seleccionar un dia valido.');
      }

      if (!payload.start_time || !payload.end_time || payload.start_time >= payload.end_time) {
        throw new Error('La hora de inicio debe ser menor a la hora final.');
      }

      if (editingScheduleId) {
        const updated = await updateCompanyProfessionalSchedule(
          accessToken,
          companyId,
          selectedProfessional.id,
          editingScheduleId,
          payload
        );
        patchProfessionalSchedules(selectedProfessional.id, (items) =>
          items.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const created = await createCompanyProfessionalSchedule(
          accessToken,
          companyId,
          selectedProfessional.id,
          payload
        );
        patchProfessionalSchedules(selectedProfessional.id, (items) => [...items, created]);
      }

      resetScheduleForm();
    } catch (error) {
      setScheduleError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el horario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSchedule(scheduleId: number) {
    if (!selectedProfessional) {
      return;
    }

    setScheduleError(null);

    try {
      await deleteCompanyProfessionalSchedule(accessToken, companyId, selectedProfessional.id, scheduleId);
      patchProfessionalSchedules(selectedProfessional.id, (items) => items.filter((item) => item.id !== scheduleId));
      if (editingScheduleId === scheduleId) {
        resetScheduleForm();
      }
    } catch (error) {
      setScheduleError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos eliminar el horario.');
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="field field--compact">
          <span>Profesional</span>
          <select
            onChange={(event) => {
              setSelectedProfessionalId(Number(event.target.value));
              resetScheduleForm();
            }}
            value={selectedProfessionalId}
          >
            {draftProfessionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="module-grid module-grid--balanced">
        <section className="form-card">
          <div className="panel-card__header">
            <h2>{editingScheduleId ? 'Editar bloque' : 'Nuevo bloque'}</h2>
            <p>Configura un rango horario para el profesional seleccionado.</p>
          </div>

          <div className="admin-company-form">
            <label className="field field--compact">
              <span>Dia</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, day_of_week: event.target.value }))}
                value={formValues.day_of_week}
              >
                {scheduleDayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Hora inicio</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, start_time: event.target.value }))}
                type="time"
                value={formValues.start_time}
              />
            </label>
            <label className="field field--compact">
              <span>Hora fin</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, end_time: event.target.value }))}
                type="time"
                value={formValues.end_time}
              />
            </label>

            {scheduleError ? <p className="form-error field--span-2">{scheduleError}</p> : null}

            <div className="form-actions field--span-2">
              {editingScheduleId ? (
                <button className="secondary-button toolbar-button" onClick={resetScheduleForm} type="button">
                  Cancelar edicion
                </button>
              ) : null}
              <button
                className="primary-button toolbar-button"
                disabled={isSubmitting || !selectedProfessional}
                onClick={() => void handleSaveSchedule()}
                type="button"
              >
                {isSubmitting ? 'Guardando...' : editingScheduleId ? 'Actualizar bloque' : 'Agregar bloque'}
              </button>
            </div>
          </div>
        </section>

        <section className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>{selectedProfessional?.name || 'Sin profesional'}</h2>
            <p>{selectedProfessional?.specialty || 'Selecciona un profesional para gestionar sus horarios.'}</p>
          </div>

          <div className="ingredient-list">
            {(selectedProfessional?.schedules || [])
              .slice()
              .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
              .map((schedule) => (
                <article className="ingredient-row" key={schedule.id}>
                  <div className="list-main">
                    <strong>{scheduleDayOptions.find((option) => option.value === schedule.day_of_week)?.label}</strong>
                    <p>
                      {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} | {schedule.status}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="secondary-button inline-action"
                      onClick={() => startEditSchedule(schedule)}
                      type="button"
                    >
                      Editar
                    </button>
                    <DestructiveButton label="Eliminar" title="Eliminar horario" impact="Este bloque dejará de estar disponible para reservar citas." onConfirm={() => handleDeleteSchedule(schedule.id)} />
                  </div>
                </article>
              ))}
            {!selectedProfessional?.schedules?.length ? (
              <p className="catalog-card__copy">Este profesional todavia no tiene bloques horarios configurados.</p>
            ) : null}
          </div>
        </section>
      </section>
    </section>
  );
}

function AdminDashboardPanel({ data }: { data: AdminDashboardData }) {
  return (
    <section className="workspace-stack">
      <section className="metric-strip">
        <article className="metric-card metric-card--compact">
          <span>Empresas activas</span>
          <strong>{data.companies.active}</strong>
          <small>{data.companies.total} registradas</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Comision del dia</span>
          <strong>{formatMoney(data.commissions.daily)}</strong>
          <small>Semana: {formatMoney(data.commissions.weekly)}</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Pedidos del mes</span>
          <strong>{data.orders.monthly.orders}</strong>
          <small>Ventas: {formatMoney(data.orders.monthly.sales)}</small>
        </article>
      </section>
      <section className="module-grid module-grid--balanced">
        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Empresas por tipo</h2>
            <p>Lectura actual de la plataforma</p>
          </div>
          <div className="pill-row">
            {data.companies.by_type.map((item) => (
              <span className="soft-pill" key={item.type}>
                {item.type}: {item.count}
              </span>
            ))}
          </div>
        </article>
        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Estados del mes</h2>
            <p>Distribucion de pedidos</p>
          </div>
          <div className="detail-list detail-list--compact">
            {Object.entries(data.orders.monthly.by_status).map(([status, count]) => (
              <div className="detail-row detail-row--compact" key={status}>
                <span>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

function CustomerLinksPanel({ accessToken }: { accessToken: string }) {
  const [links, setLinks] = useState({ support_url: '', become_store_url: '', privacy_policy_url: '', terms_url: '', data_authorization_url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAdminCustomerLinksSettings(accessToken)
      .then((value) => setLinks({
        support_url: value.support_url || '', become_store_url: value.become_store_url || '', privacy_policy_url: value.privacy_policy_url || '',
        terms_url: value.terms_url || '', data_authorization_url: value.data_authorization_url || ''
      }))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'No pudimos cargar los enlaces.'))
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSaving(true); setError(null);
      await updateAdminCustomerLinksSettings(accessToken, links);
      showToast({ kind: 'success', title: 'Enlaces guardados' });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No pudimos guardar los enlaces.'); }
    finally { setIsSaving(false); }
  }

  const fields: Array<[keyof typeof links, string]> = [
    ['support_url', 'Soporte'], ['become_store_url', 'Quiero ser una tienda'], ['privacy_policy_url', 'Política de privacidad'], ['terms_url', 'Términos y condiciones'], ['data_authorization_url', 'Autorización de datos']
  ];
  if (isLoading) return <p>Cargando enlaces...</p>;
  return <form className="admin-company-form" onSubmit={(event) => void save(event)}>{fields.map(([key, label]) => <label className="field field--span-2" key={key}><span>{label}</span><input onChange={(event) => setLinks((current) => ({ ...current, [key]: event.target.value }))} placeholder="https://..." type="url" value={links[key]} /></label>)}{error ? <p className="form-error field--span-2">{error}</p> : null}<div className="form-actions field--span-2"><button className="primary-button toolbar-button" disabled={isSaving} type="submit">{isSaving ? 'Guardando...' : 'Guardar enlaces'}</button></div></form>;
}

function SupportTicketsPanel({ accessToken }: { accessToken: string }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    try { setLoading(true); setError(null); setTickets(await getAdminSupportTickets(accessToken, { page_size: 100 })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos cargar las solicitudes.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [accessToken]);
  async function changeStatus(ticket: SupportTicket, status: SupportTicket['status']) {
    try { const updated = await updateAdminSupportTicketStatus(accessToken, ticket.id, status); setTickets((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (cause) { showToast({ kind: 'error', title: 'No pudimos actualizar', message: cause instanceof Error ? cause.message : 'Inténtalo nuevamente.' }); }
  }
  if (loading) return <p>Cargando solicitudes…</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!tickets.length) return <p>No hay solicitudes de soporte todavía.</p>;
  return <div className="role-panel__list">{tickets.map((ticket) => <article className="role-card" key={ticket.id}><div><strong>{ticket.subject}</strong><p>{ticket.customer.name} {ticket.customer.last_name} · {ticket.customer.email}</p><p>Contacto: {ticket.contact_phone}{ticket.order_number ? ` · Pedido: ${ticket.order_number}` : ''}</p><p>{ticket.message}</p><small>{new Date(ticket.created_at).toLocaleString('es-CO')}</small></div><label>Estado<select aria-label={`Estado de ${ticket.subject}`} value={ticket.status} onChange={(event) => void changeStatus(ticket, event.target.value as SupportTicket['status'])}><option value="open">Abierto</option><option value="in_progress">En proceso</option><option value="closed">Cerrado</option></select></label></article>)}</div>;
}

function AdminCoveragePanel({
  accessToken,
  initialCoverage
}: {
  accessToken: string;
  initialCoverage: GlobalCoverageSettings | null;
}) {
  const [coverage, setCoverage] = useState<GlobalCoverageSettings>(
    initialCoverage || {
      enabled: false,
      label: 'Cobertura general de la vereda',
      notes: null,
      center: null,
      zoom: 16,
      polygon: []
    }
  );
  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (initialCoverage) {
      setCoverage(initialCoverage);
    }
  }, [initialCoverage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCoverageError(null);
    setIsSubmitting(true);

    try {
      const savedCoverage = await updateAdminCoverageSettings(accessToken, {
        ...coverage,
        label: emptyToNull(coverage.label || ''),
        notes: emptyToNull(coverage.notes || '')
      });
      setCoverage(savedCoverage);
    } catch (error) {
      setCoverageError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'No pudimos guardar la cobertura global.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="form-card">
        <div className="panel-card__header">
          <h2>Area valida para pedidos</h2>
          <p>
            Esta configuracion aplica a toda la plataforma. Solo los pedidos dentro de este poligono
            podran avanzar.
          </p>
          <p className="field-help">
            El dibujo del poligono se guarda aunque lo dejes desactivado. La casilla solo define si ya
            empieza a validar pedidos o no.
          </p>
        </div>

        <form className="admin-company-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field field--compact field--span-2">
            <span className="field__checkbox">
              <input
                checked={coverage.enabled}
                onChange={(event) =>
                  setCoverage((current) => ({ ...current, enabled: event.target.checked }))
                }
                type="checkbox"
              />
              <span>Activar cobertura global para la vereda</span>
            </span>
          </label>

          <label className="field field--compact">
            <span>Nombre interno</span>
            <input
              onChange={(event) =>
                setCoverage((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Cobertura vereda principal"
              value={coverage.label || ''}
            />
          </label>

          <label className="field field--compact">
            <span>Zoom recomendado</span>
            <input
              max="20"
              min="8"
              onChange={(event) =>
                setCoverage((current) => ({
                  ...current,
                  zoom: Number(event.target.value || 16)
                }))
              }
              type="number"
              value={coverage.zoom}
            />
          </label>

          <label className="field field--compact field--span-2">
            <span>Notas operativas</span>
            <textarea
              onChange={(event) =>
                setCoverage((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Ejemplo: incluir la via principal, la escuela y el parque de la vereda."
              rows={3}
              value={coverage.notes || ''}
            />
          </label>

          <div className="field field--compact">
            <span>Latitud centro</span>
            <input readOnly value={coverage.center?.latitude?.toFixed(6) || ''} />
          </div>

          <div className="field field--compact">
            <span>Longitud centro</span>
            <input readOnly value={coverage.center?.longitude?.toFixed(6) || ''} />
          </div>

          <div className="field field--span-2">
            {googleMapsApiKey ? (
              <CoverageMapEditor
                apiKey={googleMapsApiKey}
                center={coverage.center}
                onCenterChange={(center) =>
                  setCoverage((current) => ({ ...current, center }))
                }
                onPolygonChange={(polygon) =>
                  setCoverage((current) => ({ ...current, polygon }))
                }
                onZoomChange={(zoom) =>
                  setCoverage((current) => ({ ...current, zoom }))
                }
                polygon={coverage.polygon}
                zoom={coverage.zoom}
              />
            ) : (
              <div className="coverage-map-card coverage-map-card--empty">
                <strong>Mapa no disponible</strong>
                <p>
                  Puedes conservar o actualizar las coordenadas desde los controles disponibles.
                </p>
              </div>
            )}
          </div>

          <div className="field field--compact field--span-2">
            <span>Poligono guardado</span>
            <textarea readOnly rows={6} value={JSON.stringify(coverage.polygon, null, 2)} />
            <p className="field-help">
              Se actualiza solo cuando agregas o mueves puntos en el mapa.
            </p>
          </div>

          {coverageError ? <p className="form-error field--span-2">{coverageError}</p> : null}

          <div className="form-actions field--span-2">
            <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Guardando...' : 'Guardar cobertura'}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

function AdminCompaniesPanel({
  accessToken,
  companies
}: {
  accessToken: string;
  companies: CompanySummary[];
}) {
  const [draftCompanies, setDraftCompanies] = useState(companies);
  const [editingCompany, setEditingCompany] = useState<CompanySummary | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commissionDrafts, setCommissionDrafts] = useState<Record<number, string>>({});
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
  const [commissionLoadingId, setCommissionLoadingId] = useState<number | null>(null);
  const [teamCompany, setTeamCompany] = useState<CompanySummary | null>(null);
  const [formValues, setFormValues] = useState<AdminCompanyFormValues>(() => emptyCompanyForm());

  useEffect(() => {
    setDraftCompanies(companies);
  }, [companies]);

  const filteredCompanies = draftCompanies.filter((company) => {
    const target = `${company.name} ${company.type} ${company.email || ''} ${company.phone || ''}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateForm() {
    setEditingCompany(null);
    setIsCreating(true);
    setFormError(null);
    setFormValues(emptyCompanyForm());
  }

  function openEditForm(company: CompanySummary) {
    setEditingCompany(company);
    setIsCreating(false);
    setFormError(null);
    setFormValues({
      address: company.address || '',
      commission_percentage: String(Number(company.commission_percentage || 0)),
      description: company.description || '',
      email: company.email || '',
      name: company.name,
      phone: company.phone || '',
      rating: company.rating == null ? '' : String(company.rating),
      status: company.status || 'pending',
      type: company.type
    });
  }

  function closeForm() {
    setEditingCompany(null);
    setIsCreating(false);
    setFormError(null);
    setFormValues(emptyCompanyForm());
  }

  function patchCompany(updatedCompany: CompanySummary) {
    setDraftCompanies((current) =>
      current.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload: AdminCompanyPayload = {
        address: emptyToNull(formValues.address),
        commission_percentage: Number(formValues.commission_percentage || 0),
        description: emptyToNull(formValues.description),
        email: emptyToNull(formValues.email),
        name: formValues.name.trim(),
        phone: emptyToNull(formValues.phone),
        rating: formValues.rating ? Number(formValues.rating) : null,
        status: formValues.status,
        type: formValues.type
      };

      if (!payload.name) {
        throw new Error('El nombre es obligatorio.');
      }

      if (editingCompany) {
        const updated = await updateAdminCompany(accessToken, editingCompany.id, {
          address: payload.address,
          commission_percentage: payload.commission_percentage,
          description: payload.description,
          email: payload.email,
          name: payload.name,
          phone: payload.phone,
          rating: payload.rating,
          status: payload.status
        });
        patchCompany(updated);
        showToast({ kind: 'success', title: 'Empresa actualizada', message: `${updated.name} fue guardada correctamente.` });
      } else {
        const created = await createAdminCompany(accessToken, payload);
        setDraftCompanies((current) => [created, ...current]);
        setTeamCompany(created);
        showToast({ kind: 'success', title: 'Empresa creada', message: `${created.name} ya esta lista para configurarse.` });
      }

      closeForm();
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar la empresa.';
      setFormError(message);
      showToast({ kind: 'error', title: 'No pudimos guardar la empresa', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatus(company: CompanySummary) {
    const nextStatus = company.status === 'active' ? 'suspended' : 'active';
    setStatusLoadingId(company.id);

    try {
      const updated = await updateAdminCompanyStatus(accessToken, company.id, nextStatus);
      patchCompany(updated);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No pudimos cambiar el estado.');
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleCommissionSave(company: CompanySummary) {
    const draftValue = commissionDrafts[company.id] ?? String(Number(company.commission_percentage || 0));
    setCommissionLoadingId(company.id);

    try {
      const updated = await updateAdminCompanyCommission(
        accessToken,
        company.id,
        Number(draftValue || 0)
      );
      patchCompany(updated);
      setCommissionDrafts((current) => ({ ...current, [company.id]: String(Number(updated.commission_percentage || 0)) }));
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'No pudimos guardar la comision.');
    } finally {
      setCommissionLoadingId(null);
    }
  }

  if (teamCompany) {
    return <AdminCompanyTeamPanel accessToken={accessToken} company={teamCompany} onClose={() => setTeamCompany(null)} />;
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, tipo, correo o telefono"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateForm} type="button">
          Nueva empresa
        </button>
      </section>

      {(isCreating || editingCompany) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingCompany ? 'Editar empresa' : 'Crear empresa'}</h2>
              <p>Formulario rapido para administrar negocios desde web.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmit(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Tipo</span>
              <select
                disabled={Boolean(editingCompany)}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, type: event.target.value as CompanySummary['type'] }))
                }
                value={formValues.type}
              >
                <option value="food">food</option>
                <option value="products">products</option>
                <option value="services">services</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Correo</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                value={formValues.email}
              />
            </label>
            <label className="field field--compact">
              <span>Telefono</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
                value={formValues.phone}
              />
            </label>
            <label className="field field--compact field--span-2">
              <span>Direccion</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
                value={formValues.address}
              />
            </label>
            <label className="field field--compact field--span-2">
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                value={formValues.description}
              />
            </label>
            <label className="field field--compact">
              <span>Comision %</span>
              <input
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, commission_percentage: event.target.value }))
                }
                type="number"
                value={formValues.commission_percentage}
              />
            </label>
            <label className="field field--compact">
              <span>Rating</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, rating: event.target.value }))}
                step="0.1"
                type="number"
                value={formValues.rating}
              />
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </label>

            {formError ? <p className="form-error field--span-2">{formError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingCompany ? 'Guardar cambios' : 'Crear empresa'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="list-shell">
        <div className="list-head list-head--companies-admin">
          <span>Empresa</span>
          <span>Tipo</span>
          <span>Estado</span>
          <span>Comision</span>
          <span>Acciones</span>
        </div>
        <div className="list-body">
          {filteredCompanies.map((company) => (
            <article className="list-row list-row--companies-admin" key={company.id}>
              <div className="list-main">
                <strong>{company.name}</strong>
                <p>{company.email || company.phone || 'Sin contacto'}</p>
              </div>
              <span className="soft-pill" data-label="Tipo">{company.type}</span>
              <span className={`status-badge status-badge--${company.status}`} data-label="Estado">{company.status}</span>
              <div className="inline-editor" data-label="Comisión">
                <input
                  onChange={(event) =>
                    setCommissionDrafts((current) => ({ ...current, [company.id]: event.target.value }))
                  }
                  type="number"
                  value={commissionDrafts[company.id] ?? String(Number(company.commission_percentage || 0))}
                />
                <button
                  className="secondary-button inline-editor__button"
                  disabled={commissionLoadingId === company.id}
                  onClick={() => void handleCommissionSave(company)}
                  type="button"
                >
                  %
                </button>
              </div>
              <div className="row-actions" data-label="Acciones">
                <button className="secondary-button inline-action" onClick={() => openEditForm(company)} type="button">
                  Editar
                </button>
                <button className="secondary-button inline-action" onClick={() => setTeamCompany(company)} type="button">
                  Usuarios
                </button>
                {company.status === 'active' ? <DestructiveButton label="Suspender" title="Suspender empresa" impact="La empresa dejará de operar y sus usuarios perderán acceso operativo." disabled={statusLoadingId === company.id} onConfirm={() => handleStatus(company)} /> : <button className="secondary-button inline-action" disabled={statusLoadingId === company.id} onClick={() => void handleStatus(company)} type="button">Activar</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function CompanyDashboardPanel({
  appointments = [],
  companyType,
  data,
  walletTransactions = []
}: {
  appointments?: AppointmentSummary[];
  companyType: CompanySummary['type'];
  data: CompanyDashboardData;
  walletTransactions?: WalletTransactionSummary[];
}) {
  const [localWalletSummary, setLocalWalletSummary] = useState(data.wallet);
  const [localWalletTransactions, setLocalWalletTransactions] = useState(walletTransactions);

  useEffect(() => {
    setLocalWalletSummary(data.wallet);
  }, [data.wallet]);

  useEffect(() => {
    setLocalWalletTransactions(walletTransactions);
  }, [walletTransactions]);

  const wallet = localWalletSummary?.wallet;
  const commissionRate = localWalletSummary?.company?.commission_percentage;
  const lowThreshold = localWalletSummary?.low_balance_threshold;

  return (
    <section className="workspace-stack">
      <section className="metric-strip metric-strip--quad">
        <article className="metric-card metric-card--compact">
          <span>Pedidos acumulados</span>
          <strong>{data.all.orders}</strong>
          <small>Ventas: {formatMoney(data.all.sales)}</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Pedidos de hoy</span>
          <strong>{data.today.orders}</strong>
          <small>Comision: {formatMoney(data.today.commission)}</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Saldo disponible</span>
          <strong>{formatMoney(wallet?.balance)}</strong>
          <small>Comision actual: {formatPercent(commissionRate)}</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Estado de cartera</span>
          <strong>{walletStatusCopy(wallet?.status || 'insufficient_balance')}</strong>
          <small>Minimo sugerido: {formatMoney(lowThreshold)}</small>
        </article>
      </section>
      <section className="module-grid module-grid--balanced">
        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Cartera y comisiones</h2>
            <p>Asi va el saldo de la empresa con base en la comision configurada.</p>
          </div>
          <div className="detail-list detail-list--compact">
            <div className="detail-row detail-row--compact">
              <span>Porcentaje de comision</span>
              <strong>{formatPercent(commissionRate)}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Comisiones cobradas hoy</span>
              <strong>{formatMoney(data.wallet?.today?.commissions)}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Pedidos validados hoy</span>
              <strong>{data.wallet?.today?.orders || 0}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Estado actual</span>
              <strong className={`status-badge status-badge--${wallet?.status || 'insufficient_balance'}`}>
                {walletStatusCopy(wallet?.status || 'insufficient_balance')}
              </strong>
            </div>
          </div>
        </article>
        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Ultimos movimientos</h2>
            <p>Recargas, descuentos de comision y ajustes recientes.</p>
          </div>
          <div className="wallet-movement-list">
            {localWalletTransactions.length ? (
              localWalletTransactions.map((transaction) => (
                <div className="wallet-movement-item" key={transaction.id}>
                  <div className="wallet-movement-item__main">
                    <strong>{walletTransactionLabel(transaction.type)}</strong>
                    <p>{transaction.description || 'Movimiento sin descripcion'}</p>
                    {walletTransactionDetail(transaction) ? (
                      <small className="wallet-movement-item__detail">
                        {walletTransactionDetail(transaction)}
                      </small>
                    ) : null}
                  </div>
                  <div className="wallet-movement-item__side">
                    <strong
                      className={
                        Number(transaction.amount) >= 0
                          ? 'wallet-movement-item__amount is-positive'
                          : 'wallet-movement-item__amount is-negative'
                      }
                    >
                      {Number(transaction.amount) >= 0 ? '+' : ''}
                      {formatMoney(transaction.amount)}
                    </strong>
                    <small>Saldo: {formatMoney(transaction.balance_after)}</small>
                    <small>{formatDate(transaction.created_at)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="wallet-movement-item wallet-movement-item--empty">
                <strong>Sin movimientos todavia</strong>
                <p>Cuando hagas una recarga o se entregue un pedido, aparecera aqui.</p>
              </div>
            )}
          </div>
        </article>
      </section>
      {companyType === 'services' ? (
        <section className="list-shell">
          <div className="list-head list-head--appointments">
            <span>Servicio</span>
            <span>Fecha</span>
            <span>Profesional</span>
            <span>Estado</span>
            <span>Precio</span>
          </div>
          <div className="list-body">
            {appointments.slice(0, 6).map((appointment) => (
              <article className="list-row list-row--appointments" key={appointment.id}>
                <div className="list-main">
                  <strong>{appointment.service.name}</strong>
                  <p>
                    {appointment.customer.name} {appointment.customer.last_name}
                  </p>
                </div>
                <span data-label="Fecha">
                  {formatAppointmentDay(appointment.scheduled_date, appointment.start_time)}
                  <small>{appointment.start_time.slice(0, 5)}</small>
                </span>
                <span data-label="Profesional">{appointment.professional.name}</span>
                <span className={`status-badge status-badge--${appointment.status}`} data-label="Estado">{appointment.status}</span>
                <strong data-label="Precio">{formatMoney(appointment.price)}</strong>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="list-shell">
          <div className="list-head list-head--orders">
            <span>Pedido</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Venta</span>
          </div>
          <div className="list-body">
            {data.recent_orders.map((order) => (
              <article className="list-row list-row--orders" key={order.id}>
                <div className="list-main">
                  <strong>{order.order_number}</strong>
                </div>
                <span data-label="Fecha">{formatDate(order.created_at)}</span>
                <span className={`status-badge status-badge--${order.order_status}`} data-label="Estado">{order.order_status}</span>
                <strong data-label="Venta">{formatMoney(companyVisibleOrderTotal(order))}</strong>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function CompanyCommissionsPanel({
  accessToken,
  companyId,
  data,
  walletTransactions
}: {
  accessToken: string;
  companyId: number;
  data: CompanyDashboardData;
  walletTransactions: WalletTransactionSummary[];
}) {
  const wallet = data.wallet?.wallet;
  const lifetime = data.wallet?.lifetime;
  const commissionRate = data.wallet?.company?.commission_percentage;
  const [transactions, setTransactions] = useState(walletTransactions);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', search: '', type: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setTransactions(walletTransactions);
  }, [walletTransactions]);

  async function loadTransactions(nextFilters = filters) {
    try {
      setIsFiltering(true);
      setFilterError(null);
      const result = await getCompanyWalletTransactions(accessToken, companyId, {
        dateFrom: nextFilters.dateFrom || undefined,
        dateTo: nextFilters.dateTo || undefined,
        search: nextFilters.search || undefined,
        type: nextFilters.type || undefined
      });
      setTransactions(result);
    } catch (error) {
      setFilterError(error instanceof ApiError ? error.message : 'No pudimos filtrar los movimientos.');
    } finally {
      setIsFiltering(false);
    }
  }

  function handleClearFilters() {
    const emptyFilters = { dateFrom: '', dateTo: '', search: '', type: '' };
    setFilters(emptyFilters);
    void loadTransactions(emptyFilters);
  }

  return (
    <section className="workspace-stack">
      <section className="metric-strip metric-strip--quad">
        <article className="metric-card metric-card--compact">
          <span>Saldo disponible</span>
          <strong>{formatMoney(wallet?.balance)}</strong>
          <small>{walletStatusCopy(wallet?.status || 'insufficient_balance')}</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Ingresos a cartera</span>
          <strong>{formatMoney(lifetime?.credits)}</strong>
          <small>Recargas, bonos y ajustes positivos</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Salidas de cartera</span>
          <strong>{formatMoney(lifetime?.debits)}</strong>
          <small>Comisiones y ajustes negativos</small>
        </article>
        <article className="metric-card metric-card--compact">
          <span>Comisiones cobradas</span>
          <strong>{formatMoney(lifetime?.commissions)}</strong>
          <small>Historico de pedidos entregados</small>
        </article>
      </section>

      <section className="module-grid module-grid--balanced">
        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Resumen del negocio</h2>
            <p>Las ventas y la cartera se muestran por separado para mantener las cuentas claras.</p>
          </div>
          <div className="detail-list detail-list--compact">
            <div className="detail-row detail-row--compact">
              <span>Ventas del negocio</span>
              <strong>{formatMoney(data.all.sales)}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Porcentaje de comision</span>
              <strong>{formatPercent(commissionRate)}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Comisiones de hoy</span>
              <strong>{formatMoney(data.wallet?.today?.commissions)}</strong>
            </div>
            <div className="detail-row detail-row--compact">
              <span>Pedidos registrados</span>
              <strong>{data.all.orders}</strong>
            </div>
          </div>
          <p className="wallet-clarification">
            El domicilio no aparece como venta ni se usa para calcular comisiones.
          </p>
        </article>

        <article className="panel-card panel-card--compact">
          <div className="panel-card__header">
            <h2>Como se calcula</h2>
            <p>Ejemplo para entender cada cobro del historial.</p>
          </div>
          <div className="commission-formula">
            <strong>Venta de productos o servicio</strong>
            <span>x {formatPercent(commissionRate)} de comision</span>
            <strong>= descuento a la cartera</strong>
          </div>
          <small className="wallet-clarification">
            Los descuentos o cupones reducen la base de la venta; el envio siempre queda por fuera.
          </small>
        </article>
      </section>

      <form
        className={`panel-card panel-card--compact wallet-filters ${filtersOpen ? 'is-open' : ''}`}
        onSubmit={(event) => {
          event.preventDefault();
          void loadTransactions();
        }}
      >
        <div className="panel-card__header wallet-filters__header">
          <h2>Buscar movimientos</h2>
          <p>Filtra por pedido, fecha o tipo de operacion.</p>
          <button className="wallet-filters__toggle" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}</button>
        </div>
        <div className="wallet-filters__body">
        <div className="wallet-filters__grid">
          <label className="field field--compact wallet-filters__search">
            <span>Pedido o descripcion</span>
            <input
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Ej. ORD-1788122167298-66AC13"
              value={filters.search}
            />
          </label>
          <label className="field field--compact">
            <span>Desde</span>
            <input
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
              type="date"
              value={filters.dateFrom}
            />
          </label>
          <label className="field field--compact">
            <span>Hasta</span>
            <input
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
              type="date"
              value={filters.dateTo}
            />
          </label>
          <label className="field field--compact">
            <span>Tipo</span>
            <select
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
              value={filters.type}
            >
              <option value="">Todos los movimientos</option>
              <option value="order_commission">Comisiones cobradas</option>
              <option value="topup">Recargas</option>
              <option value="bonus">Bonos</option>
              <option value="refund">Reintegros</option>
              <option value="manual_credit">Creditos manuales</option>
              <option value="manual_debit">Debitos manuales</option>
              <option value="adjustment">Ajustes</option>
            </select>
          </label>
        </div>
        {filterError ? <p className="form-error" role="alert">{filterError}</p> : null}
        <div className="form-actions">
          <button className="primary-button toolbar-button" disabled={isFiltering} type="submit">
            {isFiltering ? 'Buscando...' : 'Aplicar filtros'}
          </button>
          <button className="secondary-button toolbar-button" disabled={isFiltering} onClick={handleClearFilters} type="button">
            Limpiar filtros
          </button>
        </div>
        </div>
      </form>

      <article className="panel-card panel-card--compact">
        <div className="panel-card__header">
          <h2>Detalle de movimientos</h2>
          <p>Cada movimiento conserva el saldo resultante y, para pedidos, la venta usada como base.</p>
        </div>
        <div className="wallet-movement-list">
          {transactions.length ? (
            transactions.map((transaction) => (
              <div className="wallet-movement-item" key={transaction.id}>
                <div className="wallet-movement-item__main">
                  <strong>{walletTransactionLabel(transaction.type)}</strong>
                  <p>{transaction.description || 'Movimiento sin descripcion'}</p>
                  {walletTransactionDetail(transaction) ? (
                    <small className="wallet-movement-item__detail">
                      {walletTransactionDetail(transaction)}
                    </small>
                  ) : null}
                </div>
                <div className="wallet-movement-item__side">
                  <strong
                    className={
                      Number(transaction.amount) >= 0
                        ? 'wallet-movement-item__amount is-positive'
                        : 'wallet-movement-item__amount is-negative'
                    }
                  >
                    {Number(transaction.amount) >= 0 ? '+' : ''}
                    {formatMoney(transaction.amount)}
                  </strong>
                  <small>Saldo: {formatMoney(transaction.balance_after)}</small>
                  <small>{formatDate(transaction.created_at)}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="wallet-movement-item wallet-movement-item--empty">
              <strong>Aun no hay movimientos</strong>
              <p>Las recargas y comisiones de pedidos entregados apareceran aqui.</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function OrdersPanel({
  accessToken,
  companyId,
  company,
  orders
}: {
  accessToken: string;
  companyId: number;
  company: UserCompanyMembership['company'];
  orders: CompanyOrder[];
}) {
  const [draftOrders, setDraftOrders] = useState(orders);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actingOrderId, setActingOrderId] = useState<number | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<CompanyOrder | null>(null);

  useEffect(() => {
    setDraftOrders(orders);
  }, [orders]);

  async function handleAction(order: CompanyOrder, action: OrderAction) {
    setOrderError(null);
    setActingOrderId(order.id);

    try {
      let rejectionReason: string | undefined;

      if (action === 'reject') {
        const promptValue = window.prompt('Escribe el motivo del rechazo');

        if (!promptValue?.trim()) {
          setActingOrderId(null);
          return;
        }

        rejectionReason = promptValue.trim();
      }

      const updated = await transitionCompanyOrderStatus(
        accessToken,
        companyId,
        order.id,
        action,
        rejectionReason
      );

      setDraftOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      if (action === 'waiting-delivery') {
        setReceiptOrder(updated);
      }
    } catch (error) {
      setOrderError(error instanceof ApiError ? error.message : 'No pudimos actualizar el pedido.');
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <section className="workspace-stack">
      {orderError ? <p className="form-error" role="alert">{orderError}</p> : null}
      <section className="list-shell">
        <div className="list-head list-head--orders-detail">
          <span>Pedido</span>
          <span>Pago</span>
          <span>Estado del pedido</span>
          <span>Venta</span>
          <span>Acciones</span>
        </div>
        <div className="list-body">
          {draftOrders.map((order) => (
            <div className="order-block" key={order.id}>
              <article className="list-row list-row--orders-detail">
                <div className="list-main list-main--stacked">
                  <div>
                    <h2>{order.order_number}</h2>
                    <p>{formatDate(order.created_at)}</p>
                  </div>
                  <small>{orderSummary(order)}</small>
                </div>
                <div className="list-main list-main--stacked" data-label="Pago">
                  <strong>{order.payment_method === 'pse' ? 'PSE' : order.payment_method === 'cash' ? 'Efectivo' : 'Sin definir'}</strong>
                  <span className={`status-badge status-badge--${order.payment_status || 'pending'}`}>
                    {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'failed' ? 'Fallido' : order.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente de pago'}
                  </span>
                </div>
                <span className={`status-badge status-badge--${order.order_status}`} data-label="Estado">{order.order_status}</span>
                <div className="list-side" data-label="Venta">
                  <strong>{formatMoney(companyVisibleOrderTotal(order))}</strong>
                  <small>{order.address?.address || order.address?.address_line || 'Sin direccion'}</small>
                </div>
                <div className="row-actions" data-label="Acciones">
                  <button
                    className="secondary-button inline-action"
                    onClick={() =>
                      setExpandedOrderId((current) => (current === order.id ? null : order.id))
                    }
                    type="button"
                  >
                    {expandedOrderId === order.id ? 'Ocultar' : 'Detalle'}
                  </button>
                  <button className="secondary-button inline-action" onClick={() => setReceiptOrder(order)} title="Ver o guardar la tirilla en PDF" type="button">PDF</button>
                  {getOrderActions(order.order_status).map((action) => action.key === 'reject' ? <DestructiveButton key={action.key} label={action.label} title="Rechazar pedido" impact="El pedido se cancelará y el cliente recibirá el motivo registrado." disabled={actingOrderId === order.id} onConfirm={() => handleAction(order, action.key)} /> : <button className="secondary-button inline-action" disabled={actingOrderId === order.id} key={action.key} onClick={() => void handleAction(order, action.key)} type="button">{action.label}</button>)}
                </div>
              </article>

              {expandedOrderId === order.id ? (
                <section className="order-detail">
                  <div className="order-detail__grid">
                    <article className="order-detail__card">
                      <h3>Items</h3>
                      <div className="detail-list detail-list--compact">
                        {order.items?.length ? (
                          order.items.map((item) => (
                            <div className="detail-row detail-row--compact detail-row--stacked" key={item.id}>
                              <div>
                                <strong>
                                  {item.quantity}x {item.product_name}
                                </strong>
                                <p>{formatMoney(item.line_total)}</p>
                              </div>
                              <div className="order-detail__notes">
                                {item.variants.length ? (
                                  <small>
                                    Variantes: {item.variants.map((variant) => variant.option_name).join(', ')}
                                  </small>
                                ) : null}
                                {item.ingredientAdjustments.length ? (
                                  <small>
                                    Ajustes: {item.ingredientAdjustments
                                      .map((ingredient) => `${ingredient.action} ${ingredient.ingredient_name}`)
                                      .join(', ')}
                                  </small>
                                ) : null}
                                {item.customer_notes ? <small>Nota: {item.customer_notes}</small> : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="order-detail__empty">Sin items detallados.</p>
                        )}
                      </div>
                    </article>
                    <article className="order-detail__card">
                      <h3>Resumen</h3>
                      <div className="detail-list detail-list--compact">
                        <div className="detail-row detail-row--compact">
                          <span>Productos</span>
                          <strong>{formatMoney(order.subtotal)}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Descuento</span>
                          <strong>{formatMoney(order.discount)}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Venta del negocio</span>
                          <strong>{formatMoney(companyVisibleOrderTotal(order))}</strong>
                        </div>
                      </div>
                      {order.customer_notes ? (
                        <div className="order-detail__info">
                          <strong>Nota del cliente</strong>
                          <p>{order.customer_notes}</p>
                        </div>
                      ) : null}
                      {order.rejection_reason ? (
                        <div className="order-detail__info">
                          <strong>Motivo de rechazo</strong>
                          <p>{order.rejection_reason}</p>
                        </div>
                      ) : null}
                    </article>
                  </div>
                </section>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      {receiptOrder ? (
        <OrderReceiptModal
          company={company}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />
      ) : null}
    </section>
  );
}

function OrderReceiptModal({
  company,
  onClose,
  order
}: {
  company: UserCompanyMembership['company'];
  onClose: () => void;
  order: CompanyOrder;
}) {
  const logoUrl = resolveMediaUrl(company.logo);
  const receiptTotal = Number(order.total || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const productTotal = order.subtotal != null
    ? Number(order.subtotal || 0) - Number(order.discount || 0)
    : receiptTotal - deliveryFee;

  return (
    <div aria-modal="true" className="order-receipt-backdrop" role="dialog" aria-labelledby="order-receipt-title">
      <section className="order-receipt-modal">
        <header className="order-receipt-modal__header">
          <div>
            <span>Pedido listo para envío</span>
            <h3 id="order-receipt-title">Tirilla de preparación</h3>
          </div>
          <button aria-label="Cerrar tirilla" className="order-receipt-modal__close" onClick={onClose} type="button">×</button>
        </header>
        <article className="order-receipt" id="order-receipt-print">
          <div className="order-receipt__brand">
            {logoUrl ? <img alt={`Logo de ${company.name}`} src={logoUrl} /> : <strong>{company.name.slice(0, 1).toUpperCase()}</strong>}
            <h2>{company.name}</h2>
            <span>COMPROBANTE DE PEDIDO</span>
          </div>
          <div className="order-receipt__meta">
            <div><span>Pedido</span><strong>{order.order_number}</strong></div>
            <div><span>Fecha</span><strong>{formatDate(order.created_at)}</strong></div>
            <div><span>Pago</span><strong>{order.payment_method === 'pse' ? 'PSE' : 'Efectivo'}</strong></div>
          </div>
          <div className="order-receipt__rule" />
          <div className="order-receipt__items">
            {order.items?.map((item) => (
              <div className="order-receipt__item" key={item.id}>
                <div><strong>{item.quantity} x {item.product_name}</strong>{item.variants.length ? <small>{item.variants.map((variant) => variant.option_name).join(', ')}</small> : null}{item.customer_notes ? <small>Nota: {item.customer_notes}</small> : null}</div>
                <strong>{formatMoney(item.line_total)}</strong>
              </div>
            ))}
          </div>
          <div className="order-receipt__rule" />
          <div className="order-receipt__summary">
            <div><span>Productos</span><strong>{formatMoney(productTotal)}</strong></div>
            {deliveryFee > 0 ? <div><span>Domicilio</span><strong>{formatMoney(deliveryFee)}</strong></div> : null}
          </div>
          <div className="order-receipt__total"><span>TOTAL COBRADO</span><strong>{formatMoney(receiptTotal)}</strong></div>
          <div className="order-receipt__delivery"><strong>Entrega</strong><span>{order.address?.address || order.address?.address_line || 'Dirección por confirmar'}</span></div>
          {order.customer_notes ? <p className="order-receipt__customer-note">Instrucciones: {order.customer_notes}</p> : null}
          <p className="order-receipt__footer">Estado: listo para envío<br />Gracias por tu compra</p>
        </article>
        <footer className="order-receipt-modal__actions">
          <button className="secondary-button" onClick={() => window.print()} type="button">Imprimir</button>
          <button className="primary-button" onClick={() => window.print()} type="button">PDF</button>
        </footer>
        <p className="order-receipt-modal__help">En la ventana de impresión selecciona “Guardar como PDF” para descargarla.</p>
      </section>
    </div>
  );
}

function flattenVariantOptions(variants: CompanyVariant[]): CompanyVariant['options'] {
  return variants.flatMap((variant) => variant.options.flatMap((option) => [
    option,
    ...flattenVariantOptions(option.childVariants || option.child_variants || [])
  ]));
}

function productVariantPriceMap(variants: CompanyVariant[]) {
  return Object.fromEntries(
    flattenVariantOptions(variants).map((option) => [option.id, String(Number(option.additional_price || 0))])
  );
}

export function ProductVariantPricingEditor({
  variant,
  prices,
  onPriceChange,
  depth = 0
}: {
  variant: CompanyVariant;
  prices: Record<number, string>;
  onPriceChange: (optionId: number, price: string) => void;
  depth?: number;
}) {
  return (
    <section className={`product-variant-pricing${depth ? ' is-nested' : ''}`}>
      <div className="product-variant-pricing__header">
        <strong>{variant.name}</strong>
        <small>Incremento sobre el precio base del producto</small>
      </div>
      <div className="product-variant-pricing__options">
        {variant.options.map((option) => (
          <div className="product-variant-pricing__branch" key={option.id}>
            <label className="product-variant-price-row">
              <span>{option.name}</span>
              <span className="product-variant-price-input">
                <b>+$</b>
                <input
                  aria-label={`Precio adicional de ${option.name}`}
                  min="0"
                  onChange={(event) => onPriceChange(option.id, event.target.value)}
                  step="100"
                  type="number"
                  value={prices[option.id] ?? '0'}
                />
              </span>
            </label>
            {(option.childVariants || option.child_variants || []).map((child) => (
              <ProductVariantPricingEditor
                depth={depth + 1}
                key={child.id}
                onPriceChange={onPriceChange}
                prices={prices}
                variant={child}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsPanel({
  accessToken,
  categories,
  companyId,
  products,
  variants
}: {
  accessToken: string;
  categories: PublicCategory[];
  companyId: number;
  products: CompanyProduct[];
  variants: CompanyVariant[];
}) {
  const [draftProducts, setDraftProducts] = useState(products);
  const [editingProduct, setEditingProduct] = useState<CompanyProduct | null>(null);
  const [duplicatingProductId, setDuplicatingProductId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSavingIngredient, setIsSavingIngredient] = useState(false);
  const [ingredientLibrary, setIngredientLibrary] = useState<IngredientLibraryItem[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isLoadingIngredientLibrary, setIsLoadingIngredientLibrary] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
  const [ingredientDraft, setIngredientDraft] = useState<IngredientFormValues>(() => emptyIngredientForm());
  const [variantDraft, setVariantDraft] = useState<VariantFormValues>(() => emptyVariantForm());
  const [isSavingVariant, setIsSavingVariant] = useState(false);
  const [draftVariants, setDraftVariants] = useState(variants);
  const [openProductSection, setOpenProductSection] = useState<'images' | 'variants' | 'ingredients' | null>('images');
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [formValues, setFormValues] = useState<ProductFormValues>(() => emptyProductForm(categories[0]?.id));

  useEffect(() => {
    setDraftProducts(products);
  }, [products]);

  useEffect(() => {
    setDraftVariants(variants);
  }, [variants]);

  useEffect(() => {
    setFormValues((current) => ({
      ...current,
      category_id: current.category_id || categories[0]?.id || 0
    }));
  }, [categories]);

  useEffect(() => {
    if (!editingProduct || openProductSection !== 'ingredients') return undefined;

    if (ingredientSearch.trim().length < 2) {
      setIngredientLibrary([]);
      setIsLoadingIngredientLibrary(false);
      return undefined;
    }

    let isCurrent = true;
    const timer = window.setTimeout(async () => {
      setIsLoadingIngredientLibrary(true);
      try {
        const ingredients = await getCompanyIngredientLibrary(accessToken, companyId, ingredientSearch);
        if (isCurrent) setIngredientLibrary(ingredients);
      } catch (error) {
        if (isCurrent) {
          setProductError(error instanceof ApiError ? error.message : 'No pudimos buscar los ingredientes guardados.');
        }
      } finally {
        if (isCurrent) setIsLoadingIngredientLibrary(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [accessToken, companyId, editingProduct?.id, ingredientSearch, openProductSection]);

  const filteredProducts = draftProducts.filter((product) => {
    const categoryName = product.category?.name || '';
    const variantsLabel = product.variants.map((variant) => variant.name).join(' ');
    const target = `${product.name} ${product.description || ''} ${categoryName} ${variantsLabel}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateProduct() {
    setEditingProduct(null);
    setIsCreating(true);
    setProductError(null);
    setSelectedFiles([]);
    setEditingIngredientId(null);
    setIngredientDraft(emptyIngredientForm());
    setIngredientSearch('');
    setIngredientLibrary([]);
    setVariantDraft(emptyVariantForm());
    setOpenProductSection('images');
    setIsVariantSelectorOpen(false);
    setFormValues(emptyProductForm(categories[0]?.id));
  }

  function openEditProduct(product: CompanyProduct) {
    setEditingProduct(product);
    setIsCreating(false);
    setProductError(null);
    setOpenProductSection('images');
    setIsVariantSelectorOpen(false);
    setIngredientSearch('');
    setIngredientLibrary([]);
    setFormValues({
      base_price: String(Number(product.base_price || 0)),
      category_id: product.category?.id || categories[0]?.id || 0,
      description: product.description || '',
      name: product.name,
      status: product.status,
      variant_ids: product.variants.map((variant) => variant.id),
      variant_prices: productVariantPriceMap(product.variants)
    });
  }

  function closeProductForm() {
    setEditingProduct(null);
    setIsCreating(false);
    setProductError(null);
    setSelectedFiles([]);
    setEditingIngredientId(null);
    setIngredientDraft(emptyIngredientForm());
    setIngredientSearch('');
    setIngredientLibrary([]);
    setVariantDraft(emptyVariantForm());
    setOpenProductSection('images');
    setIsVariantSelectorOpen(false);
    setFormValues(emptyProductForm(categories[0]?.id));
  }

  function patchProduct(updatedProduct: CompanyProduct) {
    setDraftProducts((current) =>
      current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    );
  }

  function toggleVariant(variantId: number) {
    setFormValues((current) => ({
      ...current,
      variant_ids: current.variant_ids.includes(variantId)
        ? current.variant_ids.filter((id) => id !== variantId)
        : [...current.variant_ids, variantId]
    }));
  }

  function updateProductVariantPrice(optionId: number, value: string) {
    setFormValues((current) => ({
      ...current,
      variant_prices: { ...current.variant_prices, [optionId]: value }
    }));
  }

  function updateVariantOption(
    index: number,
    patch: Partial<VariantFormValues['options'][number]>
  ) {
    setVariantDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option
      )
    }));
  }

  function addVariantOption() {
    setVariantDraft((current) => ({
      ...current,
      options: [...current.options, { child_variants: [], name: '', status: 'active' }]
    }));
  }

  function removeVariantOption(index: number) {
    setVariantDraft((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index)
    }));
  }

  function patchEditingProduct(updatedProduct: CompanyProduct) {
    setEditingProduct(updatedProduct);
    patchProduct(updatedProduct);
  }

  function toggleProductSection(section: 'images' | 'variants' | 'ingredients') {
    setOpenProductSection((current) => (current === section ? null : section));
  }

  function resetIngredientForm() {
    setEditingIngredientId(null);
    setIngredientDraft(emptyIngredientForm());
  }

  function startEditIngredient(ingredient: CompanyProduct['ingredients'][number]) {
    setEditingIngredientId(ingredient.id);
    setIngredientDraft({
      is_default: ingredient.is_default !== false,
      is_removable: Boolean(ingredient.is_removable),
      name: ingredient.name,
      sort_order: String(Number(ingredient.sort_order || 1)),
      status: ingredient.status || 'active'
    });
  }

  async function handleSubmitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        base_price: Number(formValues.base_price),
        category_id: Number(formValues.category_id),
        description: emptyToNull(formValues.description),
        name: formValues.name.trim(),
        status: formValues.status,
        variant_ids: formValues.variant_ids,
        variant_prices: flattenVariantOptions(
          draftVariants.filter((variant) => formValues.variant_ids.includes(variant.id))
        ).map((option) => ({
          variant_option_id: option.id,
          additional_price: Number(formValues.variant_prices[option.id] || 0)
        }))
      };

      if (!payload.name) {
        throw new Error('El nombre del producto es obligatorio.');
      }

      if (!payload.category_id) {
        throw new Error('Debes seleccionar una categoria.');
      }

      if (payload.base_price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }

      if (payload.variant_prices.some((price) => !Number.isFinite(price.additional_price) || price.additional_price < 0)) {
        throw new Error('Los precios adicionales no pueden ser negativos.');
      }

      if (editingProduct) {
        const updated = await updateCompanyProduct(accessToken, companyId, editingProduct.id, payload);
        patchProduct(updated);
      } else {
        const created = await createCompanyProduct(accessToken, companyId, payload);
        setDraftProducts((current) => [created, ...current]);
      }

      closeProductForm();
    } catch (error) {
      setProductError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reloadEditedProduct(productId: number) {
    const refreshed = await getCompanyProducts(accessToken, companyId);
    setDraftProducts(refreshed);
    const updated = refreshed.find((product) => product.id === productId) || null;
    setEditingProduct(updated);
  }

  async function handleUploadImages() {
    if (!editingProduct || !selectedFiles.length) {
      return;
    }

    setProductError(null);
    setIsUploadingImages(true);

    try {
      const updated = await uploadCompanyProductImages(accessToken, companyId, editingProduct.id, selectedFiles);
      patchEditingProduct(updated);
      setSelectedFiles([]);
    } catch (error) {
      setProductError(error instanceof ApiError ? error.message : 'No pudimos subir las imagenes.');
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!editingProduct) {
      return;
    }

    setProductError(null);
    const previousProduct = editingProduct;
    const optimisticProduct = {
      ...editingProduct,
      images: editingProduct.images.filter((image) => image.id !== imageId)
    };
    patchEditingProduct(optimisticProduct);

    try {
      await deleteCompanyProductImage(accessToken, companyId, editingProduct.id, imageId);
    } catch (error) {
      patchEditingProduct(previousProduct);
      setProductError(error instanceof ApiError ? error.message : 'No pudimos eliminar la imagen.');
    }
  }

  async function handleSaveIngredient() {
    if (!editingProduct) {
      return;
    }

    setProductError(null);
    setIsSavingIngredient(true);

    try {
      const payload = {
        is_default: ingredientDraft.is_default,
        is_removable: ingredientDraft.is_removable,
        name: ingredientDraft.name.trim(),
        sort_order: Number(ingredientDraft.sort_order || 1),
        status: ingredientDraft.status
      };

      if (!payload.name) {
        throw new Error('El nombre del ingrediente es obligatorio.');
      }

      if (editingIngredientId) {
        await updateCompanyProductIngredient(
          accessToken,
          companyId,
          editingProduct.id,
          editingIngredientId,
          payload
        );
      } else {
        await createCompanyProductIngredient(accessToken, companyId, editingProduct.id, payload);
      }

      await reloadEditedProduct(editingProduct.id);
      resetIngredientForm();
    } catch (error) {
      setProductError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el ingrediente.');
    } finally {
      setIsSavingIngredient(false);
    }
  }

  async function addIngredientFromLibrary(
    name: string,
    settings: Pick<IngredientLibraryItem, 'is_default' | 'is_removable'> = {
      is_default: true,
      is_removable: false
    }
  ) {
    if (!editingProduct) return;

    setProductError(null);
    setIsSavingIngredient(true);
    try {
      const nextOrder = Math.max(0, ...editingProduct.ingredients.map((ingredient) => Number(ingredient.sort_order || 0))) + 1;
      await createCompanyProductIngredient(accessToken, companyId, editingProduct.id, {
        name,
        is_default: settings.is_default,
        is_removable: settings.is_default ? settings.is_removable : false,
        sort_order: nextOrder,
        status: 'active'
      });
      await reloadEditedProduct(editingProduct.id);
      setIngredientSearch('');
      showToast({
        kind: 'success',
        title: 'Ingrediente agregado',
        message: `${name} fue agregado al producto.`
      });
    } catch (error) {
      setProductError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos agregar el ingrediente.');
    } finally {
      setIsSavingIngredient(false);
    }
  }

  async function handleDeleteIngredient(ingredientId: number) {
    if (!editingProduct) {
      return;
    }

    setProductError(null);

    try {
      await deleteCompanyProductIngredient(accessToken, companyId, editingProduct.id, ingredientId);
      await reloadEditedProduct(editingProduct.id);
      if (editingIngredientId === ingredientId) {
        resetIngredientForm();
      }
    } catch (error) {
      setProductError(error instanceof ApiError ? error.message : 'No pudimos eliminar el ingrediente.');
    }
  }

  async function handleCreateVariant() {
    setProductError(null);
    setIsSavingVariant(true);

    try {
      const payload = variantFormToPayload(variantDraft);

      if (!payload.name) {
        throw new Error('La adicion necesita un nombre.');
      }

      if (!payload.options.length) {
        throw new Error('Agrega al menos una opcion para la adicion.');
      }

      const created = await createCompanyVariant(accessToken, companyId, payload);
      setDraftVariants((current) => [...current, created]);
      setFormValues((current) => ({
        ...current,
        variant_ids: current.variant_ids.includes(created.id)
          ? current.variant_ids
          : [...current.variant_ids, created.id]
      }));
      setVariantDraft(emptyVariantForm());
    } catch (error) {
      setProductError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos crear la adicion.');
    } finally {
      setIsSavingVariant(false);
    }
  }

  async function handleDuplicateProduct(product: CompanyProduct) {
    setProductError(null);
    setDuplicatingProductId(product.id);
    try {
      const copy = await duplicateCompanyProduct(accessToken, companyId, product.id);
      setDraftProducts((current) => [copy, ...current]);
      showToast({
        kind: 'success',
        title: 'Producto copiado',
        message: `${copy.name} quedó inactivo y listo para completar sus imágenes.`
      });
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos copiar el producto.';
      setProductError(message);
      showToast({ kind: 'error', title: 'No pudimos copiar el producto', message });
    } finally {
      setDuplicatingProductId(null);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por producto, categoria o variante"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateProduct} type="button">
          Nuevo producto
        </button>
      </section>

      {(isCreating || editingProduct) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingProduct ? 'Editar producto' : 'Crear producto'}</h2>
              <p>Configura precio, categoria, estado y variantes desde el panel web.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeProductForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitProduct(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Categoria</span>
              <select
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, category_id: Number(event.target.value) }))
                }
                value={formValues.category_id}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--compact">
              <span>Precio base</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, base_price: event.target.value }))}
                type="number"
                value={formValues.base_price}
              />
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="inactive">inactive</option>
                <option value="active">active</option>
              </select>
            </label>
            <label className="field field--compact field--span-2">
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                value={formValues.description}
              />
            </label>
            <div className={`product-option-picker field--span-2${isVariantSelectorOpen ? ' is-open' : ''}`}>
              <button
                aria-expanded={isVariantSelectorOpen}
                className="product-option-picker__toggle"
                onClick={() => setIsVariantSelectorOpen((current) => !current)}
                type="button"
              >
                <span className="product-option-picker__heading">
                  <strong>Opciones del combo</strong>
                  <small>
                    {formValues.variant_ids.length
                      ? `${formValues.variant_ids.length} grupo${formValues.variant_ids.length === 1 ? '' : 's'} seleccionado${formValues.variant_ids.length === 1 ? '' : 's'}`
                      : 'Selecciona tamanos, bebidas, acompanamientos o extras'}
                  </small>
                </span>
                <span className="product-option-picker__badge">{formValues.variant_ids.length}</span>
                <span className="accordion-toggle__icon">{isVariantSelectorOpen ? '-' : '+'}</span>
              </button>

              {isVariantSelectorOpen ? (
                <div className="product-option-picker__body">
                  {draftVariants.length ? (
                    <>
                    <div className="product-option-choice-grid">
                      {draftVariants.map((variant) => {
                        const isSelected = formValues.variant_ids.includes(variant.id);

                        return (
                          <label className={`product-option-choice${isSelected ? ' is-selected' : ''}`} key={variant.id}>
                            <input
                              checked={isSelected}
                              className="product-option-choice__input"
                              onChange={() => toggleVariant(variant.id)}
                              type="checkbox"
                            />
                            <span aria-hidden="true" className="product-option-choice__check">{isSelected ? '✓' : ''}</span>
                            <span className="product-option-choice__content">
                              <strong>{variant.name}</strong>
                              <small>
                                {variant.required ? 'Obligatorio' : 'Opcional'} · {variant.selection_type === 'multiple' ? `Hasta ${variant.max_selections}` : 'Elige una'}
                              </small>
                              <span className="product-option-choice__options">
                                {variant.options.slice(0, 4).map((option) => (
                                  <em key={option.id}>
                                    {option.name}
                                  </em>
                                ))}
                                {variant.options.length > 4 ? <em>+{variant.options.length - 4} mas</em> : null}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {formValues.variant_ids.length ? (
                      <div className="product-variant-pricing-list">
                        <div className="product-variant-pricing-list__heading">
                          <strong>Precios de estas opciones para este producto</strong>
                          <p>Usa 0 cuando esté incluida. Estos valores no afectan otros productos.</p>
                        </div>
                        {draftVariants
                          .filter((variant) => formValues.variant_ids.includes(variant.id))
                          .map((variant) => (
                            <ProductVariantPricingEditor
                              key={variant.id}
                              onPriceChange={updateProductVariantPrice}
                              prices={formValues.variant_prices}
                              variant={variant}
                            />
                          ))}
                      </div>
                    ) : null}
                    </>
                  ) : (
                    <p className="product-option-picker__empty">Aun no hay grupos de opciones. Puedes crearlos abajo, en Adiciones disponibles.</p>
                  )}
                </div>
              ) : null}
            </div>

            {productError ? <p className="form-error field--span-2">{productError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeProductForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>

          {editingProduct ? (
            <div className="product-extra-sections">
              <section className={`extra-card extra-card--accordion${openProductSection === 'images' ? ' is-open' : ''}`}>
                <button
                  aria-expanded={openProductSection === 'images'}
                  className="accordion-toggle"
                  onClick={() => toggleProductSection('images')}
                  type="button"
                >
                  <div>
                    <h2>Imagenes</h2>
                    <p>Sube de 1 a 5 imagenes. Para activar el producto necesitas minimo 1.</p>
                  </div>
                  <span className="accordion-toggle__icon">{openProductSection === 'images' ? '-' : '+'}</span>
                </button>
                {openProductSection === 'images' ? (
                  <div className="accordion-body">
                    <div className="upload-row">
                      <input
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                        type="file"
                      />
                      <button
                        className="primary-button toolbar-button"
                        disabled={!selectedFiles.length || isUploadingImages}
                        onClick={() => void handleUploadImages()}
                        type="button"
                      >
                        {isUploadingImages ? 'Subiendo...' : 'Subir imagenes'}
                      </button>
                    </div>
                    <div className="image-grid">
                      {editingProduct.images.map((image) => (
                        <article className="image-card" key={image.id}>
                          <ProductImagePreview alt={editingProduct.name} src={resolveMediaUrl(image.image_url)} />
                          <DestructiveButton label="Eliminar" title="Eliminar imagen" impact="La imagen se eliminará del producto de forma permanente." onConfirm={() => handleDeleteImage(image.id)} />
                        </article>
                      ))}
                      {!editingProduct.images.length ? (
                        <div className="image-grid__empty">
                          <strong>Aún no hay imágenes</strong>
                          <span>Sube una imagen horizontal o cuadrada para presentar mejor el producto.</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={`extra-card extra-card--accordion${openProductSection === 'variants' ? ' is-open' : ''}`}>
                <button
                  aria-expanded={openProductSection === 'variants'}
                  className="accordion-toggle"
                  onClick={() => toggleProductSection('variants')}
                  type="button"
                >
                  <div>
                    <h2>Adiciones disponibles</h2>
                    <p>Crea nuevas adiciones como tamanos, toppings o extras sin salir del producto.</p>
                  </div>
                  <span className="accordion-toggle__icon">{openProductSection === 'variants' ? '-' : '+'}</span>
                </button>
                {openProductSection === 'variants' ? (
                  <div className="accordion-body">
                    <div className="admin-company-form">
                      <label className="field field--compact">
                        <span>Nombre de la adicion</span>
                        <input
                          onChange={(event) => setVariantDraft((current) => ({ ...current, name: event.target.value }))}
                          value={variantDraft.name}
                        />
                      </label>
                      <label className="field field--compact">
                        <span>Tipo</span>
                        <select
                          onChange={(event) =>
                            setVariantDraft((current) => ({
                              ...current,
                              selection_type: event.target.value as VariantFormValues['selection_type']
                            }))
                          }
                          value={variantDraft.selection_type}
                        >
                          <option value="single">single</option>
                          <option value="multiple">multiple</option>
                        </select>
                      </label>
                      <label className="selector-chip">
                        <input
                          checked={variantDraft.required}
                          onChange={(event) => setVariantDraft((current) => ({ ...current, required: event.target.checked }))}
                          type="checkbox"
                        />
                        <span>Obligatoria</span>
                      </label>
                      <label className="field field--compact">
                        <span>Max selecciones</span>
                        <input
                          onChange={(event) => setVariantDraft((current) => ({ ...current, max_selections: event.target.value }))}
                          type="number"
                          value={variantDraft.max_selections}
                        />
                      </label>
                      <div className="field field--compact field--span-2">
                        <span>Opciones de la adicion</span>
                        <div className="variant-option-list">
                          {variantDraft.options.map((option, index) => (
                            <div className="variant-option-row" key={index}>
                              <input
                                onChange={(event) => updateVariantOption(index, { name: event.target.value })}
                                placeholder="Nombre opcion"
                                value={option.name}
                              />
                              <button
                                className="secondary-button inline-action"
                                onClick={() => removeVariantOption(index)}
                                type="button"
                              >
                                Quitar
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="form-actions field--span-2">
                          <button className="secondary-button toolbar-button" onClick={addVariantOption} type="button">
                            Agregar opcion
                          </button>
                          <button
                            className="primary-button toolbar-button"
                            disabled={isSavingVariant}
                            onClick={() => void handleCreateVariant()}
                            type="button"
                          >
                            {isSavingVariant ? 'Guardando...' : 'Crear adicion'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="variant-summary-list">
                      {draftVariants.map((variant) => (
                        <article className="ingredient-row" key={variant.id}>
                          <div className="list-main">
                            <strong>{variant.name}</strong>
                            <p>
                              {variant.selection_type === 'multiple' ? 'Varias opciones' : 'Una opcion'} | {variant.options.length} opciones
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={`extra-card extra-card--accordion${openProductSection === 'ingredients' ? ' is-open' : ''}`}>
                <button
                  aria-expanded={openProductSection === 'ingredients'}
                  className="accordion-toggle"
                  onClick={() => toggleProductSection('ingredients')}
                  type="button"
                >
                  <div>
                    <h2>Ingredientes base</h2>
                    <p>Define que ingredientes trae el producto y cuales se pueden quitar.</p>
                  </div>
                  <span className="accordion-toggle__icon">{openProductSection === 'ingredients' ? '-' : '+'}</span>
                </button>
                {openProductSection === 'ingredients' ? (
                  <div className="accordion-body">
                    <IngredientLibraryPicker
                      currentNames={editingProduct.ingredients.map((ingredient) => ingredient.name)}
                      disabled={isSavingIngredient}
                      items={ingredientLibrary}
                      loading={isLoadingIngredientLibrary}
                      onCreate={(name) => void addIngredientFromLibrary(name)}
                      onQueryChange={setIngredientSearch}
                      onSelect={(ingredient) => void addIngredientFromLibrary(ingredient.name, ingredient)}
                      query={ingredientSearch}
                    />
                    <div className="admin-company-form">
                      <label className="field field--compact">
                        <span>Nombre</span>
                        <input
                          onChange={(event) => setIngredientDraft((current) => ({ ...current, name: event.target.value }))}
                          value={ingredientDraft.name}
                        />
                      </label>
                      <label className="field field--compact">
                        <span>Orden</span>
                        <input
                          onChange={(event) => setIngredientDraft((current) => ({ ...current, sort_order: event.target.value }))}
                          type="number"
                          value={ingredientDraft.sort_order}
                        />
                      </label>
                      <label className="selector-chip">
                        <input
                          checked={ingredientDraft.is_default}
                          onChange={(event) =>
                            setIngredientDraft((current) => ({
                              ...current,
                              is_default: event.target.checked,
                              is_removable: event.target.checked ? current.is_removable : false
                            }))
                          }
                          type="checkbox"
                        />
                        <span>Incluido por defecto</span>
                      </label>
                      <label className="selector-chip">
                        <input
                          disabled={!ingredientDraft.is_default}
                          checked={ingredientDraft.is_removable}
                          onChange={(event) => setIngredientDraft((current) => ({ ...current, is_removable: event.target.checked }))}
                          type="checkbox"
                        />
                        <span>El cliente lo puede quitar</span>
                      </label>
                      <p className="field-help field--span-2">
                        `Incluido por defecto` significa que viene en el producto. Si ademas marcas
                        `El cliente lo puede quitar`, aparecera como removible en la app.
                      </p>
                      <div className="form-actions field--span-2">
                        {editingIngredientId ? (
                          <button className="secondary-button toolbar-button" onClick={resetIngredientForm} type="button">
                            Cancelar edicion
                          </button>
                        ) : null}
                        <button
                          className="primary-button toolbar-button"
                          disabled={isSavingIngredient}
                          onClick={() => void handleSaveIngredient()}
                          type="button"
                        >
                          {isSavingIngredient ? 'Guardando...' : editingIngredientId ? 'Actualizar ingrediente' : 'Agregar ingrediente'}
                        </button>
                      </div>
                    </div>
                    <div className="ingredient-list">
                      {editingProduct.ingredients.map((ingredient) => (
                        <article className="ingredient-row" key={ingredient.id}>
                          <div className="list-main">
                            <strong>{ingredient.name}</strong>
                            <p>
                              {ingredient.is_default !== false ? 'Incluido por defecto' : 'Opcional'} | {ingredient.is_removable ? 'Se puede quitar' : 'No se quita'}
                            </p>
                          </div>
                          <div className="row-actions">
                            <button
                              className="secondary-button inline-action"
                              onClick={() => startEditIngredient(ingredient)}
                              type="button"
                            >
                              Editar
                            </button>
                            <DestructiveButton label="Eliminar" title="Eliminar ingrediente" impact="El ingrediente dejará de estar disponible en este producto." onConfirm={() => handleDeleteIngredient(ingredient.id)} />
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="card-grid card-grid--dense">
        {filteredProducts.map((product) => (
          <article className="catalog-card catalog-card--compact" key={product.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{product.name}</h2>
                <p>{product.category?.name || 'Sin categoria'}</p>
              </div>
              <span className={`status-badge status-badge--${product.status}`}>{product.status}</span>
            </div>
            <p className="catalog-card__copy">{product.description || 'Sin descripcion todavia.'}</p>
            <div className="catalog-meta">
              <span>{product.images.length} img</span>
              <span>{product.ingredients.length} ing</span>
              <span>{product.variants.length} var</span>
            </div>
            <div className="catalog-meta catalog-meta--wrap">
              {product.variants.map((variant) => (
                <span className="soft-pill soft-pill--tiny" key={variant.id}>
                  {variant.name}
                </span>
              ))}
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">{formatMoney(product.base_price)}</strong>
              <div className="row-actions">
                <CopyActionButton
                  disabled={duplicatingProductId !== null}
                  message={`¿Quieres copiar “${product.name}”? Se conservarán ingredientes, variantes y precios. La copia quedará inactiva y sin imágenes.`}
                  onConfirm={() => handleDuplicateProduct(product)}
                  title="Copiar producto"
                />
                <button className="secondary-button inline-action" onClick={() => openEditProduct(product)} type="button">
                  Editar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function AppointmentsPanel({
  accessToken,
  appointments,
  companyId
}: {
  accessToken: string;
  appointments: AppointmentSummary[];
  companyId: number;
}) {
  const [draftAppointments, setDraftAppointments] = useState(appointments);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<number | null>(null);
  const [actingAppointmentId, setActingAppointmentId] = useState<number | null>(null);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  useEffect(() => {
    setDraftAppointments(appointments);
  }, [appointments]);

  async function handleAppointmentStatus(
    appointment: AppointmentSummary,
    status: 'accepted' | 'completed'
  ) {
    setAppointmentError(null);
    setActingAppointmentId(appointment.id);

    try {
      const updated = await updateCompanyAppointmentStatus(
        accessToken,
        companyId,
        appointment.id,
        status
      );

      setDraftAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      setAppointmentError(error instanceof ApiError ? error.message : 'No pudimos actualizar la cita.');
    } finally {
      setActingAppointmentId(null);
    }
  }

  return (
    <section className="workspace-stack">
      {appointmentError ? <p className="form-error" role="alert">{appointmentError}</p> : null}
      <section className="list-shell">
        <div className="list-head list-head--appointments">
          <span>Servicio</span>
          <span>Fecha</span>
          <span>Profesional</span>
          <span>Estado</span>
          <span>Precio</span>
          <span>Acciones</span>
        </div>
        <div className="list-body">
          {draftAppointments.map((appointment) => (
            <div className="order-block" key={appointment.id}>
              <article className="list-row list-row--appointments">
                <div className="list-main">
                  <strong>{appointment.service.name}</strong>
                  <p>
                    {appointment.customer.name} {appointment.customer.last_name}
                  </p>
                </div>
                <span data-label="Fecha">
                  {formatAppointmentDay(appointment.scheduled_date, appointment.start_time)}
                  <small>{appointment.start_time.slice(0, 5)}</small>
                </span>
                <span data-label="Profesional">{appointment.professional.name}</span>
                <span className={`status-badge status-badge--${appointment.status}`} data-label="Estado">{appointment.status}</span>
                <strong data-label="Precio">{formatMoney(appointment.price)}</strong>
                <div className="row-actions" data-label="Acciones">
                  <button
                    className="secondary-button inline-action"
                    onClick={() =>
                      setExpandedAppointmentId((current) =>
                        current === appointment.id ? null : appointment.id
                      )
                    }
                    type="button"
                  >
                    {expandedAppointmentId === appointment.id ? 'Ocultar' : 'Detalle'}
                  </button>
                  {getAppointmentActions(appointment.status).map((action) => (
                    <button
                      className="secondary-button inline-action"
                      disabled={actingAppointmentId === appointment.id}
                      key={action.key}
                      onClick={() => void handleAppointmentStatus(appointment, action.key)}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </article>

              {expandedAppointmentId === appointment.id ? (
                <section className="order-detail">
                  <div className="order-detail__grid">
                    <article className="order-detail__card">
                      <h3>Servicio</h3>
                      <div className="detail-list detail-list--compact">
                        <div className="detail-row detail-row--compact">
                          <span>Servicio</span>
                          <strong>{appointment.service.name}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Descripcion</span>
                          <strong>{appointment.service.description || 'Sin descripcion'}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Duracion</span>
                          <strong>{appointment.service.duration_minutes} min</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Fecha</span>
                          <strong>
                            {formatAppointmentDay(appointment.scheduled_date, appointment.start_time)}
                          </strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Hora</span>
                          <strong>
                            {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                          </strong>
                        </div>
                      </div>
                    </article>
                    <article className="order-detail__card">
                      <h3>Atencion</h3>
                      <div className="detail-list detail-list--compact">
                        <div className="detail-row detail-row--compact">
                          <span>Profesional</span>
                          <strong>{appointment.professional.name}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Cliente</span>
                          <strong>
                            {appointment.customer.name} {appointment.customer.last_name}
                          </strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Contacto</span>
                          <strong>{appointment.customer.phone || appointment.customer.email}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Estado</span>
                          <strong>{appointment.status}</strong>
                        </div>
                        <div className="detail-row detail-row--compact">
                          <span>Precio</span>
                          <strong>{formatMoney(appointment.price)}</strong>
                        </div>
                      </div>
                      {appointment.customer_notes ? (
                        <div className="order-detail__info">
                          <strong>Nota del cliente</strong>
                          <p>{appointment.customer_notes}</p>
                        </div>
                      ) : null}
                    </article>
                  </div>
                </section>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function ServicesPanel({
  accessToken,
  companyId,
  professionals,
  services
}: {
  accessToken: string;
  companyId: number;
  professionals: ProfessionalSummary[];
  services: CompanyService[];
}) {
  const [draftServices, setDraftServices] = useState(services);
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [formValues, setFormValues] = useState<ServiceFormValues>(() => emptyServiceForm());

  useEffect(() => {
    setDraftServices(services);
  }, [services]);

  const filteredServices = draftServices.filter((service) => {
    const professionalsLabel = service.professionals.map((professional) => professional.name).join(' ');
    const target = `${service.name} ${service.description || ''} ${professionalsLabel}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });

  function openCreateService() {
    setEditingService(null);
    setIsCreating(true);
    setServiceError(null);
    setFormValues(emptyServiceForm());
  }

  function openEditService(service: CompanyService) {
    setEditingService(service);
    setIsCreating(false);
    setServiceError(null);
    setFormValues({
      description: service.description || '',
      duration_minutes: String(service.duration_minutes),
      name: service.name,
      price: String(Number(service.price || 0)),
      professional_ids: service.professionals.map((professional) => professional.id),
      status: service.status
    });
  }

  function closeServiceForm() {
    setEditingService(null);
    setIsCreating(false);
    setServiceError(null);
    setFormValues(emptyServiceForm());
  }

  function patchService(updatedService: CompanyService) {
    setDraftServices((current) =>
      current.map((service) => (service.id === updatedService.id ? updatedService : service))
    );
  }

  function toggleProfessional(professionalId: number) {
    setFormValues((current) => ({
      ...current,
      professional_ids: current.professional_ids.includes(professionalId)
        ? current.professional_ids.filter((id) => id !== professionalId)
        : [...current.professional_ids, professionalId]
    }));
  }

  async function handleSubmitService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServiceError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        description: emptyToNull(formValues.description),
        duration_minutes: Number(formValues.duration_minutes),
        name: formValues.name.trim(),
        price: Number(formValues.price),
        professional_ids: formValues.professional_ids,
        status: formValues.status
      };

      if (!payload.name) {
        throw new Error('El nombre del servicio es obligatorio.');
      }

      if (!payload.duration_minutes || payload.duration_minutes <= 0) {
        throw new Error('La duracion debe ser mayor que cero.');
      }

      if (payload.price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }

      if (editingService) {
        const updated = await updateCompanyService(accessToken, companyId, editingService.id, payload);
        patchService(updated);
      } else {
        const created = await createCompanyService(accessToken, companyId, payload);
        setDraftServices((current) => [created, ...current]);
      }

      closeServiceForm();
    } catch (error) {
      setServiceError(error instanceof ApiError || error instanceof Error ? error.message : 'No pudimos guardar el servicio.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="workspace-stack">
      <section className="toolbar-card">
        <label className="toolbar-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por servicio o profesional"
            value={query}
          />
        </label>
        <button className="primary-button toolbar-button" onClick={openCreateService} type="button">
          Nuevo servicio
        </button>
      </section>

      {(isCreating || editingService) ? (
        <section className="form-card">
          <div className="panel-card__header panel-card__header--spread">
            <div>
              <h2>{editingService ? 'Editar servicio' : 'Crear servicio'}</h2>
              <p>Configura nombre, duracion, precio y profesionales asignados.</p>
            </div>
            <button className="secondary-button toolbar-button" onClick={closeServiceForm} type="button">
              Cerrar
            </button>
          </div>

          <form className="admin-company-form" onSubmit={(event) => void handleSubmitService(event)}>
            <label className="field field--compact">
              <span>Nombre</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                value={formValues.name}
              />
            </label>
            <label className="field field--compact">
              <span>Estado</span>
              <select
                onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
                value={formValues.status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <label className="field field--compact">
              <span>Duracion minutos</span>
              <input
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, duration_minutes: event.target.value }))
                }
                type="number"
                value={formValues.duration_minutes}
              />
            </label>
            <label className="field field--compact">
              <span>Precio</span>
              <input
                onChange={(event) => setFormValues((current) => ({ ...current, price: event.target.value }))}
                type="number"
                value={formValues.price}
              />
            </label>
            <label className="field field--compact field--span-2">
              <span>Descripcion</span>
              <textarea
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                rows={3}
                value={formValues.description}
              />
            </label>
            <div className="field field--compact field--span-2">
              <span>Profesionales</span>
              <div className="selector-grid">
                {professionals.map((professional) => (
                  <label className="selector-chip" key={professional.id}>
                    <input
                      checked={formValues.professional_ids.includes(professional.id)}
                      onChange={() => toggleProfessional(professional.id)}
                      type="checkbox"
                    />
                    <span>{professional.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {serviceError ? <p className="form-error field--span-2">{serviceError}</p> : null}

            <div className="form-actions field--span-2">
              <button className="secondary-button toolbar-button" onClick={closeServiceForm} type="button">
                Cancelar
              </button>
              <button className="primary-button toolbar-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Guardando...' : editingService ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card-grid card-grid--dense">
        {filteredServices.map((service) => (
          <article className="catalog-card catalog-card--compact" key={service.id}>
            <div className="catalog-card__header">
              <div>
                <h2>{service.name}</h2>
                <p>{service.duration_minutes} min</p>
              </div>
              <span className={`status-badge status-badge--${service.status}`}>{service.status}</span>
            </div>
            <p className="catalog-card__copy">{service.description || 'Sin descripcion todavia.'}</p>
            <div className="catalog-meta catalog-meta--wrap">
              {service.professionals.map((professional) => (
                <span className="soft-pill soft-pill--tiny" key={professional.id}>
                  {professional.name}
                </span>
              ))}
            </div>
            <div className="catalog-card__footer">
              <strong className="catalog-card__price">{formatMoney(service.price)}</strong>
              <button className="secondary-button inline-action" onClick={() => openEditService(service)} type="button">
                Editar
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

interface AdminCompanyFormValues {
  address: string;
  commission_percentage: string;
  description: string;
  email: string;
  name: string;
  phone: string;
  rating: string;
  status: string;
  type: CompanySummary['type'];
}

interface ServiceFormValues {
  description: string;
  duration_minutes: string;
  name: string;
  price: string;
  professional_ids: number[];
  status: string;
}

interface ProfessionalFormValues {
  description: string;
  email: string;
  name: string;
  phone: string;
  specialty: string;
  status: string;
}

interface CompanySettingsFormValues {
  address: string;
  description: string;
  email: string;
  latitude: string;
  longitude: string;
  name: string;
  phone: string;
  availability_mode: 'automatic' | 'open' | 'closed';
  business_hours: Array<{ day_of_week: number; enabled: boolean; start_time: string; end_time: string }>;
}

interface CategoryFormValues {
  icon: string;
  name: string;
  status: string;
  type: PublicCategory['type'];
}

interface CouponFormValues {
  category_id: string;
  code: string;
  company_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  expires_at: string;
  max_discount: string;
  minimum_order_amount: string;
  per_user_limit: string;
  starts_at: string;
  status: string;
  usage_limit: string;
}

const campaignInternalDestinations = [
  { label: 'Inicio', value: 'allora-customer://home' },
  { label: 'Todos los negocios', value: 'allora-customer://companies' },
  { label: 'Mis pedidos', value: 'allora-customer://orders' },
  { label: 'Mi carrito', value: 'allora-customer://cart' },
  { label: 'Mis citas', value: 'allora-customer://appointments' },
  { label: 'Mi perfil y configuracion', value: 'allora-customer://settings' }
] as const;

function getCampaignDestinationType(link: string | null): PopupFormValues['destination_type'] {
  if (!link) return 'none';
  return link.toLowerCase().startsWith('allora-customer://') ? 'internal' : 'external';
}

function validateExternalCampaignUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'http:' || url.protocol === 'https:') return;
  } catch (_error) {
    // The user-facing validation message is shared for every invalid URL.
  }
  throw new Error('El enlace externo debe ser una URL valida que comience por https:// o http://.');
}

interface PopupFormValues {
  destination_type: 'none' | 'internal' | 'external';
  display_order: string;
  ends_at: string;
  link_url: string;
  message: string;
  starts_at: string;
  status: 'active' | 'inactive';
  title: string;
}

interface DriverFormValues {
  email: string;
  last_name: string;
  name: string;
  password: string;
  phone: string;
  vehicle_plate: string;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car' | 'other';
}

interface ScheduleFormValues {
  day_of_week: string;
  end_time: string;
  start_time: string;
  status: string;
}

interface ProductFormValues {
  base_price: string;
  category_id: number;
  description: string;
  name: string;
  status: string;
  variant_ids: number[];
  variant_prices: Record<number, string>;
}

interface VariantFormValues {
  id?: number;
  max_selections: string;
  min_selections: string;
  name: string;
  options: Array<{
    id?: number;
    child_variants: VariantFormValues[];
    name: string;
    status: string;
  }>;
  required: boolean;
  selection_type: 'single' | 'multiple';
  status: string;
}
interface IngredientFormValues {
  is_default: boolean;
  is_removable: boolean;
  name: string;
  sort_order: string;
  status: string;
}

function emptyCompanyForm(): AdminCompanyFormValues {
  return {
    address: '',
    commission_percentage: '0',
    description: '',
    email: '',
    name: '',
    phone: '',
    rating: '',
    status: 'pending',
    type: 'food'
  };
}

function emptyServiceForm(): ServiceFormValues {
  return {
    description: '',
    duration_minutes: '45',
    name: '',
    price: '0',
    professional_ids: [],
    status: 'active'
  };
}

function emptyProfessionalForm(): ProfessionalFormValues {
  return {
    description: '',
    email: '',
    name: '',
    phone: '',
    specialty: '',
    status: 'active'
  };
}

function companyToSettingsForm(company?: {
  address?: string | null;
  description?: string | null;
  email?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  name?: string | null;
  phone?: string | null;
  availability_mode?: 'automatic' | 'open' | 'closed';
  business_hours?: Array<{ day_of_week: number; enabled: boolean; start_time: string; end_time: string }> | null;
} | null): CompanySettingsFormValues {
  const savedHours = company?.business_hours || [];
  return {
    address: company?.address || '',
    description: company?.description || '',
    email: company?.email || '',
    latitude: company?.latitude != null ? String(company.latitude) : '',
    longitude: company?.longitude != null ? String(company.longitude) : '',
    name: company?.name || '',
    phone: company?.phone || '',
    availability_mode: company?.availability_mode || 'automatic',
    business_hours: scheduleDayOptions.map((day) => {
      const saved = savedHours.find((entry) => Number(entry.day_of_week) === day.value);
      return {
        day_of_week: day.value,
        enabled: saved?.enabled ?? (day.value >= 1 && day.value <= 6),
        start_time: String(saved?.start_time || '08:00').slice(0, 5),
        end_time: String(saved?.end_time || '18:00').slice(0, 5)
      };
    })
  };
}

function emptyCategoryForm(): CategoryFormValues {
  return {
    icon: '',
    name: '',
    status: 'active',
    type: 'food'
  };
}

function emptyCouponForm(): CouponFormValues {
  return {
    category_id: '',
    code: '',
    company_id: '',
    discount_type: 'percentage',
    discount_value: '',
    expires_at: '',
    max_discount: '',
    minimum_order_amount: '',
    per_user_limit: '1',
    starts_at: '',
    status: 'active',
    usage_limit: ''
  };
}

function emptyPopupForm(): PopupFormValues {
  return {
    destination_type: 'none',
    display_order: '1',
    ends_at: '',
    link_url: '',
    message: '',
    starts_at: '',
    status: 'active',
    title: ''
  };
}

function emptyDriverForm(): DriverFormValues {
  return {
    email: '',
    last_name: '',
    name: '',
    password: '',
    phone: '',
    vehicle_plate: '',
    vehicle_type: 'motorcycle'
  };
}

function emptyScheduleForm(): ScheduleFormValues {
  return {
    day_of_week: '1',
    end_time: '18:00',
    start_time: '09:00',
    status: 'active'
  };
}

function emptyProductForm(defaultCategoryId?: number): ProductFormValues {
  return {
    base_price: '0',
    category_id: defaultCategoryId || 0,
    description: '',
    name: '',
    status: 'inactive',
    variant_ids: [],
    variant_prices: {}
  };
}

function emptyVariantForm(): VariantFormValues {
  return {
    max_selections: '1',
    min_selections: '0',
    name: '',
    options: [{ child_variants: [], name: '', status: 'active' }],
    required: false,
    selection_type: 'single',
    status: 'active'
  };
}

function companyVariantToForm(variant: CompanyVariant): VariantFormValues {
  return {
    id: variant.id,
    max_selections: String(variant.max_selections || 1),
    min_selections: String(variant.min_selections || 0),
    name: variant.name,
    options: variant.options.map((option) => ({
      id: option.id,
      child_variants: (option.childVariants || option.child_variants || []).map(companyVariantToForm),
      name: option.name,
      status: option.status
    })),
    required: Boolean(variant.required),
    selection_type: variant.selection_type,
    status: variant.status
  };
}

function variantFormToPayload(form: VariantFormValues): {
  id?: number;
  max_selections: number;
  min_selections: number;
  name: string;
  options: Array<{
    id?: number;
    child_variants: ReturnType<typeof variantFormToPayload>[];
    name: string;
    status: string;
  }>;
  required: boolean;
  selection_type: 'single' | 'multiple';
  status: string;
} {
  return {
    id: form.id,
    max_selections: form.selection_type === 'single' ? 1 : Number(form.max_selections || 1),
    min_selections: Number(form.min_selections || 0),
    name: form.name.trim(),
    options: form.options
      .filter((option) => option.name.trim())
      .map((option) => ({
        id: option.id,
        child_variants: option.child_variants.map(variantFormToPayload),
        name: option.name.trim(),
        status: option.status
      })),
    required: form.required,
    selection_type: form.selection_type,
    status: form.status
  };
}
function emptyIngredientForm(): IngredientFormValues {
  return {
    is_default: true,
    is_removable: false,
    name: '',
    sort_order: '1',
    status: 'active'
  };
}

function resolveMediaUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${path}`;
}

function ProductImagePreview({ alt, src }: { alt: string; src: string | null }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="image-card__fallback">
        <strong>{alt}</strong>
        <span>Vista previa no disponible</span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className="image-card__preview"
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

type OrderAction = 'accept' | 'reject' | 'preparing' | 'waiting-delivery';

function getOrderActions(status: string): Array<{ key: OrderAction; label: string }> {
  if (status === 'pending') {
    return [
      { key: 'accept', label: 'Aceptar' },
      { key: 'reject', label: 'Rechazar' }
    ];
  }

  if (status === 'accepted') {
    return [{ key: 'preparing', label: 'Preparando' }];
  }

  if (status === 'preparing') {
    return [{ key: 'waiting-delivery', label: 'Listo envio' }];
  }

  return [];
}

function getAppointmentActions(status: string): Array<{ key: 'accepted' | 'completed'; label: string }> {
  if (status === 'pending') {
    return [{ key: 'accepted', label: 'Aceptar' }];
  }

  if (status === 'accepted') {
    return [{ key: 'completed', label: 'Completar' }];
  }

  return [];
}



