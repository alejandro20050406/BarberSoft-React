import { createServer } from "node:http";
import { env } from "./config/env.js";
import { handleHealthRoute } from "./routes/healthRoutes.js";
import { normalizePath, sendJson } from "./utils/http.js";

export function createApp() {
  return createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = normalizePath(url.pathname);

    if (pathname === `${env.apiPrefix}/health` || pathname === "/health") {
      handleHealthRoute(request, response);
      return;
    }

    sendJson(response, 404, {
      ok: false,
      message: "Ruta no encontrada.",
      path: pathname,
    });
  });
}
