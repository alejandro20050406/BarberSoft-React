import { env } from "../config/env.js";
import { salesStore } from "../data/salesStore.js";
import { requireRoles } from "../middleware/auth.js";
import { readJsonBody, sendJson } from "../utils/http.js";

function sendStoreResult(response, result) {
  sendJson(response, result.status, {
    ok: result.ok,
    data: result.data,
    message: result.message,
    errors: result.errors,
  });
}

export async function handleSalesRoutes(request, response, pathname) {
  const basePath = `${env.apiPrefix}/sales`;

  if (!pathname.startsWith(basePath)) {
    return false;
  }

  const user = requireRoles(request, response, ["admin", "employee"]);
  if (!user) return true;

  try {
    if (pathname === `${basePath}/options` && request.method === "GET") {
      sendStoreResult(response, salesStore.getOptions(user));
      return true;
    }

    if (pathname === `${basePath}/service-sales` && request.method === "POST") {
      sendStoreResult(response, salesStore.createServiceSale(await readJsonBody(request), user));
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
