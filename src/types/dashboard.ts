export type CompanyType = 'food' | 'products' | 'services';
export interface CompanyReview { id: number; rating: number; comment: string | null; created_at: string; company?: { id: number; name: string }; customer?: { id: number; name: string; last_name: string }; order?: { id: number; order_number: string }; }

export interface CoveragePoint {
  latitude: number;
  longitude: number;
}

export interface GlobalCoverageSettings {
  enabled: boolean;
  label: string | null;
  notes: string | null;
  center: CoveragePoint | null;
  zoom: number;
  polygon: CoveragePoint[];
}

export interface WompiSettings {
  enabled: boolean;
  environment: 'sandbox' | 'production';
  public_key: string;
  public_base_url: string;
  webhook_url: string;
  private_key_configured: boolean;
  events_secret_configured: boolean;
  integrity_secret_configured: boolean;
  private_key_hint: string | null;
  events_secret_hint: string | null;
  integrity_secret_hint: string | null;
}

export type CompanyCoverageBoundary = Pick<GlobalCoverageSettings, 'enabled' | 'center' | 'polygon'>;

export interface AdminCustomerSummary {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  status: string;
  addresses: Array<{
    id: number;
    label: string | null;
    recipient_name: string;
    recipient_phone: string;
    address_line: string;
    additional_details?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    is_default: boolean;
  }>;
  stats: {
    addresses_count: number;
    orders_count: number;
    active_orders_count: number;
    delivered_orders_count: number;
    appointments_count: number;
    pending_appointments_count: number;
    cancellations_this_month: number;
  };
  recent_orders: Array<{
    id: number;
    order_number: string;
    order_status: string;
    total: number | string;
    created_at: string;
    company: {
      id: number;
      name: string;
      type: CompanyType;
    } | null;
  }>;
  recent_appointments: Array<{
    id: number;
    appointment_number: string;
    status: string;
    scheduled_date: string;
    start_time: string;
    price: number | string;
    created_at: string;
    company: {
      id: number;
      name: string;
      type: CompanyType;
    } | null;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface CompanySummary {
  id: number;
  name: string;
  type: CompanyType;
  description: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  address: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  commission_percentage: number | string | null;
  status: string;
  rating: number | string | null;
  availability_mode: 'automatic' | 'open' | 'closed';
  business_hours: Array<{
    day_of_week: number;
    enabled: boolean;
    start_time: string;
    end_time: string;
  }> | null;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminCompanyPayload {
  name: string;
  type: CompanyType;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  commission_percentage?: number;
  status?: string;
  rating?: number | null;
}

export interface MetricBlock {
  orders: number;
  sales: number | string;
  commission: number | string;
  by_status: Record<string, number>;
}

export interface AdminDashboardData {
  companies: {
    total: number;
    active: number;
    by_type: Array<{ type: CompanyType; count: number | string }>;
  };
  commissions: {
    daily: number | string;
    weekly: number | string;
    monthly: number | string;
  };
  orders: {
    daily: MetricBlock;
    weekly: MetricBlock;
    monthly: MetricBlock;
  };
}

export interface CompanyOrder {
  id: number;
  order_number: string;
  total: number | string;
  subtotal?: number | string;
  discount?: number | string;
  delivery_fee?: number | string;
  payment_method?: string;
  payment_status?: string;
  order_status: string;
  rejection_reason?: string | null;
  customer_notes?: string | null;
  created_at: string;
  address?: {
    id: number;
    label?: string | null;
    address_line?: string | null;
    address?: string | null;
  } | null;
  items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_base_price: number | string;
    variants_total: number | string;
    line_total: number | string;
    customer_notes?: string | null;
    variants: Array<{
      id?: number;
      variant_name: string;
      option_name: string;
      additional_price: number | string;
    }>;
    ingredientAdjustments: Array<{
      id?: number;
      ingredient_name: string;
      action: string;
    }>;
  }>;
  }

export interface CompanyDashboardData {
  all: MetricBlock;
  today: MetricBlock;
  recent_orders: CompanyOrder[];
  wallet: {
    wallet: {
      id: number;
      company_id: number;
      balance: number | string;
      currency: string;
      status: 'active' | 'low_balance' | 'insufficient_balance';
      created_at?: string;
      updated_at?: string;
    };
    company: {
      id: number;
      name: string;
      commission_percentage: number | string | null;
    } | null;
    low_balance_threshold: number | string;
    today: {
      orders: number;
      commissions: number | string;
    };
    lifetime: {
      credits: number | string;
      debits: number | string;
      commissions: number | string;
    };
  };
}

export interface WalletTransactionSummary {
  id: number;
  company_wallet_id: number;
  company_id: number;
  type:
    | 'topup'
    | 'order_commission'
    | 'refund'
    | 'bonus'
    | 'manual_credit'
    | 'manual_debit'
    | 'adjustment';
  amount: number | string;
  balance_before: number | string;
  balance_after: number | string;
  reference_type: string | null;
  reference_id: number | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_by: number | null;
  created_at: string;
}

export interface CompanyProduct {
  id: number;
  name: string;
  description: string | null;
  base_price: number | string;
  status: string;
  category: {
    id: number;
    name: string;
    type: CompanyType;
  } | null;
  images: Array<{
    id: number;
    image_url: string;
    sort_order: number;
  }>;
  ingredients: Array<{
    id: number;
    name: string;
    is_removable: boolean;
    is_default?: boolean;
    extra_price: number | string;
    sort_order?: number;
    status: string;
  }>;
  variants: CompanyVariant[];
}

export interface IngredientLibraryItem {
  name: string;
  is_default: boolean;
  is_removable: boolean;
  usage_count: number;
}

export interface PublicCategory {
  id: number;
  name: string;
  type: CompanyType;
  icon: string | null;
  status: string;
}

export interface CompanyVariantOption {
  id: number;
  name: string;
  additional_price?: number | string;
  status: string;
  childVariants?: CompanyVariant[];
  child_variants?: CompanyVariant[];
}

export interface CompanyVariant {
  id: number;
  name: string;
  selection_type: 'single' | 'multiple';
  required: boolean;
  min_selections: number;
  max_selections: number;
  status: string;
  options: CompanyVariantOption[];
}

export interface ProfessionalSchedule {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: string;
}

export interface ProfessionalSummary {
  id: number;
  user_id?: number | null;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  description: string | null;
  status: string;
  schedules?: ProfessionalSchedule[];
}

export interface CompanyService {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | string;
  status: string;
  professionals: ProfessionalSummary[];
}

export interface AppointmentSummary {
  id: number;
  appointment_number: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  price: number | string;
  status: string;
  customer_notes: string | null;
  service: CompanyService;
  professional: ProfessionalSummary;
  customer: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface UserNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | string;
  max_discount: number | string | null;
  minimum_order_amount: number | string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count?: number | null;
  per_user_limit: number | null;
  company_id: number | null;
  category_id: number | null;
  status: string;
}

export interface AdminPopup {
  id: number;
  title: string;
  message: string | null;
  image_url: string | null;
  link_url: string | null;
  display_order: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export type AdminHomePromotion = AdminPopup;

export interface AdminDriver {
  id: number;
  user_id: number;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car' | 'other';
  vehicle_plate: string | null;
  availability_status: 'offline' | 'available' | 'busy' | 'suspended';
  current_latitude: number | string | null;
  current_longitude: number | string | null;
  location_updated_at: string | null;
  created_at?: string;
  updated_at?: string;
  user: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
  };
}

export interface SettlementItem {
  id?: number;
  order_id: number;
  order_number: string;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string;
  subtotal: number | string;
  discount: number | string;
  net_product_sale: number | string;
  delivery_fee: number | string;
  customer_paid_total: number | string;
  commission_amount: number | string;
  company_payable: number | string;
}

export interface CompanySettlement {
  id: number;
  settlement_number: string;
  company_id: number;
  period_start: string;
  period_end: string;
  status: 'issued' | 'paid';
  closure_type: 'weekly' | 'monthly' | 'custom';
  currency: string;
  order_count: number;
  gross_sales: number | string;
  discounts: number | string;
  net_product_sales: number | string;
  delivery_fees: number | string;
  customer_paid_total: number | string;
  platform_commission: number | string;
  amount_payable: number | string;
  notes: string | null;
  payout_method: string | null;
  payout_reference: string | null;
  paid_at: string | null;
  issued_at: string;
  document_hash: string;
  period_orders_count: number;
  period_total_sales: number | string;
  period_pse_sales: number | string;
  period_cash_sales: number | string;
  period_customer_paid: number | string;
  period_commissions: number | string;
  period_topups: number | string;
  period_wallet_credits: number | string;
  period_wallet_debits: number | string;
  opening_wallet_balance: number | string;
  closing_wallet_balance: number | string;
  company: CompanySummary;
  items?: SettlementItem[];
}

export interface SettlementPreview {
  company: CompanySummary;
  period_start: string;
  period_end: string;
  items: SettlementItem[];
  totals: Pick<CompanySettlement, 'order_count' | 'gross_sales' | 'discounts' | 'net_product_sales' | 'delivery_fees' | 'customer_paid_total' | 'platform_commission' | 'amount_payable'>;
}

export interface SettlementOverview {
  company: CompanySummary;
  period_start: string;
  period_end: string;
  sales: {
    orders: number;
    total_sales: number | string;
    pse_sales: number | string;
    cash_sales: number | string;
    total_commissions: number | string;
    customer_paid: number | string;
  };
  wallet: {
    balance: number | string;
    status: 'active' | 'low_balance' | 'insufficient_balance';
    opening_balance: number | string;
    closing_balance: number | string;
    period: {
      topups: number | string;
      credits: number | string;
      debits: number | string;
      commissions: number | string;
    };
  };
  pse: {
    total_payable: number | string;
    already_settled: number | string;
    pending_payable: number | string;
    pending_orders: number;
  };
}
