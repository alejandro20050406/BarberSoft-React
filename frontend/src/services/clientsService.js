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

export const clientsService = {
  list(filters) {
    return request(`${API_ENDPOINTS.clients}${buildQuery(filters)}`);
  },

  create(payload) {
    return request(API_ENDPOINTS.clients, {
      method: "POST",
      body: payload,
    });
  },

  update(id, payload) {
    return request(`${API_ENDPOINTS.clients}/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  setStatus(id, status) {
    return request(`${API_ENDPOINTS.clients}/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
