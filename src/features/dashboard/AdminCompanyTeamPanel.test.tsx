import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCompanyTeamPanel } from './AdminCompanyTeamPanel';
import type { CompanyTeamMember } from '@/services/dashboard.service';

const serviceMocks = vi.hoisted(() => ({
  create: vi.fn(async () => ({})),
  getRoles: vi.fn(async () => [{ id: 7, name: 'OWNER', description: 'Propietario', scope: 'company' }]),
  getTeam: vi.fn(async () => Object.assign([] as CompanyTeamMember[], { pagination: { page: 1, page_size: 10, total_items: 0, total_pages: 0, has_previous: false, has_next: false } })),
  remove: vi.fn(async () => undefined),
  updateMember: vi.fn(async () => ({})),
  updateRoles: vi.fn(async () => ({}))
}));

vi.mock('@/services/dashboard.service', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/dashboard.service')>();
  return {
    ...original,
    createAdminCompanyTeamMember: serviceMocks.create,
    getAdminCompanyRoles: serviceMocks.getRoles,
    getAdminCompanyTeam: serviceMocks.getTeam,
    removeAdminCompanyTeamMember: serviceMocks.remove,
    updateAdminCompanyTeamMember: serviceMocks.updateMember,
    updateAdminCompanyTeamRoles: serviceMocks.updateRoles
  };
});

describe('AdminCompanyTeamPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates and links the first company owner', async () => {
    render(<AdminCompanyTeamPanel accessToken="token" company={{ id: 12, name: 'Nueva Empresa' } as never} onClose={vi.fn()} />);

    expect(await screen.findByText('Aún no hay usuarios vinculados')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'López' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'laura@empresa.test' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '3001234567' } });
    fireEvent.change(screen.getByLabelText('Contraseña temporal'), { target: { value: 'Segura123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear y vincular' }));

    await waitFor(() => expect(serviceMocks.create).toHaveBeenCalledWith('token', 12, {
      name: 'Laura',
      last_name: 'López',
      email: 'laura@empresa.test',
      phone: '3001234567',
      password: 'Segura123',
      role_ids: [7]
    }));
  });

  it('edits an existing company user without resetting the password', async () => {
    serviceMocks.getTeam.mockResolvedValueOnce(Object.assign([{
      id: 4,
      user: { id: 9, name: 'Kelly', last_name: 'Trujillo', email: 'kelly@test.com', phone: '3001234567', status: 'active' },
      companyRoles: [{ id: 7, name: 'OWNER', scope: 'company' }]
    }], { pagination: { page: 1, page_size: 10, total_items: 1, total_pages: 1, has_previous: false, has_next: false } }));
    render(<AdminCompanyTeamPanel accessToken="token" company={{ id: 12, name: 'Nueva Empresa' } as never} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Kely' } });
    fireEvent.change(screen.getByLabelText('Estado de la cuenta'), { target: { value: 'inactive' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(serviceMocks.updateMember).toHaveBeenCalledWith('token', 12, 4, {
      name: 'Kely', last_name: 'Trujillo', email: 'kelly@test.com', phone: '3001234567', status: 'inactive', role_ids: [7]
    }));
  });
});
