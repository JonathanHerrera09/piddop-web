export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  title: string;
  message?: string;
  kind?: ToastKind;
}

type ToastListener = (toast: ToastMessage) => void;

const listeners = new Set<ToastListener>();

export function showToast(toast: ToastMessage) {
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
