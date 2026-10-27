import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiUrl } from "@/lib/env";
import { ApiError, httpRequest } from "@/services/http";

describe("httpRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("explains how to configure a missing API URL", () => {
    vi.stubEnv("VITE_API_URL", "");

    expect(getApiUrl).toThrow("VITE_API_URL no está configurada");
  });

  it("sends the session and active company headers", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.piddop.test/api/v1/");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, message: "ok", data: { id: 7 } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      httpRequest<{ id: number }>({ accessToken: "token", companyId: 14, path: "company/orders" }),
    ).resolves.toMatchObject({ data: { id: 7 } });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.piddop.test/api/v1/company/orders",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token", "X-Company-Id": "14" }),
      }),
    );
  });

  it("turns API errors into ApiError with its status", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.piddop.test/api/v1");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: "No autorizado" }), { status: 403 }),
        ),
    );

    await expect(httpRequest({ path: "/admin/companies" })).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: "ApiError",
        status: 403,
        message: "No autorizado",
      }),
    );
  });
});
