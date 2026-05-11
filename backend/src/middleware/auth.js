import { userStore } from "../data/userStore.js";
import { sendJson } from "../utils/http.js";

function getBearerToken(request) {
  const authorization = request.headers.authorization ?? "";
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return "";
  }

  return token;
}

export function authenticateRequest(request) {
  const token = getBearerToken(request);
  const user = token ? userStore.findByToken(token) : null;

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "Sesion no valida o expirada.",
    };
  }

  return { ok: true, user };
}

export function requireAuth(request, response) {
  const auth = authenticateRequest(request);

  if (!auth.ok) {
    sendJson(response, auth.status, {
      ok: false,
      message: auth.message,
      errors: {},
    });
    return null;
  }

  return auth.user;
}

export function requireRoles(request, response, roles = []) {
  const user = requireAuth(request, response);

  if (!user) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    sendJson(response, 403, {
      ok: false,
      message: "No tienes permisos para acceder a esta ruta.",
      errors: {},
    });
    return null;
  }

  return user;
}
