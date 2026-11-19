import { httpRequest } from "@/services/http";

export type PushCampaignResult = {
  recipients: number;
  push_tickets: number;
};

export type PushCampaignFilters = {
  activity: "all" | "orders" | "appointments";
  company_type: "all" | "food" | "products" | "services";
  company_id: number | null;
  minimum_order_total: number | null;
  from: string;
  to: string;
};

export async function previewPushCampaign(accessToken: string, filters: PushCampaignFilters) {
  return (
    await httpRequest<{ recipients: number }>({
      accessToken,
      method: "POST",
      path: "/admin/notifications/push/preview",
      body: { filters },
    })
  ).data;
}

export async function sendPushCampaign(
  accessToken: string,
  title: string,
  message: string,
  filters: PushCampaignFilters,
) {
  return (
    await httpRequest<PushCampaignResult>({
      accessToken,
      method: "POST",
      path: "/admin/notifications/push",
      body: { title, message, filters },
    })
  ).data;
}
