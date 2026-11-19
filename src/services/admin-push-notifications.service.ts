import { httpRequest } from "@/services/http";

export type PushCampaignResult = {
  recipients: number;
  push_tickets: number;
};

export async function sendPushCampaign(accessToken: string, title: string, message: string) {
  return (
    await httpRequest<PushCampaignResult>({
      accessToken,
      method: "POST",
      path: "/admin/notifications/push",
      body: { title, message },
    })
  ).data;
}
