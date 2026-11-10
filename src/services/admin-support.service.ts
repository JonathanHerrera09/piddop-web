import { httpRequest } from "@/services/http";

export type SupportTicket = {
  id: number;
  subject: string;
  message: string;
  contact_phone: string;
  status: "open" | "in_progress" | "closed";
  created_at: string;
  customer?: { id: number; name: string; last_name: string; email: string };
  messages?: Array<{ id: number; message: string; is_internal: boolean; created_at: string; author?: { id: number; name: string; last_name: string } }>;
};

export async function listAdminSupportTickets(accessToken: string) {
  return (
    await httpRequest<{ tickets: SupportTicket[] }>({
      accessToken,
      path: "/admin/support-tickets?page=1&page_size=100",
    })
  ).data.tickets;
}
export async function getAdminSupportTicket(accessToken: string, id: number) {
  return (await httpRequest<{ ticket: SupportTicket }>({ accessToken, path: `/admin/support-tickets/${id}` })).data.ticket;
}
export async function addAdminSupportMessage(accessToken: string, id: number, message: string, isInternal: boolean) {
  return (await httpRequest<{ ticket: SupportTicket }>({ accessToken, method: "POST", path: `/admin/support-tickets/${id}/messages`, body: { message, is_internal: isInternal } })).data.ticket;
}
export async function updateAdminSupportTicket(
  accessToken: string,
  id: number,
  status: SupportTicket["status"],
) {
  return (
    await httpRequest<{ ticket: SupportTicket }>({
      accessToken,
      method: "PATCH",
      body: { status },
      path: `/admin/support-tickets/${id}`,
    })
  ).data.ticket;
}
