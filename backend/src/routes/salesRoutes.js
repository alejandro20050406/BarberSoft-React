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

function getSalesFilters(searchParams) {
  const type = searchParams?.get("type") ?? "all";

  return {
    from: searchParams?.get("from") ?? "",
    to: searchParams?.get("to") ?? "",
    type: ["all", "service", "product"].includes(type) ? type : "all",
  };
}

export async function handleSalesRoutes(request, response, pathname, searchParams = new URLSearchParams()) {
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

    if (pathname === `${basePath}/my-sales` && request.method === "GET") {
      sendStoreResult(response, salesStore.listAuthenticatedEmployeeSales(user, getSalesFilters(searchParams)));
      return true;
    }

    if (pathname === `${basePath}/my-commissions` && request.method === "GET") {
      sendStoreResult(
        response,
        salesStore.listAuthenticatedEmployeeCommissions(user, getSalesFilters(searchParams)),
      );
      return true;
    }

    if (pathname === `${basePath}/service-sales` && request.method === "POST") {
      sendStoreResult(response, salesStore.createServiceSale(await readJsonBody(request), user));
      return true;
    }

    if (pathname === `${basePath}/product-sales` && request.method === "POST") {
      sendStoreResult(response, salesStore.createProductSale(await readJsonBody(request), user));
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
