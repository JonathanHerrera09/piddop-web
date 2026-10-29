import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Users,
  Download,
  Send,
  RefreshCw,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Check,
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
  Stars,
  Modal,
  useConfirm,
  Table,
  Td,
  Pager,
  Tabs,
  Status,
  money,
} from "./kit";
import { useSession } from "@/providers/session-provider";
import { getGoogleMapsApiKey } from "@/lib/env";
import { CoveragePolygonMap } from "./company-location-map";
import { ErrorState, EmptyState, LoadingState } from "./async-state";
import {
  createCompanyTeamMember,
  listAdminCompanyTeam,
  listAdminCompanyTeamRoles,
  listCompanyTeam,
  listCompanyTeamRoles,
  removeCompanyTeamMember,
  updateCompanyTeamMemberStatus,
  updateCompanyTeamRoles,
  type TeamMember,
  type TeamRole,
} from "@/services/team.service";
import {
  listAdminCompanies,
  listAdminCompaniesPage,
  saveAdminCompany,
  setAdminCompanyStatus,
  updateAdminCompanyCommission,
  type AdminCompany,
  type CompanyPayload,
} from "@/services/admin-companies.service";
import {
  listAdminSupportTickets,
  updateAdminSupportTicket,
  type SupportTicket,
} from "@/services/admin-support.service";
import {
  activateAdminCustomer,
  clearAdminCustomer,
  eraseAdminCustomer,
  listAdminCustomers,
  type AdminCustomer,
} from "@/services/admin-customers.service";
import {
  listCategories,
  removeCategory,
  saveCategory,
  uploadCategoryIcon,
  type AdminCategory,
} from "@/services/admin-categories.service";
import {
  deleteCoupon,
  listCoupons,
  saveCoupon,
  type Coupon,
} from "@/services/admin-coupons.service";
import { createCampaign, listCampaigns, type Campaign } from "@/services/admin-campaigns.service";
import { createCourier, listCouriers, type Courier } from "@/services/admin-couriers.service";
import {
  deleteRole,
  listPermissions,
  listRoles,
  type Permission,
  type Role,
} from "@/services/admin-roles.service";
import {
  createSettlement,
  downloadSettlement,
  getPlatformCoverage,
  getPlatformLinks,
  getWompiSettings,
  listEligibleOrders,
  listEmailTemplates,
  listSettlements,
  saveEmailTemplate,
  savePlatformCoverage,
  savePlatformLinks,
  saveWompiSettings,
  sendSettlement,
  testEmailTemplate,
  type Coverage as PlatformCoverage,
  type EmailTemplate,
  type EligibleOrder,
  type PlatformLinks,
  type Settlement,
  type WompiSettings,
} from "@/services/admin-platform.service";
import { listAdminReviews, listCompanyReviews, type Review } from "@/services/reviews.service";
import {
  getAdminDashboard,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from "@/services/dashboard.service";

const ok = (m: string) => toast.success(m);

/* ---------- Calificaciones (compartido) ---------- */
const reviews = [
  {
    co: "La Brasa",
    order: "#1042",
    date: "24 oct 2026",
    n: 5,
    text: "Llegó caliente y rapidísimo. ¡Excelente!",
  },
  {
    co: "Studio Bella",
    order: "Cita #311",
    date: "23 oct 2026",
    n: 4,
    text: "Muy buena atención, puntuales.",
  },
  { co: "Mercado Verde", order: "#988", date: "22 oct 2026", n: 3, text: "" },
  {
    co: "La Brasa",
    order: "#1031",
    date: "21 oct 2026",
    n: 2,
    text: "Faltó una salsa en el pedido.",
  },
  {
    co: "Studio Bella",
    order: "Cita #305",
    date: "20 oct 2026",
    n: 5,
    text: "La mejor manicura del barrio.",
  },
  { co: "Mercado Verde", order: "#975", date: "19 oct 2026", n: 1, text: "" },
];
function RatingsDemo({ scope }: { scope?: string }) {
  const [stars, setStars] = useState("Todas");
  const [onlyText, setOnlyText] = useState(false);
  const [co, setCo] = useState("Todas");
  let list = reviews.filter((r) => (scope ? r.co === scope : co === "Todas" || r.co === co));
  const base = list;
  if (stars !== "Todas") list = list.filter((r) => r.n === Number(stars[0]));
  if (onlyText) list = list.filter((r) => r.text);
  const avg = base.reduce((a, r) => a + r.n, 0) / (base.length || 1);
  return (
    <>
      <PageHeader
        title={scope ? "Mis calificaciones y comentarios" : "Calificaciones"}
        desc={
          scope
            ? "Reputación de tu negocio. Solo lectura."
            : "Reseñas recibidas por todas las empresas. Módulo de consulta."
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Stat accent label="Promedio" value={avg.toFixed(1)} hint="sobre 5 estrellas" />
        <Stat label="Total" value={base.length} />
        <Stat label="Con comentario" value={base.filter((r) => r.text).length} />
        <Card>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Distribución
          </p>
          {[5, 4, 3, 2, 1].map((s) => {
            const c = base.filter((r) => r.n === s).length;
            return (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3">{s}</span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(c / (base.length || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-3 text-muted-foreground">{c}</span>
              </div>
            );
          })}
        </Card>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!scope && (
          <Select
            className="w-48"
            value={co}
            onChange={(e) => setCo(e.target.value)}
            options={["Todas", "La Brasa", "Studio Bella", "Mercado Verde"]}
          />
        )}
        <Select
          className="w-40"
          value={stars}
          onChange={(e) => setStars(e.target.value)}
          options={[
            "Todas",
            "5 estrellas",
            "4 estrellas",
            "3 estrellas",
            "2 estrellas",
            "1 estrella",
          ]}
        />
        <Toggle on={onlyText} onChange={setOnlyText} label="Solo comentarios" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{r.co}</p>
                <p className="text-xs text-muted-foreground">
                  {r.order} · {r.date}
                </p>
              </div>
              <Stars n={r.n} />
            </div>
            <p className="mt-3 text-sm">
              {r.text || (
                <span className="italic text-muted-foreground">Sin comentario escrito</span>
              )}
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- Resumen general ---------- */
function AdminSummaryDemo() {
  const bars = [42, 58, 51, 73, 66, 88, 95];
  return (
    <>
      <PageHeader title="Resumen general" desc="Vista ejecutiva de la plataforma." />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat accent label="Ventas del mes" value={money(184_350_000)} hint="+12% vs. septiembre" />
        <Stat label="Pedidos" value="6.482" />
        <Stat label="Empresas activas" value="128" />
        <Stat label="Comisiones" value={money(18_435_000)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 font-semibold">Actividad semanal</p>
          <div className="flex h-48 items-end gap-3">
            {bars.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-brand-gradient"
                  style={{ height: `${b}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["L", "M", "X", "J", "V", "S", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="mb-4 font-semibold">Comisiones por tipo</p>
          {[
            ["Comida", 62],
            ["Productos", 23],
            ["Servicios", 15],
          ].map(([l, v]) => (
            <div key={l} className="mb-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>{l}</span>
                <span className="font-semibold">{v}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

export function Ratings({ scope }: { scope?: string }) {
  const { session } = useSession();
  const company = session?.companies.find(
    (entry) => entry.company.id === session.activeCompanyId,
  )?.company;
  const [rating, setRating] = useState("Todas");
  const [commentsOnly, setCommentsOnly] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{
    count: number;
    average: number;
    distribution: Record<number, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      const result =
        scope && company
          ? await listCompanyReviews(session.tokens.accessToken, company.id, rating, commentsOnly)
          : await listAdminReviews(session.tokens.accessToken, rating, commentsOnly);
      setReviews(result.reviews);
      setSummary(result.summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar calificaciones.");
    }
  }, [commentsOnly, company, rating, scope, session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!summary && scope) return <LoadingState label="Cargando calificaciones..." />;
  const average =
    summary?.average ??
    (reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0);
  return (
    <>
      <PageHeader
        title={scope ? "Mis calificaciones" : "Calificaciones"}
        desc="Reseñas reales registradas en la plataforma."
      />
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Stat accent label="Promedio" value={average.toFixed(1)} hint="sobre 5 estrellas" />
        <Stat label="Total" value={summary?.count ?? reviews.length} />
        <Stat label="Con comentario" value={reviews.filter((review) => review.comment).length} />
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          className="w-40"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          options={[
            "Todas",
            "5 estrellas",
            "4 estrellas",
            "3 estrellas",
            "2 estrellas",
            "1 estrella",
          ]}
        />
        <Toggle on={commentsOnly} onChange={setCommentsOnly} label="Solo comentarios" />
      </div>
      {!reviews.length ? (
        <EmptyState
          title="No hay calificaciones"
          description="Cuando clientes califiquen pedidos, aparecerán aquí."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-semibold">{review.company?.name ?? scope}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.order?.order_number ?? "Pedido"} ·{" "}
                    {new Date(review.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <Stars n={review.rating} />
              </div>
              <p className="mt-3 text-sm">
                {review.comment || (
                  <span className="italic text-muted-foreground">Sin comentario escrito</span>
                )}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function AdminSummary() {
  const { session } = useSession();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      setData(await getAdminDashboard(session.tokens.accessToken));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar el resumen.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState label="Cargando resumen..." />;
  const companies = (data.companies ?? {}) as {
    total?: number;
    active?: number;
    by_type?: Array<{ type: string; count: number }>;
  };
  const orders = (data.orders ?? {}) as {
    monthly?: { sales?: number; orders?: number; commission?: number };
  };
  const month = orders.monthly ?? {};
  return (
    <>
      <PageHeader title="Resumen general" desc="Métricas reales de la plataforma." />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat accent label="Ventas del mes" value={money(Number(month.sales ?? 0))} />
        <Stat label="Pedidos del mes" value={Number(month.orders ?? 0)} />
        <Stat
          label="Empresas activas"
          value={Number(companies.active ?? 0)}
          hint={`Total: ${Number(companies.total ?? 0)}`}
        />
        <Stat label="Comisiones del mes" value={money(Number(month.commission ?? 0))} />
      </div>
      <Card className="mt-6">
        <p className="mb-4 font-semibold">Empresas por tipo</p>
        {(companies.by_type ?? []).length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {(companies.by_type ?? []).map((item) => (
              <div key={item.type} className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">{item.type}</p>
                <p className="font-display text-2xl font-bold">{item.count}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin empresas" description="No hay datos para este periodo." />
        )}
      </Card>
    </>
  );
}

/* ---------- Empresas ---------- */
type Co = {
  id: number;
  name: string;
  type: string;
  email: string;
  fee: number;
  rating: number;
  status: string;
};
function CompaniesDemo({ openUsers }: { openUsers: () => void }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Co[]>([
    {
      id: 1,
      name: "La Brasa",
      type: "Comida",
      email: "hola@labrasa.co",
      fee: 10,
      rating: 4.6,
      status: "active",
    },
    {
      id: 2,
      name: "Studio Bella",
      type: "Servicios",
      email: "citas@bella.co",
      fee: 8,
      rating: 4.8,
      status: "active",
    },
    {
      id: 3,
      name: "Mercado Verde",
      type: "Productos",
      email: "",
      fee: 12,
      rating: 4.1,
      status: "suspended",
    },
    {
      id: 4,
      name: "Café Nube",
      type: "Comida",
      email: "cafe@nube.co",
      fee: 10,
      rating: 4.4,
      status: "pending",
    },
  ]);
  const [edit, setEdit] = useState<Co | null | "new">(null);
  const c = useConfirm();
  const shown = list.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Empresas"
        desc="Gestiona los negocios registrados."
        actions={
          <Btn onClick={() => setEdit("new")}>
            <Plus className="size-4" />
            Nueva empresa
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <Table head={["Empresa", "Tipo", "Calificación", "Comisión %", "Estado", "Acciones"]}>
        {shown.map((x) => (
          <tr key={x.id}>
            <Td>
              <p className="font-semibold">{x.name}</p>
              <p className="text-xs text-muted-foreground">{x.email || "Sin correo"}</p>
            </Td>
            <Td>
              <Badge tone="info">{x.type}</Badge>
            </Td>
            <Td>{x.rating} ★</Td>
            <Td>
              <div className="flex items-center gap-1">
                <Input type="number" defaultValue={x.fee} className="h-8 w-16" />
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => ok(`Comisión de ${x.name} guardada`)}
                >
                  %
                </Btn>
              </div>
            </Td>
            <Td>
              <Status s={x.status} />
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                <Btn size="sm" variant="outline" onClick={() => setEdit(x)}>
                  <Pencil className="size-3" />
                  Editar
                </Btn>
                <Btn size="sm" variant="outline" onClick={openUsers}>
                  <Users className="size-3" />
                  Usuarios
                </Btn>
                {x.status === "suspended" ? (
                  <Btn
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      setList(list.map((y) => (y.id === x.id ? { ...y, status: "active" } : y)));
                      ok("Empresa activada");
                    }}
                  >
                    Activar
                  </Btn>
                ) : (
                  <Btn
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      c.ask(
                        "¿Suspender empresa?",
                        `Sus usuarios perderán acceso operativo a ${x.name}.`,
                        "Suspender",
                        () => {
                          setList(
                            list.map((y) => (y.id === x.id ? { ...y, status: "suspended" } : y)),
                          );
                          ok("Empresa suspendida");
                        },
                      )
                    }
                  >
                    Suspender
                  </Btn>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <Pager total={shown.length} />
      <Modal
        wide
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit === "new" ? "Nueva empresa" : "Editar empresa"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEdit(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok(edit === "new" ? "Empresa creada" : "Cambios guardados");
                setEdit(null);
              }}
            >
              {edit === "new" ? "Crear empresa" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input defaultValue={edit && edit !== "new" ? edit.name : ""} />
          </Field>
          <Field label="Tipo">
            <Select options={["Comida", "Productos", "Servicios"]} />
          </Field>
          <Field label="Correo">
            <Input defaultValue={edit && edit !== "new" ? edit.email : ""} />
          </Field>
          <Field label="Teléfono">
            <Input placeholder="+57 300 000 0000" />
          </Field>
          <Field label="Dirección" className="md:col-span-2">
            <Input />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <Textarea />
          </Field>
          <Field label="Comisión %">
            <Input type="number" defaultValue={10} />
          </Field>
          <Field label="Calificación">
            <Input type="number" step="0.1" defaultValue={5} />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo", "Pendiente", "Suspendido"]} />
          </Field>
        </div>
      </Modal>
      {c.node}
    </>
  );
}

export function Companies({ openUsers }: { openUsers: () => void }) {
  const { session } = useSession();
  const [items, setItems] = useState<AdminCompany[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_items: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminCompany | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [commission, setCommission] = useState<Record<number, string>>({});
  const [draft, setDraft] = useState<CompanyPayload>({ name: "", type: "food", status: "pending" });
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const response = await listAdminCompaniesPage(session.tokens.accessToken, query, page);
      setItems(response.companies);
      setPagination(response.pagination);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar las empresas.");
    } finally {
      setLoading(false);
    }
  }, [page, query, session]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);
  const openNew = () => {
    setDraft({ name: "", type: "food", status: "pending", commission_percentage: 0 });
    setEditing("new");
  };
  const openEdit = (item: AdminCompany) => {
    setDraft({ ...item, commission_percentage: Number(item.commission_percentage) });
    setEditing(item);
  };
  const save = async () => {
    if (!session || !draft.name.trim())
      return toast.error("El nombre de la empresa es obligatorio.");
    setSaving(true);
    try {
      await saveAdminCompany(
        session.tokens.accessToken,
        draft,
        editing === "new" ? undefined : editing?.id,
      );
      toast.success(
        editing === "new" ? "Empresa creada correctamente." : "Empresa actualizada correctamente.",
      );
      setEditing(null);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No fue posible guardar la empresa.");
    } finally {
      setSaving(false);
    }
  };
  const setStatus = async (item: AdminCompany, status: "active" | "suspended") => {
    if (!session) return;
    try {
      const updated = await setAdminCompanyStatus(session.tokens.accessToken, item.id, status);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      toast.success(status === "active" ? "Empresa activada." : "Empresa suspendida.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar el estado.",
      );
    }
  };
  const saveCommission = async (item: AdminCompany) => {
    if (!session) return;
    const value = Number(commission[item.id] ?? item.commission_percentage);
    if (!Number.isFinite(value) || value < 0 || value > 100)
      return toast.error("La comisión debe estar entre 0 y 100.");
    try {
      const updated = await updateAdminCompanyCommission(
        session.tokens.accessToken,
        item.id,
        value,
      );
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      toast.success("Comisión actualizada.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar la comisión.",
      );
    }
  };
  return (
    <>
      <PageHeader
        title="Empresas"
        desc="Gestiona los negocios registrados."
        actions={
          <Btn onClick={openNew}>
            <Plus className="size-4" />
            Nueva empresa
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          placeholder="Nombre o correo"
        />
      </div>
      {loading ? <LoadingState label="Cargando empresas reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && !items.length ? (
        <EmptyState title="No hay empresas para este filtro." />
      ) : null}
      {!loading && !error && items.length ? (
        <Table head={["Empresa", "Tipo", "Calificación", "Comisión %", "Estado", "Acciones"]}>
          {items.map((item) => (
            <tr key={item.id}>
              <Td>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.email || "Sin correo"}</p>
              </Td>
              <Td>
                <Badge tone="info">{item.type}</Badge>
              </Td>
              <Td>{item.rating ?? "—"} ★</Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={commission[item.id] ?? String(item.commission_percentage)}
                    onChange={(event) =>
                      setCommission({ ...commission, [item.id]: event.target.value })
                    }
                    className="h-8 w-16"
                  />
                  <Btn size="sm" variant="outline" onClick={() => void saveCommission(item)}>
                    %
                  </Btn>
                </div>
              </Td>
              <Td>
                <Status s={item.status} />
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Btn size="sm" variant="outline" onClick={() => openEdit(item)}>
                    <Pencil className="size-3" />
                    Editar
                  </Btn>
                  <Btn size="sm" variant="outline" onClick={openUsers}>
                    <Users className="size-3" />
                    Usuarios
                  </Btn>
                  {item.status === "suspended" ? (
                    <Btn size="sm" variant="accent" onClick={() => void setStatus(item, "active")}>
                      Activar
                    </Btn>
                  ) : (
                    <Btn
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void setStatus(item, "suspended")}
                    >
                      Suspender
                    </Btn>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
      {!loading && !error && items.length ? (
        <Pager
          total={pagination.total_items}
          page={page}
          totalPages={pagination.total_pages}
          onPageChange={setPage}
        />
      ) : null}
      <Modal
        wide
        open={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === "new" ? "Nueva empresa" : "Editar empresa"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
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
          <Field label="Tipo">
            <Select
              value={draft.type}
              disabled={editing !== "new"}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as AdminCompany["type"] })
              }
              options={["food", "products", "services"]}
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
          <Field label="Comisión %">
            <Input
              type="number"
              value={draft.commission_percentage ?? 0}
              onChange={(event) =>
                setDraft({ ...draft, commission_percentage: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Estado">
            <Select
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
              options={["active", "inactive", "pending", "suspended"]}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}

/* ---------- Usuarios / Equipo (compartido) ---------- */
type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  owner?: boolean;
};
const roles = ["OWNER", "MANAGER", "COOK", "PROFESSIONAL", "CATALOG_MANAGER", "SUPPORT"];
function TeamUsersDemo({ admin }: { admin?: boolean }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Member[]>([
    {
      id: 1,
      name: "Andrea Gómez",
      email: "andrea@labrasa.co",
      role: "OWNER",
      status: "active",
      owner: true,
    },
    { id: 2, name: "Carlos Ruiz", email: "carlos@labrasa.co", role: "MANAGER", status: "active" },
    { id: 3, name: "Luisa Pérez", email: "luisa@labrasa.co", role: "COOK", status: "active" },
    {
      id: 4,
      name: "Mateo Díaz",
      email: "mateo@labrasa.co",
      role: "CATALOG_MANAGER",
      status: "inactive",
    },
  ]);
  const [form, setForm] = useState<Member | "new" | null>(null);
  const [show, setShow] = useState(false);
  const c = useConfirm();
  const shown = list.filter((m) => (m.name + m.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title={admin ? "Usuarios de empresas" : "Equipo"}
        desc={
          admin
            ? "Administra las personas vinculadas a cada negocio."
            : "Invita y gestiona a las personas de tu empresa."
        }
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            {admin ? "Nuevo usuario" : "Invitar miembro"}
          </Btn>
        }
      />
      {admin && (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Field label="Empresa seleccionada">
            <Select options={["La Brasa", "Studio Bella", "Mercado Verde"]} />
          </Field>
          <Stat label="Usuarios vinculados" value={list.length} />
          <Stat
            label="Responsables"
            value={list.filter((m) => m.role === "OWNER" || m.role === "MANAGER").length}
          />
          <Stat label="Estado del negocio" value={<Badge tone="active">Activo</Badge>} />
        </div>
      )}
      <div className="mb-4 flex gap-2">
        <SearchBox value={q} onChange={setQ} placeholder="Nombre o correo" />
        <Btn variant="outline">Buscar</Btn>
      </div>
      <Table head={["Persona", "Rol asignado", "Estado", "Acciones"]}>
        {shown.map((m) => (
          <tr key={m.id}>
            <Td>
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.email}</p>
            </Td>
            <Td>
              <Select
                className="h-8 w-48"
                defaultValue={m.role}
                options={roles}
                onChange={() => ok(`Rol de ${m.name} actualizado`)}
              />
            </Td>
            <Td>
              <Status s={m.status} />
            </Td>
            <Td>
              <div className="flex gap-1">
                {admin && (
                  <Btn size="sm" variant="outline" onClick={() => setForm(m)}>
                    <Pencil className="size-3" />
                    Editar
                  </Btn>
                )}
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={m.owner}
                  title={m.owner ? "Cambia primero el rol del propietario" : ""}
                  onClick={() =>
                    c.ask(
                      "¿Retirar miembro?",
                      `${m.name} quedará desvinculado de la empresa.`,
                      "Retirar",
                      () => {
                        setList(list.filter((x) => x.id !== m.id));
                        ok("Miembro retirado");
                      },
                    )
                  }
                >
                  Retirar
                </Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      {admin && <Pager total={shown.length} />}
      <Modal
        wide
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? (admin ? "Nuevo usuario" : "Invitar miembro") : "Editar usuario"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              {form === "new" ? "Cancelar" : "Volver al equipo"}
            </Btn>
            <Btn
              onClick={() => {
                ok(form === "new" ? "Persona creada y vinculada" : "Cambios guardados");
                setForm(null);
              }}
            >
              {form === "new" ? (admin ? "Crear y vincular" : "Crear miembro") : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input defaultValue={form && form !== "new" ? form.name.split(" ")[0] : ""} />
          </Field>
          <Field label="Apellido">
            <Input defaultValue={form && form !== "new" ? form.name.split(" ")[1] : ""} />
          </Field>
          <Field label="Correo">
            <Input defaultValue={form && form !== "new" ? form.email : ""} />
          </Field>
          <Field label="Teléfono">
            <Input />
          </Field>
          <Field label={form === "new" ? "Contraseña temporal" : "Nueva contraseña (opcional)"}>
            <div className="relative">
              <Input type={show ? "text" : "password"} />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="Rol">
            <Select options={roles} />
          </Field>
          {form !== "new" && (
            <Field label="Estado">
              <Select options={["Activo", "Inactivo", "Suspendido"]} />
            </Field>
          )}
        </div>
      </Modal>
      {c.node}
    </>
  );
}

function CompanyTeamUsers() {
  const { session } = useSession();
  const company = session?.companies.find(
    (item) => item.company.id === session.activeCompanyId,
  )?.company;
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
  });
  const load = useCallback(async () => {
    if (!session || !company) return;
    setLoading(true);
    setError(null);
    try {
      const [nextMembers, nextRoles] = await Promise.all([
        listCompanyTeam(session.tokens.accessToken, company.id),
        listCompanyTeamRoles(session.tokens.accessToken, company.id),
      ]);
      setMembers(nextMembers);
      setRoles(nextRoles);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos cargar el equipo.");
    } finally {
      setLoading(false);
    }
  }, [company, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const openCreate = () => {
    setDraft({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      role_id: String(roles[0]?.id ?? ""),
    });
    setCreating(true);
  };
  const create = async () => {
    if (!session || !company) return;
    if (
      !draft.name ||
      !draft.last_name ||
      !draft.email ||
      !draft.phone ||
      !draft.password ||
      !draft.role_id
    ) {
      toast.error("Completa todos los campos y selecciona un rol.");
      return;
    }
    if (draft.password.length < 8) {
      toast.error("La contraseña temporal debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await createCompanyTeamMember(session.tokens.accessToken, company.id, {
        name: draft.name,
        last_name: draft.last_name,
        email: draft.email,
        phone: draft.phone,
        password: draft.password,
        role_ids: [Number(draft.role_id)],
      });
      toast.success("Integrante creado y vinculado correctamente.");
      setCreating(false);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No fue posible crear el integrante.");
    } finally {
      setSaving(false);
    }
  };
  const changeRole = async (member: TeamMember, roleId: number) => {
    if (!session || !company) return;
    try {
      await updateCompanyTeamRoles(session.tokens.accessToken, company.id, member.id, [roleId]);
      setMembers((current) =>
        current.map((item) =>
          item.id === member.id
            ? { ...item, companyRoles: roles.filter((role) => role.id === roleId) }
            : item,
        ),
      );
      toast.success("Rol actualizado correctamente.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No fue posible actualizar el rol.");
    }
  };
  const remove = async (member: TeamMember) => {
    if (!session || !company) return;
    if (!window.confirm(`¿Retirar a ${member.user.name} del equipo?`)) return;
    try {
      await removeCompanyTeamMember(session.tokens.accessToken, company.id, member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      toast.success("Miembro retirado correctamente.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "No fue posible retirar el miembro.");
    }
  };
  const changeStatus = async (member: TeamMember, status: "active" | "inactive" | "suspended") => {
    if (!session || !company) return;
    try {
      await updateCompanyTeamMemberStatus(
        session.tokens.accessToken,
        company.id,
        member.id,
        status,
      );
      setMembers((current) =>
        current.map((item) =>
          item.id === member.id ? { ...item, user: { ...item.user, status } } : item,
        ),
      );
      toast.success("Estado actualizado correctamente.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar el estado.",
      );
    }
  };
  return (
    <>
      <PageHeader
        title="Equipo"
        desc="Personas vinculadas a tu empresa."
        actions={
          <Btn onClick={openCreate} disabled={!roles.length}>
            <Plus className="size-4" />
            Nuevo integrante
          </Btn>
        }
      />
      {loading ? <LoadingState label="Cargando equipo real..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && !members.length ? (
        <EmptyState title="No hay miembros vinculados" />
      ) : null}
      {!loading && !error && members.length ? (
        <Table head={["Persona", "Rol asignado", "Estado", "Acciones"]}>
          {members.map((member) => (
            <tr key={member.id}>
              <Td>
                <p className="font-semibold">
                  {member.user.name} {member.user.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </Td>
              <Td>
                <select
                  value={String(member.companyRoles[0]?.id ?? "")}
                  onChange={(event) => void changeRole(member, Number(event.target.value))}
                  className="h-8 w-48 rounded-lg border border-input bg-background px-2 text-xs"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Td>
              <Td>
                <select
                  value={member.user.status}
                  onChange={(event) =>
                    void changeStatus(
                      member,
                      event.target.value as "active" | "inactive" | "suspended",
                    )
                  }
                  className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                  aria-label={`Estado de ${member.user.name}`}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </Td>
              <Td>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => void remove(member)}
                >
                  Retirar
                </Btn>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
      <Modal
        open={creating}
        onClose={() => !saving && setCreating(false)}
        title="Nuevo integrante"
        footer={
          <>
            <Btn variant="outline" onClick={() => setCreating(false)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn onClick={() => void create()} disabled={saving}>
              {saving ? "Creando..." : "Crear integrante"}
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
          <Field label="Apellido">
            <Input
              value={draft.last_name}
              onChange={(event) => setDraft({ ...draft, last_name: event.target.value })}
            />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </Field>
          <Field label="Contraseña temporal">
            <Input
              type="password"
              value={draft.password}
              onChange={(event) => setDraft({ ...draft, password: event.target.value })}
            />
          </Field>
          <Field label="Rol">
            <select
              value={draft.role_id}
              onChange={(event) => setDraft({ ...draft, role_id: event.target.value })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </>
  );
}

function AdminTeamUsers() {
  const { session } = useSession();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!session) return;
    void listAdminCompanies(session.tokens.accessToken)
      .then((items) => {
        setCompanies(items);
        setCompanyId(String(items[0]?.id ?? ""));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No fue posible cargar empresas."));
  }, [session]);
  const loadTeam = useCallback(async () => {
    if (!session || !companyId) return;
    try {
      const id = Number(companyId);
      const [nextMembers, nextRoles] = await Promise.all([
        listAdminCompanyTeam(session.tokens.accessToken, id),
        listAdminCompanyTeamRoles(session.tokens.accessToken, id),
      ]);
      setMembers(nextMembers);
      setRoles(nextRoles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar usuarios.");
    }
  }, [companyId, session]);
  useEffect(() => void loadTeam(), [loadTeam]);
  if (error) return <ErrorState message={error} retry={loadTeam} />;
  return (
    <>
      <PageHeader
        title="Usuarios de empresas"
        desc="Selecciona una empresa para administrar sus usuarios y roles."
      />
      <Card className="mb-4 max-w-md">
        <Field label="Empresa">
          <select
            className="h-10 w-full rounded-lg border border-input bg-background px-3"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </Field>
      </Card>
      {!companyId ? (
        <LoadingState label="Cargando empresas..." />
      ) : (
        <Table head={["Persona", "Roles", "Estado"]}>
          {members.map((member) => (
            <tr key={member.id}>
              <Td>
                <p className="font-semibold">
                  {member.user.name} {member.user.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </Td>
              <Td>{member.companyRoles.map((role) => role.name).join(", ") || "Sin rol"}</Td>
              <Td>
                <Status s={member.user.status} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
      {roles.length ? null : null}
    </>
  );
}

export function TeamUsers({ admin }: { admin?: boolean }) {
  return admin ? <AdminTeamUsers /> : <CompanyTeamUsers />;
}

/* ---------- Liquidaciones PSE ---------- */
function SettlementsDemo() {
  const [tab, setTab] = useState("Órdenes pendientes");
  const orders = [
    { id: "#1042", co: "La Brasa", total: 58000 },
    { id: "#1043", co: "La Brasa", total: 34500 },
    { id: "#990", co: "Mercado Verde", total: 120000 },
    { id: "#1044", co: "La Brasa", total: 21000 },
  ];
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState("");
  const selCo = orders.find((o) => o.id === sel[0])?.co;
  const total = orders.filter((o) => sel.includes(o.id)).reduce((a, o) => a + o.total, 0);
  return (
    <>
      <PageHeader
        title="Liquidaciones PSE"
        desc="Agrupa pagos PSE en soportes de liquidación. El domicilio no se incluye."
        actions={
          <>
            <Btn variant="outline" onClick={() => ok("Listas actualizadas")}>
              <RefreshCw className="size-4" />
              Actualizar
            </Btn>
            {tab === "Órdenes pendientes" && (
              <Btn disabled={!sel.length} onClick={() => setOpen(true)}>
                Facturar ({sel.length})
              </Btn>
            )}
          </>
        }
      />
      <Tabs tabs={["Órdenes pendientes", "Facturadas"]} value={tab} onChange={setTab} />
      {tab === "Órdenes pendientes" ? (
        <Table head={["", "Orden", "Empresa", "Valor liquidable"]}>
          {orders.map((o) => {
            const blocked = !!selCo && selCo !== o.co;
            return (
              <tr key={o.id} className={blocked ? "opacity-40" : ""}>
                <Td>
                  <input
                    type="checkbox"
                    disabled={blocked}
                    checked={sel.includes(o.id)}
                    onChange={(e) =>
                      setSel(e.target.checked ? [...sel, o.id] : sel.filter((s) => s !== o.id))
                    }
                    className="size-4 accent-primary"
                  />
                </Td>
                <Td className="font-semibold">{o.id}</Td>
                <Td>{o.co}</Td>
                <Td>{money(o.total)}</Td>
              </tr>
            );
          })}
        </Table>
      ) : (
        <Table head={["Número", "Empresa", "Órdenes", "Referencia", "Total", "Acciones"]}>
          {[
            ["LIQ-0021", "La Brasa", 12, "PSE-88213", 642000, true],
            ["LIQ-0020", "Mercado Verde", 5, "PSE-88104", 310000, false],
          ].map(([n, co, q, r, t, mail]) => (
            <tr key={n as string}>
              <Td className="font-semibold">{n}</Td>
              <Td>{co}</Td>
              <Td>{q}</Td>
              <Td>{r}</Td>
              <Td>{money(t as number)}</Td>
              <Td>
                <div className="flex gap-1">
                  <Btn size="sm" variant="outline" onClick={() => ok("PDF descargado")}>
                    <Download className="size-3" />
                    PDF
                  </Btn>
                  <Btn
                    size="sm"
                    variant="accent"
                    disabled={!mail}
                    onClick={() => ok("Enviado al correo de la empresa")}
                  >
                    <Send className="size-3" />
                    Enviar a cliente
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmar liquidación"
        footer={
          <>
            <Btn variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Btn>
            <Btn
              disabled={!ref}
              onClick={() => {
                ok("Liquidación creada con su PDF");
                setOpen(false);
                setSel([]);
                setRef("");
              }}
            >
              Confirmar y facturar
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Empresa</p>
            <p className="font-semibold">{selCo}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Órdenes</p>
            <p className="font-semibold">{sel.length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{money(total)}</p>
          </Card>
        </div>
        <Field label="Referencia de pago *">
          <Input value={ref} onChange={(e) => setRef(e.target.value)} />
        </Field>
      </Modal>
    </>
  );
}

/* ---------- Cobertura ---------- */
function CoverageDemo() {
  const [on, setOn] = useState(true);
  const [pts, setPts] = useState([
    [20, 30],
    [70, 18],
    [85, 60],
    [50, 85],
    [15, 65],
  ]);
  return (
    <>
      <PageHeader
        title="Cobertura general"
        desc="Zona geográfica global donde la plataforma acepta pedidos."
        actions={<Btn onClick={() => ok("Cobertura guardada")}>Guardar cobertura</Btn>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4">
          <Toggle on={on} onChange={setOn} label="Activar cobertura global para la vereda" />
          <Field label="Nombre interno">
            <Input defaultValue="Vereda El Carmen" />
          </Field>
          <Field label="Notas">
            <Textarea defaultValue="Incluye casco urbano y vía principal." />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Lat">
              <Input defaultValue="6.2442" />
            </Field>
            <Field label="Lng">
              <Input defaultValue="-75.58" />
            </Field>
            <Field label="Zoom">
              <Input defaultValue="14" />
            </Field>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-3 flex gap-2">
            <Btn
              size="sm"
              variant="outline"
              onClick={() => setPts([...pts, [40 + Math.random() * 20, 40 + Math.random() * 20]])}
            >
              <MapPin className="size-3" />
              Agregar punto
            </Btn>
            <Btn
              size="sm"
              variant="outline"
              disabled={pts.length <= 3}
              onClick={() => setPts(pts.slice(0, -1))}
            >
              <Trash2 className="size-3" />
              Quitar punto
            </Btn>
          </div>
          <svg viewBox="0 0 100 100" className="aspect-video w-full rounded-lg bg-secondary">
            {[...Array(10)].map((_, i) => (
              <line
                key={i}
                x1={i * 10}
                y1="0"
                x2={i * 10}
                y2="100"
                className="stroke-border"
                strokeWidth=".3"
              />
            ))}
            <polygon
              points={pts.map((p) => p.join(",")).join(" ")}
              className={
                on
                  ? "fill-primary/25 stroke-primary"
                  : "fill-muted-foreground/15 stroke-muted-foreground"
              }
              strokeWidth=".8"
            />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.6" className="fill-primary" />
            ))}
          </svg>
          <p className="mt-2 text-xs text-muted-foreground">
            El polígono se conserva aunque la validación esté desactivada.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ---------- Enlaces ---------- */
function AppLinksDemo() {
  return (
    <>
      <PageHeader
        title="Enlaces de la app"
        desc="Enlaces que el cliente ve desde Configuración en la app móvil."
      />
      <Card className="grid max-w-2xl gap-4">
        {[
          "Soporte",
          "Quiero ser una tienda",
          "Política de privacidad",
          "Términos y condiciones",
          "Autorización de datos",
        ].map((l) => (
          <Field key={l} label={l}>
            <Input defaultValue={`https://piddop.com/${l.toLowerCase().split(" ")[0]}`} />
          </Field>
        ))}
        <div>
          <Btn onClick={() => ok("Enlaces guardados")}>Guardar enlaces</Btn>
        </div>
      </Card>
    </>
  );
}

/* ---------- Soporte ---------- */
function SupportDemo() {
  const t = [
    [
      "No llegó mi pedido",
      "El pedido #1031 aparece entregado pero no lo recibí.",
      "Laura M.",
      "24 oct",
      "Abierto",
    ],
    [
      "Cambiar correo",
      "Quiero actualizar el correo de mi cuenta.",
      "Pedro S.",
      "23 oct",
      "En proceso",
    ],
    ["Cobro doble PSE", "Se debitó dos veces el pago.", "Ana R.", "20 oct", "Cerrado"],
  ];
  return (
    <>
      <PageHeader title="Soporte" desc="Solicitudes privadas enviadas desde la app de clientes." />
      <div className="grid gap-4">
        {t.map(([s, d, u, f, st]) => (
          <Card key={s} className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-semibold">{s}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {u} · {f}
              </p>
            </div>
            <Select
              className="w-40"
              defaultValue={st}
              options={["Abierto", "En proceso", "Cerrado"]}
              onChange={(e) => ok(`Ticket: ${e.target.value}`)}
            />
          </Card>
        ))}
      </div>
    </>
  );
}

export function Support() {
  const { session } = useSession();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setTickets(await listAdminSupportTickets(session.tokens.accessToken));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar soporte.");
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  const update = async (ticket: SupportTicket, status: SupportTicket["status"]) => {
    if (!session) return;
    try {
      const updated = await updateAdminSupportTicket(session.tokens.accessToken, ticket.id, status);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? updated : item)));
      toast.success("Estado actualizado.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar el ticket.",
      );
    }
  };
  const labels: Record<SupportTicket["status"], string> = {
    open: "Abierto",
    in_progress: "En proceso",
    closed: "Cerrado",
  };
  return (
    <>
      <PageHeader title="Soporte" desc="Solicitudes privadas enviadas desde la app de clientes." />
      {loading ? <LoadingState label="Cargando solicitudes reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && !tickets.length ? (
        <EmptyState title="No hay solicitudes de soporte." />
      ) : null}
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-semibold">{ticket.subject}</p>
              <p className="text-sm text-muted-foreground">{ticket.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ticket.customer
                  ? `${ticket.customer.name} ${ticket.customer.last_name} · ${ticket.customer.email}`
                  : ticket.contact_phone}{" "}
                ·{" "}
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
                  new Date(ticket.created_at),
                )}
              </p>
            </div>
            <select
              value={ticket.status}
              onChange={(event) =>
                void update(ticket, event.target.value as SupportTicket["status"])
              }
              className="h-10 w-40 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Object.entries(labels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- Clientes ---------- */
function ClientsDemo() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const c = useConfirm();
  const list = [
    {
      id: 1,
      name: "Laura Martínez",
      email: "laura@mail.com",
      status: "active",
      orders: 14,
      appts: 2,
    },
    {
      id: 2,
      name: "Pedro Salas",
      email: "pedro@mail.com",
      status: "inactive",
      orders: 3,
      appts: 0,
    },
    { id: 3, name: "Ana Restrepo", email: "ana@mail.com", status: "active", orders: 0, appts: 5 },
  ].filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Clientes"
        desc="Actividad y acciones extraordinarias sobre cuentas de clientes."
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-3">
        {list.map((x) => (
          <Card key={x.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{x.name}</p>
                <p className="text-xs text-muted-foreground">{x.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Status s={x.status} />
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => setOpen(open === x.id ? null : x.id)}
                >
                  {open === x.id ? "Ocultar" : "Ver detalle"}
                </Btn>
                {x.status !== "active" && (
                  <Btn size="sm" variant="accent" onClick={() => ok("Cliente reactivado")}>
                    Reactivar
                  </Btn>
                )}
              </div>
            </div>
            {open === x.id && (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Direcciones
                  </p>
                  <p className="text-sm">
                    Cra 45 #12-30, Casa
                    <br />
                    Calle 10 #5-22, Oficina
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Resumen
                  </p>
                  <p className="text-sm">
                    {x.orders} pedidos · {x.appts} citas
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Recientes
                  </p>
                  <p className="text-sm">#1042 La Brasa · Cita #311</p>
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-3">
                  <Btn
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      c.ask(
                        "Eliminar datos del cliente",
                        "Acción irreversible. Se eliminará la información personal disponible.",
                        "Eliminar datos",
                        () => ok("Datos eliminados"),
                      )
                    }
                  >
                    Eliminar datos del cliente
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    disabled={!x.orders}
                    onClick={() =>
                      c.ask(
                        "Borrar pedidos",
                        "Se eliminará el historial de pedidos de este cliente.",
                        "Borrar pedidos",
                        () => ok("Pedidos borrados"),
                      )
                    }
                  >
                    Borrar pedidos
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    disabled={!x.appts}
                    onClick={() =>
                      c.ask(
                        "Borrar citas",
                        "Se eliminará el historial de citas de este cliente.",
                        "Borrar citas",
                        () => ok("Citas borradas"),
                      )
                    }
                  >
                    Borrar citas
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      {c.node}
    </>
  );
}

export function Clients() {
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await listAdminCustomers(session.tokens.accessToken, query));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar clientes.");
    } finally {
      setLoading(false);
    }
  }, [query, session]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);
  const activate = async (item: AdminCustomer) => {
    if (!session) return;
    try {
      const updated = await activateAdminCustomer(session.tokens.accessToken, item.id);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      toast.success("Cliente reactivado.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible reactivar el cliente.",
      );
    }
  };
  const action = (item: AdminCustomer, target: "orders" | "appointments" | "erase") =>
    confirm.ask(
      target === "erase"
        ? "Eliminar datos del cliente"
        : `Borrar ${target === "orders" ? "pedidos" : "citas"}`,
      target === "erase"
        ? "Esta acción anonimiza los datos personales y no se puede deshacer."
        : "Solo se eliminarán registros permitidos por el backend.",
      target === "erase" ? "Eliminar datos" : "Confirmar",
      async () => {
        if (!session) return;
        try {
          if (target === "erase") {
            await eraseAdminCustomer(session.tokens.accessToken, item.id);
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          } else {
            await clearAdminCustomer(session.tokens.accessToken, item.id, target);
            await load();
          }
          toast.success("Operación completada.");
        } catch (reason) {
          toast.error(
            reason instanceof Error ? reason.message : "No fue posible completar la operación.",
          );
        }
      },
    );
  return (
    <>
      <PageHeader
        title="Clientes"
        desc="Actividad y acciones extraordinarias sobre cuentas de clientes."
      />
      <div className="mb-4">
        <SearchBox value={query} onChange={setQuery} />
      </div>
      {loading ? <LoadingState label="Cargando clientes reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && !items.length ? (
        <EmptyState title="No hay clientes para este filtro." />
      ) : null}
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {item.name} {item.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{item.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Status s={item.status} />
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                >
                  {open === item.id ? "Ocultar" : "Ver detalle"}
                </Btn>
                {item.status !== "active" ? (
                  <Btn size="sm" variant="accent" onClick={() => void activate(item)}>
                    Reactivar
                  </Btn>
                ) : null}
              </div>
            </div>
            {open === item.id ? (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Direcciones
                  </p>
                  <p className="text-sm">
                    {item.addresses
                      .map((address) =>
                        [address.address_line, address.neighborhood, address.city]
                          .filter(Boolean)
                          .join(", "),
                      )
                      .join(" · ") || "Sin direcciones"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Resumen
                  </p>
                  <p className="text-sm">
                    {item.stats.orders_count} pedidos · {item.stats.appointments_count} citas
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Recientes
                  </p>
                  <p className="text-sm">
                    {[
                      ...item.recent_orders.map((order) => order.order_number),
                      ...item.recent_appointments.map(
                        (appointment) => appointment.appointment_number,
                      ),
                    ].join(" · ") || "Sin actividad"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-3">
                  <Btn size="sm" variant="danger" onClick={() => action(item, "erase")}>
                    Eliminar datos del cliente
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    disabled={!item.stats.orders_count}
                    onClick={() => action(item, "orders")}
                  >
                    Borrar pedidos
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    disabled={!item.stats.appointments_count}
                    onClick={() => action(item, "appointments")}
                  >
                    Borrar citas
                  </Btn>
                </div>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
      {confirm.node}
    </>
  );
}

/* ---------- Categorías ---------- */
function CategoriesDemo() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const c = useConfirm();
  const cats = [
    ["🍔", "Hamburguesas", "Comida", "active"],
    ["🍕", "Pizzas", "Comida", "active"],
    ["💅", "Uñas", "Servicios", "active"],
    ["🥬", "Mercado", "Productos", "inactive"],
    ["💇", "Peluquería", "Servicios", "active"],
    ["☕", "Cafetería", "Comida", "active"],
  ].filter((x) => x.join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Categorías"
        desc="Categorías globales que usan los negocios y la app."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nueva categoría
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map(([i, n, t, s]) => (
          <Card key={n} className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-2xl">
              {i}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{n}</p>
              <div className="mt-1 flex gap-1">
                <Badge>{t}</Badge>
                <Status s={s} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Btn size="sm" variant="outline" onClick={() => setForm(n)}>
                Editar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  c.ask(
                    "¿Eliminar categoría?",
                    "Puede afectar los productos asociados.",
                    "Eliminar",
                    () => ok("Categoría eliminada"),
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
        open={!!form}
        onClose={() => setForm(null)}
        title={form === "new" ? "Nueva categoría" : "Editar categoría"}
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
              {form === "new" ? "Crear categoría" : "Guardar cambios"}
            </Btn>
          </>
        }
      >
        <Field label="Nombre">
          <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
        </Field>
        <Field label="Tipo">
          <Select options={["Comida", "Productos", "Servicios"]} />
        </Field>
        <Field label="Estado">
          <Select options={["Activo", "Inactivo"]} />
        </Field>
        <Field label="Icono (referencia o archivo)">
          <Input type="file" className="py-1.5" />
        </Field>
      </Modal>
      {c.node}
    </>
  );
}

export function Categories() {
  const { session } = useSession();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    type: "food" as AdminCategory["type"],
    status: "active" as AdminCategory["status"],
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const confirm = useConfirm();
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      setItems(await listCategories(session.tokens.accessToken));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar categorías.");
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  const open = (item?: AdminCategory) => {
    setFile(null);
    setPreview(item?.icon ?? null);
    setDraft(
      item
        ? { name: item.name, type: item.type, status: item.status }
        : { name: "", type: "food", status: "active" },
    );
    setEditing(item ?? "new");
  };
  const save = async () => {
    if (!session || !draft.name.trim()) return toast.error("El nombre es obligatorio.");
    try {
      const item = await saveCategory(
        session.tokens.accessToken,
        draft,
        editing === "new" ? undefined : editing?.id,
      );
      if (file) await uploadCategoryIcon(session.tokens.accessToken, item.id, file);
      toast.success("Categoría guardada.");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No fue posible guardar.");
    }
  };
  return (
    <>
      <PageHeader
        title="Categorías"
        desc="Categorías globales que usan los negocios y la app."
        actions={
          <Btn onClick={() => open()}>
            <Plus className="size-4" />
            Nueva categoría
          </Btn>
        }
      />
      {loading ? <LoadingState label="Cargando categorías reales..." /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center gap-4">
            {item.icon ? (
              <img src={item.icon} alt="" className="size-12 rounded-xl object-cover" />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
                —
              </span>
            )}
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <Badge>{item.type}</Badge> <Status s={item.status} />
            </div>
            <div className="flex flex-col gap-1">
              <Btn size="sm" variant="outline" onClick={() => open(item)}>
                Editar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  confirm.ask(
                    "¿Eliminar categoría?",
                    "Puede afectar productos asociados.",
                    "Eliminar",
                    async () => {
                      if (!session) return;
                      try {
                        await removeCategory(session.tokens.accessToken, item.id);
                        await load();
                        toast.success("Categoría eliminada.");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "No se pudo eliminar.");
                      }
                    },
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
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nueva categoría" : "Editar categoría"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()}>Guardar</Btn>
          </>
        }
      >
        <Field label="Nombre">
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </Field>
        <Field label="Tipo">
          <Select
            disabled={editing !== "new"}
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as AdminCategory["type"] })}
            options={["food", "products", "services"]}
          />
        </Field>
        <Field label="Estado">
          <Select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as AdminCategory["status"] })
            }
            options={["active", "inactive"]}
          />
        </Field>
        <Field label="Icono">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
              setPreview(
                selected ? URL.createObjectURL(selected) : editing !== "new" ? editing.icon : null,
              );
            }}
          />
          {preview ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={preview}
                alt="Vista previa del icono"
                className="size-14 rounded-xl border border-border object-cover"
              />
              <span className="text-xs text-muted-foreground">Vista previa del icono.</span>
            </div>
          ) : null}
        </Field>
      </Modal>
      {confirm.node}
    </>
  );
}

/* ---------- Cupones ---------- */
function CouponsDemo() {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const c = useConfirm();
  const list = [
    ["BIENVENIDA20", "20%", "Global", "1 oct – 31 dic", "active"],
    ["BRASA5K", "$5.000", "La Brasa", "15 oct – 15 nov", "active"],
    ["UÑAS10", "10%", "Cat. Uñas", "1 sep – 30 sep", "inactive"],
  ].filter((x) => x[0].includes(q.toUpperCase()));
  return (
    <>
      <PageHeader
        title="Cupones"
        desc="Descuentos globales o acotados."
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nuevo cupón
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map(([code, d, scope, v, s]) => (
          <Card key={code} className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/10" />
            <p className="font-display text-xl font-bold tracking-widest text-primary">{code}</p>
            <p className="mt-1 font-display text-3xl font-bold">{d}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge>{scope}</Badge>
              <Status s={s} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Vigencia: {v}</p>
            <div className="mt-4 flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => setForm(code)}>
                Editar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  c.ask(
                    "¿Eliminar cupón?",
                    "Dejará de estar disponible inmediatamente.",
                    "Eliminar",
                    () => ok("Cupón eliminado"),
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
        title={form === "new" ? "Nuevo cupón" : `Editar ${form}`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Cupón guardado");
                setForm(null);
              }}
            >
              Guardar
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Código">
            <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
          </Field>
          <Field label="Tipo de descuento">
            <Select options={["Porcentual", "Fijo"]} />
          </Field>
          <Field label="Valor">
            <Input type="number" />
          </Field>
          <Field label="Descuento máximo">
            <Input type="number" />
          </Field>
          <Field label="Compra mínima">
            <Input type="number" />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo"]} />
          </Field>
          <Field label="Límite total">
            <Input type="number" />
          </Field>
          <Field label="Límite por usuario">
            <Input type="number" />
          </Field>
          <Field label="Empresa (opcional)">
            <Select options={["Todas", "La Brasa", "Studio Bella"]} />
          </Field>
          <Field label="Categoría (opcional)">
            <Select options={["Todas", "Hamburguesas", "Uñas"]} />
          </Field>
          <Field label="Inicio">
            <Input type="date" />
          </Field>
          <Field label="Expiración">
            <Input type="date" />
          </Field>
        </div>
      </Modal>
      {c.node}
    </>
  );
}

export function Coupons() {
  const { session } = useSession();
  const [items, setItems] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  const [draft, setDraft] = useState({
    code: "",
    discount_type: "percentage" as Coupon["discount_type"],
    discount_value: "",
    status: "active",
  });
  const confirm = useConfirm();
  const load = useCallback(async () => {
    if (session) setItems(await listCoupons(session.tokens.accessToken));
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  const open = (item?: Coupon) => {
    setDraft(
      item
        ? {
            code: item.code,
            discount_type: item.discount_type,
            discount_value: String(item.discount_value),
            status: item.status,
          }
        : { code: "", discount_type: "percentage", discount_value: "", status: "active" },
    );
    setEditing(item ?? "new");
  };
  const save = async () => {
    if (!session || !draft.code || Number(draft.discount_value) <= 0)
      return toast.error("Completa código y descuento.");
    try {
      await saveCoupon(
        session.tokens.accessToken,
        { ...draft, discount_value: Number(draft.discount_value) },
        editing === "new" ? undefined : editing?.id,
      );
      toast.success("Cupón guardado.");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No fue posible guardar.");
    }
  };
  return (
    <>
      <PageHeader
        title="Cupones"
        desc="Descuentos globales o acotados."
        actions={
          <Btn onClick={() => open()}>
            <Plus className="size-4" />
            Nuevo cupón
          </Btn>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <p className="font-display text-xl font-bold tracking-widest text-primary">
              {item.code}
            </p>
            <p className="mt-1 font-display text-3xl font-bold">
              {item.discount_type === "percentage"
                ? `${item.discount_value}%`
                : money(Number(item.discount_value))}
            </p>
            <Status s={item.status} />
            <p className="mt-2 text-xs text-muted-foreground">
              Vigencia: {item.starts_at?.slice(0, 10) || "Sin inicio"} –{" "}
              {item.expires_at?.slice(0, 10) || "Sin fin"}
            </p>
            <div className="mt-4 flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => open(item)}>
                Editar
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  confirm.ask(
                    "¿Eliminar cupón?",
                    "Dejará de estar disponible.",
                    "Eliminar",
                    async () => {
                      if (session) {
                        await deleteCoupon(session.tokens.accessToken, item.id);
                        await load();
                      }
                    },
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
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Nuevo cupón" : "Editar cupón"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Btn>
            <Btn onClick={() => void save()}>Guardar</Btn>
          </>
        }
      >
        <Field label="Código">
          <Input
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="Tipo">
          <Select
            value={draft.discount_type}
            onChange={(e) =>
              setDraft({ ...draft, discount_type: e.target.value as Coupon["discount_type"] })
            }
            options={["percentage", "fixed"]}
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={draft.discount_value}
            onChange={(e) => setDraft({ ...draft, discount_value: e.target.value })}
          />
        </Field>
        <Field label="Estado">
          <Select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            options={["active", "inactive"]}
          />
        </Field>
      </Modal>
      {confirm.node}
    </>
  );
}

/* ---------- Popups / Promociones ---------- */
function PopupsDemo({ banner }: { banner?: boolean }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState<string | null>(null);
  const [action, setAction] = useState("Sin destino");
  const c = useConfirm();
  const noun = banner ? "promoción" : "popup";
  const list = (
    banner
      ? [
          ["Envío gratis el fin de semana", 1, "Negocios"],
          ["Hasta 30% en hamburguesas", 2, "Enlace externo"],
        ]
      : [
          ["¡Bienvenido a Piddop!", 1, "Inicio"],
          ["Agenda tu cita hoy", 2, "Citas"],
        ]
  ).filter((x) => String(x[0]).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title={banner ? "Promociones" : "Popups"}
        desc={
          banner ? "Banners del inicio de la app." : "Ventanas emergentes promocionales de la app."
        }
        actions={
          <Btn onClick={() => setForm("new")}>
            <Plus className="size-4" />
            Nuev{banner ? "a" : "o"} {noun}
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(([t, o, d]) => (
          <Card key={t as string} className="overflow-hidden p-0">
            <div
              className={`flex items-end bg-brand-gradient p-5 text-primary-foreground ${banner ? "h-28" : "h-40"}`}
            >
              <p className="font-display text-xl font-bold">{t}</p>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex gap-1">
                <Badge>Orden {o}</Badge>
                <Badge tone="brand">→ {d}</Badge>
                <Status s="active" />
              </div>
              <div className="flex gap-1">
                <Btn size="sm" variant="outline" onClick={() => setForm(t as string)}>
                  Editar
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    c.ask(`¿Eliminar ${noun}?`, "Se borrará junto con su imagen.", "Eliminar", () =>
                      ok("Eliminado"),
                    )
                  }
                >
                  Eliminar
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
        title={form === "new" ? `Nuev${banner ? "a" : "o"} ${noun}` : `Editar ${noun}`}
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
              Guardar
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título">
            <Input defaultValue={form !== "new" ? (form ?? "") : ""} />
          </Field>
          <Field label="Orden">
            <Input type="number" defaultValue={1} />
          </Field>
          <Field label="Mensaje" className="md:col-span-2">
            <Textarea />
          </Field>
          <Field label="Inicio">
            <Input type="date" />
          </Field>
          <Field label="Fin">
            <Input type="date" />
          </Field>
          <Field label="Estado">
            <Select options={["Activo", "Inactivo"]} />
          </Field>
          <Field label="Imagen">
            <Input type="file" className="py-1.5" />
          </Field>
          <Field label="Acción al tocar">
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              options={["Sin destino", "Sección interna", "Enlace externo"]}
            />
          </Field>
          {action === "Sección interna" && (
            <Field label="Sección">
              <Select
                options={[
                  "Inicio",
                  "Negocios",
                  "Pedidos",
                  "Carrito",
                  "Citas",
                  "Perfil/Configuración",
                ]}
              />
            </Field>
          )}
          {action === "Enlace externo" && (
            <Field label="URL (http/https)">
              <Input placeholder="https://" />
            </Field>
          )}
        </div>
      </Modal>
      {c.node}
    </>
  );
}

export function Popups({ banner }: { banner?: boolean }) {
  const { session } = useSession();
  const kind = banner ? ("promotions" as const) : ("popups" as const);
  const [items, setItems] = useState<Campaign[]>([]);
  const [form, setForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    if (session) setItems(await listCampaigns(session.tokens.accessToken, kind));
  }, [kind, session]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async () => {
    if (!session || !file || !title) return toast.error("Título e imagen son obligatorios.");
    try {
      await createCampaign(
        session.tokens.accessToken,
        kind,
        { title, message, status: "active", display_order: String(items.length + 1) },
        file,
      );
      setForm(false);
      await load();
      toast.success("Guardado correctamente.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No fue posible guardar.");
    }
  };
  return (
    <>
      <PageHeader
        title={banner ? "Promociones" : "Popups"}
        desc="Contenido visual de la aplicación."
        actions={
          <Btn onClick={() => setForm(true)}>
            <Plus className="size-4" />
            Nuevo
          </Btn>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((x) => (
          <Card key={x.id} className="overflow-hidden p-0">
            <img src={x.image_url} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold">{x.title}</p>
              <p>{x.message}</p>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={form}
        onClose={() => setForm(false)}
        title="Nuevo"
        footer={<Btn onClick={() => void save()}>Guardar</Btn>}
      >
        <Field label="Título">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Mensaje">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Field label="Imagen">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
      </Modal>
    </>
  );
}

/* ---------- Domiciliarios ---------- */
function CouriersDemo() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = [
    ["Jhon Mejía", "jhon@piddop.co", "300 111 2233", "Moto", "ABC-12F"],
    ["Sara Cano", "sara@piddop.co", "311 555 9988", "Bicicleta", "BICI-07"],
    ["Diego Ríos", "diego@piddop.co", "320 444 7766", "Moto", "XYZ-98G"],
  ].filter((x) => x.join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Domiciliarios"
        desc="Registra y consulta personal de entrega."
        actions={
          <Btn onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nuevo domiciliario
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map(([n, e, p, v, pl]) => (
          <Card key={n}>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent font-display font-bold text-accent-foreground">
                {n[0]}
              </span>
              <div>
                <p className="font-semibold">{n}</p>
                <p className="text-xs text-muted-foreground">{e}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">{p}</span>
              <Badge tone="brand">
                {v} · {pl}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        wide
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo domiciliario"
        footer={
          <>
            <Btn variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Btn>
            <Btn
              onClick={() => {
                ok("Domiciliario creado");
                setOpen(false);
              }}
            >
              Crear domiciliario
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {["Nombre", "Apellido", "Correo", "Celular"].map((l) => (
            <Field key={l} label={l}>
              <Input />
            </Field>
          ))}
          <Field label="Contraseña">
            <Input type="password" />
          </Field>
          <Field label="Vehículo">
            <Select options={["Moto", "Bicicleta", "Carro", "A pie"]} />
          </Field>
          <Field label="Placa / referencia">
            <Input />
          </Field>
        </div>
      </Modal>
    </>
  );
}

/* ---------- Roles y permisos ---------- */
const perms = [
  "orders",
  "orders.status",
  "products",
  "variants",
  "appointments",
  "appointments.status",
  "services",
  "team",
  "settings",
];
const acts = ["view", "create", "update", "delete", "execute"];
export function Couriers() {
  const { session } = useSession();
  const [items, setItems] = useState<Courier[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    vehicle_type: "motorcycle",
    vehicle_plate: "",
  });
  const load = useCallback(async () => {
    if (session) setItems(await listCouriers(session.tokens.accessToken));
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async () => {
    if (!session) return;
    try {
      await createCourier(session.tokens.accessToken, draft);
      setOpen(false);
      await load();
      toast.success("Domiciliario creado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No fue posible crear.");
    }
  };
  return (
    <>
      <PageHeader
        title="Domiciliarios"
        desc="Equipo de entrega de la plataforma."
        actions={
          <Btn onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nuevo domiciliario
          </Btn>
        }
      />
      <Table head={["Nombre", "Contacto", "Vehículo", "Disponibilidad"]}>
        {items.map((x) => (
          <tr key={x.id}>
            <Td>
              {x.user.name} {x.user.last_name}
            </Td>
            <Td>
              {x.user.email}
              <br />
              {x.user.phone}
            </Td>
            <Td>
              {x.vehicle_type} {x.vehicle_plate || ""}
            </Td>
            <Td>
              <Status s={x.availability_status} />
            </Td>
          </tr>
        ))}
      </Table>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo domiciliario"
        footer={<Btn onClick={() => void save()}>Crear</Btn>}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {(["name", "last_name", "email", "phone", "password", "vehicle_plate"] as const).map(
            (k) => (
              <Field key={k} label={k}>
                <Input
                  type={k === "password" ? "password" : "text"}
                  value={draft[k]}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              </Field>
            ),
          )}
          <Field label="Vehículo">
            <Select
              value={draft.vehicle_type}
              onChange={(e) => setDraft({ ...draft, vehicle_type: e.target.value })}
              options={["bicycle", "motorcycle", "car", "other"]}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}

function RolesPermsDemo() {
  const c = useConfirm();
  const [m, setM] = useState<Record<string, boolean>>({
    "orders.view": true,
    "orders.status.execute": true,
  });
  return (
    <>
      <PageHeader title="Roles y permisos" desc="Roles reutilizables de plataforma o empresa." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="font-semibold">Roles existentes</p>
          {[
            ["OWNER", "Sistema"],
            ["MANAGER", "Sistema"],
            ["COOK", "Sistema"],
            ["CAJERO_NOCTURNO", "Personalizado"],
          ].map(([r, t]) => (
            <div
              key={r}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-semibold">{r}</p>
                <p className="text-xs text-muted-foreground">{t}</p>
              </div>
              <div className="flex gap-1">
                <Btn size="sm" variant="outline" onClick={() => ok(`Rol ${r} cargado`)}>
                  Editar
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    c.ask(
                      "¿Eliminar rol?",
                      "No se pueden eliminar roles del sistema ni en uso.",
                      "Eliminar",
                      () =>
                        t === "Sistema"
                          ? toast.error("Rol del sistema: no se puede eliminar")
                          : ok("Rol eliminado"),
                    )
                  }
                >
                  Eliminar
                </Btn>
              </div>
            </div>
          ))}
        </Card>
        <Card className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre">
              <Input placeholder="CAJERO_NOCTURNO" />
            </Field>
            <Field label="Alcance">
              <Select options={["Empresa", "Plataforma"]} />
            </Field>
            <Field label="Descripción" className="md:col-span-2">
              <Input />
            </Field>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="py-2 text-left">Permiso</th>
                  {acts.map((a) => (
                    <th key={a}>{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p} className="border-t border-border">
                    <td className="py-2 font-mono text-xs">{p}</td>
                    {acts.map((a) => (
                      <td key={a} className="text-center">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={!!m[`${p}.${a}`]}
                          onChange={(e) => setM({ ...m, [`${p}.${a}`]: e.target.checked })}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Btn onClick={() => ok("Rol guardado")}>Guardar</Btn>
        </Card>
      </div>
      {c.node}
    </>
  );
}

export function RolesPerms() {
  const { session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Role | null>(null);
  const confirm = useConfirm();
  const load = useCallback(async () => {
    if (!session) return;
    const [r, p] = await Promise.all([
      listRoles(session.tokens.accessToken),
      listPermissions(session.tokens.accessToken),
    ]);
    setRoles(r);
    setPermissions(p);
    setSelected((x) => (x && r.find((y) => y.id === x.id)) || r[0] || null);
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  const system = new Set([
    "SUPER_ADMIN",
    "CUSTOMER",
    "DELIVERY",
    "COMPANY",
    "OWNER",
    "MANAGER",
    "COOK",
    "PROFESSIONAL",
    "CATALOG_MANAGER",
    "SUPPORT",
  ]);
  return (
    <>
      <PageHeader title="Roles y permisos" desc="Roles reutilizables de plataforma o empresa." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="font-semibold">Roles existentes</p>
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <button onClick={() => setSelected(r)} className="text-left">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {system.has(r.name) ? "Sistema" : "Personalizado"}
                </p>
              </button>
              {!system.has(r.name) ? (
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    confirm.ask(
                      "¿Eliminar rol?",
                      "Esta acción no se puede deshacer.",
                      "Eliminar",
                      async () => {
                        if (session) {
                          await deleteRole(session.tokens.accessToken, r.id);
                          await load();
                        }
                      },
                    )
                  }
                >
                  Eliminar
                </Btn>
              ) : null}
            </div>
          ))}
        </Card>
        <Card className="lg:col-span-2">
          <p className="font-semibold">{selected?.name || "Selecciona un rol"}</p>
          <p className="mb-4 text-sm text-muted-foreground">{selected?.description}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {permissions.map((p) => (
              <label key={p.id} className="flex gap-2 rounded border border-border p-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!selected?.permissions.some((x) => x.id === p.id)}
                  readOnly
                />
                {p.code}
              </label>
            ))}
          </div>
        </Card>
      </div>
      {confirm.node}
    </>
  );
}

/* ---------- Notificaciones (compartido) ---------- */
function NotificationsDemo() {
  const [q, setQ] = useState("");
  const [list, setList] = useState([
    {
      id: 1,
      t: "Nuevo pedido #1045",
      m: "La Brasa recibió un pedido por $42.000",
      type: "pedido",
      read: false,
    },
    {
      id: 2,
      t: "Cita confirmada",
      m: "Ana Restrepo · Manicura 3:00 p.m.",
      type: "cita",
      read: false,
    },
    {
      id: 3,
      t: "Liquidación generada",
      m: "LIQ-0021 lista para descargar",
      type: "pago",
      read: true,
    },
  ]);
  const unread = list.filter((n) => !n.read).length;
  const shown = list.filter((n) => (n.t + n.m + n.type).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Notificaciones"
        desc="Tu buzón personal."
        actions={
          <Btn
            variant="outline"
            disabled={!unread}
            onClick={() => setList(list.map((n) => ({ ...n, read: true })))}
          >
            <Check className="size-4" />
            Marcar todas ({unread})
          </Btn>
        }
      />
      <div className="mb-4">
        <SearchBox value={q} onChange={setQ} />
      </div>
      <div className="grid gap-3">
        {shown.map((n) => (
          <Card
            key={n.id}
            className={`flex items-center justify-between gap-4 ${!n.read ? "border-l-4 border-l-primary" : ""}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{n.t}</p>
                <Badge>{n.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{n.m}</p>
            </div>
            {!n.read && (
              <Btn
                size="sm"
                variant="outline"
                onClick={() => setList(list.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              >
                Marcar leída
              </Btn>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

export function Notifications() {
  const { session } = useSession();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await getUserNotifications(session.tokens.accessToken));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "No fue posible cargar las notificaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  const read = async (item: UserNotification) => {
    if (!session || item.read_at) return;
    try {
      const updated = await markNotificationRead(session.tokens.accessToken, item.id);
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar la notificación.",
      );
    }
  };
  const readAll = async () => {
    if (!session) return;
    try {
      await markAllNotificationsRead(session.tokens.accessToken);
      await load();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "No fue posible actualizar las notificaciones.",
      );
    }
  };
  if (loading) return <LoadingState label="Cargando notificaciones..." />;
  if (error) return <ErrorState message={error} retry={load} />;
  return (
    <>
      <PageHeader
        title="Notificaciones"
        desc="Avisos recibidos por tu cuenta."
        actions={
          <Btn variant="outline" onClick={() => void readAll()}>
            Marcar todas como leídas
          </Btn>
        }
      />
      {!items.length ? (
        <EmptyState
          title="No tienes notificaciones"
          description="Los avisos nuevos aparecerán aquí."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className={item.read_at ? "opacity-70" : "border-primary/40"}>
              <button className="w-full text-left" onClick={() => void read(item)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                  </div>
                  {!item.read_at ? <Badge tone="brand">Nueva</Badge> : null}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("es-CO")}
                </p>
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Medios de pago ---------- */
function PaymentMethodsDemo() {
  const [on, setOn] = useState(true);
  const url = "https://api.piddop.com/webhooks/wompi";
  return (
    <>
      <PageHeader title="Medios de pago" desc="Configuración de PSE con Wompi." />
      <Card className="grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between md:col-span-2">
          <p className="font-display text-lg font-bold">PSE · Wompi</p>
          <Toggle on={on} onChange={setOn} label={on ? "Habilitado" : "Deshabilitado"} />
        </div>
        <Field label="Ambiente">
          <Select options={["Sandbox", "Producción"]} />
        </Field>
        <Field label="URL pública del backend">
          <Input defaultValue="https://api.piddop.com" />
        </Field>
        <Field label="Llave pública">
          <Input defaultValue="pub_test_8sd7f..." />
        </Field>
        <Field label="Llave privada">
          <Input type="password" placeholder="•••• guardada (vacío = conservar)" />
        </Field>
        <Field label="Secreto de eventos">
          <Input type="password" placeholder="•••• guardado" />
        </Field>
        <Field label="Secreto de integridad">
          <Input type="password" placeholder="•••• guardado" />
        </Field>
        <div className="rounded-lg bg-secondary p-3 md:col-span-2">
          <p className="text-xs font-semibold text-secondary-foreground">URL de eventos</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <code className="text-xs">{url}</code>
            <Btn
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(url);
                ok("URL copiada");
              }}
            >
              <Copy className="size-3" />
              Copiar URL
            </Btn>
          </div>
        </div>
        <div>
          <Btn onClick={() => ok("Configuración cifrada y guardada")}>Guardar configuración</Btn>
        </div>
      </Card>
    </>
  );
}

/* ---------- Centro de correos ---------- */
const tpls: Record<string, [string, string]> = {
  Bienvenida: [
    "¡Bienvenido a Piddop, {{name}}!",
    "<h2>Hola {{name}} 👋</h2><p>Tu cuenta está lista. Entra en {{app_url}}</p>",
  ],
  Verificación: ["Tu código: {{code}}", "<h2>Código {{code}}</h2><p>Expira en {{expires_in}}.</p>"],
  Agradecimiento: [
    "Gracias por tu compra #{{order_number}}",
    "<h2>¡Gracias, {{name}}!</h2><p>{{company_name}} recibió tu pedido por {{order_total}}.</p>",
  ],
};
const sample: Record<string, string> = {
  name: "Laura",
  code: "482913",
  expires_in: "10 minutos",
  app_url: "piddop.com",
  order_number: "1045",
  company_name: "La Brasa",
  order_total: "$42.000",
};
function EmailCenterDemo() {
  const [tab, setTab] = useState("Bienvenida");
  const [data, setData] = useState(tpls);
  const [subj, html] = data[tab];
  const render = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => sample[k] ?? "");
  return (
    <>
      <PageHeader
        title="Centro de correos"
        desc="Plantillas transaccionales."
        actions={
          <>
            <Badge tone="active">SMTP/Brevo configurado</Badge>
            <Badge tone="active">Remitente OK</Badge>
          </>
        }
      />
      <Tabs tabs={Object.keys(tpls)} value={tab} onChange={setTab} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Asunto del correo">
            <Input
              value={subj}
              onChange={(e) => setData({ ...data, [tab]: [e.target.value, html] })}
            />
          </Field>
          <Field label="Contenido HTML">
            <Textarea
              rows={8}
              className="font-mono text-xs"
              value={html}
              onChange={(e) => setData({ ...data, [tab]: [subj, e.target.value] })}
            />
          </Field>
          <div className="flex flex-wrap gap-1">
            {Object.keys(sample).map((k) => (
              <Badge key={k}>{`{{${k}}}`}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={() =>
                subj && html
                  ? ok("Plantilla guardada")
                  : toast.error("Asunto y HTML son obligatorios")
              }
            >
              Guardar cambios
            </Btn>
            <Input placeholder="correo@destino.com" className="w-56" />
            <Btn variant="accent" onClick={() => ok("Correo de prueba enviado")}>
              <Send className="size-4" />
              Enviar correo de prueba
            </Btn>
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Vista previa</p>
          <p className="mb-3 font-semibold">{render(subj)}</p>
          <iframe
            title="preview"
            className="h-72 w-full rounded-lg border border-border bg-card"
            srcDoc={`<body style="font-family:sans-serif;padding:16px">${render(html)}</body>`}
          />
        </Card>
      </div>
    </>
  );
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function Settlements() {
  const { session } = useSession();
  const [eligible, setEligible] = useState<EligibleOrder[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reference, setReference] = useState("");
  const [tab, setTab] = useState("Pendientes");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      const [orders, invoices] = await Promise.all([
        listEligibleOrders(session.tokens.accessToken),
        listSettlements(session.tokens.accessToken),
      ]);
      setEligible(orders);
      setSettlements(invoices);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar liquidaciones.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  const companyId = selected.length
    ? eligible.find((order) => order.id === selected[0])?.company.id
    : undefined;
  const total = eligible
    .filter((order) => selected.includes(order.id))
    .reduce((sum, order) => sum + Number(order.total), 0);
  return (
    <>
      <PageHeader
        title="Liquidaciones PSE"
        desc="Agrupa órdenes elegibles de una sola empresa."
        actions={
          <Btn variant="outline" onClick={() => void load()}>
            <RefreshCw className="size-4" />
            Actualizar
          </Btn>
        }
      />
      <Tabs tabs={["Pendientes", "Facturadas"]} value={tab} onChange={setTab} />
      {tab === "Pendientes" ? (
        <>
          <Table head={["", "Orden", "Empresa", "Valor"]}>
            {eligible.map((order) => {
              const blocked = Boolean(companyId && companyId !== order.company.id);
              return (
                <tr key={order.id} className={blocked ? "opacity-40" : ""}>
                  <Td>
                    <input
                      type="checkbox"
                      disabled={blocked}
                      checked={selected.includes(order.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, order.id]
                            : selected.filter((id) => id !== order.id),
                        )
                      }
                    />
                  </Td>
                  <Td>{order.order_number}</Td>
                  <Td>{order.company.name}</Td>
                  <Td>{money(Number(order.total))}</Td>
                </tr>
              );
            })}
          </Table>
          <Card className="mt-4 flex flex-wrap items-end gap-3">
            <Field label="Referencia de pago">
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </Field>
            <p className="pb-2 text-sm">
              {selected.length} órdenes · {money(total)}
            </p>
            <Btn
              disabled={!selected.length || !reference}
              onClick={async () => {
                if (!session) return;
                try {
                  await createSettlement(session.tokens.accessToken, selected, reference);
                  setSelected([]);
                  setReference("");
                  ok("Liquidación creada");
                  await load();
                  setTab("Facturadas");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "No se pudo crear.");
                }
              }}
            >
              Facturar seleccionadas
            </Btn>
          </Card>
        </>
      ) : (
        <Table head={["Número", "Empresa", "Órdenes", "Referencia", "Total", "Acciones"]}>
          {settlements.map((settlement) => (
            <tr key={settlement.id}>
              <Td>{settlement.settlement_number}</Td>
              <Td>{settlement.company.name}</Td>
              <Td>{settlement.order_count}</Td>
              <Td>{settlement.payout_reference ?? "-"}</Td>
              <Td>{money(Number(settlement.amount_payable))}</Td>
              <Td>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!session) return;
                      try {
                        saveBlob(
                          await downloadSettlement(session.tokens.accessToken, settlement.id),
                          `${settlement.settlement_number}.pdf`,
                        );
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "No se pudo descargar.");
                      }
                    }}
                  >
                    <Download className="size-3" />
                    PDF
                  </Btn>
                  <Btn
                    size="sm"
                    variant="accent"
                    onClick={async () => {
                      if (!session) return;
                      try {
                        await sendSettlement(session.tokens.accessToken, settlement.id);
                        ok("Liquidación enviada");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "No se pudo enviar.");
                      }
                    }}
                  >
                    <Send className="size-3" />
                    Enviar
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

export function AppLinks() {
  const { session } = useSession();
  const [links, setLinks] = useState<PlatformLinks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      setLinks(await getPlatformLinks(session.tokens.accessToken));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar los enlaces.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  const fields: Array<[keyof PlatformLinks, string]> = [
    ["support_url", "Soporte"],
    ["become_store_url", "Quiero ser una tienda"],
    ["privacy_policy_url", "Política de privacidad"],
    ["terms_url", "Términos y condiciones"],
    ["data_authorization_url", "Autorización de datos"],
  ];
  if (error) return <ErrorState message={error} retry={load} />;
  if (!links) return <LoadingState label="Cargando enlaces..." />;
  return (
    <>
      <PageHeader
        title="Enlaces de la app"
        desc="Enlaces públicos que la aplicación móvil presenta al cliente."
      />
      <Card className="grid max-w-2xl gap-4">
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <Input
              value={links[key] ?? ""}
              onChange={(e) => setLinks({ ...links, [key]: e.target.value || null })}
            />
          </Field>
        ))}
        <div>
          <Btn
            onClick={async () => {
              if (!session) return;
              try {
                setLinks(await savePlatformLinks(session.tokens.accessToken, links));
                ok("Enlaces guardados");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "No se pudieron guardar.");
              }
            }}
          >
            Guardar enlaces
          </Btn>
        </div>
      </Card>
    </>
  );
}

export function Coverage() {
  const { session } = useSession();
  const [coverage, setCoverage] = useState<PlatformCoverage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      setCoverage(await getPlatformCoverage(session.tokens.accessToken));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar cobertura.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!coverage) return <LoadingState label="Cargando cobertura..." />;
  const updatePoint = (index: number, field: "latitude" | "longitude", value: string) =>
    setCoverage({
      ...coverage,
      polygon: coverage.polygon.map((point, i) =>
        i === index ? { ...point, [field]: Number(value) } : point,
      ),
    });
  const mapsKey = getGoogleMapsApiKey();
  const center = coverage.center ??
    coverage.polygon[0] ?? { latitude: 6.2442, longitude: -75.5812 };
  return (
    <>
      <PageHeader
        title="Cobertura general"
        desc="Zona geográfica global de la plataforma."
        actions={
          <Btn
            onClick={async () => {
              if (!session) return;
              try {
                setCoverage(await savePlatformCoverage(session.tokens.accessToken, coverage));
                ok("Cobertura guardada");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
              }
            }}
          >
            Guardar cobertura
          </Btn>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <Toggle
            on={coverage.enabled}
            onChange={(enabled) => setCoverage({ ...coverage, enabled })}
            label="Activar cobertura global"
          />
          <Field label="Nombre interno">
            <Input
              value={coverage.label ?? ""}
              onChange={(e) => setCoverage({ ...coverage, label: e.target.value })}
            />
          </Field>
          <Field label="Notas">
            <Textarea
              value={coverage.notes ?? ""}
              onChange={(e) => setCoverage({ ...coverage, notes: e.target.value })}
            />
          </Field>
          <Field label="Zoom">
            <Input
              type="number"
              value={coverage.zoom}
              onChange={(e) => setCoverage({ ...coverage, zoom: Number(e.target.value) })}
            />
          </Field>
        </Card>
        <Card>
          <div className="mb-3 flex justify-between">
            <p className="font-semibold">Polígono</p>
            <Btn
              size="sm"
              variant="outline"
              onClick={() =>
                setCoverage({
                  ...coverage,
                  polygon: [
                    ...coverage.polygon,
                    coverage.center ?? { latitude: 6.2442, longitude: -75.5812 },
                  ],
                })
              }
            >
              Agregar punto
            </Btn>
          </div>
          <div className="space-y-2">
            {coverage.polygon.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  aria-label={`Latitud ${index + 1}`}
                  type="number"
                  value={point.latitude}
                  onChange={(e) => updatePoint(index, "latitude", e.target.value)}
                />
                <Input
                  aria-label={`Longitud ${index + 1}`}
                  type="number"
                  value={point.longitude}
                  onChange={(e) => updatePoint(index, "longitude", e.target.value)}
                />
                <Btn
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    setCoverage({
                      ...coverage,
                      polygon: coverage.polygon.filter((_, i) => i !== index),
                    })
                  }
                >
                  Quitar
                </Btn>
              </div>
            ))}
          </div>
          {mapsKey ? (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                Haz clic para agregar puntos; arrastra los vértices para ajustar la zona.
              </p>
              <CoveragePolygonMap
                apiKey={mapsKey}
                center={center}
                zoom={coverage.zoom}
                polygon={coverage.polygon}
                onChange={(polygon) =>
                  setCoverage((current) => (current ? { ...current, polygon } : current))
                }
              />
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Configura VITE_GOOGLE_MAPS_API_KEY para editar la cobertura directamente en el mapa.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}

export function PaymentMethods() {
  const { session } = useSession();
  const [settings, setSettings] = useState<
    (WompiSettings & Record<string, string | boolean>) | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      setSettings(await getWompiSettings(session.tokens.accessToken));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar Wompi.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!settings) return <LoadingState label="Cargando Wompi..." />;
  const secret = (key: string, label: string) => (
    <Field label={label}>
      <Input
        type="password"
        value={String(settings[key] ?? "")}
        placeholder="Vacío = conservar secreto actual"
        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
      />
    </Field>
  );
  return (
    <>
      <PageHeader title="Medios de pago" desc="Configuración segura de PSE mediante Wompi." />
      <Card className="grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between md:col-span-2">
          <p className="font-display text-lg font-bold">PSE · Wompi</p>
          <Toggle
            on={Boolean(settings.enabled)}
            onChange={(enabled) => setSettings({ ...settings, enabled })}
            label={settings.enabled ? "Habilitado" : "Deshabilitado"}
          />
        </div>
        <Field label="Ambiente">
          <select
            className="h-10 w-full rounded-lg border border-input bg-background px-3"
            value={settings.environment}
            onChange={(e) =>
              setSettings({
                ...settings,
                environment: e.target.value as WompiSettings["environment"],
              })
            }
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Producción</option>
          </select>
        </Field>
        <Field label="URL pública del backend">
          <Input
            value={settings.public_base_url}
            onChange={(e) => setSettings({ ...settings, public_base_url: e.target.value })}
          />
        </Field>
        <Field label="Llave pública">
          <Input
            value={settings.public_key}
            onChange={(e) => setSettings({ ...settings, public_key: e.target.value })}
          />
        </Field>
        {secret("private_key", "Llave privada")}
        {secret("events_secret", "Secreto de eventos")}
        {secret("integrity_secret", "Secreto de integridad")}
        <div className="md:col-span-2">
          <Btn
            onClick={async () => {
              if (!session) return;
              try {
                setSettings(await saveWompiSettings(session.tokens.accessToken, settings));
                ok("Configuración de Wompi guardada");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
              }
            }}
          >
            Guardar configuración
          </Btn>
        </div>
      </Card>
    </>
  );
}

export function EmailCenter() {
  const { session } = useSession();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      const data = await listEmailTemplates(session.tokens.accessToken);
      setTemplates(data.templates);
      setSelected((current) => current || data.templates[0]?.key || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar plantillas.");
    }
  }, [session]);
  useEffect(() => void load(), [load]);
  const current = templates.find((template) => template.key === selected);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!current) return <LoadingState label="Cargando plantillas..." />;
  const replace = (patch: Partial<EmailTemplate>) =>
    setTemplates((items) =>
      items.map((template) =>
        template.key === current.key ? { ...template, ...patch } : template,
      ),
    );
  return (
    <>
      <PageHeader title="Centro de correos" desc="Plantillas transaccionales y correo de prueba." />
      <Tabs
        tabs={templates.map((template) => template.key)}
        value={selected}
        onChange={setSelected}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Asunto">
            <Input value={current.subject} onChange={(e) => replace({ subject: e.target.value })} />
          </Field>
          <Field label="Contenido HTML">
            <Textarea
              rows={10}
              className="font-mono text-xs"
              value={current.html}
              onChange={(e) => replace({ html: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Btn
              onClick={async () => {
                if (!session) return;
                try {
                  const saved = await saveEmailTemplate(
                    session.tokens.accessToken,
                    current.key,
                    current,
                  );
                  replace(saved);
                  ok("Plantilla guardada");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
                }
              }}
            >
              Guardar cambios
            </Btn>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="correo@destino.com"
              className="w-56"
            />
            <Btn
              variant="accent"
              onClick={async () => {
                if (!session || !email) return toast.error("Ingresa un correo de destino.");
                try {
                  await testEmailTemplate(session.tokens.accessToken, current.key, email);
                  ok("Correo de prueba enviado");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "No se pudo enviar.");
                }
              }}
            >
              Enviar prueba
            </Btn>
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Vista previa</p>
          <p className="mb-3 font-semibold">{current.subject}</p>
          <iframe
            title="Vista previa de correo"
            className="h-80 w-full rounded-lg border border-border bg-card"
            srcDoc={current.html}
          />
        </Card>
      </div>
    </>
  );
}
