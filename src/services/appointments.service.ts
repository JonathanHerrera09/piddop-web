import { httpRequest } from "@/services/http";

export type Appointment = {
  id: number;
  appointment_number: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  price: number | string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  customer_notes: string | null;
  customer: { name: string; last_name: string; phone?: string | null } | null;
  service: { name: string; duration_minutes: number } | null;
  professional: { name: string } | null;
};

export async function listCompanyAppointments(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ appointments: Appointment[] }>({
        accessToken,
        companyId,
        path: "/company/appointments?page=1&page_size=50",
      })
    ).data.appointments ?? []
  );
}

export async function updateCompanyAppointmentStatus(
  accessToken: string,
  companyId: number,
  appointmentId: number,
  status: "accepted" | "completed",
) {
  return (
    await httpRequest<{ appointment: Appointment }>({
      accessToken,
      companyId,
      body: { status },
      method: "PUT",
      path: `/company/appointments/${appointmentId}/status`,
    })
  ).data.appointment;
}
