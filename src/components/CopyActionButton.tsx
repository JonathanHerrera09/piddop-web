import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface CopyActionButtonProps {
  disabled?: boolean;
  message: string;
  onConfirm: () => Promise<void>;
  title: string;
}

export function CopyActionButton({ disabled = false, message, onConfirm, title }: CopyActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="secondary-button inline-action" disabled={disabled || pending} onClick={() => setOpen(true)} type="button">
        {pending ? 'Copiando...' : 'Copiar'}
      </button>
      <ConfirmDialog confirmLabel="Sí, copiar" message={message} onCancel={() => !pending && setOpen(false)} onConfirm={() => void confirm()} open={open} pending={pending} title={title} tone="primary" />
    </>
  );
}
