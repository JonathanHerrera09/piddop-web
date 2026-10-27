import { httpRequest } from "@/services/http";

export type Wallet = {
  balance: number | string;
  currency: string;
  status: "active" | "low_balance" | "insufficient_balance";
};

export type WalletTransaction = {
  id: number;
  type: string;
  amount: number | string;
  description: string | null;
  reference_type: string | null;
  reference_id: number | null;
  metadata: {
    order_number?: string;
    product_subtotal?: number;
    discount?: number;
    sale_amount?: number;
    commission_amount?: number;
    commission_percentage?: number;
  } | null;
  created_at: string;
};

export type WalletSummary = {
  wallet: Wallet;
  company: { id: number; name: string; commission_percentage: number | string };
  low_balance_threshold: number | string;
  today: { orders: number; commissions: number | string };
  lifetime: { credits: number | string; debits: number | string; commissions: number | string };
};

export type WalletFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
};

export type WalletPage = {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
  };
};

function query(filters: WalletFilters) {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    page_size: String(filters.pageSize ?? 20),
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  return params.toString();
}

export async function getCompanyWallet(accessToken: string, companyId: number) {
  return (await httpRequest<WalletSummary>({ accessToken, companyId, path: "/company/wallet" }))
    .data;
}

export async function listCompanyWalletTransactions(
  accessToken: string,
  companyId: number,
  filters: WalletFilters,
) {
  return (
    await httpRequest<WalletPage>({
      accessToken,
      companyId,
      path: `/company/wallet/transactions?${query(filters)}`,
    })
  ).data;
}
