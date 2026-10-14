import { useEffect, useRef, useState } from 'react';
import { subscribeToToast, ToastKind, ToastMessage } from '@/services/toast.service';

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'success') return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>;
  if (kind === 'error') return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismiss() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(null);
  }

  useEffect(() => {
    return subscribeToToast((nextToast) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast(nextToast);
      timeoutRef.current = setTimeout(dismiss, nextToast.kind === 'error' ? 5000 : 3400);
    });
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  if (!toast) return null;
  const kind = toast.kind || 'info';

  return (
    <div className={`app-toast app-toast--${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live="polite">
      <span className="app-toast__icon"><ToastIcon kind={kind} /></span>
      <span className="app-toast__copy">
        <strong>{toast.title}</strong>
        {toast.message ? <small>{toast.message}</small> : null}
      </span>
      <button aria-label="Cerrar notificación" className="app-toast__close" onClick={dismiss} type="button"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" /></svg></button>
    </div>
  );
}
