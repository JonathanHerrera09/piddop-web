import { httpRequest } from "@/services/http";
export type Permission = { id: number; code: string; module: string };
export type Role = {
  id: number;
  name: string;
  scope: "platform" | "company";
  description: string | null;
  permissions: Permission[];
};
export async function listRoles(token: string) {
  return (
    await httpRequest<{ roles: Role[] }>({
      accessToken: token,
      path: "/admin/roles?page=1&page_size=100",
    })
  ).data.roles;
}
export async function listPermissions(token: string) {
  return (
    await httpRequest<{ permissions: Permission[] }>({
      accessToken: token,
      path: "/admin/permissions",
    })
  ).data.permissions;
}
export async function deleteRole(token: string, id: number) {
  await httpRequest({ accessToken: token, method: "DELETE", path: `/admin/roles/${id}` });
}
