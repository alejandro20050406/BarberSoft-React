const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const buildUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export async function request(endpoint, options = {}) {
  const { body, headers, ...fetchOptions } = options;

  try {
    const response = await fetch(buildUrl(endpoint), {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
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
