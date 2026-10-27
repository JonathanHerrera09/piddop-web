import { describe, expect, it } from "vitest";
import { defaultModule, navigationFor } from "@/lib/navigation";
import type { UserCompanyMembership, WebSession } from "@/types/auth";

const company: UserCompanyMembership = {
  company_user_id: 1,
  primary_role: "COOK",
  company: { id: 10, name: "La Brasa", type: "food", logo: null, status: "active" },
  roles: [
    {
      id: 1,
      name: "COOK",
      scope: "company",
      permissions: [
        { id: 1, code: "orders", name: "Pedidos", module: "orders", view_permission: true },
      ],
    },
  ],
};

function session(role = "COMPANY"): WebSession {
  return {
    user: {
      id: 1,
      name: "Ana",
      last_name: "Pérez",
      email: "ana@piddop.co",
      phone: "300",
      profile_image: null,
      status: "active",
      role: { id: 1, name: role, scope: "platform" },
    },
    tokens: { accessToken: "access", refreshToken: "refresh" },
    companies: [company],
    activeCompanyId: 10,
  };
}

describe("navigationFor", () => {
  it("shows a Super Admin all platform modules", () => {
    expect(navigationFor(session("SUPER_ADMIN"), null)).toHaveLength(18);
  });

  it("limits a cook to permitted operational modules and notifications", () => {
    expect(navigationFor(session(), company).map((item) => item.key)).toEqual([
      "rat",
      "ord",
      "not",
    ]);
    expect(defaultModule(session(), company)).toBe("ord");
  });

  it("only exposes commissions to owner or manager", () => {
    const owner = { ...company, primary_role: "OWNER" };
    expect(navigationFor(session(), owner).some((item) => item.key === "com")).toBe(true);
  });
});
