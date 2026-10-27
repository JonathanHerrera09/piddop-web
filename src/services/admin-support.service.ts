import { httpRequest } from "@/services/http";

export type SupportTicket = {
  id: number;
  subject: string;
  message: string;
  contact_phone: string;
  status: "open" | "in_progress" | "closed";
  created_at: string;
  customer?: { name: string; last_name: string; email: string };
};

export async function listAdminSupportTickets(accessToken: string) {
  return (
    await httpRequest<{ tickets: SupportTicket[] }>({
      accessToken,
      path: "/admin/support-tickets?page=1&page_size=100",
    })
  ).data.tickets;
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
