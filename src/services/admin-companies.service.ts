import { httpRequest } from "@/services/http";

export type AdminCompany = {
  id: number;
  name: string;
  type: "food" | "products" | "services";
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  commission_percentage: number | string;
  rating: number | string | null;
  status: string;
};
export type CompanyPayload = Partial<Omit<AdminCompany, "id" | "commission_percentage">> & {
  name: string;
  type: AdminCompany["type"];
  commission_percentage?: number;
};
export type Pagination = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
};
export async function listAdminCompaniesPage(accessToken: string, search = "", page = 1) {
  const query = new URLSearchParams({ page: String(page), page_size: "20" });
  if (search.trim()) query.set("search", search.trim());
  return (
    await httpRequest<{ companies: AdminCompany[]; pagination: Pagination }>({
      accessToken,
      path: `/admin/companies?${query}`,
    })
  ).data;
}
export async function listAdminCompanies(accessToken: string, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "100" });
  if (search) query.set("search", search);
  return (
    await httpRequest<{ companies: AdminCompany[] }>({
      accessToken,
      path: `/admin/companies?${query}`,
    })
  ).data.companies;
}
export async function saveAdminCompany(accessToken: string, payload: CompanyPayload, id?: number) {
  return (
    await httpRequest<{ company: AdminCompany }>({
      accessToken,
      body: payload,
      method: id ? "PUT" : "POST",
      path: id ? `/admin/companies/${id}` : "/admin/companies",
    })
  ).data.company;
}
export async function setAdminCompanyStatus(
  accessToken: string,
  id: number,
  status: "active" | "suspended",
) {
  return (
    await httpRequest<{ company: AdminCompany }>({
      accessToken,
      method: "POST",
      path: `/admin/companies/${id}/${status === "active" ? "activate" : "suspend"}`,
    })
  ).data.company;
}
export async function updateAdminCompanyCommission(
  accessToken: string,
  id: number,
  commission_percentage: number,
) {
  return (
    await httpRequest<{ company: AdminCompany }>({
      accessToken,
      body: { commission_percentage },
      method: "PUT",
      path: `/admin/companies/${id}/commission`,
    })
  ).data.company;
}
