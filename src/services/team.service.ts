import { httpRequest } from "@/services/http";

export type TeamMember = {
  id: number;
  role: string;
  user: { name: string; last_name: string; email: string; status: string };
  companyRoles: Array<{ id: number; name: string }>;
};
export type TeamRole = { id: number; name: string };
export type TeamMemberPayload = {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role_ids: number[];
};
export async function listCompanyTeam(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ members: TeamMember[] }>({
        accessToken,
        companyId,
        path: "/company/team?page=1&page_size=50",
      })
    ).data.members ?? []
  );
}

/** Team data for a platform administrator. The admin endpoint authorizes the
 * Super Admin role directly, rather than requiring membership in the company. */
export async function listAdminCompanyTeam(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ members: TeamMember[] }>({
        accessToken,
        path: `/admin/companies/${companyId}/team?page=1&page_size=50`,
      })
    ).data.members ?? []
  );
}
export async function listCompanyTeamRoles(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ roles: TeamRole[] }>({
        accessToken,
        companyId,
        path: "/company/team/roles",
      })
    ).data.roles ?? []
  );
}

export async function listAdminCompanyTeamRoles(accessToken: string, companyId: number) {
  return (
    (
      await httpRequest<{ roles: TeamRole[] }>({
        accessToken,
        path: `/admin/companies/${companyId}/team/roles`,
      })
    ).data.roles ?? []
  );
}
export async function updateCompanyTeamRoles(
  accessToken: string,
  companyId: number,
  memberId: number,
  roleIds: number[],
) {
  await httpRequest({
    accessToken,
    companyId,
    body: { role_ids: roleIds },
    method: "PUT",
    path: `/company/team/${memberId}/roles`,
  });
}
export async function updateCompanyTeamMemberStatus(
  accessToken: string,
  companyId: number,
  memberId: number,
  status: "active" | "inactive" | "suspended",
) {
  await httpRequest({
    accessToken,
    companyId,
    body: { status },
    method: "PUT",
    path: `/company/team/${memberId}`,
  });
}
export async function createCompanyTeamMember(
  accessToken: string,
  companyId: number,
  payload: TeamMemberPayload,
) {
  return (
    await httpRequest<{ company_user_id: number }>({
      accessToken,
      companyId,
      body: payload,
      method: "POST",
      path: "/company/team",
    })
  ).data;
}
export async function removeCompanyTeamMember(
  accessToken: string,
  companyId: number,
  memberId: number,
) {
  await httpRequest<null>({
    accessToken,
    companyId,
    method: "DELETE",
    path: `/company/team/${memberId}`,
  });
}
