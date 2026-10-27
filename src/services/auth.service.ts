import { ApiError, httpRequest, registerSessionRefresher } from "@/services/http";
import type {
  AuthUser,
  LoginResponseData,
  UserCompanyMembership,
  WebSession,
  WebTokens,
} from "@/types/auth";

const STORAGE_KEY = "piddop.web.session";

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function mapTokens(tokens: LoginResponseData["tokens"]): WebTokens {
  return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token };
}

function readSession(): WebSession | null {
  const storage = browserStorage();
  const raw = storage?.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebSession;
  } catch {
    storage?.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSession(session: WebSession) {
  browserStorage()?.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function updateStoredSession(session: WebSession) {
  saveSession(session);
}

export function clearStoredSession() {
  browserStorage()?.removeItem(STORAGE_KEY);
}

function assertWebAccess(user: AuthUser) {
  if (user.role?.name === "SUPER_ADMIN" || user.role?.name === "COMPANY") return;
  throw new ApiError("Esta web solo permite acceso a Super Admin y usuarios de empresa.", 403);
}

async function fetchCurrentUser(accessToken: string) {
  const response = await httpRequest<AuthUser>({ accessToken, path: "/auth/me" });
  return response.data;
}

async function fetchCompanies(accessToken: string) {
  const response = await httpRequest<{ companies: UserCompanyMembership[] }>({
    accessToken,
    path: "/users/me/companies",
  });
  return response.data.companies;
}

registerSessionRefresher(async (requestedToken) => {
  const stored = readSession();
  if (!stored?.tokens.refreshToken) return null;
  if (stored.tokens.accessToken !== requestedToken) return stored.tokens.accessToken;
  try {
    const response = await httpRequest<{ tokens: LoginResponseData["tokens"] }>({
      body: { refresh_token: stored.tokens.refreshToken },
      method: "POST",
      path: "/auth/refresh",
      retryAfterRefresh: false,
    });
    const next = { ...stored, tokens: mapTokens(response.data.tokens) };
    saveSession(next);
    return next.tokens.accessToken;
  } catch {
    return null;
  }
});

export async function loginWithEmail(email: string, password: string): Promise<WebSession> {
  const response = await httpRequest<LoginResponseData>({
    body: { email: email.trim().toLowerCase(), password },
    method: "POST",
    path: "/auth/login",
  });
  const tokens = mapTokens(response.data.tokens);
  const user = await fetchCurrentUser(tokens.accessToken);
  assertWebAccess(user);
  const companies = user.role?.name === "COMPANY" ? await fetchCompanies(tokens.accessToken) : [];
  if (user.role?.name === "COMPANY" && !companies.length) {
    throw new ApiError("Tu cuenta no tiene empresas asignadas para operar en la web.", 403);
  }
  const session = { user, tokens, companies, activeCompanyId: companies[0]?.company.id ?? null };
  saveSession(session);
  return session;
}

export async function restoreWebSession(): Promise<WebSession | null> {
  const stored = readSession();
  if (!stored) return null;
  try {
    const user = await fetchCurrentUser(stored.tokens.accessToken);
    assertWebAccess(user);
    const companies =
      user.role?.name === "COMPANY" ? await fetchCompanies(stored.tokens.accessToken) : [];
    if (user.role?.name === "COMPANY" && !companies.length) {
      throw new ApiError("Tu cuenta no tiene empresas asignadas para operar en la web.", 403);
    }
    const activeCompanyId = companies.some((entry) => entry.company.id === stored.activeCompanyId)
      ? stored.activeCompanyId
      : (companies[0]?.company.id ?? null);
    const session = { ...stored, user, companies, activeCompanyId };
    saveSession(session);
    return session;
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) clearStoredSession();
    return error instanceof ApiError && [401, 403].includes(error.status) ? null : stored;
  }
}

export async function logoutSession(session: WebSession | null) {
  try {
    if (session?.tokens.refreshToken) {
      await httpRequest({
        body: { refresh_token: session.tokens.refreshToken },
        method: "POST",
        path: "/auth/logout",
      });
    }
  } finally {
    clearStoredSession();
  }
}
