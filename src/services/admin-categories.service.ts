import { httpRequest } from "@/services/http";
import { getApiUrl } from "@/lib/env";
export type AdminCategory = {
  id: number;
  name: string;
  type: "food" | "products" | "services";
  icon: string | null;
  status: "active" | "inactive";
};
function withImageUrl(category: AdminCategory): AdminCategory {
  return {
    ...category,
    icon:
      category.icon && !/^https?:\/\//i.test(category.icon)
        ? new URL(category.icon, new URL(getApiUrl()).origin).toString()
        : category.icon,
  };
}
export async function listCategories(accessToken: string) {
  return (
    await httpRequest<{ categories: AdminCategory[] }>({
      accessToken,
      path: "/admin/categories?page=1&page_size=100",
    })
  ).data.categories.map(withImageUrl);
}
export async function saveCategory(
  accessToken: string,
  p: Partial<AdminCategory> & Pick<AdminCategory, "name" | "type">,
  id?: number,
) {
  return (
    await httpRequest<{ category: AdminCategory }>({
      accessToken,
      body: p,
      method: id ? "PUT" : "POST",
      path: id ? `/admin/categories/${id}` : "/admin/categories",
    })
  ).data.category;
}
export async function removeCategory(accessToken: string, id: number) {
  await httpRequest({ accessToken, method: "DELETE", path: `/admin/categories/${id}` });
}
export async function uploadCategoryIcon(accessToken: string, id: number, file: File) {
  const formData = new FormData();
  formData.append("icon", file);
  return (
    await httpRequest<{ category: AdminCategory }>({
      accessToken,
      formData,
      method: "POST",
      path: `/admin/categories/${id}/icon`,
    })
  ).data.category;
}
