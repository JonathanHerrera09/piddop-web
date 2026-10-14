import { ApiError, httpRequest, registerSessionRefresher } from '@/services/http';
import { AuthUser, LoginResponseData, UserCompaniesResponseData, UserCompanyMembership, WebSession, WebTokens } from '@/types/auth';

const STORAGE_KEY = 'allora.web.session';
const SESSION_UPDATED_EVENT = 'allora:web-session-updated';

function mapTokens(tokens: { access_token: string; refresh_token: string }): WebTokens {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

function saveSession(session: WebSession, notify = false) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  if (notify) window.dispatchEvent(new CustomEvent<WebSession>(SESSION_UPDATED_EVENT, { detail: session }));
}

function readSession(): WebSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WebSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

registerSessionRefresher(async (requestedToken) => {
  const stored = readSession();
  if (!stored?.tokens.refreshToken) return null;
  // A concurrent request may have already rotated the token. Reuse it instead
  // of rotating the same refresh token again (the backend revokes old tokens).
  if (requestedToken && stored.tokens.accessToken !== requestedToken) return stored.tokens.accessToken;
  try {
    const response = await httpRequest<{ tokens: { access_token: string; refresh_token: string } }>({ body: { refresh_token: stored.tokens.refreshToken }, method: 'POST', path: '/auth/refresh', retryAfterRefresh: false });
    const next = { ...stored, tokens: mapTokens(response.data.tokens) };
    saveSession(next, true);
    return next.tokens.accessToken;
  } catch { return null; }
});

async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await httpRequest<AuthUser>({
    accessToken,
    method: 'GET',
    path: '/auth/me'
  });

  return response.data;
}

async function fetchUserCompanies(accessToken: string): Promise<UserCompanyMembership[]> {
  const response = await httpRequest<UserCompaniesResponseData>({
    accessToken,
    method: 'GET',
    path: '/users/me/companies'
  });

  return response.data.companies;
}

function ensureAllowedWebUser(user: AuthUser) {
  const roleName = user.role?.name;

  if (roleName === 'SUPER_ADMIN' || roleName === 'COMPANY') {
    return;
  }

  throw new ApiError(
    'Esta web solo permite acceso a Super Admin y usuarios de empresa. Clientes y domiciliarios deben usar su flujo correspondiente.',
    403
  );
}

export async function loginWithEmail(email: string, password: string): Promise<WebSession> {
  const response = await httpRequest<LoginResponseData>({
    body: { email: email.trim().toLowerCase(), password },
    method: 'POST',
    path: '/auth/login'
  });

  const tokens = mapTokens(response.data.tokens);
  const user = await fetchCurrentUser(tokens.accessToken);
  ensureAllowedWebUser(user);
  const companies = user.role?.name === 'COMPANY' ? await fetchUserCompanies(tokens.accessToken) : [];

  if (user.role?.name === 'COMPANY' && !companies.length) {
    throw new ApiError('Este usuario de empresa no tiene empresas asignadas para operar en la web.', 403);
  }

  const session = {
    tokens,
    user,
    companies,
    activeCompanyId: companies[0]?.company.id ?? null
  };

  saveSession(session);

  return session;
}

export async function restoreWebSession(): Promise<WebSession | null> {
  const storedSession = readSession();

  if (!storedSession) {
    return null;
  }

  try {
    const user = await fetchCurrentUser(storedSession.tokens.accessToken);
    ensureAllowedWebUser(user);
    const companies = user.role?.name === 'COMPANY' ? await fetchUserCompanies(storedSession.tokens.accessToken) : [];

    if (user.role?.name === 'COMPANY' && !companies.length) {
      throw new ApiError('Este usuario de empresa no tiene empresas asignadas para operar en la web.', 403);
    }

    const activeCompanyId =
      companies.find((item) => item.company.id === storedSession.activeCompanyId)?.company.id ??
      companies[0]?.company.id ??
      null;

    const nextSession = { ...storedSession, user, companies, activeCompanyId };
    saveSession(nextSession);
    return nextSession;
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) window.localStorage.removeItem(STORAGE_KEY);
    // Network, throttling and temporary server failures must not erase a valid session.
    if (!(error instanceof ApiError) || ![401, 403].includes(error.status)) return storedSession;
    return null;
  }
}

export async function logoutSession(refreshToken?: string) {
  try {
    if (refreshToken) {
      await httpRequest({
        body: { refresh_token: refreshToken },
        method: 'POST',
        path: '/auth/logout'
      });
    }
  } catch {
    // Ignore logout errors and clear local session anyway.
  } finally {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function updateStoredSession(session: WebSession) {
  saveSession(session);
}

export function subscribeToSessionUpdates(listener: (session: WebSession) => void) {
  const handleEvent = (event: Event) => listener((event as CustomEvent<WebSession>).detail);
  window.addEventListener(SESSION_UPDATED_EVENT, handleEvent);
  return () => window.removeEventListener(SESSION_UPDATED_EVENT, handleEvent);
}
