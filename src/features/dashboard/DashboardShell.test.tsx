import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardShell } from './DashboardShell';
import type { WebSession } from '@/types/auth';

vi.mock('./DashboardWorkspace', () => ({
  DashboardWorkspace: () => <div data-testid="workspace">Contenido</div>
}));
vi.mock('@/components/ToastHost', () => ({ ToastHost: () => null }));
vi.mock('@/services/socket', () => ({
  createWebSocketClient: () => ({ on: vi.fn(), off: vi.fn(), disconnect: vi.fn() })
}));
vi.mock('@/services/auth.service', () => ({ logoutSession: vi.fn(async () => undefined) }));

const session = {
  user: { id: 1, name: 'Ana', last_name: 'Gómez', email: 'ana@test.co', phone: '300', profile_image: null, status: 'active', role: { id: 1, name: 'SUPER_ADMIN', scope: 'platform' } },
  tokens: { accessToken: 'access', refreshToken: 'refresh' },
  companies: [],
  activeCompanyId: null
} as unknown as WebSession;

describe('DashboardShell mobile navigation', () => {
  beforeEach(() => { document.body.style.overflow = ''; });

  it('opens the drawer and exposes expanded state', () => {
    render(<DashboardShell session={session} themeMode="light" onCompanyChange={vi.fn()} onLogout={vi.fn()} onThemeToggle={vi.fn()} />);
    const menu = screen.getByRole('button', { name: 'Abrir menú de navegación' });
    fireEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('complementary', { name: 'Navegación principal' })).toHaveClass('is-open');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes on Escape and after choosing a module', () => {
    render(<DashboardShell session={session} themeMode="light" onCompanyChange={vi.fn()} onLogout={vi.fn()} onThemeToggle={vi.fn()} />);
    const menu = screen.getByRole('button', { name: 'Abrir menú de navegación' });
    fireEvent.click(menu);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menu);
    fireEvent.click(screen.getByRole('button', { name: /Empresas/ }));
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes through the backdrop', () => {
    render(<DashboardShell session={session} themeMode="light" onCompanyChange={vi.fn()} onLogout={vi.fn()} onThemeToggle={vi.fn()} />);
    const menu = screen.getByRole('button', { name: 'Abrir menú de navegación' });
    fireEvent.click(menu);
    fireEvent.click(document.querySelector('.dashboard-backdrop') as HTMLElement);
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps Tab navigation inside the open drawer', () => {
    render(<DashboardShell session={session} themeMode="light" onCompanyChange={vi.fn()} onLogout={vi.fn()} onThemeToggle={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    const drawer = screen.getByRole('complementary', { name: 'Navegación principal' });
    const controls = drawer.querySelectorAll<HTMLElement>('button, select');
    controls[0].focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(controls[controls.length - 1]);
    controls[controls.length - 1].focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(controls[0]);
  });
});
