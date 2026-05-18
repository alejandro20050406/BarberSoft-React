import { API_ENDPOINTS } from "./endpoints";
import { request } from "./http";

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.query) params.set("query", filters.query);
  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.page) params.set("page", filters.page);
  if (filters.pageSize) params.set("pageSize", filters.pageSize);

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const productsService = {
  list(filters) {
    return request(`${API_ENDPOINTS.products}${buildQuery(filters)}`);
  },

  create(payload) {
    return request(API_ENDPOINTS.products, {
      method: "POST",
      body: payload,
    });
  },

  update(id, payload) {
    return request(`${API_ENDPOINTS.products}/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  setStatus(id, status) {
    return request(`${API_ENDPOINTS.products}/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  getInventoryStatus() {
    return request(`${API_ENDPOINTS.products}/inventory-status`);
  },

  getSoldSummary(filters = {}) {
    return request(`${API_ENDPOINTS.products}/sold-summary${buildQuery(filters)}`);
  },

  getMovements(filters = {}) {
    return request(`${API_ENDPOINTS.products}/movements${buildQuery(filters)}`);
  },
};
