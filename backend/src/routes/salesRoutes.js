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
    type: ["all", "service", "product", "mixed"].includes(type) ? type : "all",
    page: searchParams?.get("page") ?? "1",
    pageSize: searchParams?.get("pageSize") ?? "10",
  };
}

function parseSaleManagementRoute(pathname) {
  const basePath = `${env.apiPrefix}/sales/sales`;

  if (pathname === basePath) {
    return { matches: true };
  }

  const prefix = `${basePath}/`;
  if (!pathname.startsWith(prefix)) {
    return { matches: false };
  }

  const [idSegment, ...rest] = pathname.slice(prefix.length).split("/");
  const id = Number(idSegment);

  if (!Number.isInteger(id) || id <= 0 || rest.length > 0) {
    return { matches: false };
  }

  return { matches: true, id };
}

function getManagementFilters(searchParams) {
  return {
    query: searchParams?.get("query") ?? "",
    from: searchParams?.get("from") ?? "",
    to: searchParams?.get("to") ?? "",
    page: searchParams?.get("page") ?? "1",
    pageSize: searchParams?.get("pageSize") ?? "10",
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

    const managementRoute = parseSaleManagementRoute(pathname);

    if (managementRoute.matches && request.method === "GET" && managementRoute.id === undefined) {
      sendStoreResult(response, salesStore.listSales(user, getManagementFilters(searchParams)));
      return true;
    }

    if (managementRoute.matches && request.method === "GET" && managementRoute.id !== undefined) {
      sendStoreResult(response, salesStore.getSale(managementRoute.id, user));
      return true;
    }

    if (managementRoute.matches && request.method === "DELETE" && managementRoute.id !== undefined) {
      sendStoreResult(response, salesStore.deleteSale(managementRoute.id, user));
      return true;
    }

    if (pathname === `${basePath}/sales` && request.method === "POST") {
      sendStoreResult(response, salesStore.createSale(await readJsonBody(request), user));
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
