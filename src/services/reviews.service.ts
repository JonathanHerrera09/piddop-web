import { httpRequest } from "@/services/http";

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  company?: { name: string } | null;
  order?: { order_number: string } | null;
  customer?: { name: string; last_name: string } | null;
};
export type ReviewsResult = {
  reviews: Review[];
  summary?: { count: number; average: number; distribution: Record<number, number> } | null;
};
export async function listAdminReviews(accessToken: string, rating?: string, commentsOnly = false) {
  const query = new URLSearchParams({ page: "1", page_size: "100" });
  if (rating && rating !== "Todas") query.set("rating", rating[0]);
  if (commentsOnly) query.set("has_comment", "true");
  return (await httpRequest<ReviewsResult>({ accessToken, path: `/admin/reviews?${query}` })).data;
}
export async function listCompanyReviews(
  accessToken: string,
  companyId: number,
  rating?: string,
  commentsOnly = false,
) {
  const query = new URLSearchParams({ page: "1", page_size: "100" });
  if (rating && rating !== "Todas") query.set("rating", rating[0]);
  if (commentsOnly) query.set("has_comment", "true");
  return (
    await httpRequest<ReviewsResult>({ accessToken, companyId, path: `/company/reviews?${query}` })
  ).data;
}
