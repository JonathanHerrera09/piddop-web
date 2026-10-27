import { httpRequest } from "@/services/http";

export type CatalogCategory = { id: number; name: string; type: string; status: string };
export type CatalogProduct = {
  id: number;
  name: string;
  description: string | null;
  base_price: number | string;
  status: string;
  category: CatalogCategory | null;
  images: Array<{ id: number; image_url: string }>;
  ingredients?: CatalogIngredient[];
  variants?: CatalogVariant[];
};
export type CatalogProductPayload = {
  name: string;
  description?: string | null;
  category_id: number;
  base_price: number;
  status: string;
  variant_ids?: number[];
  variant_prices?: Array<{ variant_option_id: number; additional_price: number }>;
};
export type CatalogIngredient = {
  id: number;
  name: string;
  is_removable: boolean;
  is_default: boolean;
  status: string;
  sort_order?: number;
};
export type IngredientLibraryItem = Pick<CatalogIngredient, "name" | "is_removable" | "is_default">;

export async function listPublicCategories() {
  return (await httpRequest<{ categories: CatalogCategory[] }>({ path: "/categories" })).data
    .categories;
}
export async function listCatalogProducts(accessToken: string, companyId: number, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "50" });
  if (search.trim()) query.set("search", search.trim());
  return (
    (
      await httpRequest<{ products: CatalogProduct[] }>({
        accessToken,
        companyId,
        path: `/company/products?${query.toString()}`,
      })
    ).data.products?.map((product) => ({
      ...product,
      variants: product.variants?.map(normalizeVariantTree),
    })) ?? []
  );
}
export async function saveCatalogProduct(
  accessToken: string,
  companyId: number,
  payload: CatalogProductPayload,
  id?: number,
) {
  return (
    await httpRequest<{ product: CatalogProduct }>({
      accessToken,
      companyId,
      body: payload,
      method: id ? "PUT" : "POST",
      path: id ? `/company/products/${id}` : "/company/products",
    })
  ).data.product;
}
export async function duplicateCatalogProduct(accessToken: string, companyId: number, id: number) {
  return (
    await httpRequest<{ product: CatalogProduct }>({
      accessToken,
      companyId,
      method: "POST",
      path: `/company/products/${id}/duplicate`,
    })
  ).data.product;
}
export async function deleteCatalogProduct(accessToken: string, companyId: number, id: number) {
  await httpRequest({ accessToken, companyId, method: "DELETE", path: `/company/products/${id}` });
}
export async function uploadCatalogProductImages(
  accessToken: string,
  companyId: number,
  id: number,
  files: File[],
) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return (
    await httpRequest<{ product: CatalogProduct }>({
      accessToken,
      companyId,
      formData,
      method: "POST",
      path: `/company/products/${id}/images`,
    })
  ).data.product;
}
export async function deleteCatalogProductImage(
  accessToken: string,
  companyId: number,
  productId: number,
  imageId: number,
) {
  await httpRequest({
    accessToken,
    companyId,
    method: "DELETE",
    path: `/company/products/${productId}/images/${imageId}`,
  });
}
export async function searchIngredientLibrary(
  accessToken: string,
  companyId: number,
  search: string,
) {
  const query = new URLSearchParams({ search });
  return (
    await httpRequest<{ ingredients: IngredientLibraryItem[] }>({
      accessToken,
      companyId,
      path: `/company/products/ingredients/library?${query}`,
    })
  ).data.ingredients;
}
export async function createCatalogProductIngredient(
  accessToken: string,
  companyId: number,
  productId: number,
  body: Omit<CatalogIngredient, "id">,
) {
  return (
    await httpRequest<{ ingredient: CatalogIngredient }>({
      accessToken,
      companyId,
      body,
      method: "POST",
      path: `/company/products/${productId}/ingredients`,
    })
  ).data.ingredient;
}
export async function deleteCatalogProductIngredient(
  accessToken: string,
  companyId: number,
  productId: number,
  ingredientId: number,
) {
  await httpRequest({
    accessToken,
    companyId,
    method: "DELETE",
    path: `/company/products/${productId}/ingredients/${ingredientId}`,
  });
}

export type CatalogVariantOption = {
  id?: number;
  name: string;
  status: string;
  additional_price?: number | string;
  child_variants?: CatalogVariant[];
  childVariants?: CatalogVariant[];
};
export type CatalogVariant = {
  id: number;
  name: string;
  selection_type: "single" | "multiple";
  required: boolean;
  min_selections: number;
  max_selections: number;
  status: string;
  options: CatalogVariantOption[];
};
export type CatalogVariantPayload = Omit<CatalogVariant, "id">;
function normalizeVariantTree(variant: CatalogVariant): CatalogVariant {
  return {
    ...variant,
    options: (variant.options ?? []).map((option) => {
      const rawOption = option as CatalogVariantOption & { childVariants?: CatalogVariant[] };
      return {
        ...option,
        child_variants: (rawOption.child_variants ?? rawOption.childVariants ?? []).map(
          normalizeVariantTree,
        ),
      };
    }),
  };
}
export async function listCatalogVariants(accessToken: string, companyId: number, search = "") {
  const query = new URLSearchParams({ page: "1", page_size: "50" });
  if (search.trim()) query.set("search", search.trim());
  return (
    (
      await httpRequest<{ variants: CatalogVariant[] }>({
        accessToken,
        companyId,
        path: `/company/variants?${query.toString()}`,
      })
    ).data.variants?.map(normalizeVariantTree) ?? []
  );
}
export async function saveCatalogVariant(
  accessToken: string,
  companyId: number,
  payload: CatalogVariantPayload,
  id?: number,
) {
  const response = await httpRequest<{ variant: CatalogVariant }>({
    accessToken,
    companyId,
    body: payload,
    method: id ? "PUT" : "POST",
    path: id ? `/company/variants/${id}` : "/company/variants",
  });
  return normalizeVariantTree(response.data.variant);
}
export async function duplicateCatalogVariant(accessToken: string, companyId: number, id: number) {
  const response = await httpRequest<{ variant: CatalogVariant }>({
    accessToken,
    companyId,
    method: "POST",
    path: `/company/variants/${id}/duplicate`,
  });
  return normalizeVariantTree(response.data.variant);
}
export async function deleteCatalogVariant(accessToken: string, companyId: number, id: number) {
  await httpRequest({ accessToken, companyId, method: "DELETE", path: `/company/variants/${id}` });
}
