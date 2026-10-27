import { httpRequest } from "@/services/http";

export type UserNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export async function getAdminDashboard(accessToken: string) {
  return (await httpRequest<Record<string, unknown>>({ accessToken, path: "/admin/dashboard" }))
    .data;
}

export async function getCompanyDashboard(accessToken: string, companyId: number) {
  return (
    await httpRequest<Record<string, unknown>>({
      accessToken,
      companyId,
      path: "/company/dashboard",
    })
  ).data;
}

export async function getUserNotifications(accessToken: string, page = 1) {
  return (
    await httpRequest<{ notifications: UserNotification[] }>({
      accessToken,
      path: `/notifications?page=${page}&page_size=50`,
    })
  ).data.notifications;
}

export async function markNotificationRead(accessToken: string, notificationId: number) {
  return (
    await httpRequest<{ notification: UserNotification }>({
      accessToken,
      method: "POST",
      path: `/notifications/${notificationId}/read`,
    })
  ).data.notification;
}

export async function markAllNotificationsRead(accessToken: string) {
  await httpRequest<Record<string, never>>({
    accessToken,
    method: "POST",
    path: "/notifications/read-all",
  });
}

export type CatalogProduct = {
  id: number;
  name: string;
  description: string | null;
  base_price: number | string;
  status: string;
  category: { id: number; name: string } | null;
  images: Array<{ id: number; image_url: string }>;
};

export async function getCompanyProducts(accessToken: string, companyId: number, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "50" });
  if (search.trim()) query.set("search", search.trim());
  return (
    await httpRequest<{ products: CatalogProduct[] }>({
      accessToken,
      companyId,
      path: `/company/products?${query}`,
    })
  ).data.products;
}

export async function saveCompanyProduct(
  accessToken: string,
  companyId: number,
  productId: number | null,
  payload: Record<string, unknown>,
) {
  const path = productId ? `/company/products/${productId}` : "/company/products";
  return (
    await httpRequest<{ product: CatalogProduct }>({
      accessToken,
      companyId,
      body: payload,
      method: productId ? "PUT" : "POST",
      path,
    })
  ).data.product;
}
