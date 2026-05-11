import { env } from "../config/env.js";
import { employeeStore } from "../data/employeeStore.js";
import { handleAdminResourceRoutes } from "./adminResourceRoutes.js";

export function handleEmployeeRoutes(request, response, pathname, searchParams) {
  return handleAdminResourceRoutes({
    request,
    response,
    pathname,
    searchParams,
    basePath: `${env.apiPrefix}/employees`,
    store: employeeStore,
  });
}
