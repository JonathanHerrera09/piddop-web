import {
  isPermissionGranted as isTauriPermissionGranted,
  requestPermission as requestTauriPermission,
  sendNotification as sendTauriNotification,
} from "@tauri-apps/plugin-notification";

type TauriWindow = Window & { __TAURI_INTERNALS__?: unknown };

function isTauriDesktop() {
  return typeof window !== "undefined" && Boolean((window as TauriWindow).__TAURI_INTERNALS__);
}

export async function notificationPermissionGranted() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return isTauriDesktop() ? isTauriPermissionGranted() : Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (isTauriDesktop()) {
    if (await isTauriPermissionGranted()) return true;
    return (await requestTauriPermission()) === "granted";
  }
  if (Notification.permission === "granted") return true;
  return (await Notification.requestPermission()) === "granted";
}

export async function showNotification(title: string, body: string) {
  if (!(await notificationPermissionGranted())) return;
  if (isTauriDesktop()) {
    sendTauriNotification({ title, body });
    return;
  }
  new Notification(title, { body });
}
