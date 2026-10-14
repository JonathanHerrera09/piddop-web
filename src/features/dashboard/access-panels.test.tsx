import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RolesPanel } from './RolesPanel';
import { TeamPanel } from './TeamPanel';

describe('access management panels', () => {
  it('renders role permission matrix and team invite control', async () => {
    const { container } = render(<RolesPanel accessToken="test" roles={[]} permissions={[{ id: 1, code: 'orders', name: 'Pedidos', module: 'orders', status: 'active' }]} onChanged={vi.fn()} />);
    expect(screen.getByText('Crear rol')).toBeInTheDocument(); expect(screen.getByText('Pedidos')).toBeInTheDocument();
    expect(container.querySelector('.role-panel__flags')).toBeInTheDocument();
    render(<TeamPanel accessToken="test" companyId={1} members={[]} roles={[{ id: 1, name: 'STAFF', scope: 'company' }, { id: 2, name: 'SUPER_ADMIN', scope: 'platform' }]} onChanged={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Invitar miembro' })).toBeInTheDocument(); expect(screen.getByText('No hay miembros en este equipo.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Invitar miembro' }));
    await waitFor(() => expect(screen.getByRole('option', { name: 'STAFF' })).toBeInTheDocument());
    expect(screen.queryByRole('option', { name: 'SUPER_ADMIN' })).not.toBeInTheDocument();
  });
});
