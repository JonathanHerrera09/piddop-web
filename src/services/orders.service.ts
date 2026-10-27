import { httpDownload, httpRequest } from "@/services/http";

export type CompanyOrderItem = {
  id: number;
  quantity: number;
  unit_price: number | string;
  product?: { name: string } | null;
  product_name?: string;
  notes?: string | null;
};

export type CompanyOrder = {
  id: number;
  order_number: string;
  order_status: string;
  subtotal: number | string;
  delivery_fee: number | string;
  discount: number | string;
  total: number | string;
  payment_method?: string | null;
  payment_status?: string | null;
  created_at: string;
  rejection_reason?: string | null;
  customer?: { name: string; last_name?: string | null; phone?: string | null } | null;
  delivery_address?: { address_line?: string; neighborhood?: string } | null;
  items?: CompanyOrderItem[];
};

export async function listCompanyOrders(accessToken: string, companyId: number, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "50" });
  if (search.trim()) query.set("search", search.trim());
  return (
    (
      await httpRequest<{ orders: CompanyOrder[] }>({
        accessToken,
        companyId,
        path: `/company/orders?${query.toString()}`,
      })
    ).data.orders ?? []
  );
}

export async function getCompanyOrder(accessToken: string, companyId: number, orderId: number) {
  return (
    await httpRequest<{ order: CompanyOrder }>({
      accessToken,
      companyId,
      path: `/company/orders/${orderId}`,
    })
  ).data.order;
}

export async function transitionCompanyOrder(
  accessToken: string,
  companyId: number,
  orderId: number,
  action: "accept" | "reject" | "preparing" | "waiting-delivery",
  rejectionReason?: string,
) {
  return (
    await httpRequest<{ order: CompanyOrder }>({
      accessToken,
      companyId,
      method: "POST",
      path: `/company/orders/${orderId}/${action}`,
      body: rejectionReason ? { rejection_reason: rejectionReason } : undefined,
    })
  ).data.order;
}

export async function downloadCompanyOrderReceipt(
  accessToken: string,
  companyId: number,
  orderId: number,
) {
  return httpDownload({ accessToken, companyId, path: `/company/orders/${orderId}/receipt.pdf` });
}
