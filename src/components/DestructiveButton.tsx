import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  label: string;
  title: string;
  impact: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function DestructiveButton({ label, title, impact, onConfirm, disabled, className = 'secondary-button inline-action' }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  async function confirm() {
    setPending(true);
    try { await onConfirm(); setOpen(false); } finally { setPending(false); }
  }
  return <>
    <button type="button" className={className} disabled={disabled || pending} onClick={() => setOpen(true)}>{pending ? 'Procesando…' : label}</button>
    <ConfirmDialog open={open} title={title} message={impact} confirmLabel={label} pending={pending} onCancel={() => !pending && setOpen(false)} onConfirm={() => void confirm()} />
  </>;
}
