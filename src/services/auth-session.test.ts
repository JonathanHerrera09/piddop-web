import { describe, expect, it, vi } from 'vitest';
import { restoreWebSession, subscribeToSessionUpdates } from './auth.service';
import type { WebSession } from '@/types/auth';

const session = { tokens: { accessToken: 'old-access', refreshToken: 'refresh' }, user: { id: 1, name: 'Owner', last_name: 'User', email: 'owner@example.test', phone: '1', profile_image: null, status: 'active', role: { id: 1, name: 'COMPANY', scope: 'platform' } }, companies: [], activeCompanyId: null } as WebSession;

describe('web session coordination', () => {
  it('notifies the app when a refresh publishes rotated tokens', () => {
    const listener = vi.fn();
    const cleanup = subscribeToSessionUpdates(listener);
    window.dispatchEvent(new CustomEvent('allora:web-session-updated', { detail: session }));
    cleanup();
    expect(listener).toHaveBeenCalledWith(session);
  });

  it('preserves a stored session on a transient restore failure', async () => {
    window.localStorage.setItem('allora.web.session', JSON.stringify(session));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(restoreWebSession()).resolves.toEqual(session);
    vi.unstubAllGlobals();
  });
});
