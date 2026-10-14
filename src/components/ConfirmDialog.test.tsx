import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('is modal, focuses cancel and confirms', () => {
    const onConfirm = vi.fn(); const onCancel = vi.fn();
    render(<ConfirmDialog open title="Eliminar" message="Impacto" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
