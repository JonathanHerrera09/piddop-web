import { httpRequest } from "@/services/http";

export type MonitoredOperation = { id: number; kind: "order" | "appointment"; reference: string; status: string; waiting_minutes: number; threshold_minutes: number; is_alert: boolean; updated_at: string; scheduled_date: string | null; start_time: string | null; customer: { name: string; phone: string | null } | null; company: { id: number; name: string; type: string; phone: string | null; email: string | null } | null; service: string | null; };
export type OperationsMonitoring = { operations: MonitoredOperation[]; summary: { active: number; alerts: number; orders: number; appointments: number } };
export async function getAdminOperations(accessToken: string) { return (await httpRequest<OperationsMonitoring>({ accessToken, path: "/admin/operations" })).data; }
