import { getApiUrl } from "@/lib/env";
import type { ApiEnvelope, ApiErrorPayload, ApiMethod } from "@/types/api";

export type RequestOptions = {
  accessToken?: string;
  body?: unknown;
  companyId?: number | null;
  formData?: FormData;
  headers?: Record<string, string>;
  method?: ApiMethod;
  path: string;
  retryAfterRefresh?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string[] | string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type SessionRefresher = (accessToken: string) => Promise<string | null>;
let sessionRefresher: SessionRefresher | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function registerSessionRefresher(refresher: SessionRefresher) {
  sessionRefresher = refresher;
}

function apiPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

async function parsePayload<T>(response: Response) {
  return (await response.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorPayload | null;
}

async function refreshedToken(accessToken: string) {
  if (!sessionRefresher) return null;
  refreshInFlight ??= sessionRefresher(accessToken).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function httpRequest<T>({
  accessToken,
  body,
  companyId,
  formData,
  headers,
  method = "GET",
  path,
  retryAfterRefresh = true,
}: RequestOptions): Promise<ApiEnvelope<T>> {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${apiPath(path)}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(formData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(companyId ? { "X-Company-Id": String(companyId) } : {}),
        ...headers,
      },
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error de red";
    throw new ApiError(`No se pudo conectar con la API. Detalle: ${detail}`, 0);
  }

  if (response.status === 204 || response.status === 205) {
    return { success: true, message: "Solicitud completada.", data: null as T };
  }

  const payload = await parsePayload<T>(response);
  if (!response.ok) {
    if (
      response.status === 401 &&
      accessToken &&
      retryAfterRefresh &&
      !apiPath(path).startsWith("/auth/")
    ) {
      const token = await refreshedToken(accessToken);
      if (token) {
        return httpRequest<T>({
          accessToken: token,
          body,
          companyId,
          formData,
          headers,
          method,
          path,
          retryAfterRefresh: false,
        });
      }
    }
    const errorPayload = payload as ApiErrorPayload | null;
    throw new ApiError(
      errorPayload?.message || "No pudimos completar la solicitud.",
      response.status,
      errorPayload?.errors,
    );
  }

  if (!payload || !("data" in payload)) {
    throw new ApiError("La API no devolvió una respuesta válida.", 500);
  }
  return payload as ApiEnvelope<T>;
}

export async function httpDownload({
  accessToken,
  companyId,
  path,
  retryAfterRefresh = true,
}: Pick<
  RequestOptions,
  "accessToken" | "companyId" | "path" | "retryAfterRefresh"
>): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${apiPath(path)}`, {
      headers: {
        Accept: "application/pdf",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(companyId ? { "X-Company-Id": String(companyId) } : {}),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error de red";
    throw new ApiError(`No se pudo descargar el documento. Detalle: ${detail}`, 0);
  }

  if (response.status === 401 && accessToken && retryAfterRefresh) {
    const token = await refreshedToken(accessToken);
    if (token)
      return httpDownload({ accessToken: token, companyId, path, retryAfterRefresh: false });
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new ApiError(
      payload?.message || "No pudimos descargar el documento.",
      response.status,
      payload?.errors,
    );
  }
  return response.blob();
}
