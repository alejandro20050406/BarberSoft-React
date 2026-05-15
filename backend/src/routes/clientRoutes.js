import { env } from "../config/env.js";
import { clientStore } from "../data/clientStore.js";
import { salesStore } from "../data/salesStore.js";
import { readJsonBody, sendJson } from "../utils/http.js";

function parseClientRoute(pathname) {
  const basePath = `${env.apiPrefix}/clients`;

  if (pathname === basePath) {
    return { matches: true };
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

function withVisitSummary(client) {
  return {
    ...client,
    ...salesStore.getClientVisitSummary(client.id),
  };
}

export async function handleClientRoutes(request, response, pathname, searchParams) {
  const route = parseClientRoute(pathname);

  if (!route.matches) {
    return false;
  }

  try {
    if (request.method === "GET" && route.id === undefined) {
      const result = clientStore.list({
        query: searchParams.get("query") ?? "",
        status: searchParams.get("status") ?? "all",
      });

      sendStoreResult(response, {
        ...result,
        data: result.data.map(withVisitSummary),
      });
      return true;
    }

    if (request.method === "GET" && route.id !== undefined && route.action === "visits") {
      sendStoreResult(response, salesStore.listClientVisits(route.id));
      return true;
    }

    if (request.method === "POST" && route.id === undefined) {
      sendStoreResult(response, clientStore.create(await readJsonBody(request)));
      return true;
    }

    if (request.method === "PUT" && route.id !== undefined && route.action === undefined) {
      sendStoreResult(response, clientStore.update(route.id, await readJsonBody(request)));
      return true;
    }

    if (request.method === "PATCH" && route.id !== undefined && route.action === "status") {
      const body = await readJsonBody(request);
      sendStoreResult(response, clientStore.setStatus(route.id, body.status));
      return true;
    }

    sendJson(response, 405, { ok: false, message: "Metodo no permitido." });
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
