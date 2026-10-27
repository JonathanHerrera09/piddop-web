function optionalEnv(name: "VITE_API_URL" | "VITE_SOCKET_URL" | "VITE_GOOGLE_MAPS_API_KEY") {
  return import.meta.env[name]?.trim() || "";
}

export function getApiUrl() {
  const apiUrl = optionalEnv("VITE_API_URL").replace(/\/$/, "");
  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL no está configurada. Crea un archivo .env.local basándote en .env.example.",
    );
  }
  return apiUrl;
}

export function getSocketUrl() {
  return optionalEnv("VITE_SOCKET_URL");
}

export function getGoogleMapsApiKey() {
  return optionalEnv("VITE_GOOGLE_MAPS_API_KEY");
}
