import { describe, expect, it } from 'vitest';
import { getNavigationForSession } from './navigation';
import type { WebSession } from '@/types/auth';

describe('dashboard navigation permissions', () => {
  it('shows company user management and email templates to the Super Admin', () => {
    const session = { user: { role: { name: 'SUPER_ADMIN' } }, companies: [] } as unknown as WebSession;
    expect(getNavigationForSession(session, null)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'company_users', label: 'Usuarios de empresas' }),
      expect.objectContaining({ key: 'email_templates', label: 'Correos' })
    ]));
  });

  it('hides modules without view permission', () => {
    const session = { user: { id: 1, name: 'A', last_name: 'B', email: 'a@b.co', phone: '1', profile_image: null, status: 'active', role: { id: 1, name: 'COMPANY', scope: 'platform' } }, tokens: { accessToken: 'x', refreshToken: 'y' }, companies: [], activeCompanyId: 1 } as WebSession;
    const company = { company_user_id: 1, primary_role: 'staff', company: { id: 1, name: 'C', type: 'products' as const, logo: null, status: 'active' }, roles: [{ id: 1, name: 'STAFF', scope: 'company', permissions: [{ id: 1, code: 'products', name: 'Products', module: 'products', view_permission: false }] }] };
    expect(getNavigationForSession(session, company).some((item) => item.key === 'products')).toBe(false);
    expect(getNavigationForSession(session, company).some((item) => item.key === 'email_templates')).toBe(false);
  });
});
