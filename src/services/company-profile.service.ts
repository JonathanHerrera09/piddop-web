import { getApiUrl } from "@/lib/env";
import { httpRequest } from "@/services/http";

export type CompanyProfile = {
  id: number;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
};

export type CompanyProfilePayload = Omit<CompanyProfile, "id" | "logo">;

export function companyImageUrl(url: string | null) {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return new URL(url, new URL(getApiUrl()).origin).toString();
}

export async function getCompanyProfile(accessToken: string, companyId: number) {
  const response = await httpRequest<{ company: CompanyProfile }>({
    accessToken,
    companyId,
    path: "/company/profile",
  });
  return { ...response.data.company, logo: companyImageUrl(response.data.company.logo) };
}

export async function updateCompanyProfile(
  accessToken: string,
  companyId: number,
  payload: CompanyProfilePayload,
) {
  const response = await httpRequest<{ company: CompanyProfile }>({
    accessToken,
    companyId,
    body: payload,
    method: "PUT",
    path: "/company/profile",
  });
  return { ...response.data.company, logo: companyImageUrl(response.data.company.logo) };
}

export async function uploadCompanyLogo(accessToken: string, companyId: number, image: File) {
  const formData = new FormData();
  formData.set("image", image);
  const response = await httpRequest<{ company: CompanyProfile }>({
    accessToken,
    companyId,
    formData,
    method: "POST",
    path: "/company/profile/logo",
  });
  return { ...response.data.company, logo: companyImageUrl(response.data.company.logo) };
}
