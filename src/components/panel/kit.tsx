import {
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { Search, Star, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnVariant = "primary" | "outline" | "ghost" | "accent" | "danger";
const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-105 shadow-glow",
  accent: "bg-accent text-accent-foreground hover:brightness-105",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:brightness-110",
};

export function Btn({
  variant = "primary",
  size = "md",
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        btnStyles[variant],
        className,
      )}
    />
  );
}

const tones = {
  active: "bg-success/15 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-foreground",
  suspended: "bg-destructive/15 text-destructive",
  info: "bg-accent/20 text-secondary-foreground",
  brand: "bg-primary/15 text-primary",
} as const;
export type Tone = keyof typeof tones;

export function Badge({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

const statusMap: Record<string, [Tone, string]> = {
  active: ["active", "Activo"],
  inactive: ["inactive", "Inactivo"],
  pending: ["pending", "Pendiente"],
  suspended: ["suspended", "Suspendido"],
  accepted: ["info", "Aceptado"],
  preparing: ["brand", "Preparando"],
  ready: ["active", "Listo envío"],
  delivered: ["inactive", "Entregado"],
  cancelled: ["suspended", "Rechazado"],
  completed: ["active", "Completada"],
  open: ["pending", "Abierto"],
  progress: ["info", "En proceso"],
  closed: ["inactive", "Cerrado"],
};
export function Status({ s }: { s: string }) {
  const [t, l] = statusMap[s] ?? ["info", s];
  return <Badge tone={t}>{l}</Badge>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className={cn(accent && "border-transparent bg-brand-gradient text-primary-foreground")}>
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wider",
          accent ? "opacity-85" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {hint && (
        <p className={cn("mt-1 text-xs", accent ? "opacity-85" : "text-muted-foreground")}>
          {hint}
        </p>
      )}
    </Card>
  );
}

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Buscar...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(inputCls, p.className)} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...p} className={cn(inputCls, "h-auto py-2", p.className)} />;
}
export function Select({
  options,
  ...p
}: SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <select {...p} className={cn(inputCls, p.className)}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-2 text-sm"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          on ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-card shadow transition",
            on ? "left-5.5" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= n ? "fill-primary text-primary" : "text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] w-full overflow-auto rounded-2xl border border-border bg-card shadow-card animate-in zoom-in-95",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    msg: string;
    label: string;
    run: () => void;
  } | null>(null);
  const ask = (title: string, msg: string, label: string, run: () => void) =>
    setState({ title, msg, label, run });
  const node = (
    <Modal
      open={!!state}
      onClose={() => setState(null)}
      title={state?.title ?? ""}
      footer={
        <>
          <Btn variant="outline" onClick={() => setState(null)}>
            Cancelar
          </Btn>
          <Btn
            variant="danger"
            onClick={() => {
              state?.run();
              setState(null);
            }}
          >
            {state?.label}
          </Btn>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle className="size-6 shrink-0 text-destructive" />
        <p className="text-sm text-muted-foreground">{state?.msg}</p>
      </div>
    </Modal>
  );
  return { ask, node };
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>
);

export function Pager({
  total,
  page: controlledPage,
  totalPages: controlledTotalPages,
  onPageChange,
}: {
  total: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const [p, setP] = useState(1);
  const page = controlledPage ?? p;
  const totalPages = controlledTotalPages ?? 3;
  const change = (next: number) => (onPageChange ? onPageChange(next) : setP(next));
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total} registros · página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Btn size="sm" variant="outline" disabled={page === 1} onClick={() => change(page - 1)}>
          Anterior
        </Btn>
        <Btn
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => change(page + 1)}
        >
          Siguiente
        </Btn>
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition",
            value === t ? "bg-card shadow-card text-foreground" : "text-muted-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export const money = (n: number) => "$" + n.toLocaleString("es-CO");
