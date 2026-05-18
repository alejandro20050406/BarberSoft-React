import { env } from "../config/env.js";
import { productStore } from "../data/productStore.js";
import { salesStore } from "../data/salesStore.js";
import { readJsonBody, sendJson } from "../utils/http.js";

function parseProductRoute(pathname) {
  const basePath = `${env.apiPrefix}/products`;

  if (pathname === basePath) {
    return { matches: true };
  }

  if (pathname === `${basePath}/inventory-status`) {
    return { matches: true, collectionAction: "inventory-status" };
  }

  if (pathname === `${basePath}/movements`) {
    return { matches: true, collectionAction: "movements" };
  }

  if (pathname === `${basePath}/sold-summary`) {
    return { matches: true, collectionAction: "sold-summary" };
  }

  const prefix = `${basePath}/`;
  if (!pathname.startsWith(prefix)) {
    return { matches: false };
  }

  const [idSegment, action, ...rest] = pathname.slice(prefix.length).split("/");
  const id = Number(idSegment);

  if (!Number.isInteger(id) || id <= 0 || rest.length > 0) {
    return { matches: false };
  }

  return { matches: true, id, action };
}

function sendStoreResult(response, result) {
  sendJson(response, result.status, {
    ok: result.ok,
    data: result.data,
    message: result.message,
    errors: result.errors,
  });
}

export async function handleProductRoutes(request, response, pathname, searchParams) {
  const route = parseProductRoute(pathname);

  if (!route.matches) {
    return false;
  }

  try {
    if (request.method === "GET" && route.collectionAction === "inventory-status") {
      sendStoreResult(response, productStore.getInventoryStatus());
      return true;
    }

    if (request.method === "GET" && route.collectionAction === "movements") {
      sendStoreResult(
        response,
        productStore.listInventoryMovements({
          query: searchParams.get("query") ?? "",
          productId: searchParams.get("productId") ?? "",
          type: searchParams.get("type") ?? "all",
          page: searchParams.get("page") ?? "1",
          pageSize: searchParams.get("pageSize") ?? "10",
        }),
      );
      return true;
    }

    if (request.method === "GET" && route.collectionAction === "sold-summary") {
      sendStoreResult(
        response,
        salesStore.listSoldProducts({
          query: searchParams.get("query") ?? "",
          from: searchParams.get("from") ?? "",
          to: searchParams.get("to") ?? "",
          page: searchParams.get("page") ?? "1",
          pageSize: searchParams.get("pageSize") ?? "10",
        }),
      );
      return true;
    }

    if (request.method === "GET" && route.id === undefined) {
      sendStoreResult(
        response,
        productStore.list({
          query: searchParams.get("query") ?? "",
          category: searchParams.get("category") ?? "all",
          status: searchParams.get("status") ?? "all",
        }),
      );
      return true;
    }

    if (request.method === "POST" && route.id === undefined) {
      sendStoreResult(response, productStore.create(await readJsonBody(request)));
      return true;
    }

    if (request.method === "PUT" && route.id !== undefined && route.action === undefined) {
      sendStoreResult(response, productStore.update(route.id, await readJsonBody(request)));
      return true;
    }

    if (request.method === "PATCH" && route.id !== undefined && route.action === "status") {
      const body = await readJsonBody(request);
      sendStoreResult(response, productStore.setStatus(route.id, body.status));
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
