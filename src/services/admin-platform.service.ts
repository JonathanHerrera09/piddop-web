import { httpDownload, httpRequest } from "@/services/http";

export type PlatformLinks = Record<
  | "support_url"
  | "become_store_url"
  | "privacy_policy_url"
  | "terms_url"
  | "data_authorization_url",
  string | null
>;
export type Coverage = {
  enabled: boolean;
  label: string | null;
  notes: string | null;
  center: { latitude: number; longitude: number } | null;
  zoom: number;
  polygon: Array<{ latitude: number; longitude: number }>;
};
export type WompiSettings = {
  enabled: boolean;
  environment: "sandbox" | "production";
  public_key: string;
  public_base_url: string;
  private_key_configured?: boolean;
  events_secret_configured?: boolean;
  integrity_secret_configured?: boolean;
};
export type EmailTemplate = { key: string; subject: string; html: string; variables?: string[] };
export type Settlement = {
  id: number;
  settlement_number: string;
  order_count: number;
  amount_payable: number | string;
  payout_reference: string | null;
  status: string;
  company: { name: string };
};
export type EligibleOrder = {
  id: number;
  order_number: string;
  total: number | string;
  company: { id: number; name: string };
};

export async function getPlatformLinks(token: string) {
  return (
    await httpRequest<{ links: PlatformLinks }>({
      accessToken: token,
      path: "/admin/platform-settings/customer-links",
    })
  ).data.links;
}
export async function savePlatformLinks(token: string, body: PlatformLinks) {
  return (
    await httpRequest<{ links: PlatformLinks }>({
      accessToken: token,
      body,
      method: "PUT",
      path: "/admin/platform-settings/customer-links",
    })
  ).data.links;
}
export async function getPlatformCoverage(token: string) {
  return (
    await httpRequest<{ coverage: Coverage }>({
      accessToken: token,
      path: "/admin/platform-settings/coverage",
    })
  ).data.coverage;
}
export async function savePlatformCoverage(token: string, body: Coverage) {
  return (
    await httpRequest<{ coverage: Coverage }>({
      accessToken: token,
      body,
      method: "PUT",
      path: "/admin/platform-settings/coverage",
    })
  ).data.coverage;
}
export async function getWompiSettings(token: string) {
  return (
    await httpRequest<{ wompi: WompiSettings }>({
      accessToken: token,
      path: "/admin/platform-settings/wompi",
    })
  ).data.wompi;
}
export async function saveWompiSettings(
  token: string,
  body: Partial<WompiSettings> & Record<string, string | boolean | undefined>,
) {
  return (
    await httpRequest<{ wompi: WompiSettings }>({
      accessToken: token,
      body,
      method: "PUT",
      path: "/admin/platform-settings/wompi",
    })
  ).data.wompi;
}
export async function listEmailTemplates(token: string) {
  return (
    await httpRequest<{ templates: EmailTemplate[]; status: Record<string, unknown> }>({
      accessToken: token,
      path: "/admin/email-templates",
    })
  ).data;
}
export async function saveEmailTemplate(
  token: string,
  key: string,
  body: Pick<EmailTemplate, "subject" | "html">,
) {
  return (
    await httpRequest<{ template: EmailTemplate }>({
      accessToken: token,
      body,
      method: "PUT",
      path: `/admin/email-templates/${key}`,
    })
  ).data.template;
}
export async function testEmailTemplate(token: string, key: string, email: string) {
  await httpRequest({
    accessToken: token,
    body: { email },
    method: "POST",
    path: `/admin/email-templates/${key}/test`,
  });
}
export async function listEligibleOrders(token: string) {
  return (
    await httpRequest<{ orders: EligibleOrder[] }>({
      accessToken: token,
      path: "/admin/settlements/eligible-orders",
    })
  ).data.orders;
}
export async function listSettlements(token: string) {
  return (
    await httpRequest<{ settlements: Settlement[] }>({
      accessToken: token,
      path: "/admin/settlements?page=1&page_size=100",
    })
  ).data.settlements;
}
export async function createSettlement(token: string, orderIds: number[], payoutReference: string) {
  return (
    await httpRequest<{ settlement: Settlement }>({
      accessToken: token,
      body: { order_ids: orderIds, payout_reference: payoutReference },
      method: "POST",
      path: "/admin/settlements/invoices",
    })
  ).data.settlement;
}
export async function downloadSettlement(token: string, id: number) {
  return httpDownload({ accessToken: token, path: `/admin/settlements/${id}/pdf` });
}
export async function sendSettlement(token: string, id: number) {
  await httpRequest({ accessToken: token, method: "POST", path: `/admin/settlements/${id}/send` });
}
