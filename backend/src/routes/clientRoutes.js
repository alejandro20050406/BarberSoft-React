import { env } from "../config/env.js";
import { clientStore } from "../data/clientStore.js";
import { handleAdminResourceRoutes } from "./adminResourceRoutes.js";

export function handleClientRoutes(request, response, pathname, searchParams) {
  return handleAdminResourceRoutes({
    request,
    response,
    pathname,
    searchParams,
    basePath: `${env.apiPrefix}/clients`,
    store: clientStore,
  });
}
