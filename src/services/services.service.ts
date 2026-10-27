import { httpRequest } from "@/services/http";

export type ServiceProfessional = {
  id: number;
  name: string;
  specialty?: string | null;
};

export type BusinessService = {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | string;
  status: "active" | "inactive" | string;
  professionals?: ServiceProfessional[] | null;
};

export type ServicePayload = {
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  status: "active" | "inactive";
  professional_ids?: number[];
};

export async function listCompanyServices(accessToken: string, companyId: number, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "50" });
  if (search.trim()) query.set("search", search.trim());
  return (
    (
      await httpRequest<{ services: BusinessService[] }>({
        accessToken,
        companyId,
        path: `/company/services?${query.toString()}`,
      })
    ).data.services ?? []
  );
}

export async function createCompanyService(
  accessToken: string,
  companyId: number,
  payload: ServicePayload,
) {
  return (
    await httpRequest<{ service: BusinessService }>({
      accessToken,
      companyId,
      body: payload,
      method: "POST",
      path: "/company/services",
    })
  ).data.service;
}

export async function updateCompanyService(
  accessToken: string,
  companyId: number,
  serviceId: number,
  payload: ServicePayload,
) {
  return (
    await httpRequest<{ service: BusinessService }>({
      accessToken,
      companyId,
      body: payload,
      method: "PUT",
      path: `/company/services/${serviceId}`,
    })
  ).data.service;
}
