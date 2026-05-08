import { readJsonBody, sendJson } from "../utils/http.js";

function parseCategoryRoute(pathname, basePath) {
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

async function sendStoreResult(response, result) {
  sendJson(response, result.status, {
    ok: result.ok,
    data: result.data,
    message: result.message,
    errors: result.errors,
  });
}

export async function handleCategoryRoutes({
  request,
  response,
  pathname,
  searchParams,
  basePath,
  store,
}) {
  const route = parseCategoryRoute(pathname, basePath);

  if (!route.matches) {
    return false;
  }

  try {
    if (request.method === "GET" && route.id === undefined) {
      await sendStoreResult(
        response,
        store.list({
          query: searchParams.get("query") ?? "",
          status: searchParams.get("status") ?? "all",
        }),
      );
      return true;
    }

    if (request.method === "POST" && route.id === undefined) {
      await sendStoreResult(response, store.create(await readJsonBody(request)));
      return true;
    }

    if (request.method === "PUT" && route.id !== undefined && route.action === undefined) {
      await sendStoreResult(response, store.update(route.id, await readJsonBody(request)));
      return true;
    }

    if (request.method === "PATCH" && route.id !== undefined && route.action === "status") {
      const body = await readJsonBody(request);
      await sendStoreResult(response, store.setStatus(route.id, body.status));
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
