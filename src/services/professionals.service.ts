import { httpRequest } from "@/services/http";
import { getApiUrl } from "@/lib/env";

export type ProfessionalSchedule = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: "active" | "inactive";
};

export type Professional = {
  id: number;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  description: string | null;
  status: "active" | "inactive";
  schedules?: ProfessionalSchedule[];
};

export type ProfessionalPayload = Omit<Professional, "id" | "photo" | "schedules">;

function normalizeProfessional(professional: Professional): Professional {
  if (!professional.photo || /^https?:\/\//i.test(professional.photo)) return professional;
  const origin = new URL(getApiUrl()).origin;
  return { ...professional, photo: new URL(professional.photo, origin).toString() };
}

export async function listCompanyProfessionals(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ professionals: Professional[] }>({
        accessToken,
        companyId,
        path: "/company/professionals?page=1&page_size=50",
      })
    ).data.professionals?.map(normalizeProfessional) ?? []
  );
}

export async function createCompanyProfessional(
  accessToken: string,
  companyId: number,
  payload: ProfessionalPayload,
) {
  const response = await httpRequest<{ professional: Professional }>({
    accessToken,
    companyId,
    body: payload,
    method: "POST",
    path: "/company/professionals",
  });
  return normalizeProfessional(response.data.professional);
}

export async function updateCompanyProfessional(
  accessToken: string,
  companyId: number,
  professionalId: number,
  payload: ProfessionalPayload,
) {
  const response = await httpRequest<{ professional: Professional }>({
    accessToken,
    companyId,
    body: payload,
    method: "PUT",
    path: `/company/professionals/${professionalId}`,
  });
  return normalizeProfessional(response.data.professional);
}

export async function uploadCompanyProfessionalPhoto(
  accessToken: string,
  companyId: number,
  professionalId: number,
  image: File,
) {
  const formData = new FormData();
  formData.set("image", image);
  const response = await httpRequest<{ professional: Professional }>({
    accessToken,
    companyId,
    formData,
    method: "POST",
    path: `/company/professionals/${professionalId}/photo`,
  });
  return normalizeProfessional(response.data.professional);
}

export async function deleteCompanyProfessional(
  accessToken: string,
  companyId: number,
  professionalId: number,
) {
  await httpRequest<null>({
    accessToken,
    companyId,
    method: "DELETE",
    path: `/company/professionals/${professionalId}`,
  });
}

export type SchedulePayload = Pick<
  ProfessionalSchedule,
  "day_of_week" | "start_time" | "end_time" | "status"
>;

export async function listProfessionalSchedules(
  accessToken: string,
  companyId: number,
  professionalId: number,
) {
  return (
    (
      await httpRequest<{ schedules: ProfessionalSchedule[] }>({
        accessToken,
        companyId,
        path: `/company/professionals/${professionalId}/schedules`,
      })
    ).data.schedules ?? []
  );
}

export async function saveProfessionalSchedule(
  accessToken: string,
  companyId: number,
  professionalId: number,
  scheduleId: number | null,
  payload: SchedulePayload,
) {
  return (
    await httpRequest<{ schedule: ProfessionalSchedule }>({
      accessToken,
      companyId,
      body: payload,
      method: scheduleId ? "PUT" : "POST",
      path: scheduleId
        ? `/company/professionals/${professionalId}/schedules/${scheduleId}`
        : `/company/professionals/${professionalId}/schedules`,
    })
  ).data.schedule;
}

export async function deleteProfessionalSchedule(
  accessToken: string,
  companyId: number,
  professionalId: number,
  scheduleId: number,
) {
  await httpRequest<null>({
    accessToken,
    companyId,
    method: "DELETE",
    path: `/company/professionals/${professionalId}/schedules/${scheduleId}`,
  });
}
