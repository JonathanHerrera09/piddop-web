import { useEffect, useRef } from 'react';

interface Props { open: boolean; title: string; message: string; confirmLabel?: string; pending?: boolean; tone?: 'danger' | 'primary'; onConfirm: () => void; onCancel: () => void; }
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', pending = false, tone = 'danger', onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) { event.preventDefault(); onCancel(); return; }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, pending, onCancel]);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={onCancel}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="confirm-dialog" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="confirm-title" className="confirm-dialog__title">{title}</h2><p id="confirm-message" className="confirm-dialog__message">{message}</p>
      <div className="confirm-dialog__actions"><button ref={cancelRef} type="button" onClick={onCancel} disabled={pending} className="secondary-button">Cancelar</button><button type="button" onClick={onConfirm} disabled={pending} aria-busy={pending} className={tone === 'primary' ? 'primary-button' : 'danger-button'}>{pending ? 'Procesando…' : confirmLabel}</button></div>
    </section>
  </div>;
}
