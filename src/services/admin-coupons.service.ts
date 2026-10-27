import { httpRequest } from "@/services/http";
export type Coupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number | string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  company_id: number | null;
  category_id: number | null;
};
export async function listCoupons(accessToken: string) {
  return (
    await httpRequest<{ coupons: Coupon[] }>({
      accessToken,
      path: "/admin/coupons?page=1&page_size=100",
    })
  ).data.coupons;
}
export async function saveCoupon(
  accessToken: string,
  body: Partial<Coupon> & Pick<Coupon, "code" | "discount_type" | "discount_value">,
  id?: number,
) {
  return (
    await httpRequest<{ coupon: Coupon }>({
      accessToken,
      body,
      method: id ? "PUT" : "POST",
      path: id ? `/admin/coupons/${id}` : "/admin/coupons",
    })
  ).data.coupon;
}
export async function deleteCoupon(accessToken: string, id: number) {
  await httpRequest({ accessToken, method: "DELETE", path: `/admin/coupons/${id}` });
}
