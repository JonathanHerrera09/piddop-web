import { httpRequest } from "@/services/http";
export type Courier = {
  id: number;
  vehicle_type: string;
  vehicle_plate: string | null;
  availability_status: string;
  user: { name: string; last_name: string; email: string; phone: string; status: string };
};
export async function listCouriers(accessToken: string) {
  return (
    await httpRequest<{ drivers: Courier[] }>({
      accessToken,
      path: "/admin/delivery-drivers?page=1&page_size=100",
    })
  ).data.drivers;
}
export async function createCourier(accessToken: string, body: Record<string, string>) {
  await httpRequest({ accessToken, body, method: "POST", path: "/admin/delivery-drivers" });
}
