import { env } from "../config/env.js";
import { productCategoryStore } from "../data/categoryStores.js";
import { handleCategoryRoutes } from "./categoryRoutes.js";

export function handleProductCategoryRoutes(request, response, pathname, searchParams) {
  return handleCategoryRoutes({
    request,
    response,
    pathname,
    searchParams,
    basePath: `${env.apiPrefix}/product-categories`,
    store: productCategoryStore,
  });
}
