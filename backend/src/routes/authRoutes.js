import { env } from "../config/env.js";
import { userStore } from "../data/userStore.js";
import { requireAuth } from "../middleware/auth.js";
import { readJsonBody, sendJson } from "../utils/http.js";

function sendStoreResult(response, result) {
  sendJson(response, result.status, {
    ok: result.ok,
    data: result.data,
    message: result.message,
    errors: result.errors,
  });
}

export async function handleAuthRoutes(request, response, pathname) {
  const basePath = `${env.apiPrefix}/auth`;

  if (!pathname.startsWith(basePath)) {
    return false;
  }

  try {
    if (pathname === `${basePath}/login` && request.method === "POST") {
      sendStoreResult(response, userStore.authenticate(await readJsonBody(request)));
      return true;
    }

    if (pathname === `${basePath}/me` && request.method === "GET") {
      const user = requireAuth(request, response);
      if (!user) return true;

      sendStoreResult(response, userStore.getProfile(user.id));
      return true;
    }

    if (pathname === `${basePath}/me` && request.method === "PATCH") {
      const user = requireAuth(request, response);
      if (!user) return true;

      sendStoreResult(response, userStore.updateProfile(user.id, await readJsonBody(request)));
      return true;
    }

    sendJson(response, 405, {
      ok: false,
      message: "Metodo no permitido.",
    });
    return true;
  } catch (error) {
    sendJson(response, 400, {
      ok: false,
      message: error.message,
      errors: {},
    });
    return true;
  }
}
