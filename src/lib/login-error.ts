import { ApiError } from "@/services/http";

const knownMessages: Array<[RegExp, string]> = [
  [
    /invalid (email|credentials|password)|invalid email or password/i,
    "El correo o la contraseña no son correctos.",
  ],
  [/this user is not active|inactive user/i, "Esta cuenta no está activa. Comunícate con soporte."],
  [
    /too many (authentication )?attempts|too many requests/i,
    "Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  ],
  [/validation failed/i, "Revisa los datos ingresados e inténtalo de nuevo."],
];

function isSpanishMessage(message: string) {
  return /[áéíóúñ]|\b(contraseña|correo|cuenta|sesión|datos|usuario|acceso|servidor|conexión)\b/i.test(
    message,
  );
}

export function loginErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "No pudimos iniciar sesión. Inténtalo de nuevo.";
  if (error.status === 0)
    return "No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.";

  const known = knownMessages.find(([pattern]) => pattern.test(error.message));
  if (known) return known[1];
  if (isSpanishMessage(error.message)) return error.message;
  if (error.status === 401) return "El correo o la contraseña no son correctos.";
  if (error.status === 403) return "No tienes acceso al panel con esta cuenta.";
  if (error.status === 429)
    return "Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  if (error.status >= 500)
    return "El servicio no está disponible en este momento. Inténtalo más tarde.";
  return "No pudimos iniciar sesión. Inténtalo de nuevo.";
}
