import { createServer } from "node:http";
import { env } from "./config/env.js";
import { handleClientRoutes } from "./routes/clientRoutes.js";
import { handleEmployeeRoutes } from "./routes/employeeRoutes.js";
import { handleHealthRoute } from "./routes/healthRoutes.js";
import { handleProductCategoryRoutes } from "./routes/productCategoryRoutes.js";
import { handleProductRoutes } from "./routes/productRoutes.js";
import { handleServiceCategoryRoutes } from "./routes/serviceCategoryRoutes.js";
import { normalizePath, sendJson, sendNoContent } from "./utils/http.js";

export function createApp() {
  return createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = normalizePath(url.pathname);

    if (request.method === "OPTIONS") {
      sendNoContent(response);
      return;
    }

    if (pathname === `${env.apiPrefix}/health` || pathname === "/health") {
      handleHealthRoute(request, response);
      return;
    }

    const productCategoriesHandled = await handleProductCategoryRoutes(
      request,
      response,
      pathname,
      url.searchParams,
    );

    if (productCategoriesHandled) {
      return;
    }

    const productsHandled = await handleProductRoutes(
      request,
      response,
      pathname,
      url.searchParams,
    );

    if (productsHandled) {
      return;
    }

    const clientsHandled = await handleClientRoutes(
      request,
      response,
      pathname,
      url.searchParams,
    );

    if (clientsHandled) {
      return;
    }

    const employeesHandled = await handleEmployeeRoutes(
      request,
      response,
      pathname,
      url.searchParams,
    );

    if (employeesHandled) {
      return;
    }

    const serviceCategoriesHandled = await handleServiceCategoryRoutes(
      request,
      response,
      pathname,
      url.searchParams,
    );

    if (serviceCategoriesHandled) {
      return;
    }

    sendJson(response, 404, {
      ok: false,
      message: "Ruta no encontrada.",
      path: pathname,
    });
  });
}
