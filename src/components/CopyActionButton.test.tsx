import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CopyActionButton } from './CopyActionButton';

describe('CopyActionButton', () => {
  it('requires confirmation and does nothing when cancelled', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<CopyActionButton title="Copiar producto" message="¿Quieres continuar?" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('copies only after confirming from the modal', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<CopyActionButton title="Copiar variante" message="¿Quieres continuar?" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, copiar' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
