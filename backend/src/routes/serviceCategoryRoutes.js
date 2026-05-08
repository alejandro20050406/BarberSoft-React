import { env } from "../config/env.js";
import { serviceCategoryStore } from "../data/categoryStores.js";
import { handleCategoryRoutes } from "./categoryRoutes.js";

export function handleServiceCategoryRoutes(request, response, pathname, searchParams) {
  return handleCategoryRoutes({
    request,
    response,
    pathname,
    searchParams,
    basePath: `${env.apiPrefix}/service-categories`,
    store: serviceCategoryStore,
  });
}
