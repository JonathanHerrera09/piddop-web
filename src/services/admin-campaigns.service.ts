import { getApiUrl } from "@/lib/env";
import { httpRequest } from "@/services/http";
export type Campaign = {
  id: number;
  title: string;
  message: string | null;
  image_url: string;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
  display_order: number;
};
const path = (kind: "popups" | "promotions") =>
  kind === "popups" ? "/admin/popups" : "/admin/home-promotions";
const image = (item: Campaign) => ({
  ...item,
  image_url: /^https?:/i.test(item.image_url)
    ? item.image_url
    : new URL(item.image_url, new URL(getApiUrl()).origin).toString(),
});
export async function listCampaigns(token: string, kind: "popups" | "promotions") {
  const key = kind === "popups" ? "popups" : "promotions";
  const data = await httpRequest<Record<string, Campaign[]>>({
    accessToken: token,
    path: path(kind),
  });
  return (data.data[key] ?? []).map(image);
}
export async function createCampaign(
  token: string,
  kind: "popups" | "promotions",
  body: Record<string, string>,
  file: File,
) {
  const formData = new FormData();
  Object.entries(body).forEach(([k, v]) => formData.set(k, v));
  formData.set("image", file);
  await httpRequest({ accessToken: token, formData, method: "POST", path: path(kind) });
}
