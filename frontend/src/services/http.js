import { getAuthToken } from "./storage";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const buildUrl = (endpoint) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (baseUrl.endsWith("/api") && normalizedEndpoint.startsWith("/api/")) {
    return `${baseUrl}${normalizedEndpoint.slice("/api".length)}`;
  }

  return `${baseUrl}${normalizedEndpoint}`;
};

export async function request(endpoint, options = {}) {
  const { body, headers, ...fetchOptions } = options;
  const token = getAuthToken();

  try {
    const response = await fetch(buildUrl(endpoint), {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        status: response.status,
        message: payload.message ?? "No se pudo completar la solicitud.",
        errors: payload.errors ?? {},
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload.data,
      message: payload.message,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "No se pudo conectar con el servidor. Verifica que la API este activa.",
      errors: {},
    };
  }
}
