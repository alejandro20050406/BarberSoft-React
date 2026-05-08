import { API_ENDPOINTS } from "./endpoints";
import { request } from "./http";

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.query) params.set("query", filters.query);
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const makeCategoryService = (endpoint) => ({
  list(filters) {
    return request(`${endpoint}${buildQuery(filters)}`);
  },

  create(payload) {
    return request(endpoint, {
      method: "POST",
      body: payload,
    });
  },

  update(id, payload) {
    return request(`${endpoint}/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  setStatus(id, status) {
    return request(`${endpoint}/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
});

export const productCategoriesService = makeCategoryService(
  API_ENDPOINTS.productCategories,
);

export const serviceCategoriesService = makeCategoryService(
  API_ENDPOINTS.serviceCategories,
);
