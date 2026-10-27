import { httpRequest } from "@/services/http";
export type AdminCustomer = {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  addresses: Array<{ address_line?: string; neighborhood?: string; city?: string }>;
  stats: { orders_count: number; appointments_count: number };
  recent_orders: Array<{ order_number: string; company?: { name: string } }>;
  recent_appointments: Array<{ appointment_number: string; company?: { name: string } }>;
};
export async function listAdminCustomers(accessToken: string, search = "") {
  const q = new URLSearchParams({ page: "1", page_size: "100" });
  if (search) q.set("search", search);
  return (
    await httpRequest<{ customers: AdminCustomer[] }>({
      accessToken,
      path: `/admin/customers?${q}`,
    })
  ).data.customers;
}
export async function activateAdminCustomer(accessToken: string, id: number) {
  return (
    await httpRequest<{ customer: AdminCustomer }>({
      accessToken,
      method: "POST",
      path: `/admin/customers/${id}/activate`,
    })
  ).data.customer;
}
export async function clearAdminCustomer(
  accessToken: string,
  id: number,
  target: "orders" | "appointments",
) {
  await httpRequest({ accessToken, method: "DELETE", path: `/admin/customers/${id}/${target}` });
}
export async function eraseAdminCustomer(accessToken: string, id: number) {
  await httpRequest({ accessToken, method: "DELETE", path: `/admin/customers/${id}` });
}
