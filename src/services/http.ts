import { ApiEnvelope } from '@/types/api';

interface RequestOptions {
  accessToken?: string;
  body?: Record<string, unknown>;
  formData?: FormData;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  retryAfterRefresh?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
if (!configuredApiUrl && import.meta.env.MODE !== 'test') {
  throw new Error('VITE_API_URL no está configurada.');
}
export const API_URL = configuredApiUrl || '';
let sessionRefresher: ((accessToken: string) => Promise<string | null>) | null = null;
let refreshInFlight: Promise<string | null> | null = null;
export function registerSessionRefresher(refresher: (accessToken: string) => Promise<string | null>) { sessionRefresher = refresher; }

export async function httpRequest<T>({
  accessToken,
  body,
  formData,
  headers,
  method = 'GET',
  path,
  retryAfterRefresh = true
}: RequestOptions): Promise<ApiEnvelope<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
        ...(formData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: formData ?? (body ? JSON.stringify(body) : undefined)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(`No se pudo conectar con la API. Detalle: ${message}`, 0);
  }

  if (response.status === 204 || response.status === 205) {
    return { success: true, message: 'Request completed successfully', data: null as T };
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    if (response.status === 401 && accessToken && retryAfterRefresh && sessionRefresher && !path.startsWith('/auth/')) {
      refreshInFlight ||= sessionRefresher(accessToken).finally(() => { refreshInFlight = null; });
      const refreshedToken = await refreshInFlight;
      if (refreshedToken) return httpRequest<T>({ accessToken: refreshedToken, body, formData, headers, method, path, retryAfterRefresh: false });
    }
    throw new ApiError(payload?.message || 'No pudimos completar la solicitud.', response.status);
  }

  if (!payload) {
    throw new ApiError('La API no devolvio una respuesta valida.', 500);
  }

  return payload;
}

export async function httpDownload({ accessToken, path, retryAfterRefresh = true }: Pick<RequestOptions, 'accessToken' | 'path' | 'retryAfterRefresh'>): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/pdf', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
  } catch (error) {
    throw new ApiError(`No se pudo descargar el documento. Detalle: ${error instanceof Error ? error.message : 'Error de red'}`, 0);
  }
  if (response.status === 401 && accessToken && retryAfterRefresh && sessionRefresher) {
    refreshInFlight ||= sessionRefresher(accessToken).finally(() => { refreshInFlight = null; });
    const refreshedToken = await refreshInFlight;
    if (refreshedToken) return httpDownload({ accessToken: refreshedToken, path, retryAfterRefresh: false });
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new ApiError(payload?.message || 'No pudimos descargar la liquidación.', response.status);
  }
  return response.blob();
}
