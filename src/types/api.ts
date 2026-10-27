export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[] | string>;
}

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
