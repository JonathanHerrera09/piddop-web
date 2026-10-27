import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Copy,
  Printer,
  FileText,
  ChevronDown,
  Trash2,
  Clock,
  Package,
} from "lucide-react";
import {
  Btn,
  Badge,
  Card,
  Stat,
  PageHeader,
  SearchBox,
  Field,
  Input,
  Textarea,
  Select,
  Toggle,
  Modal,
  useConfirm,
  Table,
  Td,
  Status,
  money,
} from "./kit";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import {
  createCompanyService,
  listCompanyServices,
  updateCompanyService,
  type BusinessService,
  type ServicePayload,
} from "@/services/services.service";
import { ErrorState, EmptyState, LoadingState } from "./async-state";
import { ApiError } from "@/services/http";
import {
  createCompanyProfessional,
  deleteCompanyProfessional,
  listCompanyProfessionals,
  updateCompanyProfessional,
  uploadCompanyProfessionalPhoto,
  type Professional,
  type ProfessionalPayload,
  type ProfessionalSchedule,
  type SchedulePayload,
  deleteProfessionalSchedule,
  listProfessionalSchedules,
  saveProfessionalSchedule,
} from "@/services/professionals.service";
import {
  listCompanyAppointments,
  updateCompanyAppointmentStatus,
  type Appointment,
} from "@/services/appointments.service";
import {
  getCompanyProfile,
  companyImageUrl,
  updateCompanyProfile,
  uploadCompanyLogo,
  type CompanyProfile,
  type CompanyProfilePayload,
} from "@/services/company-profile.service";
import { getGoogleMapsApiKey } from "@/lib/env";
import { CompanyLocationMap } from "./company-location-map";
import {
  getCompanyWallet,
  listCompanyWalletTransactions,
  type WalletFilters,
  type WalletSummary,
  type WalletTransaction,
} from "@/services/wallet.service";
import { getCompanyDashboard } from "@/services/dashboard.service";
import {
  getCompanyOrder,
  listCompanyOrders,
  transitionCompanyOrder,
  type CompanyOrder,
} from "@/services/orders.service";
import {
  deleteCatalogProduct,
  deleteCatalogProductImage,
  deleteCatalogProductIngredient,
  deleteCatalogVariant,
  duplicateCatalogProduct,
  duplicateCatalogVariant,
  createCatalogProductIngredient,
  listCatalogProducts,
  listCatalogVariants,
  listPublicCategories,
  saveCatalogProduct,
  saveCatalogVariant,
  searchIngredientLibrary,
  uploadCatalogProductImages,
  type CatalogCategory,
  type CatalogProduct,
  type CatalogVariant,
} from "@/services/catalog.service";

const ok = (m: string) => toast.success(m);

function serviceErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Tu sesión venció. Cierra sesión e ingresa nuevamente.";
    if (error.status === 403)
      return "No tienes permiso para consultar los servicios de esta empresa.";
    if (error.status === 422) return "La solicitud de servicios tiene datos inválidos.";
  }
  return error instanceof Error ? error.message : "No fue posible consultar los servicios.";
}

/* ---------- Resumen del negocio ---------- */
function BizSummaryDemo({ services }: { services?: boolean }) {
  return (
    <>
      <PageHeader
        title="Resumen del negocio"
        desc="Lectura rápida de ventas, cartera y actividad reciente."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          accent
          label="Ventas del mes"
          value={money(services ? 8_420_000 : 12_850_000)}
          hint="+8% vs. mes anterior"
        />
        <Stat label={services ? "Citas" : "Pedidos"} value={services ? 134 : 312} />
        <Stat label="Comisión del mes" value={money(services ? 673_600 : 1_285_000)} />
        <Stat
          label="Saldo de cartera"
          value={money(-245_000)}
          hint="Movimientos separados de ventas"
        />
      </div>
      <Card className="mt-6">
        <p className="mb-3 font-semibold">{services ? "Citas recientes" : "Pedidos recientes"}</p>
        <div className="divide-y divide-border">
          {(services
            ? [
                ["Ana Restrepo", "Manicura", "pending"],
                ["Sofía L.", "Corte", "accepted"],
                ["Valeria T.", "Pedicura", "completed"],
              ]
            : [
                ["#1045 · Laura M.", money(42000), "pending"],
                ["#1044 · Pedro S.", money(21000), "preparing"],
                ["#1043 · Ana R.", money(34500), "delivered"],
              ]
          ).map(([a, b, s]) => (
            <div key={a} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">{a}</span>
              <span className="text-muted-foreground">{b}</span>
              <Status s={s} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export function BizSummary({ services }: { services?: boolean }) {
  const { session } = useSession();
  const company = session?.companies.find(
    (entry) => entry.company.id === session.activeCompanyId,
  )?.company;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    setError(null);
    try {
      setData(await getCompanyDashboard(session.tokens.accessToken, company.id));
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    }
  }, [company, session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState label="Cargando resumen..." />;
  const all = (data.all ?? {}) as { sales?: number; orders?: number; commission?: number };
  const today = (data.today ?? {}) as { sales?: number; orders?: number; commission?: number };
  const wallet = (data.wallet ?? {}) as {
    wallet?: { balance?: number };
    today?: { commissions?: number };
  };
  const recent = (data.recent_orders ?? []) as Array<{
    id: number;
    order_number: string;
    total: number;
    order_status: string;
  }>;
  return (
    <>
      <PageHeader title="Resumen del negocio" desc="Datos reales de la empresa activa." />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat accent label="Ventas acumuladas" value={money(Number(all.sales ?? 0))} />
        <Stat label={services ? "Citas / pedidos" : "Pedidos"} value={Number(all.orders ?? 0)} />
        <Stat label="Comisión acumulada" value={money(Number(all.commission ?? 0))} />
        <Stat
          label="Saldo de cartera"
          value={money(Number(wallet.wallet?.balance ?? 0))}
          hint={`Comisiones hoy: ${money(Number(wallet.today?.commissions ?? today.commission ?? 0))}`}
        />
      </div>
      <Card className="mt-6">
        <p className="mb-3 font-semibold">Pedidos recientes</p>
        {recent.length ? (
          <div className="divide-y divide-border">
            {recent.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-medium">{order.order_number}</span>
                <span className="text-muted-foreground">{money(Number(order.total))}</span>
                <Status s={order.order_status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin actividad todavía"
            description="Los pedidos reales aparecerán aquí."
          />
        )}
      </Card>
    </>
  );
}

/* ---------- Comisiones ---------- */
export function Commissions() {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WalletFilters>({ page: 1, pageSize: 20, type: "all" });
  const [draft, setDraft] = useState<WalletFilters>({ page: 1, pageSize: 20, type: "all" });
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total_items: 0,
    total_pages: 1,
    has_next: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextTransactions] = await Promise.all([
        getCompanyWallet(session.tokens.accessToken, company.id),
        listCompanyWalletTransactions(session.tokens.accessToken, company.id, filters),
      ]);
      setSummary(nextSummary);
      setTransactions(nextTransactions.transactions);
      setPagination(nextTransactions.pagination);
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [company, filters, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const applyFilters = () => setFilters({ ...draft, page: 1 });
  const clearFilters = () => {
    const empty = { page: 1, pageSize: 20, type: "all" };
    setDraft(empty);
    setFilters(empty);
  };
  const typeLabel: Record<string, string> = {
    topup: "Recarga",
    order_commission: "Comisión",
    refund: "Reembolso",
    bonus: "Bonificación",
    manual_credit: "Abono manual",
    manual_debit: "Débito manual",
    adjustment: "Ajuste",
  };
  const descriptionFor = (transaction: WalletTransaction) => {
    if (transaction.type !== "order_commission")
      return transaction.description || "Movimiento de cartera";
    const metadata = transaction.metadata;
    const order = metadata?.order_number ? ` del pedido ${metadata.order_number}` : "";
    return metadata?.sale_amount !== undefined
      ? `Comisión${order} sobre ${money(Number(metadata.sale_amount))}; domicilio excluido.`
      : transaction.description || `Comisión${order}`;
  };
  if (!company) return <EmptyState title="Selecciona una empresa para ver la cartera." />;
  return (
    <>
      <PageHeader
        title="Comisiones y cartera"
        desc="Solo Owner y Manager. El domicilio no participa en la comisión."
        actions={
          <Btn variant="outline" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Btn>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat
          accent
          label="Saldo disponible"
          value={summary ? money(Number(summary.wallet.balance)) : "—"}
        />
        <Stat
          label="Estado del saldo"
          value={
            <Badge tone={summary?.wallet.status === "active" ? "active" : "pending"}>
              {summary?.wallet.status === "active"
                ? "Disponible"
                : summary?.wallet.status === "low_balance"
                  ? "Saldo bajo"
                  : "Saldo insuficiente"}
            </Badge>
          }
        />
        <Card>
          <p className="text-xs font-semibold uppercase text-muted-foreground">¿Cómo se calcula?</p>
          <p className="mt-2 text-sm">
            Comisión {summary ? `${summary.company.commission_percentage}%` : ""} sobre subtotal de
            productos. El domicilio se excluye.
          </p>
        </Card>
      </div>
      {showFilters && (
        <Card className="mb-4 grid gap-3 md:grid-cols-5">
          <Field label="Pedido / descripción">
            <Input
              value={draft.search ?? ""}
              onChange={(event) => setDraft({ ...draft, search: event.target.value })}
            />
          </Field>
          <Field label="Desde">
            <Input
              type="date"
              value={draft.dateFrom ?? ""}
              onChange={(event) => setDraft({ ...draft, dateFrom: event.target.value })}
            />
          </Field>
          <Field label="Hasta">
            <Input
              type="date"
              value={draft.dateTo ?? ""}
              onChange={(event) => setDraft({ ...draft, dateTo: event.target.value })}
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={draft.type}
              onChange={(event) => setDraft({ ...draft, type: event.target.value })}
              options={[
                "all",
                "order_commission",
                "topup",
                "refund",
                "bonus",
                "manual_credit",
                "manual_debit",
                "adjustment",
              ]}
            />
          </Field>
          <div className="flex items-end gap-2">
            <Btn onClick={applyFilters}>Aplicar filtros</Btn>
            <Btn variant="ghost" onClick={clearFilters}>
              Limpiar filtros
            </Btn>
          </div>
        </Card>
      )}
      {loading ? <LoadingState label="Cargando cartera real..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && !transactions.length ? (
        <EmptyState title="No hay movimientos para estos filtros." />
      ) : null}
      {!loading && !error && transactions.length ? (
        <>
          <Table head={["Fecha", "Descripción", "Tipo", "Valor"]}>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <Td>
                  {new Intl.DateTimeFormat("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(transaction.created_at))}
                </Td>
                <Td>{descriptionFor(transaction)}</Td>
                <Td>
                  <Badge tone={Number(transaction.amount) >= 0 ? "active" : "brand"}>
                    {typeLabel[transaction.type] ?? transaction.type}
                  </Badge>
                </Td>
                <Td
                  className={cn(
                    "font-semibold",
                    Number(transaction.amount) < 0 ? "text-destructive" : "text-success",
                  )}
                >
                  {Number(transaction.amount) < 0 ? "−" : "+"}
                  {money(Math.abs(Number(transaction.amount)))}
                </Td>
              </tr>
            ))}
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {pagination.total_items} registros · página {pagination.page} de{" "}
              {Math.max(pagination.total_pages, 1)}
            </span>
            <div className="flex gap-2">
              <Btn
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
              >
                Anterior
              </Btn>
              <Btn
                size="sm"
                variant="outline"
                disabled={!pagination.has_next}
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
              >
                Siguiente
              </Btn>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

/* ---------- Pedidos ---------- */
type Order = {
  id: string;
  date: string;
  client: string;
  items: [string, number, string][];
  total: number;
  status: string;
};
const next: Record<string, [string, string][]> = {
  pending: [["Aceptar", "accepted"]],
  accepted: [["Preparando", "preparing"]],
  preparing: [["Listo envío", "ready"]],
};
function OrdersDemo() {
  const [list, setList] = useState<Order[]>([
    {
      id: "#1045",
      date: "26 oct 9:40",
      client: "Laura Martínez",
      items: [
        ["Hamburguesa doble", 2, "+ tocineta"],
        ["Papas grandes", 1, ""],
      ],
      total: 42000,
      status: "pending",
    },
    {
      id: "#1044",
      date: "26 oct 9:12",
      client: "Pedro Salas",
      items: [["Perro especial", 1, "sin cebolla"]],
      total: 21000,
      status: "accepted",
    },
    {
      id: "#1043",
      date: "26 oct 8:55",
      client: "Ana Restrepo",
      items: [["Combo familiar", 1, "+ gaseosa 1.5L"]],
      total: 34500,
      status: "preparing",
    },
    {
      id: "#1040",
      date: "25 oct 20:10",
      client: "Juan C.",
      items: [["Salchipapa", 2, ""]],
      total: 28000,
      status: "delivered",
    },
  ]);
  const [open, setOpen] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Order | null>(null);
  const c = useConfirm();
  const set = (id: string, s: string) => {
    setList(list.map((o) => (o.id === id ? { ...o, status: s } : o)));
    ok(`Pedido ${id} actualizado`);
  };
  return (
    <>
      <PageHeader title="Pedidos" desc="Operación diaria del negocio." />
      <div className="grid gap-3">
        {list.map((o) => (
          <Card key={o.id} className="p-0">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <div className="w-20 font-display text-lg font-bold">{o.id}</div>
              <div className="min-w-40 flex-1">
                <p className="font-semibold">{o.client}</p>
                <p className="text-xs text-muted-foreground">
                  {o.date} · {o.items.length} artículos
                </p>
              </div>
              <p className="font-semibold">{money(o.total)}</p>
              <Status s={o.status} />
              <div className="flex flex-wrap gap-1">
                <Btn size="sm" variant="ghost" onClick={() => setOpen(open === o.id ? null : o.id)}>
                  {open === o.id ? "Ocultar" : "Detalle"}
                  <ChevronDown className={cn("size-3 transition", open === o.id && "rotate-180")} />
                </Btn>
                <Btn size="sm" variant="outline" onClick={() => setTicket(o)}>
                  <FileText className="size-3" />
                  PDF
                </Btn>
                {(next[o.status] ?? []).map(([l, s]) => (
                  <Btn key={l} size="sm" onClick={() => set(o.id, s)}>
                    {l}
                  </Btn>
                ))}
                {o.status === "pending" && (
                  <Btn
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      c.ask(
                        "¿Rechazar pedido?",
                        "Se cancelará y se informará al cliente con el motivo.",
                        "Rechazar",
                        () => set(o.id, "cancelled"),
                      )
                    }
                  >
                    Rechazar
                  </Btn>
                )}
              </div>
            </div>
            {open === o.id && (
              <div className="grid gap-4 border-t border-border bg-muted/40 p-4 text-sm md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Artículos
                  </p>
                  {o.items.map(([n, q, a]) => (
                    <p key={n}>
                      {q}× {n} <span className="text-muted-foreground">{a}</span>
                    </p>
                  ))}
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Entrega
                  </p>
                  <p>Cra 45 #12-30, Casa</p>
                  <p className="text-muted-foreground">Tel. 300 123 4567</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Cobro
                  </p>
                  <p>Subtotal {money(o.total - 4000)}</p>
                  <p>Domicilio {money(4000)}</p>
                  <p className="font-semibold">Total {money(o.total)} · PSE</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      <Modal
        open={!!ticket}
        onClose={() => setTicket(null)}
        title={`Tirilla ${ticket?.id}`}
        footer={
          <>
            <Btn variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Imprimir
            </Btn>
            <Btn onClick={() => window.print()}>PDF</Btn>
          </>
        }
      >
        <div className="mx-auto w-64 rounded-md border border-dashed border-border p-4 font-mono text-xs">
          <p className="text-center font-bold">LA BRASA</p>
          <p className="text-center">{ticket?.date}</p>
          <hr className="my-2 border-dashed" />
          {ticket?.items.map(([n, q, a]) => (
            <p key={n}>
              {q}x {n}
              {a && (
                <>
                  <br />
                  &nbsp;&nbsp;{a}
                </>
              )}
            </p>
          ))}
          <hr className="my-2 border-dashed" />
          <p>Cliente: {ticket?.client}</p>
          <p className="font-bold">TOTAL {ticket && money(ticket.total)}</p>
        </div>
      </Modal>
      {c.node}
    </>
  );
}

export function Orders() {
  const { session } = useSession();
  const company = session?.companies.find(
    (entry) => entry.company.id === session.activeCompanyId,
  )?.company;
  const [orders, setOrders] = useState<CompanyOrder[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<CompanyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      setOrders(await listCompanyOrders(session.tokens.accessToken, company.id));
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [company, session]);

  useEffect(() => {
    void load();
  }, [load]);

  const transition = async (
    order: CompanyOrder,
    action: "accept" | "preparing" | "waiting-delivery" | "reject",
  ) => {
    if (!session || !company) return;
    const rejectionReason =
      action === "reject" ? window.prompt("Motivo del rechazo:")?.trim() : undefined;
    if (action === "reject" && !rejectionReason) return;
    try {
      const changed = await transitionCompanyOrder(
        session.tokens.accessToken,
        company.id,
        order.id,
        action,
        rejectionReason,
      );
      setOrders((current) => current.map((item) => (item.id === changed.id ? changed : item)));
      ok(`Pedido ${order.order_number} actualizado`);
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    }
  };

  const showDetails = async (order: CompanyOrder) => {
    if (!session || !company) return;
    if (expanded === order.id) return setExpanded(null);
    try {
      const detail = await getCompanyOrder(session.tokens.accessToken, company.id, order.id);
      setOrders((current) => current.map((item) => (item.id === detail.id ? detail : item)));
      setExpanded(order.id);
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    }
  };
  const previewReceipt = async (order: CompanyOrder) => {
    if (!session || !company) return;
    try {
      setReceiptPreview(await getCompanyOrder(session.tokens.accessToken, company.id, order.id));
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    }
  };
  const closeReceiptPreview = () => setReceiptPreview(null);

  if (loading) return <LoadingState label="Cargando pedidos..." />;
  if (error) return <ErrorState message={error} retry={load} />;
  return (
    <>
      <PageHeader title="Pedidos" desc="Operación diaria de la empresa activa." />
      {!orders.length ? (
        <EmptyState
          title="No hay pedidos"
          description="Los pedidos que lleguen a esta empresa aparecerán aquí."
        />
      ) : null}
      <div className="grid gap-3">
        {orders.map((order) => {
          const client =
            [order.customer?.name, order.customer?.last_name].filter(Boolean).join(" ") ||
            "Cliente";
          const actions = next[order.order_status] ?? [];
          const unpaidPse = order.payment_method === "pse" && order.payment_status !== "paid";
          const paymentLabel =
            order.payment_method === "pse"
              ? `PSE · ${order.payment_status === "paid" ? "Pagado" : "Pendiente de pago"}`
              : "Efectivo · Se cobra al entregar";
          return (
            <Card key={order.id} className="p-0">
              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(11rem,1fr)_minmax(12rem,1fr)_auto] lg:items-center xl:grid-cols-[minmax(12rem,1fr)_minmax(13rem,1fr)_auto_minmax(24rem,auto)]">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pedido
                  </p>
                  <p
                    className="break-all font-display text-sm font-bold leading-5"
                    title={order.order_number}
                  >
                    {order.order_number}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </p>
                  <p className="font-semibold">{client}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-self-end">
                  <p className="font-semibold tabular-nums">{money(Number(order.total))}</p>
                  <Status s={order.order_status} />
                  <p
                    className={cn(
                      "w-full text-xs font-medium",
                      unpaidPse ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    {paymentLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 lg:col-span-3 xl:col-span-1 xl:justify-end">
                  <Btn size="sm" variant="ghost" onClick={() => void showDetails(order)}>
                    {expanded === order.id ? "Ocultar" : "Detalle"}
                    <ChevronDown
                      className={cn("size-3 transition", expanded === order.id && "rotate-180")}
                    />
                  </Btn>
                  <Btn size="sm" variant="outline" onClick={() => void previewReceipt(order)}>
                    <FileText className="size-3" />
                    Comprobante
                  </Btn>
                  {actions
                    .filter(([, action]) => action !== "accept" || !unpaidPse)
                    .map(([label, action]) => (
                      <Btn key={action} size="sm" onClick={() => void transition(order, action)}>
                        {label}
                      </Btn>
                    ))}
                  {unpaidPse ? (
                    <span className="self-center px-2 text-xs text-warning">
                      Esperando confirmación de Wompi
                    </span>
                  ) : null}
                  {order.order_status === "pending" ? (
                    <Btn
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() =>
                        confirm.ask(
                          "¿Rechazar pedido?",
                          "Se solicitará un motivo y se notificará al cliente.",
                          "Rechazar",
                          () => transition(order, "reject"),
                        )
                      }
                    >
                      Rechazar
                    </Btn>
                  ) : null}
                </div>
              </div>
              {expanded === order.id ? (
                <div className="grid gap-4 border-t border-border bg-muted/40 p-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Artículos
                    </p>
                    {(order.items ?? []).map((item) => (
                      <p key={item.id}>
                        {item.quantity}× {item.product?.name ?? item.product_name ?? "Producto"}{" "}
                        <span className="text-muted-foreground">{item.notes}</span>
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Entrega
                    </p>
                    <p>{order.delivery_address?.address_line ?? "Sin dirección"}</p>
                    <p className="text-muted-foreground">
                      {order.customer?.phone ?? "Sin teléfono"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                      Cobro
                    </p>
                    <p>Subtotal {money(Number(order.subtotal))}</p>
                    <p>Domicilio {money(Number(order.delivery_fee))}</p>
                    <p className="font-semibold">
                      Total {money(Number(order.total))} · {order.payment_method ?? "Sin dato"}
                    </p>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
      <Modal
        open={Boolean(receiptPreview)}
        onClose={closeReceiptPreview}
        title="Tirilla de preparación"
        footer={
          <>
            <Btn variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Imprimir
            </Btn>
            <Btn variant="outline" onClick={closeReceiptPreview}>
              Cerrar
            </Btn>
          </>
        }
      >
        {receiptPreview
          ? (() => {
              const receipt = receiptPreview;
              const productTotal = Number(receipt.subtotal) - Number(receipt.discount);
              const address = receipt.delivery_address?.address_line ?? "Sin dirección registrada";
              const companyName = company?.name ?? "Piddop";
              const items = receipt.items ?? [];
              return (
                <article
                  id="order-receipt-print"
                  className="mx-auto w-full max-w-sm border border-dashed border-slate-400 bg-white p-5 font-mono text-sm text-slate-900 shadow-sm"
                >
                  <div className="border-b border-dashed border-slate-300 pb-4 text-center">
                    {company?.logo ? (
                      <img
                        src={companyImageUrl(company.logo)}
                        alt={`Logo de ${companyName}`}
                        className="mx-auto mb-2 h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <strong className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-slate-900 text-2xl text-white">
                        {companyName.slice(0, 1).toUpperCase()}
                      </strong>
                    )}
                    <h2 className="text-lg font-bold">{companyName}</h2>
                    <p className="mt-1 text-[11px] tracking-widest text-slate-500">
                      COMPROBANTE DE PEDIDO
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b border-dashed border-slate-300 py-3 text-xs">
                    <p>
                      <span className="block text-slate-500">Pedido</span>
                      <b>{receipt.order_number}</b>
                    </p>
                    <p>
                      <span className="block text-slate-500">Fecha</span>
                      <b>{new Date(receipt.created_at).toLocaleString("es-CO")}</b>
                    </p>
                    <p>
                      <span className="block text-slate-500">Pago</span>
                      <b>{receipt.payment_method ?? "Sin dato"}</b>
                    </p>
                    <p>
                      <span className="block text-slate-500">Estado</span>
                      <b>{receipt.order_status}</b>
                    </p>
                  </div>
                  <div className="space-y-3 py-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <span className="font-bold">{item.quantity}×</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {item.product?.name ?? item.product_name ?? "Producto"}
                          </p>
                          {item.notes ? (
                            <p className="text-xs text-slate-500">{item.notes}</p>
                          ) : null}
                        </div>
                        <b>{money(Number(item.unit_price) * item.quantity)}</b>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 border-y border-dashed border-slate-300 py-3 text-xs">
                    <p className="flex justify-between">
                      <span>Productos</span>
                      <span>{money(productTotal)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Domicilio</span>
                      <span>{money(Number(receipt.delivery_fee))}</span>
                    </p>
                    {Number(receipt.discount) > 0 ? (
                      <p className="flex justify-between">
                        <span>Descuento</span>
                        <span>-{money(Number(receipt.discount))}</span>
                      </p>
                    ) : null}
                    <p className="flex justify-between pt-2 text-base font-bold">
                      <span>TOTAL</span>
                      <span>{money(Number(receipt.total))}</span>
                    </p>
                  </div>
                  <div className="pt-4 text-xs">
                    <p className="font-bold">ENTREGA</p>
                    <p className="mt-1">{address}</p>
                    <p className="mt-2">
                      {[receipt.customer?.name, receipt.customer?.last_name]
                        .filter(Boolean)
                        .join(" ") || "Cliente"}
                      {receipt.customer?.phone ? ` · ${receipt.customer.phone}` : ""}
                    </p>
                  </div>
                  <p className="mt-5 text-center text-[10px] text-slate-500">
                    Gracias por confiar en {companyName}
                  </p>
                </article>
              );
            })()
          : null}
      </Modal>
      {confirm.node}
    </>
  );
}

/* ---------- Productos ---------- */
function ProductsDemo() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const [acc, setAcc] = useState<string | null>("Imágenes");
  const c = useConfirm();
  const list = [
    ["🍔", "Hamburguesa doble", "Hamburguesas", 18000, "active"],
    ["🌭", "Perro especial", "Perros", 15000, "active"],
    ["🍟", "Papas grandes", "Acompañantes", 8000, "active"],
    ["🥤", "Limonada de coco", "Bebidas", 9000, "inactive"],
  ].filter((x) => String(x[1]).toLowerCase().includes(q.toLowerCase()));
  const Section = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border">
      <button
        className="flex w-full items-center justify-between p-3 font-semibold"
        onClick={() => setAcc(acc === name ? null : name)}
      >
        {name}
        <ChevronDown className={cn("size-4 transition", acc === name && "rotate-180")} />
      </button>
      {acc === name && <div className="space-y-3 border-t border-border p-3">{children}</div>}
    </div>
  );
  return (
    <>
      <PageHeader
        title="Productos"
        desc="Catálogo de la empresa activa."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nuevo producto
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(([i, n, cat, p, s]) => (
          <Card key={n as string} className="p-0">
            <div className="flex h-32 items-center justify-center rounded-t-xl bg-secondary text-5xl">
              {i}
            </div>
            <div className="p-4">
              <p className="font-semibold">{n}</p>
              <div className="mt-1 flex items-center justify-between">
                <Badge>{cat}</Badge>
                <Status s={s as string} />
              </div>
              <p className="mt-2 font-display text-xl font-bold text-primary">
                {money(p as number)}
              </p>
              <div className="mt-3 flex gap-2">
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    c.ask(
                      "¿Duplicar producto?",
                      "La copia conserva ingredientes, variantes y precios; quedará inactiva y sin imágenes.",
                      "Copiar",
                      () => ok("Producto duplicado"),
                    )
                  }
                >
                  <Copy className="size-3" />
                  Copiar
                </Btn>
                <Btn size="sm" onClick={() => setForm(n as string)}>
                  <Pencil className="size-3" />
                  Editar
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        wide
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? "Nuevo producto" : `Editar ${form}`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Producto guardado");
                setForm(null);
              }}
            >
              {form === "new" ? "Crear producto" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
          </Field>
          <Field label="Categoría">
            <Select options={["Hamburguesas", "Perros", "Acompañantes", "Bebidas"]} />
          </Field>
          <Field label="Precio base">
            <Input type="number" />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo"]} />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea />
          </Field>
        </div>
        {form !== "new" && (
          <div className="space-y-2">
            <Section name="Imágenes">
              <div className="flex gap-2">
                {["🍔", "🍔"].map((e, i) => (
                  <div
                    key={i}
                    className="relative flex size-20 items-center justify-center rounded-lg bg-secondary text-3xl"
                  >
                    {e}
                    <button
                      onClick={() =>
                        c.ask(
                          "¿Eliminar imagen?",
                          "Un producto necesita al menos una imagen para activarse.",
                          "Eliminar",
                          () => ok("Imagen eliminada"),
                        )
                      }
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input type="file" multiple className="py-1.5" />
                <Btn variant="outline" onClick={() => ok("Imágenes subidas")}>
                  Subir imágenes
                </Btn>
              </div>
              <p className="text-xs text-muted-foreground">De 1 a 5 archivos.</p>
            </Section>
            <Section name="Adiciones disponibles">
              {[
                ["Tamaño", "Única · obligatoria"],
                ["Extras", "Múltiple · máx 3"],
              ].map(([n, d]) => (
                <div
                  key={n}
                  className="flex items-center justify-between rounded-md bg-muted p-2 text-sm"
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="accent-primary" />
                    {n} <span className="text-xs text-muted-foreground">{d}</span>
                  </label>
                  <Input className="h-8 w-28" placeholder="Precio" />
                </div>
              ))}
              <div className="grid gap-2 md:grid-cols-4">
                <Input placeholder="Nueva adición" />
                <Select options={["Única", "Múltiple"]} />
                <Input placeholder="Máx." type="number" />
                <Btn variant="outline" onClick={() => ok("Opción agregada")}>
                  Agregar opción
                </Btn>
              </div>
            </Section>
            <Section name="Ingredientes base">
              {["Pan brioche", "Carne 150g", "Queso cheddar"].map((g, i) => (
                <div key={g} className="flex items-center justify-between text-sm">
                  <span>
                    {i + 1}. {g}
                  </span>
                  <span className="flex gap-2">
                    <Badge tone="active">Por defecto</Badge>
                    <Badge>Se puede quitar</Badge>
                  </span>
                </div>
              ))}
              <div className="grid gap-2 md:grid-cols-4">
                <Input placeholder="Ingrediente" />
                <Input type="number" placeholder="Orden" />
                <Toggle on onChange={() => {}} label="Por defecto" />
                <Btn variant="outline" onClick={() => ok("Ingrediente agregado")}>
                  Agregar ingrediente
                </Btn>
              </div>
            </Section>
          </div>
        )}
      </Modal>
      {c.node}
    </>
  );
}

/* ---------- Variantes ---------- */
function VariantsDemo() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const [opts, setOpts] = useState(["Personal", "Mediana"]);
  const c = useConfirm();
  const list = [
    ["Tamaño", "Única", true, "Personal · Mediana · Familiar"],
    ["Toppings", "Múltiple", false, "Tocineta · Queso extra · Jalapeños"],
    ["Combo bebida", "Única", true, "Gaseosa → (Coca-Cola · Sprite) · Jugo"],
  ].filter((x) =>
    String(x[0] + " " + x[3])
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Variantes"
        desc="Adiciones reutilizables. Los precios se asignan por producto."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nueva adición
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map(([n, t, r, o]) => (
          <Card key={n as string}>
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">{n}</p>
              <Status s="active" />
            </div>
            <div className="mt-2 flex gap-1">
              <Badge>{t}</Badge>
              {r && <Badge tone="brand">Obligatoria</Badge>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{o}</p>
            <div className="mt-4 flex gap-1">
              <Btn size="sm" variant="outline" onClick={() => setForm(n as string)}>
                Editar
              </Btn>
              <Btn size="sm" variant="outline" onClick={() => ok("Adición duplicada")}>
                Duplicar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  c.ask(
                    "¿Eliminar adición?",
                    "Se desvinculará de los productos que la usan.",
                    "Eliminar",
                    () => ok("Eliminada"),
                  )
                }
              >
                Eliminar
              </Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        wide
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? "Nueva adición" : `Editar ${form}`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Guardado");
                setForm(null);
              }}
            >
              {form === "new" ? "Crear adición" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre">
            <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
          </Field>
          <Field label="Tipo">
            <Select options={["Selección única", "Selección múltiple"]} />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo"]} />
          </Field>
          <Field label="Mínimo">
            <Input type="number" defaultValue={1} />
          </Field>
          <Field label="Máximo">
            <Input type="number" defaultValue={1} />
          </Field>
          <div className="flex items-end">
            <Toggle on onChange={() => {}} label="Obligatoria" />
          </div>
        </div>
        <p className="font-semibold">Opciones</p>
        {opts.map((o, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex gap-2">
              <Input defaultValue={o} />
              <Select className="w-32" options={["Activo", "Inactivo"]} />
              <Btn
                variant="ghost"
                className="text-destructive"
                disabled={opts.length <= 1}
                onClick={() => setOpts(opts.filter((_, j) => j !== i))}
              >
                Quitar
              </Btn>
            </div>
            {i === 0 && (
              <div className="ml-6 flex gap-2 border-l-2 border-accent pl-3">
                <Input placeholder="Subvariación: bebida" />
                <Btn size="sm" variant="outline">
                  Agregar bebida u opción
                </Btn>
                <Btn size="sm" variant="ghost">
                  Quitar subvariación
                </Btn>
              </div>
            )}
          </div>
        ))}
        <Btn variant="outline" onClick={() => setOpts([...opts, ""])}>
          <Plus className="size-4" />
          Agregar opción
        </Btn>
      </Modal>
      {c.node}
    </>
  );
}

export function Products() {
  // Product combo pricing is managed below in the edit modal.
  const { session } = useSession();
  const company = session?.companies.find(
    (entry) => entry.company.id === session.activeCompanyId,
  )?.company;
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [variants, setVariants] = useState<CatalogVariant[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<CatalogProduct | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [variantIds, setVariantIds] = useState<number[]>([]);
  const [variantPrices, setVariantPrices] = useState<Record<number, string>>({});
  const [showComboOptions, setShowComboOptions] = useState(false);
  const [showAdditions, setShowAdditions] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [additionSearch, setAdditionSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientLibrary, setIngredientLibrary] = useState<
    Array<{ name: string; is_default: boolean; is_removable: boolean }>
  >([]);
  const [addingIngredient, setAddingIngredient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    try {
      const [products, nextCategories, nextVariants] = await Promise.all([
        listCatalogProducts(session.tokens.accessToken, company.id, query),
        listPublicCategories(),
        listCatalogVariants(session.tokens.accessToken, company.id),
      ]);
      setItems(products);
      setCategories(nextCategories);
      setVariants(nextVariants);
      setCategoryId((id) => id || String(nextCategories[0]?.id ?? ""));
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    }
  }, [company, query, session]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (
      !session ||
      !company ||
      !draft?.id ||
      !showIngredients ||
      ingredientSearch.trim().length < 2
    ) {
      setIngredientLibrary([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchIngredientLibrary(session.tokens.accessToken, company.id, ingredientSearch.trim())
        .then(setIngredientLibrary)
        .catch(() => setIngredientLibrary([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [company, draft?.id, ingredientSearch, session, showIngredients]);
  const addIngredient = async (
    name: string,
    defaults?: { is_default: boolean; is_removable: boolean },
  ) => {
    if (!session || !company || !draft?.id || !name.trim()) return;
    setAddingIngredient(true);
    try {
      const ingredient = await createCatalogProductIngredient(
        session.tokens.accessToken,
        company.id,
        draft.id,
        {
          name: name.trim(),
          is_default: defaults?.is_default ?? true,
          is_removable: defaults?.is_removable ?? true,
          status: "active",
          sort_order: (draft.ingredients?.length ?? 0) + 1,
        },
      );
      setDraft({ ...draft, ingredients: [...(draft.ingredients ?? []), ingredient] });
      setIngredientSearch("");
      setIngredientLibrary([]);
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    } finally {
      setAddingIngredient(false);
    }
  };
  const save = async () => {
    if (!session || !company || !newName || !newPrice || !categoryId)
      return toast.error("Completa nombre, categoría y precio.");
    setSaving(true);
    try {
      const collectVariantPrices = (variant: CatalogVariant) =>
        variant.options.flatMap((option) => [
          {
            variant_option_id: Number(option.id),
            additional_price: Number(
              variantPrices[Number(option.id)] ?? option.additional_price ?? 0,
            ),
          },
          ...(option.child_variants ?? option.childVariants ?? []).flatMap(collectVariantPrices),
        ]);
      const prices = variants
        .filter((variant) => variantIds.includes(variant.id))
        .flatMap(collectVariantPrices);
      const activateAfterImages = !draft?.id && status === "active" && imageFiles.length > 0;
      const product = await saveCatalogProduct(
        session.tokens.accessToken,
        company.id,
        {
          name: newName,
          description: description || null,
          category_id: Number(categoryId),
          base_price: Number(newPrice),
          status: activateAfterImages ? "inactive" : status,
          variant_ids: variantIds,
          variant_prices: prices,
        },
        draft?.id,
      );
      if (imageFiles.length) {
        await uploadCatalogProductImages(
          session.tokens.accessToken,
          company.id,
          product.id,
          imageFiles,
        );
      }
      if (activateAfterImages) {
        await saveCatalogProduct(
          session.tokens.accessToken,
          company.id,
          {
            name: newName,
            description: description || null,
            category_id: Number(categoryId),
            base_price: Number(newPrice),
            status,
            variant_ids: variantIds,
            variant_prices: prices,
          },
          product.id,
        );
      }
      setDraft(null);
      setNewName("");
      setNewPrice("");
      setDescription("");
      setImageFiles([]);
      ok("Producto guardado");
      await load();
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };
  if (error) return <ErrorState message={error} retry={load} />;
  return (
    <>
      <PageHeader
        title="Productos"
        desc="Catálogo real de la empresa activa."
        actions={
          <Btn
            onClick={() => {
              setDraft({} as CatalogProduct);
              setNewName("");
              setNewPrice("");
              setDescription("");
              setStatus("active");
              setImageFiles([]);
              setVariantIds([]);
              setShowAdditions(false);
              setShowIngredients(false);
            }}
          >
            <Plus className="size-4" />
            Nuevo producto
          </Btn>
        }
      />
      <SearchBox value={query} onChange={setQuery} />
      {!items.length ? (
        <EmptyState title="No hay productos" description="Crea el primer producto del catálogo." />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <Card key={product.id} className="overflow-hidden p-0">
              <div className="flex h-32 items-center justify-center bg-secondary/35">
                {product.images[0] ? (
                  <img
                    src={companyImageUrl(product.images[0].image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="size-11 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.category?.name ?? "Sin categoría"}
                </p>
                <p className="mt-2 font-display text-xl font-bold text-primary">
                  {money(Number(product.base_price))}
                </p>
                <Status s={product.status} />
                <div className="mt-4 flex gap-2">
                  <Btn
                    size="sm"
                    onClick={() => {
                      setDraft(product);
                      setNewName(product.name);
                      setNewPrice(String(product.base_price));
                      setCategoryId(String(product.category?.id ?? ""));
                      setDescription(product.description ?? "");
                      setStatus(product.status);
                      setImageFiles([]);
                      setVariantIds((product.variants ?? []).map((variant) => variant.id));
                      const collectSavedPrices = (
                        variant: CatalogVariant,
                      ): Array<[number, string]> =>
                        variant.options.flatMap((option) => [
                          [Number(option.id), String(option.additional_price ?? 0)],
                          ...(option.child_variants ?? option.childVariants ?? []).flatMap(
                            collectSavedPrices,
                          ),
                        ]);
                      setVariantPrices(
                        Object.fromEntries((product.variants ?? []).flatMap(collectSavedPrices)),
                      );
                      setShowAdditions(false);
                      setShowIngredients(false);
                    }}
                  >
                    Editar
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!session || !company) return;
                      await duplicateCatalogProduct(
                        session.tokens.accessToken,
                        company.id,
                        product.id,
                      );
                      await load();
                    }}
                  >
                    Copiar
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={async () => {
                      if (!session || !company || !window.confirm("¿Eliminar producto?")) return;
                      await deleteCatalogProduct(
                        session.tokens.accessToken,
                        company.id,
                        product.id,
                      );
                      await load();
                    }}
                  >
                    Eliminar
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        wide
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? `Editar ${draft.name}` : "Nuevo producto"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setDraft(null)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()} disabled={saving}>
              {saving ? "Guardando..." : draft?.id ? "Guardar cambios" : "Crear producto"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Field>
          <Field label="Categoría">
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Precio base">
            <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          </Field>
          <Field label="Estado">
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Descripción">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </div>
        <div className="rounded-xl border border-accent/50">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowComboOptions((value) => !value)}
          >
            <span>
              <span className="block font-semibold">Opciones del combo</span>
              <span className="text-xs text-muted-foreground">
                {variantIds.length
                  ? `${variantIds.length} grupo(s) seleccionado(s)`
                  : "Selecciona grupos de opciones"}
              </span>
            </span>
            <ChevronDown
              className={cn("size-4 transition-transform", showComboOptions && "rotate-180")}
            />
          </button>
          {showComboOptions ? (
            <div className="space-y-4 border-t border-border p-4">
              <div className="grid gap-3 md:grid-cols-2">
                {variants.map((variant) => {
                  const selected = variantIds.includes(variant.id);
                  return (
                    <label
                      key={variant.id}
                      className={cn(
                        "cursor-pointer rounded-xl border p-3",
                        selected ? "border-accent bg-accent/10" : "border-border",
                      )}
                    >
                      <input
                        className="sr-only"
                        type="checkbox"
                        checked={selected}
                        onChange={(event) =>
                          setVariantIds((current) =>
                            event.target.checked
                              ? [...current, variant.id]
                              : current.filter((id) => id !== variant.id),
                          )
                        }
                      />
                      <span className="block font-semibold">
                        {selected ? "✓ " : ""}
                        {variant.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {variant.required ? "Obligatoria" : "Opcional"}
                      </span>
                    </label>
                  );
                })}
              </div>
              {variants
                .filter((variant) => variantIds.includes(variant.id))
                .map((variant) => (
                  <div key={variant.id} className="rounded-xl border border-border p-3">
                    <p className="mb-1 font-semibold">{variant.name}</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Incremento sobre el precio base del producto
                    </p>
                    {variant.options.map((option) => (
                      <div
                        key={option.id ?? option.name}
                        className="mb-2 rounded-lg bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-1">{option.name}</span>
                          <span className="text-accent">+$</span>
                          <Input
                            className="w-28 text-right"
                            type="number"
                            min={0}
                            value={
                              variantPrices[Number(option.id)] ??
                              String(option.additional_price ?? 0)
                            }
                            onChange={(event) =>
                              setVariantPrices({
                                ...variantPrices,
                                [Number(option.id)]: event.target.value,
                              })
                            }
                          />
                        </div>
                        {(option.child_variants ?? option.childVariants ?? []).map(
                          (childVariant) => (
                            <div
                              key={childVariant.id}
                              className="mt-3 rounded-lg border-l-2 border-accent bg-background/40 p-3"
                            >
                              <p className="font-semibold">{childVariant.name}</p>
                              <p className="mb-2 text-xs text-muted-foreground">
                                Incremento sobre el precio base del producto
                              </p>
                              {childVariant.options.map((childOption) => (
                                <div
                                  key={childOption.id ?? childOption.name}
                                  className="mb-2 flex items-center gap-3 rounded-lg bg-muted/50 p-3 last:mb-0"
                                >
                                  <span className="flex-1">{childOption.name}</span>
                                  <span className="text-accent">+$</span>
                                  <Input
                                    className="w-28 text-right"
                                    type="number"
                                    min={0}
                                    value={
                                      variantPrices[Number(childOption.id)] ??
                                      String(childOption.additional_price ?? 0)
                                    }
                                    onChange={(event) =>
                                      setVariantPrices({
                                        ...variantPrices,
                                        [Number(childOption.id)]: event.target.value,
                                      })
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3">
            <p className="font-semibold">Imágenes</p>
            <p className="text-xs text-muted-foreground">De 1 a 5 archivos JPG, PNG o WEBP.</p>
          </div>
          <div className="space-y-3 p-4">
            {draft?.id && draft.images.length ? (
              <div className="flex flex-wrap gap-3">
                {draft.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative size-20 overflow-hidden rounded-lg bg-muted"
                  >
                    <img
                      src={companyImageUrl(image.image_url)}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                      aria-label="Eliminar imagen"
                      onClick={async () => {
                        if (!session || !company || !draft) return;
                        await deleteCatalogProductImage(
                          session.tokens.accessToken,
                          company.id,
                          draft.id,
                          image.id,
                        );
                        setDraft({
                          ...draft,
                          images: draft.images.filter((item) => item.id !== image.id),
                        });
                        await load();
                      }}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setImageFiles(Array.from(event.target.files ?? []).slice(0, 5))}
            />
            {imageFiles.length ? (
              <p className="text-xs text-muted-foreground">
                {imageFiles.length} imagen(es) seleccionada(s); se subirán al guardar.
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-xl border border-border">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowAdditions((value) => !value)}
          >
            <span className="font-semibold">Adiciones disponibles</span>
            <ChevronDown
              className={cn("size-4 transition-transform", showAdditions && "rotate-180")}
            />
          </button>
          {showAdditions ? (
            <div className="space-y-2 border-t border-border p-4">
              <Input
                value={additionSearch}
                onChange={(event) => setAdditionSearch(event.target.value)}
                placeholder="Buscar adición..."
              />
              {variants.length ? (
                variants
                  .filter((variant) =>
                    variant.name.toLocaleLowerCase().includes(additionSearch.toLocaleLowerCase()),
                  )
                  .map((variant) => (
                    <label
                      key={variant.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={variantIds.includes(variant.id)}
                        onChange={(event) =>
                          setVariantIds((current) =>
                            event.target.checked
                              ? [...current, variant.id]
                              : current.filter((id) => id !== variant.id),
                          )
                        }
                      />
                      <span className="flex-1">
                        <span className="block font-medium">{variant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {variant.options.map((option) => option.name).join(" · ") ||
                            "Sin opciones"}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {variantIds.includes(variant.id) ? "Incluida" : "Disponible"}
                      </span>
                    </label>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay adiciones creadas todavía. Créelas en el módulo Variantes.
                </p>
              )}
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border border-border">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowIngredients((value) => !value)}
          >
            <span className="font-semibold">Ingredientes base</span>
            <ChevronDown
              className={cn("size-4 transition-transform", showIngredients && "rotate-180")}
            />
          </button>
          {showIngredients ? (
            <div className="space-y-3 border-t border-border p-4">
              {!draft?.id ? (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Guarda primero el producto para poder agregar sus ingredientes base.
                </p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={ingredientSearch}
                      onChange={(event) => setIngredientSearch(event.target.value)}
                      placeholder="Buscar o escribir un ingrediente..."
                    />
                    <Btn
                      type="button"
                      variant="outline"
                      disabled={addingIngredient || !ingredientSearch.trim()}
                      onClick={() => void addIngredient(ingredientSearch)}
                    >
                      Agregar
                    </Btn>
                  </div>
                  {ingredientLibrary.length ? (
                    <div className="rounded-lg border border-border">
                      {ingredientLibrary.map((ingredient) => (
                        <button
                          key={ingredient.name}
                          type="button"
                          disabled={
                            addingIngredient ||
                            (draft.ingredients ?? []).some(
                              (item) =>
                                item.name.toLocaleLowerCase() ===
                                ingredient.name.toLocaleLowerCase(),
                            )
                          }
                          className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-muted disabled:opacity-50"
                          onClick={() => void addIngredient(ingredient.name, ingredient)}
                        >
                          <span>{ingredient.name}</span>
                          <span className="text-xs text-muted-foreground">Seleccionar</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {draft.ingredients?.length ? (
                    <div className="space-y-2">
                      {draft.ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium">{ingredient.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ingredient.is_default ? "Incluido por defecto" : "Opcional"} ·{" "}
                              {ingredient.is_removable ? "Se puede quitar" : "No se quita"}
                            </p>
                          </div>
                          <Btn
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={async () => {
                              if (!session || !company || !draft) return;
                              try {
                                await deleteCatalogProductIngredient(
                                  session.tokens.accessToken,
                                  company.id,
                                  draft.id,
                                  ingredient.id,
                                );
                                setDraft({
                                  ...draft,
                                  ingredients: (draft.ingredients ?? []).filter(
                                    (item) => item.id !== ingredient.id,
                                  ),
                                });
                              } catch (reason) {
                                toast.error(serviceErrorMessage(reason));
                              }
                            }}
                          >
                            Quitar
                          </Btn>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aún no has agregado ingredientes base.
                    </p>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

export function Variants() {
  const { session } = useSession();
  const company = session?.companies.find(
    (entry) => entry.company.id === session.activeCompanyId,
  )?.company;
  const [items, setItems] = useState<CatalogVariant[]>([]);
  const [editing, setEditing] = useState<CatalogVariant | null>(null);
  const [draft, setDraft] = useState<Omit<CatalogVariant, "id">>({
    name: "",
    selection_type: "single",
    required: true,
    min_selections: 1,
    max_selections: 1,
    status: "active",
    options: [{ name: "", status: "active" }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    try {
      setItems(await listCatalogVariants(session.tokens.accessToken, company.id));
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    }
  }, [company, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async () => {
    const hasBlankField = draft.options.some(
      (option) =>
        !option.name.trim() ||
        (option.child_variants ?? []).some(
          (child) =>
            !child.name.trim() || child.options.some((childOption) => !childOption.name.trim()),
        ),
    );
    if (!session || !company || !draft.name.trim() || !draft.options.length || hasBlankField)
      return toast.error("Completa el nombre de la variante y todas sus opciones.");
    try {
      await saveCatalogVariant(
        session.tokens.accessToken,
        company.id,
        {
          ...draft,
        },
        editing?.id,
      );
      setEditing(null);
      ok("Variante guardada");
      await load();
    } catch (reason) {
      toast.error(serviceErrorMessage(reason));
    }
  };
  if (error) return <ErrorState message={error} retry={load} />;
  return (
    <>
      <PageHeader
        title="Variantes"
        desc="Opciones reutilizables del catálogo."
        actions={
          <Btn
            onClick={() => {
              setEditing({} as CatalogVariant);
              setDraft({
                name: "",
                selection_type: "single",
                required: true,
                min_selections: 1,
                max_selections: 1,
                status: "active",
                options: [{ name: "", status: "active" }],
              });
            }}
          >
            <Plus className="size-4" />
            Nueva variante
          </Btn>
        }
      />
      {!items.length ? (
        <EmptyState title="No hay variantes" description="Crea opciones para los productos." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((variant) => (
            <Card key={variant.id}>
              <p className="font-semibold">{variant.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {variant.options.map((option) => option.name).join(" · ")}
              </p>
              <div className="mt-3 flex gap-2">
                <Btn
                  size="sm"
                  onClick={() => {
                    setEditing(variant);
                    setDraft({ ...variant });
                  }}
                >
                  Editar
                </Btn>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!session || !company) return;
                    await duplicateCatalogVariant(
                      session.tokens.accessToken,
                      company.id,
                      variant.id,
                    );
                    await load();
                  }}
                >
                  Duplicar
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={async () => {
                    if (!session || !company || !window.confirm("¿Eliminar variante?")) return;
                    await deleteCatalogVariant(session.tokens.accessToken, company.id, variant.id);
                    await load();
                  }}
                >
                  Eliminar
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        wide
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Editar ${editing.name}` : "Nueva variante"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()}>
              {editing?.id ? "Guardar cambios" : "Crear variante"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nombre">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Field label="Tipo">
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3"
              value={draft.selection_type}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  selection_type: e.target.value as CatalogVariant["selection_type"],
                  max_selections: e.target.value === "single" ? 1 : draft.max_selections,
                })
              }
            >
              <option value="single">Selección única</option>
              <option value="multiple">Selección múltiple</option>
            </select>
          </Field>
          <Field label="Estado">
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </Field>
          <Field label="Mínimo">
            <Input
              type="number"
              min={0}
              value={draft.required ? Math.max(1, draft.min_selections) : draft.min_selections}
              onChange={(e) => setDraft({ ...draft, min_selections: Number(e.target.value) })}
            />
          </Field>
          <Field label="Máximo">
            <Input
              type="number"
              min={1}
              disabled={draft.selection_type === "single"}
              value={draft.selection_type === "single" ? 1 : draft.max_selections}
              onChange={(e) => setDraft({ ...draft, max_selections: Number(e.target.value) })}
            />
          </Field>
          <div className="flex items-end pb-2">
            <Toggle
              on={draft.required}
              onChange={(required) =>
                setDraft({
                  ...draft,
                  required,
                  min_selections: required
                    ? Math.max(1, draft.min_selections)
                    : draft.min_selections,
                })
              }
              label="Obligatoria"
            />
          </div>
        </div>
        <div>
          <p className="mb-3 font-semibold">Opciones</p>
          <div className="space-y-3">
            {draft.options.map((option, index) => (
              <div key={index} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap gap-2">
                  <Input
                    className="min-w-48 flex-1"
                    value={option.name}
                    placeholder="Nombre de opción"
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        options: draft.options.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: e.target.value } : item,
                        ),
                      })
                    }
                  />
                  <select
                    className="h-10 rounded-lg border border-input bg-background px-3"
                    value={option.status}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        options: draft.options.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, status: e.target.value } : item,
                        ),
                      })
                    }
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                  <Btn
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={draft.options.length === 1}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        options: draft.options.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  >
                    Quitar
                  </Btn>
                </div>
                {(option.child_variants ?? []).map((child, childIndex) => (
                  <div
                    key={childIndex}
                    className="ml-6 mt-3 space-y-2 border-l-2 border-accent pl-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Input
                        className="min-w-48 flex-1"
                        value={child.name}
                        placeholder="Subvariación: bebida"
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            options: draft.options.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    child_variants: (item.child_variants ?? []).map(
                                      (value, valueIndex) =>
                                        valueIndex === childIndex
                                          ? { ...value, name: event.target.value }
                                          : value,
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      />
                      <Btn
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            options: draft.options.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    child_variants: (item.child_variants ?? []).filter(
                                      (_, valueIndex) => valueIndex !== childIndex,
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      >
                        Quitar subvariación
                      </Btn>
                    </div>
                    <Field label="Tipo de selección">
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-background px-3"
                        value={child.selection_type}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            options: draft.options.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    child_variants: (item.child_variants ?? []).map(
                                      (value, valueIndex) =>
                                        valueIndex === childIndex
                                          ? {
                                              ...value,
                                              selection_type: event.target
                                                .value as CatalogVariant["selection_type"],
                                              max_selections:
                                                event.target.value === "single"
                                                  ? 1
                                                  : value.max_selections,
                                            }
                                          : value,
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      >
                        <option value="single">Una opción</option>
                        <option value="multiple">Varias opciones</option>
                      </select>
                    </Field>
                    <Input
                      value={child.options[0]?.name ?? ""}
                      placeholder="Opción de la subvariación"
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          options: draft.options.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  child_variants: (item.child_variants ?? []).map(
                                    (value, valueIndex) =>
                                      valueIndex === childIndex
                                        ? {
                                            ...value,
                                            options: [
                                              {
                                                ...(value.options[0] ?? { status: "active" }),
                                                name: event.target.value,
                                                status: value.options[0]?.status ?? "active",
                                              },
                                            ],
                                          }
                                        : value,
                                  ),
                                }
                              : item,
                          ),
                        })
                      }
                    />
                    {child.options.slice(1).map((childOption, optionIndex) => (
                      <div key={optionIndex + 1} className="flex gap-2">
                        <Input
                          className="flex-1"
                          value={childOption.name}
                          placeholder="Opción de la subvariación"
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              options: draft.options.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      child_variants: (item.child_variants ?? []).map(
                                        (value, valueIndex) =>
                                          valueIndex === childIndex
                                            ? {
                                                ...value,
                                                options: value.options.map(
                                                  (valueOption, valueOptionIndex) =>
                                                    valueOptionIndex === optionIndex + 1
                                                      ? { ...valueOption, name: event.target.value }
                                                      : valueOption,
                                                ),
                                              }
                                            : value,
                                      ),
                                    }
                                  : item,
                              ),
                            })
                          }
                        />
                        <Btn
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              options: draft.options.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      child_variants: (item.child_variants ?? []).map(
                                        (value, valueIndex) =>
                                          valueIndex === childIndex
                                            ? {
                                                ...value,
                                                options: value.options.filter(
                                                  (_, valueOptionIndex) =>
                                                    valueOptionIndex !== optionIndex + 1,
                                                ),
                                              }
                                            : value,
                                      ),
                                    }
                                  : item,
                              ),
                            })
                          }
                        >
                          Quitar
                        </Btn>
                      </div>
                    ))}
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          options: draft.options.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  child_variants: (item.child_variants ?? []).map(
                                    (value, valueIndex) =>
                                      valueIndex === childIndex
                                        ? {
                                            ...value,
                                            options: [
                                              ...value.options,
                                              { name: "", status: "active" },
                                            ],
                                          }
                                        : value,
                                  ),
                                }
                              : item,
                          ),
                        })
                      }
                    >
                      Agregar bebida u opción
                    </Btn>
                  </div>
                ))}
                <Btn
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      options: draft.options.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              child_variants: [
                                ...(item.child_variants ?? []),
                                {
                                  name: "",
                                  selection_type: "single",
                                  required: false,
                                  min_selections: 0,
                                  max_selections: 1,
                                  status: "active",
                                  options: [{ name: "", status: "active" }],
                                },
                              ],
                            }
                          : item,
                      ),
                    })
                  }
                >
                  Agregar bebida u opción
                </Btn>
              </div>
            ))}
          </div>
          <Btn
            variant="outline"
            className="mt-3"
            onClick={() =>
              setDraft({ ...draft, options: [...draft.options, { name: "", status: "active" }] })
            }
          >
            <Plus className="size-4" />
            Agregar opción
          </Btn>
        </div>
      </Modal>
    </>
  );
}

/* ---------- Configuración ---------- */
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function BizSettingsDemo({ name }: { name: string }) {
  const [mode, setMode] = useState("auto");
  const [on, setOn] = useState<boolean[]>(days.map((_, i) => i < 6));
  return (
    <>
      <PageHeader
        title="Configuración"
        desc="Cómo se muestra y opera tu negocio."
        actions={<Btn onClick={() => ok("Configuración guardada")}>Guardar configuración</Btn>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0">
          <div className="h-24 bg-brand-gradient" />
          <div className="-mt-10 p-5">
            <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-accent font-display text-2xl font-bold text-accent-foreground">
              {name[0]}
            </div>
            <p className="mt-3 font-display text-xl font-bold">{name}</p>
            <p className="text-sm text-muted-foreground">Vista previa del perfil en la app.</p>
            <div className="mt-2">
              <Badge tone={mode === "closed" ? "suspended" : "active"}>
                {mode === "closed" ? "Cerrado" : "Abierto ahora"}
              </Badge>
            </div>
          </div>
        </Card>
        <Card className="grid gap-4 md:grid-cols-2 lg:col-span-2">
          <Field label="Nombre">
            <Input defaultValue={name} />
          </Field>
          <Field label="Teléfono">
            <Input defaultValue="604 555 1234" />
          </Field>
          <Field label="Correo">
            <Input defaultValue="hola@negocio.co" />
          </Field>
          <Field label="Logo">
            <Input type="file" className="py-1.5" />
          </Field>
          <Field label="Dirección" className="md:col-span-2">
            <Input defaultValue="Calle 10 #43-20" />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea />
          </Field>
          <Field label="Ubicación (dentro de la cobertura)" className="md:col-span-2">
            <div className="flex h-28 items-center justify-center rounded-lg bg-secondary text-sm text-secondary-foreground">
              📍 6.2442, -75.5812 · Arrastra para ajustar
            </div>
          </Field>
        </Card>
      </div>
      <Card className="mt-4">
        <p className="mb-3 font-semibold">¿Cómo quieres recibir pedidos?</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["auto", "Automático por horario", "Abre y cierra según el horario semanal"],
            ["open", "Abierto manualmente", "Recibe pedidos ya"],
            ["closed", "Cerrado manualmente", "Pausa la recepción"],
          ].map(([k, t, d]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition",
                mode === k ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              <p className="font-semibold">{t}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card className="mt-4">
        <p className="mb-3 font-semibold">Horario semanal</p>
        <div className="grid gap-2">
          {days.map((d, i) => (
            <div key={d} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-medium">{d}</span>
              <Toggle on={on[i]} onChange={(v) => setOn(on.map((x, j) => (j === i ? v : x)))} />
              <Input type="time" defaultValue="08:00" disabled={!on[i]} className="w-32" />
              <span className="text-muted-foreground">a</span>
              <Input type="time" defaultValue="21:00" disabled={!on[i]} className="w-32" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ---------- Configuración real ---------- */
function LocationMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (point: { latitude: number; longitude: number }) => void;
}) {
  const apiKey = getGoogleMapsApiKey();
  if (apiKey)
    return (
      <CompanyLocationMap
        apiKey={apiKey}
        latitude={latitude}
        longitude={longitude}
        onChange={onChange}
      />
    );
  const delta = 0.01;
  const bbox = `${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted">
      <iframe
        title="Ubicación del negocio"
        src={src}
        className="h-56 w-full border-0"
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="block px-3 py-2 text-xs text-primary underline"
      >
        Abrir ubicación en el mapa
      </a>
    </div>
  );
}

export function BizSettings({ name }: { name: string }) {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [draft, setDraft] = useState<CompanyProfilePayload | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      const next = await getCompanyProfile(session.tokens.accessToken, company.id);
      setProfile(next);
      setDraft({
        name: next.name,
        description: next.description,
        phone: next.phone,
        email: next.email,
        address: next.address,
        latitude: next.latitude,
        longitude: next.longitude,
      });
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async () => {
    if (!session || !company || !draft) return;
    setSaving(true);
    try {
      let next = await updateCompanyProfile(session.tokens.accessToken, company.id, draft);
      if (logo) next = await uploadCompanyLogo(session.tokens.accessToken, company.id, logo);
      setProfile(next);
      setLogo(null);
      toast.success("Configuración guardada correctamente.");
    } catch (requestError) {
      toast.error(serviceErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <LoadingState label="Cargando configuración real..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!draft) return null;
  const latitude = Number(draft.latitude ?? 6.2442);
  const longitude = Number(draft.longitude ?? -75.5812);
  return (
    <>
      <PageHeader
        title="Configuración"
        desc="Cómo se muestra tu negocio."
        actions={
          <Btn onClick={() => void save()} disabled={saving}>
            {saving ? "Guardando..." : "Guardar configuración"}
          </Btn>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0">
          <div className="h-24 bg-brand-gradient" />
          <div className="-mt-10 p-5">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-accent font-display text-2xl font-bold text-accent-foreground">
              {profile?.logo ? (
                <img src={profile.logo} alt="Logo" className="size-full object-cover" />
              ) : (
                (draft.name || name)[0]
              )}
            </div>
            <p className="mt-3 font-display text-xl font-bold">{draft.name}</p>
            <p className="text-sm text-muted-foreground">Vista previa del perfil en la app.</p>
          </div>
        </Card>
        <Card className="grid gap-4 md:grid-cols-2 lg:col-span-2">
          <Field label="Nombre">
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={draft.phone ?? ""}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={draft.email ?? ""}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Field>
          <Field label="Logo">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="py-1.5"
              onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
            />
          </Field>
          <Field label="Dirección" className="md:col-span-2">
            <Input
              value={draft.address ?? ""}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
            />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea
              value={draft.description ?? ""}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>
          <Field label="Ubicación del negocio" className="md:col-span-2">
            <LocationMap
              latitude={Number.isFinite(latitude) ? latitude : 6.2442}
              longitude={Number.isFinite(longitude) ? longitude : -75.5812}
              onChange={({ latitude: nextLatitude, longitude: nextLongitude }) =>
                setDraft({ ...draft, latitude: nextLatitude, longitude: nextLongitude })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <Field label="Latitud">
              <Input
                type="number"
                step="any"
                value={draft.latitude ?? ""}
                onChange={(event) => setDraft({ ...draft, latitude: event.target.value })}
              />
            </Field>
            <Field label="Longitud">
              <Input
                type="number"
                step="any"
                value={draft.longitude ?? ""}
                onChange={(event) => setDraft({ ...draft, longitude: event.target.value })}
              />
            </Field>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ---------- Citas ---------- */
function AppointmentsDemo() {
  const [list, setList] = useState([
    {
      id: 311,
      client: "Ana Restrepo",
      svc: "Manicura semipermanente",
      pro: "Camila",
      when: "26 oct · 3:00 p.m.",
      status: "pending",
    },
    {
      id: 312,
      client: "Sofía López",
      svc: "Corte y cepillado",
      pro: "Daniela",
      when: "26 oct · 4:30 p.m.",
      status: "accepted",
    },
    {
      id: 305,
      client: "Valeria Torres",
      svc: "Pedicura spa",
      pro: "Camila",
      when: "25 oct · 11:00 a.m.",
      status: "completed",
    },
  ]);
  const [open, setOpen] = useState<number | null>(null);
  const set = (id: number, s: string) => {
    setList(list.map((a) => (a.id === id ? { ...a, status: s } : a)));
    ok("Cita actualizada");
  };
  return (
    <>
      <PageHeader title="Citas" desc="Gestión de reservas de servicios." />
      <Table head={["Cliente", "Servicio", "Profesional", "Fecha/hora", "Estado", "Acciones"]}>
        {list.map((a) => (
          <>
            <tr key={a.id}>
              <Td className="font-semibold">{a.client}</Td>
              <Td>{a.svc}</Td>
              <Td>{a.pro}</Td>
              <Td>{a.when}</Td>
              <Td>
                <Status s={a.status} />
              </Td>
              <Td>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpen(open === a.id ? null : a.id)}
                  >
                    {open === a.id ? "Ocultar" : "Detalle"}
                  </Btn>
                  {a.status === "pending" && (
                    <Btn size="sm" onClick={() => set(a.id, "accepted")}>
                      Aceptar
                    </Btn>
                  )}
                  {a.status === "accepted" && (
                    <Btn size="sm" variant="accent" onClick={() => set(a.id, "completed")}>
                      Completar
                    </Btn>
                  )}
                </div>
              </Td>
            </tr>
            {open === a.id && (
              <tr key={a.id + "d"}>
                <td colSpan={6} className="bg-muted/40 px-4 py-3 text-sm">
                  Duración 60 min · {money(55000)} · Notas del cliente: "Prefiero tonos nude".
                  Atención en sede principal.
                </td>
              </tr>
            )}
          </>
        ))}
      </Table>
    </>
  );
}

/* ---------- Citas reales ---------- */
export function Appointments() {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await listCompanyAppointments(session.tokens.accessToken, company.id));
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const changeStatus = async (item: Appointment, status: "accepted" | "completed") => {
    if (!session || !company) return;
    setUpdating(item.id);
    try {
      const updated = await updateCompanyAppointmentStatus(
        session.tokens.accessToken,
        company.id,
        item.id,
        status,
      );
      setItems((current) =>
        current.map((appointment) => (appointment.id === updated.id ? updated : appointment)),
      );
      toast.success("Cita actualizada correctamente.");
    } catch (requestError) {
      toast.error(serviceErrorMessage(requestError));
    } finally {
      setUpdating(null);
    }
  };
  const dateTime = (item: Appointment) => `${item.scheduled_date} · ${item.start_time.slice(0, 5)}`;
  return (
    <>
      <PageHeader title="Citas" desc="Gestión de reservas de servicios." />
      {loading ? <LoadingState label="Cargando citas reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No hay citas registradas"
          description="Las reservas de tus clientes aparecerán aquí."
        />
      ) : null}
      {!loading && !error && items.length ? (
        <Table head={["Cliente", "Servicio", "Profesional", "Fecha/hora", "Estado", "Acciones"]}>
          {items.map((item) => (
            <>
              <tr key={item.id}>
                <Td className="font-semibold">
                  {item.customer ? `${item.customer.name} ${item.customer.last_name}` : "Cliente"}
                </Td>
                <Td>{item.service?.name ?? "Servicio"}</Td>
                <Td>{item.professional?.name ?? "Sin asignar"}</Td>
                <Td>{dateTime(item)}</Td>
                <Td>
                  <Status s={item.status} />
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => setOpen(open === item.id ? null : item.id)}
                    >
                      {open === item.id ? "Ocultar" : "Detalle"}
                    </Btn>
                    {item.status === "pending" ? (
                      <Btn
                        size="sm"
                        disabled={updating === item.id}
                        onClick={() => void changeStatus(item, "accepted")}
                      >
                        Aceptar
                      </Btn>
                    ) : null}
                    {item.status === "accepted" ? (
                      <Btn
                        size="sm"
                        variant="accent"
                        disabled={updating === item.id}
                        onClick={() => void changeStatus(item, "completed")}
                      >
                        Completar
                      </Btn>
                    ) : null}
                  </div>
                </Td>
              </tr>
              {open === item.id ? (
                <tr key={`${item.id}-detail`}>
                  <td colSpan={6} className="bg-muted/40 px-4 py-3 text-sm">
                    Duración {item.service?.duration_minutes ?? "—"} min ·{" "}
                    {money(Number(item.price))} · Notas: {item.customer_notes || "Sin notas"}
                  </td>
                </tr>
              ) : null}
            </>
          ))}
        </Table>
      ) : null}
    </>
  );
}

/* ---------- Servicios ---------- */
export function Services() {
  const [q, setQ] = useState("");
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [list, setList] = useState<BusinessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BusinessService | null | "new">(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServicePayload>({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    status: "active",
  });

  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      setList(await listCompanyServices(session.tokens.accessToken, company.id));
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, session]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setForm({ name: "", description: "", duration_minutes: 60, price: 0, status: "active" });
    setEditing("new");
  };
  const openEdit = (service: BusinessService) => {
    setForm({
      name: service.name,
      description: service.description ?? "",
      duration_minutes: Number(service.duration_minutes),
      price: Number(service.price),
      status: service.status === "inactive" ? "inactive" : "active",
      professional_ids: (service.professionals ?? []).map((professional) => professional.id),
    });
    setEditing(service);
  };
  const save = async () => {
    if (!session || !company) return;
    if (!form.name.trim()) {
      toast.error("El nombre del servicio es obligatorio.");
      return;
    }
    if (form.duration_minutes <= 0 || form.price < 0) {
      toast.error("Verifica la duración y el precio del servicio.");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        await createCompanyService(session.tokens.accessToken, company.id, form);
        toast.success("Servicio creado correctamente.");
      } else if (editing) {
        await updateCompanyService(session.tokens.accessToken, company.id, editing.id, form);
        toast.success("Servicio actualizado correctamente.");
      }
      setEditing(null);
      await load();
    } catch (requestError) {
      toast.error(serviceErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const filtered = list.filter((service) =>
    `${service.name} ${(service.professionals ?? []).map((professional) => professional.name).join(" ")}`
      .toLocaleLowerCase("es")
      .includes(q.toLocaleLowerCase("es")),
  );
  return (
    <>
      <PageHeader
        title="Servicios"
        desc="Lo que el cliente puede reservar."
        actions={
          <Btn onClick={openNew}>
            <Plus className="size-4" />
            Nuevo servicio
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} placeholder="Servicio o profesional" />
      </div>
      {loading ? <LoadingState label="Cargando servicios reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title={q ? "No encontramos servicios" : "Aún no hay servicios creados"}
          description={
            q
              ? "Prueba con otro término de búsqueda."
              : "Crea el primer servicio que podrán reservar tus clientes."
          }
        />
      ) : null}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((service) => (
            <Card key={service.id}>
              <div className="flex items-center justify-between">
                <Badge>
                  <Clock className="mr-1 size-3" />
                  {service.duration_minutes} min
                </Badge>
                <Status s={service.status} />
              </div>
              <p className="mt-3 font-display text-lg font-bold">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                {service.description || "Sin descripción."}
              </p>
              <p className="mt-2 text-xs">
                Profesionales:{" "}
                <span className="font-semibold">
                  {(service.professionals ?? []).length
                    ? (service.professionals ?? [])
                        .map((professional) => professional.name)
                        .join(", ")
                    : "Sin asignar"}
                </span>
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-primary">
                  {money(Number(service.price))}
                </span>
                <Btn size="sm" variant="outline" onClick={() => openEdit(service)}>
                  Editar
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nuevo servicio" : "Editar servicio"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()} disabled={saving}>
              {saving ? "Guardando..." : editing === "new" ? "Crear servicio" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <Field label="Nombre">
          <Input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Estado">
            <Select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as ServicePayload["status"] })
              }
              options={["active", "inactive"]}
            />
          </Field>
          <Field label="Duración (min)">
            <Input
              type="number"
              min="1"
              value={form.duration_minutes}
              onChange={(event) =>
                setForm({ ...form, duration_minutes: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Precio">
            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            />
          </Field>
        </div>
        <Field label="Descripción">
          <Textarea
            value={form.description ?? ""}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          La asignación de profesionales se hará desde el módulo Profesionales, cuando esté
          conectado al API.
        </p>
      </Modal>
    </>
  );
}

/* ---------- Profesionales ---------- */
function ProfessionalsDemo() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const c = useConfirm();
  const list = [
    ["Camila Arango", "Uñas", "camila@bella.co", "active"],
    ["Daniela Vélez", "Estilista", "daniela@bella.co", "active"],
    ["Marcela Gil", "Cejas y pestañas", "marcela@bella.co", "inactive"],
  ].filter((x) => x.join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Profesionales"
        desc="El equipo que presta servicios."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nuevo profesional
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map(([n, s, e, st]) => (
          <Card key={n} className="text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-gradient font-display text-2xl font-bold text-primary-foreground">
              {n[0]}
            </div>
            <p className="mt-3 font-display text-lg font-bold">{n}</p>
            <p className="text-sm text-primary">{s}</p>
            <p className="text-xs text-muted-foreground">{e}</p>
            <div className="mt-2">
              <Status s={st} />
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Btn size="sm" variant="outline" onClick={() => setForm(n)}>
                Editar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  c.ask(
                    "¿Eliminar profesional?",
                    `Se retirará el perfil de ${n}.`,
                    "Eliminar",
                    () => ok("Profesional eliminado"),
                  )
                }
              >
                Eliminar
              </Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        wide
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? "Nuevo profesional" : "Editar profesional"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Guardado");
                setForm(null);
              }}
            >
              {form === "new" ? "Crear profesional" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
          </Field>
          <Field label="Especialidad">
            <Input />
          </Field>
          <Field label="Correo">
            <Input />
          </Field>
          <Field label="Teléfono">
            <Input />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo"]} />
          </Field>
          <Field label="Foto">
            <Input type="file" className="py-1.5" />
          </Field>
        </div>
      </Modal>
      {c.node}
    </>
  );
}

/* ---------- Profesionales reales ---------- */
export function Professionals() {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [items, setItems] = useState<Professional[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfessionalPayload>({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    description: "",
    status: "active",
  });
  const confirm = useConfirm();

  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await listCompanyProfessionals(session.tokens.accessToken, company.id));
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, session]);
  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setDraft({ name: "", specialty: "", phone: "", email: "", description: "", status: "active" });
    setEditing(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setCreating(true);
  };
  const openEdit = (item: Professional) => {
    setDraft({
      name: item.name,
      specialty: item.specialty ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      description: item.description ?? "",
      status: item.status,
    });
    setEditing(item);
    setPhotoFile(null);
    setPhotoPreview(item.photo);
    setCreating(false);
  };
  const close = () => {
    setEditing(null);
    setCreating(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };
  const selectPhoto = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : (editing?.photo ?? null));
  };
  const save = async () => {
    if (!session || !company) return;
    if (!draft.name.trim()) return toast.error("El nombre del profesional es obligatorio.");
    setSaving(true);
    try {
      const professional = creating
        ? await createCompanyProfessional(session.tokens.accessToken, company.id, draft)
        : editing
          ? await updateCompanyProfessional(
              session.tokens.accessToken,
              company.id,
              editing.id,
              draft,
            )
          : null;
      if (professional && photoFile)
        await uploadCompanyProfessionalPhoto(
          session.tokens.accessToken,
          company.id,
          professional.id,
          photoFile,
        );
      toast.success(
        creating ? "Profesional creado correctamente." : "Profesional actualizado correctamente.",
      );
      close();
      await load();
    } catch (requestError) {
      toast.error(serviceErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const remove = (item: Professional) =>
    confirm.ask(
      "¿Eliminar profesional?",
      `Se retirará el perfil de ${item.name}.`,
      "Eliminar",
      async () => {
        if (!session || !company) return;
        try {
          await deleteCompanyProfessional(session.tokens.accessToken, company.id, item.id);
          toast.success("Profesional eliminado correctamente.");
          await load();
        } catch (requestError) {
          toast.error(serviceErrorMessage(requestError));
        }
      },
    );
  const filtered = items.filter((item) =>
    `${item.name} ${item.specialty ?? ""} ${item.email ?? ""}`
      .toLocaleLowerCase("es")
      .includes(query.toLocaleLowerCase("es")),
  );

  return (
    <>
      <PageHeader
        title="Profesionales"
        desc="El equipo que presta servicios."
        actions={
          <Btn onClick={openNew}>
            <Plus className="size-4" />
            Nuevo profesional
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={query} onChange={setQuery} placeholder="Nombre, especialidad o correo" />
      </div>
      {loading ? <LoadingState label="Cargando profesionales reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState
          title={query ? "No encontramos profesionales" : "Aún no hay profesionales"}
          description="Crea el primer integrante que prestará servicios."
        />
      ) : null}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="text-center">
              <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full bg-brand-gradient font-display text-2xl font-bold text-primary-foreground">
                {item.photo ? (
                  <img src={item.photo} alt="" className="size-full object-cover" />
                ) : (
                  item.name[0]
                )}
              </div>
              <p className="mt-3 font-display text-lg font-bold">{item.name}</p>
              <p className="text-sm text-primary">{item.specialty || "Sin especialidad"}</p>
              <p className="text-xs text-muted-foreground">
                {item.email || item.phone || "Sin contacto"}
              </p>
              <div className="mt-2">
                <Status s={item.status} />
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Btn size="sm" variant="outline" onClick={() => openEdit(item)}>
                  Editar
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(item)}
                >
                  Eliminar
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      <Modal
        wide
        open={creating || editing !== null}
        onClose={close}
        title={creating ? "Nuevo profesional" : "Editar profesional"}
        footer={
          <>
            <Btn variant="outline" onClick={close} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()} disabled={saving}>
              {saving ? "Guardando..." : creating ? "Crear profesional" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>
          <Field label="Especialidad">
            <Input
              value={draft.specialty ?? ""}
              onChange={(event) => setDraft({ ...draft, specialty: event.target.value })}
            />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={draft.email ?? ""}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={draft.phone ?? ""}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea
              value={draft.description ?? ""}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>
          <Field label="Estado">
            <Select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as ProfessionalPayload["status"] })
              }
              options={["active", "inactive"]}
            />
          </Field>
          <div className="flex items-end gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-display text-lg font-bold text-muted-foreground">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Vista previa del profesional"
                  className="size-full object-cover"
                />
              ) : (
                draft.name.trim().charAt(0).toUpperCase() || "?"
              )}
            </div>
            <p className="pb-1 text-xs text-muted-foreground">
              Vista previa de la foto del profesional.
            </p>
          </div>
          <Field label="Foto" className="md:col-span-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="py-1.5"
              onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)}
            />
            <span className="text-xs text-muted-foreground">
              {photoFile ? photoFile.name : "JPG, PNG o WebP."}
            </span>
          </Field>
        </div>
      </Modal>
      {confirm.node}
    </>
  );
}

/* ---------- Horarios ---------- */
function SchedulesDemo() {
  const [pro, setPro] = useState("Camila Arango");
  const [form, setForm] = useState<string | null>(null);
  const c = useConfirm();
  const blocks = [
    ["Lunes", "08:00", "12:00"],
    ["Lunes", "14:00", "18:00"],
    ["Miércoles", "09:00", "17:00"],
    ["Viernes", "10:00", "19:00"],
    ["Sábado", "08:00", "14:00"],
  ];
  return (
    <>
      <PageHeader
        title="Horarios"
        desc="Disponibilidad semanal por profesional."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nuevo horario
          </Btn>
        }
      />
      <div className="mb-4 w-64">
        <Select
          value={pro}
          onChange={(e) => setPro(e.target.value)}
          options={["Camila Arango", "Daniela Vélez", "Marcela Gil"]}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((d) => (
          <div key={d} className="rounded-xl border border-border bg-card p-3">
            <p className="mb-2 text-sm font-semibold">{d}</p>
            {blocks
              .filter((b) => b[0] === d)
              .map(([, a, b]) => (
                <div key={a} className="mb-2 rounded-lg bg-primary/12 p-2 text-xs">
                  <p className="font-semibold text-primary">
                    {a} – {b}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <button className="underline" onClick={() => setForm(d)}>
                      Editar
                    </button>
                    <button
                      className="text-destructive underline"
                      onClick={() =>
                        c.ask(
                          "¿Eliminar horario?",
                          "Afectará la disponibilidad de reservas.",
                          "Eliminar",
                          () => ok("Horario eliminado"),
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            {!blocks.some((b) => b[0] === d) && (
              <p className="text-xs text-muted-foreground">Sin horario</p>
            )}
          </div>
        ))}
      </div>
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? "Nuevo horario" : "Editar horario"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Horario guardado");
                setForm(null);
              }}
            >
              {form === "new" ? "Crear horario" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <Field label="Día de la semana">
          <Select defaultValue={form !== "new" ? (form ?? "") : "Lunes"} options={days} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio">
            <Input type="time" defaultValue="08:00" />
          </Field>
          <Field label="Fin">
            <Input type="time" defaultValue="17:00" />
          </Field>
        </div>
        <Field label="Estado">
          <Select options={["Activo", "Inactivo"]} />
        </Field>
      </Modal>
      {c.node}
    </>
  );
}

const scheduleDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function Schedules() {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProfessionalSchedule | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SchedulePayload>({
    day_of_week: 1,
    start_time: "08:00",
    end_time: "17:00",
    status: "active",
  });
  const confirm = useConfirm();
  const loadProfessionals = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      const next = await listCompanyProfessionals(session.tokens.accessToken, company.id);
      setProfessionals(next);
      setProfessionalId((current) =>
        current && next.some((item) => item.id === current) ? current : (next[0]?.id ?? null),
      );
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, session]);
  const loadSchedules = useCallback(async () => {
    if (!session || !company || !professionalId) {
      setSchedules([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSchedules(
        await listProfessionalSchedules(session.tokens.accessToken, company.id, professionalId),
      );
    } catch (requestError) {
      setError(serviceErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [company, professionalId, session]);
  useEffect(() => {
    void loadProfessionals();
  }, [loadProfessionals]);
  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);
  const openNew = () => {
    setDraft({ day_of_week: 1, start_time: "08:00", end_time: "17:00", status: "active" });
    setEditing("new");
  };
  const openEdit = (item: ProfessionalSchedule) => {
    setDraft({
      day_of_week: item.day_of_week,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      status: item.status,
    });
    setEditing(item);
  };
  const save = async () => {
    if (!session || !company || !professionalId) return;
    if (draft.start_time >= draft.end_time)
      return toast.error("La hora de fin debe ser posterior a la hora de inicio.");
    setSaving(true);
    try {
      await saveProfessionalSchedule(
        session.tokens.accessToken,
        company.id,
        professionalId,
        editing === "new" ? null : (editing?.id ?? null),
        draft,
      );
      toast.success("Horario guardado correctamente.");
      setEditing(null);
      await loadSchedules();
    } catch (requestError) {
      toast.error(serviceErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const remove = (item: ProfessionalSchedule) =>
    confirm.ask(
      "¿Eliminar horario?",
      "Afectará la disponibilidad de reservas.",
      "Eliminar",
      async () => {
        if (!session || !company || !professionalId) return;
        try {
          await deleteProfessionalSchedule(
            session.tokens.accessToken,
            company.id,
            professionalId,
            item.id,
          );
          toast.success("Horario eliminado correctamente.");
          await loadSchedules();
        } catch (requestError) {
          toast.error(serviceErrorMessage(requestError));
        }
      },
    );
  return (
    <>
      <PageHeader
        title="Horarios"
        desc="Disponibilidad semanal por profesional."
        actions={
          <Btn onClick={openNew} disabled={!professionalId}>
            <Plus className="size-4" />
            Nuevo horario
          </Btn>
        }
      />
      {professionals.length ? (
        <div className="mb-4 w-full max-w-sm">
          <select
            value={String(professionalId ?? "")}
            onChange={(event) => setProfessionalId(Number(event.target.value))}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {professionals.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.specialty ? ` · ${item.specialty}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {loading ? <LoadingState label="Cargando horarios reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void loadSchedules()} /> : null}
      {!loading && !error && !professionalId ? (
        <EmptyState
          title="Primero crea un profesional"
          description="Los horarios se asignan a un profesional existente."
        />
      ) : null}
      {!loading && !error && professionalId ? (
        <div className="grid gap-3 md:grid-cols-7">
          {scheduleDays.map((day, dayIndex) => (
            <Card key={day} className="min-h-32 p-3">
              <p className="mb-2 text-sm font-semibold">{day}</p>
              {schedules
                .filter((item) => item.day_of_week === dayIndex)
                .map((item) => (
                  <div key={item.id} className="mb-2 rounded-lg bg-primary/12 p-2 text-xs">
                    <p className="font-semibold text-primary">
                      {item.start_time.slice(0, 5)} – {item.end_time.slice(0, 5)}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button className="underline" onClick={() => openEdit(item)}>
                        Editar
                      </button>
                      <button className="text-destructive underline" onClick={() => remove(item)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              {!schedules.some((item) => item.day_of_week === dayIndex) ? (
                <p className="text-xs text-muted-foreground">Sin horario</p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nuevo horario" : "Editar horario"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()} disabled={saving}>
              {saving ? "Guardando..." : "Guardar horario"}
            </Btn>
          </>
        }
      >
        <Field label="Día de la semana">
          <select
            value={String(draft.day_of_week)}
            onChange={(event) => setDraft({ ...draft, day_of_week: Number(event.target.value) })}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {scheduleDays.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio">
            <Input
              type="time"
              value={draft.start_time}
              onChange={(event) => setDraft({ ...draft, start_time: event.target.value })}
            />
          </Field>
          <Field label="Fin">
            <Input
              type="time"
              value={draft.end_time}
              onChange={(event) => setDraft({ ...draft, end_time: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Estado">
          <Select
            value={draft.status}
            onChange={(event) =>
              setDraft({ ...draft, status: event.target.value as SchedulePayload["status"] })
            }
            options={["active", "inactive"]}
          />
        </Field>
      </Modal>
      {confirm.node}
    </>
  );
}
