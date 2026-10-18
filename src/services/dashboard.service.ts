import { httpDownload, httpRequest } from '@/services/http';
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
  WompiSettings,
  ProfessionalSchedule,
  ProfessionalSummary,
  UserNotification,
  PublicCategory,
  WalletTransactionSummary
} from '@/types/dashboard';
import type { CompanySettlement, SettlementOverview, SettlementPreview } from '@/types/dashboard';

export interface EligibleSettlementOrder {
  order_id: number;
  order_number: string;
  paid_at: string;
  net_product_sale: number | string;
  delivery_fee: number | string;
  company_payable: number | string;
  company_id: number;
  company: { id: number; name: string; email?: string | null; logo?: string | null };
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}
export interface ListOptions { page?: number; page_size?: number; search?: string; status?: string; type?: string; dateFrom?: string; dateTo?: string; category_id?: number | string; company_id?: number | string; availability_status?: string; role_id?: number | string; sort?: string; }
export type PaginatedList<T> = T[] & { pagination: PaginationMeta };
export interface AdminRole { id: number; name: string; description?: string | null; scope: string; permissions?: Array<Record<string, unknown>>; }
export interface CompanyTeamMember { id: number; user?: { id: number; name: string; last_name: string; email: string; phone?: string; status: string }; companyRoles?: Array<{ id: number; name: string; scope: string }>; }
export interface CompanyAssignableRole { id: number; name: string; description?: string | null; scope: 'company'; }
export interface AdminPermission { id: number; code: string; name: string; module: string; status: string; }
function listQuery(options: ListOptions = {}) { const query = new URLSearchParams(); query.set('page', String(options.page || 1)); query.set('page_size', String(options.page_size || 20)); if (options.search?.trim()) query.set('search', options.search.trim()); if (options.status) query.set('status', options.status); if (options.type) query.set('type', options.type); if (options.category_id) query.set('category_id', String(options.category_id)); if (options.company_id) query.set('company_id', String(options.company_id)); if (options.availability_status) query.set('availability_status', options.availability_status); if (options.role_id) query.set('role_id', String(options.role_id)); if (options.sort) query.set('sort', options.sort); if (options.dateFrom) query.set('date_from', options.dateFrom); if (options.dateTo) query.set('date_to', options.dateTo); return query.toString(); }
function listResult<T>(items: T[], pagination?: PaginationMeta): PaginatedList<T> { return Object.assign(items, { pagination: pagination || { page: 1, page_size: items.length, total_items: items.length, total_pages: items.length ? 1 : 0, has_previous: false, has_next: false } }); }

export async function getAdminRoles(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ roles: AdminRole[]; pagination: PaginationMeta }>({ accessToken, path: `/admin/roles?${listQuery(options)}` });
  return listResult(response.data.roles, response.data.pagination);
}

export async function getCompanyTeam(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ members: CompanyTeamMember[]; pagination: PaginationMeta }>({ accessToken, headers: companyHeaders(companyId), path: `/company/team?${listQuery(options)}` });
  return listResult(response.data.members, response.data.pagination);
}
export async function getCompanyAssignableRoles(accessToken: string, companyId: number) { const response = await httpRequest<{ roles: CompanyAssignableRole[] }>({ accessToken, headers: companyHeaders(companyId), path: '/company/team/roles' }); return response.data.roles.filter((role) => role.scope === 'company'); }

export async function getAdminPermissions(accessToken: string) { const response = await httpRequest<{ permissions: AdminPermission[] }>({ accessToken, path: '/admin/permissions' }); return response.data.permissions; }
export async function createAdminRole(accessToken: string, payload: Record<string, unknown>) { const response = await httpRequest<{ role: AdminRole }>({ accessToken, method: 'POST', body: payload, path: '/admin/roles' }); return response.data.role; }
export async function updateAdminRole(accessToken: string, roleId: number, payload: Record<string, unknown>) { const response = await httpRequest<{ role: AdminRole }>({ accessToken, method: 'PUT', body: payload, path: `/admin/roles/${roleId}` }); return response.data.role; }
export async function deleteAdminRole(accessToken: string, roleId: number) { await httpRequest<null>({ accessToken, method: 'DELETE', path: `/admin/roles/${roleId}` }); }
export async function updateCompanyTeamRoles(accessToken: string, companyId: number, memberId: number, roleIds: number[]) { const response = await httpRequest<{ member_id: number; roles: Array<{ id: number; name: string }> }>({ accessToken, method: 'PUT', headers: companyHeaders(companyId), body: { role_ids: roleIds }, path: `/company/team/${memberId}/roles` }); return response.data; }
export async function removeCompanyTeamMember(accessToken: string, companyId: number, memberId: number) { await httpRequest<null>({ accessToken, method: 'DELETE', headers: companyHeaders(companyId), path: `/company/team/${memberId}` }); }
export async function createCompanyTeamMember(accessToken: string, companyId: number, payload: Record<string, unknown>) { const response = await httpRequest<Record<string, unknown>>({ accessToken, method: 'POST', headers: companyHeaders(companyId), body: payload, path: '/company/team' }); return response.data; }
export async function getAdminCompanyTeam(accessToken: string, companyId: number, options: ListOptions = {}) { const response = await httpRequest<{ members: CompanyTeamMember[]; pagination: PaginationMeta }>({ accessToken, path: `/admin/companies/${companyId}/team?${listQuery(options)}` }); return listResult(response.data.members, response.data.pagination); }
export async function getAdminCompanyRoles(accessToken: string, companyId: number) { const response = await httpRequest<{ roles: CompanyAssignableRole[] }>({ accessToken, path: `/admin/companies/${companyId}/team/roles` }); return response.data.roles.filter((role) => role.scope === 'company'); }
export async function createAdminCompanyTeamMember(accessToken: string, companyId: number, payload: Record<string, unknown>) { const response = await httpRequest<Record<string, unknown>>({ accessToken, method: 'POST', body: payload, path: `/admin/companies/${companyId}/team` }); return response.data; }
export async function updateAdminCompanyTeamRoles(accessToken: string, companyId: number, memberId: number, roleIds: number[]) { const response = await httpRequest<{ member_id: number; roles: Array<{ id: number; name: string }> }>({ accessToken, method: 'PUT', body: { role_ids: roleIds }, path: `/admin/companies/${companyId}/team/${memberId}/roles` }); return response.data; }
export async function updateAdminCompanyTeamMember(accessToken: string, companyId: number, memberId: number, payload: { name: string; last_name: string; email: string; phone: string; status: string; role_ids: number[]; password?: string }) { const response = await httpRequest<{ user: CompanyTeamMember['user'] }>({ accessToken, method: 'PUT', body: payload, path: `/admin/companies/${companyId}/team/${memberId}` }); return response.data; }
export async function removeAdminCompanyTeamMember(accessToken: string, companyId: number, memberId: number) { await httpRequest<null>({ accessToken, method: 'DELETE', path: `/admin/companies/${companyId}/team/${memberId}` }); }

function companyHeaders(companyId: number) {
  return { 'X-Company-Id': String(companyId) };
}
export async function getCompanyReviews(accessToken: string, companyId: number, options: ListOptions = {}) { const response = await httpRequest<{ reviews: import('@/types/dashboard').CompanyReview[]; pagination: PaginationMeta; summary: { count: number; average: number; distribution: Record<number, number> } }>({ accessToken, headers: companyHeaders(companyId), path: `/company/reviews?${listQuery(options)}` }); const reviews = listResult(response.data.reviews, response.data.pagination); return { reviews, pagination: reviews.pagination, summary: response.data.summary }; }
export async function getAdminReviews(accessToken: string, options: ListOptions = {}) { const response = await httpRequest<{ reviews: import('@/types/dashboard').CompanyReview[]; pagination: PaginationMeta }>({ accessToken, path: `/admin/reviews?${listQuery(options)}` }); return listResult(response.data.reviews, response.data.pagination); }

export async function getAdminSettlements(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ settlements: CompanySettlement[]; pagination: PaginationMeta }>({ accessToken, path: `/admin/settlements?${listQuery(options)}` });
  return listResult(response.data.settlements, response.data.pagination);
}
export async function getEligibleSettlementOrders(accessToken: string) {
  const response = await httpRequest<{ orders: EligibleSettlementOrder[] }>({ accessToken, path: '/admin/settlements/eligible-orders' });
  return response.data.orders;
}
export async function invoiceSelectedOrders(accessToken: string, payload: { order_ids: number[]; payout_reference: string; notes?: string }) {
  const response = await httpRequest<{ settlement: CompanySettlement }>({ accessToken, method: 'POST', body: payload, path: '/admin/settlements/invoices' });
  return response.data.settlement;
}
export async function sendSettlementToCompany(accessToken: string, settlementId: number) {
  const response = await httpRequest<{ delivery: { recipient: string; sent_at: string } }>({ accessToken, method: 'POST', path: `/admin/settlements/${settlementId}/send` });
  return response.data.delivery;
}
export async function getAdminSettlementOverview(accessToken: string, companyId: number, dateFrom: string, dateTo: string) {
  const query = new URLSearchParams({ company_id: String(companyId), date_from: dateFrom, date_to: dateTo });
  const response = await httpRequest<SettlementOverview>({ accessToken, path: `/admin/settlements/overview?${query}` });
  return response.data;
}
export async function previewAdminSettlement(accessToken: string, payload: { company_id: number; date_from: string; date_to: string }) {
  const response = await httpRequest<SettlementPreview>({ accessToken, method: 'POST', body: payload, path: '/admin/settlements/preview' }); return response.data;
}
export async function createAdminSettlement(accessToken: string, payload: { company_id: number; date_from: string; date_to: string; notes?: string; closure_type?: 'weekly' | 'monthly' | 'custom'; paid_now?: boolean; payout_reference?: string; payout_method?: string; paid_at?: string }) {
  const response = await httpRequest<{ settlement: CompanySettlement }>({ accessToken, method: 'POST', body: payload, path: '/admin/settlements' }); return response.data.settlement;
}
export async function markAdminSettlementPaid(accessToken: string, settlementId: number, payload: { payout_reference: string; payout_method?: string; paid_at?: string }) {
  const response = await httpRequest<{ settlement: CompanySettlement }>({ accessToken, method: 'POST', body: payload, path: `/admin/settlements/${settlementId}/paid` }); return response.data.settlement;
}
export async function getCompanySettlements(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ settlements: CompanySettlement[]; pagination: PaginationMeta }>({ accessToken, headers: companyHeaders(companyId), path: `/company/settlements?${listQuery(options)}` }); return listResult(response.data.settlements, response.data.pagination);
}
export async function getCompanySettlementOverview(accessToken: string, companyId: number, dateFrom: string, dateTo: string) {
  const query = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const response = await httpRequest<SettlementOverview>({ accessToken, headers: companyHeaders(companyId), path: `/company/settlements/overview?${query}` });
  return response.data;
}
export async function getSettlementDetail(accessToken: string, settlementId: number, companyId?: number) {
  const response = await httpRequest<{ settlement: CompanySettlement }>({ accessToken, headers: companyId ? companyHeaders(companyId) : undefined, path: companyId ? `/company/settlements/${settlementId}` : `/admin/settlements/${settlementId}` }); return response.data.settlement;
}
export async function downloadSettlementPdf(accessToken: string, settlementId: number, companyId?: number) {
  return httpDownload({ accessToken, path: companyId ? `/company/settlements/${settlementId}/pdf` : `/admin/settlements/${settlementId}/pdf` });
}

export async function getAdminDashboard(accessToken: string) {
  const response = await httpRequest<AdminDashboardData>({
    accessToken,
    path: '/admin/dashboard'
  });

  return response.data;
}

export async function getAdminCompanies(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ companies: CompanySummary[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/companies?${listQuery(options)}`
  });

  return listResult(response.data.companies, response.data.pagination);
}

export async function getAllAdminCompanies(accessToken: string): Promise<CompanySummary[]> {
  const firstPage = await getAdminCompanies(accessToken, { page: 1, page_size: 100, sort: 'name' });
  if (firstPage.pagination.total_pages <= 1) return firstPage;
  const remainingPages = await Promise.all(Array.from({ length: firstPage.pagination.total_pages - 1 }, (_, index) => getAdminCompanies(accessToken, { page: index + 2, page_size: 100, sort: 'name' })));
  return [ ...firstPage, ...remainingPages.flat() ];
}

export async function getAdminCustomers(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ customers: AdminCustomerSummary[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/customers?${listQuery(options)}`
  });

  return listResult(response.data.customers, response.data.pagination);
}

export async function activateAdminCustomer(accessToken: string, customerId: number) {
  const response = await httpRequest<{ customer: AdminCustomerSummary }>({
    accessToken,
    method: 'POST',
    path: `/admin/customers/${customerId}/activate`
  });

  return response.data.customer;
}

export async function getAdminCoverageSettings(accessToken: string) {
  const response = await httpRequest<{ coverage: GlobalCoverageSettings }>({
    accessToken,
    path: '/admin/platform-settings/coverage'
  });

  return response.data.coverage;
}

export interface CustomerLinksSettings {
  support_url: string | null;
  become_store_url: string | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  data_authorization_url: string | null;
}

export interface SupportTicket {
  id: number; subject: string; order_number: string | null; contact_phone: string; message: string;
  status: 'open' | 'in_progress' | 'closed'; created_at: string;
  customer: { id: number; name: string; last_name: string; email: string; phone: string | null };
}
export async function getAdminSupportTickets(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ tickets: SupportTicket[]; pagination: PaginationMeta }>({ accessToken, path: `/admin/support-tickets?${listQuery(options)}` });
  return listResult(response.data.tickets, response.data.pagination);
}
export async function updateAdminSupportTicketStatus(accessToken: string, ticketId: number, status: SupportTicket['status']) {
  const response = await httpRequest<{ ticket: SupportTicket }>({ accessToken, method: 'PATCH', body: { status }, path: `/admin/support-tickets/${ticketId}` });
  return response.data.ticket;
}

export async function getAdminCustomerLinksSettings(accessToken: string) {
  const response = await httpRequest<{ links: CustomerLinksSettings }>({ accessToken, path: '/admin/platform-settings/customer-links' });
  return response.data.links;
}

export async function updateAdminCustomerLinksSettings(accessToken: string, payload: CustomerLinksSettings) {
  const response = await httpRequest<{ links: CustomerLinksSettings }>({ accessToken, body: payload as unknown as Record<string, unknown>, method: 'PUT', path: '/admin/platform-settings/customer-links' });
  return response.data.links;
}

export async function getPublicCoverageSettings() {
  const response = await httpRequest<{ coverage: CompanyCoverageBoundary }>({ path: '/mobile/coverage' });
  return response.data.coverage;
}

export async function updateAdminCoverageSettings(
  accessToken: string,
  payload: GlobalCoverageSettings
) {
  const response = await httpRequest<{ coverage: GlobalCoverageSettings }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    method: 'PUT',
    path: '/admin/platform-settings/coverage'
  });

  return response.data.coverage;
}

export async function getAdminWompiSettings(accessToken: string) {
  const response = await httpRequest<{ wompi: WompiSettings }>({ accessToken, path: '/admin/platform-settings/wompi' });
  return response.data.wompi;
}

export async function updateAdminWompiSettings(accessToken: string, payload: {
  enabled: boolean;
  environment: WompiSettings['environment'];
  public_key: string;
  private_key: string;
  events_secret: string;
  integrity_secret: string;
  public_base_url: string;
}) {
  const response = await httpRequest<{ wompi: WompiSettings }>({ accessToken, body: payload, method: 'PUT', path: '/admin/platform-settings/wompi' });
  return response.data.wompi;
}

export async function getAdminCategories(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ categories: PublicCategory[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/categories?${listQuery(options)}`
  });

  return listResult(response.data.categories, response.data.pagination);
}

export async function createAdminCategory(
  accessToken: string,
  payload: {
    name: string;
    type: PublicCategory['type'];
    icon?: string | null;
    status: string;
  }
) {
  const response = await httpRequest<{ category: PublicCategory }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'POST',
    path: '/admin/categories'
  });

  return response.data.category;
}

export async function updateAdminCategory(
  accessToken: string,
  categoryId: number,
  payload: {
    name?: string;
    icon?: string | null;
    status?: string;
  }
) {
  const response = await httpRequest<{ category: PublicCategory }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'PUT',
    path: `/admin/categories/${categoryId}`
  });

  return response.data.category;
}

export async function uploadAdminCategoryIcon(
  accessToken: string,
  categoryId: number,
  file: File
) {
  const formData = new FormData();
  formData.append('icon', file);

  const response = await httpRequest<{ category: PublicCategory }>({
    accessToken,
    formData,
    method: 'POST',
    path: `/admin/categories/${categoryId}/icon`
  });

  return response.data.category;
}

export async function deleteAdminCategory(accessToken: string, categoryId: number) {
  await httpRequest<null>({
    accessToken,
    method: 'DELETE',
    path: `/admin/categories/${categoryId}`
  });
}

export async function createAdminCompany(accessToken: string, payload: AdminCompanyPayload) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    method: 'POST',
    path: '/admin/companies'
  });

  return response.data.company;
}

export async function updateAdminCompany(
  accessToken: string,
  companyId: number,
  payload: Partial<AdminCompanyPayload>
) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'PUT',
    path: `/admin/companies/${companyId}`
  });

  return response.data.company;
}

export async function updateAdminCompanyCommission(
  accessToken: string,
  companyId: number,
  commissionPercentage: number
) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    body: { commission_percentage: commissionPercentage },
    method: 'PUT',
    path: `/admin/companies/${companyId}/commission`
  });

  return response.data.company;
}

export async function updateAdminCompanyStatus(
  accessToken: string,
  companyId: number,
  nextStatus: 'active' | 'suspended'
) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    method: 'POST',
    path: `/admin/companies/${companyId}/${nextStatus === 'active' ? 'activate' : 'suspend'}`
  });

  return response.data.company;
}

export async function getAdminCoupons(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ coupons: AdminCoupon[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/coupons?${listQuery(options)}`
  });

  return listResult(response.data.coupons, response.data.pagination);
}

export async function createAdminCoupon(
  accessToken: string,
  payload: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount?: number | null;
    minimum_order_amount?: number | null;
    starts_at?: string | null;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit?: number | null;
    company_id?: number | null;
    category_id?: number | null;
    status?: string;
  }
) {
  const response = await httpRequest<{ coupon: AdminCoupon }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'POST',
    path: '/admin/coupons'
  });

  return response.data.coupon;
}

export async function updateAdminCoupon(
  accessToken: string,
  couponId: number,
  payload: {
    code?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    max_discount?: number | null;
    minimum_order_amount?: number | null;
    starts_at?: string | null;
    expires_at?: string | null;
    usage_limit?: number | null;
    per_user_limit?: number | null;
    company_id?: number | null;
    category_id?: number | null;
    status?: string;
  }
) {
  const response = await httpRequest<{ coupon: AdminCoupon }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'PUT',
    path: `/admin/coupons/${couponId}`
  });

  return response.data.coupon;
}

export async function deleteAdminCoupon(accessToken: string, couponId: number) {
  await httpRequest<null>({
    accessToken,
    method: 'DELETE',
    path: `/admin/coupons/${couponId}`
  });
}

export async function getAdminDrivers(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ drivers: AdminDriver[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/delivery-drivers?${listQuery(options)}`
  });

  return listResult(response.data.drivers, response.data.pagination);
}

export async function createAdminDriver(
  accessToken: string,
  payload: {
    name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    vehicle_type?: 'bicycle' | 'motorcycle' | 'car' | 'other';
    vehicle_plate?: string | null;
  }
) {
  const response = await httpRequest<{
    driver: AdminDriver;
    user: {
      id: number;
      name: string;
      last_name: string;
      email: string;
    };
  }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'POST',
    path: '/admin/delivery-drivers'
  });

  return response.data;
}

export async function getAdminPopups(accessToken: string, options: ListOptions = {}) {
  const response = await httpRequest<{ popups: AdminPopup[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/admin/popups?${listQuery(options)}`
  });

  return listResult(response.data.popups, response.data.pagination);
}

export async function createAdminPopup(
  accessToken: string,
  payload: {
    title: string;
    message?: string | null;
    link_url?: string | null;
    display_order?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: 'active' | 'inactive';
  },
  file: File
) {
  const formData = new FormData();
  formData.append('image', file);
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  const response = await httpRequest<{ popup: AdminPopup }>({
    accessToken,
    formData,
    method: 'POST',
    path: '/admin/popups'
  });

  return response.data.popup;
}

export async function updateAdminPopup(
  accessToken: string,
  popupId: number,
  payload: {
    title?: string;
    message?: string | null;
    link_url?: string | null;
    display_order?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: 'active' | 'inactive';
  }
) {
  const response = await httpRequest<{ popup: AdminPopup }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'PUT',
    path: `/admin/popups/${popupId}`
  });

  return response.data.popup;
}

export async function uploadAdminPopupImage(
  accessToken: string,
  popupId: number,
  file: File
) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await httpRequest<{ popup: AdminPopup }>({
    accessToken,
    formData,
    method: 'POST',
    path: `/admin/popups/${popupId}/image`
  });

  return response.data.popup;
}

export async function deleteAdminPopup(accessToken: string, popupId: number) {
  await httpRequest<null>({
    accessToken,
    method: 'DELETE',
    path: `/admin/popups/${popupId}`
  });
}

export async function getAdminHomePromotions(accessToken: string) {
  const response = await httpRequest<{ promotions: AdminHomePromotion[] }>({
    accessToken,
    path: '/admin/home-promotions'
  });

  return response.data.promotions;
}

export async function createAdminHomePromotion(
  accessToken: string,
  payload: {
    title: string;
    message?: string | null;
    link_url?: string | null;
    display_order?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: 'active' | 'inactive';
  },
  file: File
) {
  const formData = new FormData();
  formData.append('image', file);
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, String(value));
  });

  const response = await httpRequest<{ promotion: AdminHomePromotion }>({
    accessToken,
    formData,
    method: 'POST',
    path: '/admin/home-promotions'
  });
  return response.data.promotion;
}

export async function updateAdminHomePromotion(
  accessToken: string,
  promotionId: number,
  payload: {
    title?: string;
    message?: string | null;
    link_url?: string | null;
    display_order?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: 'active' | 'inactive';
  }
) {
  const response = await httpRequest<{ promotion: AdminHomePromotion }>({
    accessToken,
    body: payload as Record<string, unknown>,
    method: 'PUT',
    path: `/admin/home-promotions/${promotionId}`
  });
  return response.data.promotion;
}

export async function uploadAdminHomePromotionImage(accessToken: string, promotionId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await httpRequest<{ promotion: AdminHomePromotion }>({
    accessToken,
    formData,
    method: 'POST',
    path: `/admin/home-promotions/${promotionId}/image`
  });
  return response.data.promotion;
}

export async function deleteAdminHomePromotion(accessToken: string, promotionId: number) {
  await httpRequest<null>({
    accessToken,
    method: 'DELETE',
    path: `/admin/home-promotions/${promotionId}`
  });
}

export async function getCompanyDashboard(accessToken: string, companyId: number) {
  const response = await httpRequest<CompanyDashboardData>({
    accessToken,
    headers: companyHeaders(companyId),
    path: '/company/dashboard'
  });

  return response.data;
}

export async function getCompanyWalletTransactions(
  accessToken: string,
  companyId: number,
  filters: ListOptions = {}
) {
  const response = await httpRequest<{ transactions: WalletTransactionSummary[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/wallet/transactions?${listQuery(filters)}`
  });

  return listResult(response.data.transactions, response.data.pagination);
}

export async function getOwnCompanyProfile(accessToken: string, companyId: number) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: '/company/profile'
  });

  return response.data.company;
}

export async function updateOwnCompanyProfile(
  accessToken: string,
  companyId: number,
  payload: {
    name?: string;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    availability_mode?: 'automatic' | 'open' | 'closed';
    business_hours?: Array<{ day_of_week: number; enabled: boolean; start_time: string; end_time: string }>;
  }
) {
  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    body: payload as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: '/company/profile'
  });

  return response.data.company;
}

export async function uploadOwnCompanyLogo(
  accessToken: string,
  companyId: number,
  file: File
) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await httpRequest<{ company: CompanySummary }>({
    accessToken,
    formData,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: '/company/profile/logo'
  });

  return response.data.company;
}

export async function getCompanyOrders(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ orders: CompanyOrder[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/orders?${listQuery(options)}`
  });

  return listResult(response.data.orders, response.data.pagination);
}

export async function transitionCompanyOrderStatus(
  accessToken: string,
  companyId: number,
  orderId: number,
  action: 'accept' | 'reject' | 'preparing' | 'waiting-delivery',
  rejectionReason?: string
) {
  const response = await httpRequest<{ order: CompanyOrder }>({
    accessToken,
    body: rejectionReason ? { rejection_reason: rejectionReason } : undefined,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/orders/${orderId}/${action}`
  });

  return response.data.order;
}

export async function getCompanyProducts(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ products: CompanyProduct[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/products?${listQuery(options)}`
  });

  return listResult(response.data.products, response.data.pagination);
}

export async function createCompanyProduct(
  accessToken: string,
  companyId: number,
  payload: {
    name: string;
    description?: string | null;
    category_id: number;
    base_price: number;
    status: string;
    variant_ids?: number[];
    variant_prices?: Array<{ variant_option_id: number; additional_price: number }>;
  }
) {
  const response = await httpRequest<{ product: CompanyProduct }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: '/company/products'
  });

  return response.data.product;
}

export async function duplicateCompanyProduct(accessToken: string, companyId: number, productId: number) {
  const response = await httpRequest<{ product: CompanyProduct }>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/products/${productId}/duplicate`
  });
  return response.data.product;
}

export async function updateCompanyProduct(
  accessToken: string,
  companyId: number,
  productId: number,
  payload: {
    name?: string;
    description?: string | null;
    category_id?: number;
    base_price?: number;
    status?: string;
    variant_ids?: number[];
    variant_prices?: Array<{ variant_option_id: number; additional_price: number }>;
  }
) {
  const response = await httpRequest<{ product: CompanyProduct }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/products/${productId}`
  });

  return response.data.product;
}

export async function uploadCompanyProductImages(
  accessToken: string,
  companyId: number,
  productId: number,
  files: File[]
) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await httpRequest<{ product: CompanyProduct }>({
    accessToken,
    formData,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/products/${productId}/images`
  });

  return response.data.product;
}

export async function deleteCompanyProductImage(
  accessToken: string,
  companyId: number,
  productId: number,
  imageId: number
) {
  await httpRequest<null>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'DELETE',
    path: `/company/products/${productId}/images/${imageId}`
  });
}

export async function createCompanyProductIngredient(
  accessToken: string,
  companyId: number,
  productId: number,
  payload: {
    name: string;
    is_removable: boolean;
    is_default: boolean;
    status: string;
    sort_order: number;
  }
) {
  const response = await httpRequest<{ ingredient: CompanyProduct['ingredients'][number] }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/products/${productId}/ingredients`
  });

  return response.data.ingredient;
}

export async function getCompanyIngredientLibrary(
  accessToken: string,
  companyId: number,
  search = ''
) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const response = await httpRequest<{ ingredients: IngredientLibraryItem[] }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/products/ingredients/library${suffix}`
  });

  return response.data.ingredients;
}

export async function updateCompanyProductIngredient(
  accessToken: string,
  companyId: number,
  productId: number,
  ingredientId: number,
  payload: {
    name: string;
    is_removable: boolean;
    is_default: boolean;
    status: string;
    sort_order: number;
  }
) {
  const response = await httpRequest<{ ingredient: CompanyProduct['ingredients'][number] }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/products/${productId}/ingredients/${ingredientId}`
  });

  return response.data.ingredient;
}

export async function deleteCompanyProductIngredient(
  accessToken: string,
  companyId: number,
  productId: number,
  ingredientId: number
) {
  await httpRequest<null>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'DELETE',
    path: `/company/products/${productId}/ingredients/${ingredientId}`
  });
}

export async function getPublicCategories() {
  const response = await httpRequest<{ categories: PublicCategory[] }>({
    path: '/categories'
  });

  return response.data.categories;
}

export async function getCompanyVariants(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ variants: CompanyVariant[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/variants?${listQuery(options)}`
  });

  return listResult(response.data.variants, response.data.pagination);
}

export async function createCompanyVariant(
  accessToken: string,
  companyId: number,
  payload: CompanyVariantPayload
) {
  const response = await httpRequest<{ variant: CompanyVariant }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: '/company/variants'
  });

  return response.data.variant;
}

export async function duplicateCompanyVariant(accessToken: string, companyId: number, variantId: number) {
  const response = await httpRequest<{ variant: CompanyVariant }>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/variants/${variantId}/duplicate`
  });
  return response.data.variant;
}

export async function updateCompanyVariant(
  accessToken: string,
  companyId: number,
  variantId: number,
  payload: Partial<CompanyVariantPayload>
) {
  const response = await httpRequest<{ variant: CompanyVariant }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/variants/${variantId}`
  });

  return response.data.variant;
}

interface CompanyVariantPayload {
  id?: number;
  name: string;
  selection_type: 'single' | 'multiple';
  required: boolean;
  min_selections: number;
  max_selections: number;
  status: string;
  options: Array<{
    id?: number;
    name: string;
    status: string;
    child_variants?: CompanyVariantPayload[];
  }>;
}

export async function deleteCompanyVariant(
  accessToken: string,
  companyId: number,
  variantId: number
) {
  await httpRequest<null>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'DELETE',
    path: `/company/variants/${variantId}`
  });
}

export async function getCompanyServices(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ services: CompanyService[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/services?${listQuery(options)}`
  });

  return listResult(response.data.services, response.data.pagination);
}

export async function createCompanyService(
  accessToken: string,
  companyId: number,
  payload: {
    name: string;
    description?: string | null;
    duration_minutes: number;
    price: number;
    status: string;
    professional_ids?: number[];
  }
) {
  const response = await httpRequest<{ service: CompanyService }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: '/company/services'
  });

  return response.data.service;
}

export async function updateCompanyService(
  accessToken: string,
  companyId: number,
  serviceId: number,
  payload: {
    name?: string;
    description?: string | null;
    duration_minutes?: number;
    price?: number;
    status?: string;
    professional_ids?: number[];
  }
) {
  const response = await httpRequest<{ service: CompanyService }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/services/${serviceId}`
  });

  return response.data.service;
}

export async function getCompanyProfessionals(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ professionals: ProfessionalSummary[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/professionals?${listQuery(options)}`
  });

  return listResult(response.data.professionals, response.data.pagination);
}

export async function createCompanyProfessional(
  accessToken: string,
  companyId: number,
  payload: {
    name: string;
    specialty?: string | null;
    phone?: string | null;
    email?: string | null;
    photo?: string | null;
    description?: string | null;
    status: string;
  }
) {
  const response = await httpRequest<{ professional: ProfessionalSummary }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: '/company/professionals'
  });

  return response.data.professional;
}

export async function updateCompanyProfessional(
  accessToken: string,
  companyId: number,
  professionalId: number,
  payload: {
    name?: string;
    specialty?: string | null;
    phone?: string | null;
    email?: string | null;
    photo?: string | null;
    description?: string | null;
    status?: string;
  }
) {
  const response = await httpRequest<{ professional: ProfessionalSummary }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/professionals/${professionalId}`
  });

  return response.data.professional;
}

export async function uploadCompanyProfessionalPhoto(
  accessToken: string,
  companyId: number,
  professionalId: number,
  file: File
) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await httpRequest<{ professional: ProfessionalSummary }>({
    accessToken,
    formData,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/professionals/${professionalId}/photo`
  });

  return response.data.professional;
}

export async function deleteCompanyProfessional(
  accessToken: string,
  companyId: number,
  professionalId: number
) {
  await httpRequest<null>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'DELETE',
    path: `/company/professionals/${professionalId}`
  });
}

export async function createCompanyProfessionalSchedule(
  accessToken: string,
  companyId: number,
  professionalId: number,
  payload: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    status: string;
  }
) {
  const response = await httpRequest<{ schedule: ProfessionalSchedule }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'POST',
    path: `/company/professionals/${professionalId}/schedules`
  });

  return response.data.schedule;
}

export async function updateCompanyProfessionalSchedule(
  accessToken: string,
  companyId: number,
  professionalId: number,
  scheduleId: number,
  payload: {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    status?: string;
  }
) {
  const response = await httpRequest<{ schedule: ProfessionalSchedule }>({
    accessToken,
    body: payload as unknown as Record<string, unknown>,
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/professionals/${professionalId}/schedules/${scheduleId}`
  });

  return response.data.schedule;
}

export async function deleteCompanyProfessionalSchedule(
  accessToken: string,
  companyId: number,
  professionalId: number,
  scheduleId: number
) {
  await httpRequest<null>({
    accessToken,
    headers: companyHeaders(companyId),
    method: 'DELETE',
    path: `/company/professionals/${professionalId}/schedules/${scheduleId}`
  });
}

export async function getCompanyAppointments(accessToken: string, companyId: number, options: ListOptions = {}) {
  const response = await httpRequest<{ appointments: AppointmentSummary[]; pagination: PaginationMeta }>({
    accessToken,
    headers: companyHeaders(companyId),
    path: `/company/appointments?${listQuery(options)}`
  });

  return listResult(response.data.appointments, response.data.pagination);
}

export async function updateCompanyAppointmentStatus(
  accessToken: string,
  companyId: number,
  appointmentId: number,
  status: 'accepted' | 'completed'
) {
  const response = await httpRequest<{ appointment: AppointmentSummary }>({
    accessToken,
    body: { status },
    headers: companyHeaders(companyId),
    method: 'PUT',
    path: `/company/appointments/${appointmentId}/status`
  });

  return response.data.appointment;
}

export async function getUserNotifications(accessToken: string, limit = 50, options: ListOptions = {}) {
  const response = await httpRequest<{ notifications: UserNotification[]; pagination: PaginationMeta }>({
    accessToken,
    path: `/notifications?${listQuery({ ...options, page_size: options.page_size || limit })}`
  });

  return listResult(response.data.notifications, response.data.pagination);
}

export async function markUserNotificationRead(accessToken: string, notificationId: number) {
  const response = await httpRequest<{ notification: UserNotification }>({
    accessToken,
    method: 'POST',
    path: `/notifications/${notificationId}/read`
  });

  return response.data.notification;
}

export async function markAllUserNotificationsRead(accessToken: string) {
  await httpRequest<Record<string, never>>({
    accessToken,
    method: 'POST',
    path: '/notifications/read-all'
  });
}
