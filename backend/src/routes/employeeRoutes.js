import { env } from "../config/env.js";
import { employeeStore } from "../data/employeeStore.js";
import { readJsonBody, sendJson } from "../utils/http.js";

function parseEmployeeRoute(pathname) {
  const basePath = `${env.apiPrefix}/employees`;

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

export async function handleEmployeeRoutes(request, response, pathname, searchParams) {
  const route = parseEmployeeRoute(pathname);

  if (!route.matches) {
    return false;
  }

  try {
    if (request.method === "GET" && route.id === undefined) {
      sendStoreResult(
        response,
        employeeStore.list({
          query: searchParams.get("query") ?? "",
          status: searchParams.get("status") ?? "all",
        }),
      );
      return true;
    }

    if (request.method === "POST" && route.id === undefined) {
      sendStoreResult(response, employeeStore.create(await readJsonBody(request)));
      return true;
    }

    if (request.method === "PUT" && route.id !== undefined && route.action === undefined) {
      sendStoreResult(response, employeeStore.update(route.id, await readJsonBody(request)));
      return true;
    }

    if (request.method === "PATCH" && route.id !== undefined && route.action === "status") {
      const body = await readJsonBody(request);
      sendStoreResult(response, employeeStore.setStatus(route.id, body.status));
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
