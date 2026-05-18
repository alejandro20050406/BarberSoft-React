import { API_ENDPOINTS } from "../../../services/endpoints";
import { request } from "../../../services/http";

export const salesService = {
  getOptions() {
    return request(`${API_ENDPOINTS.sales}/options`);
  },

  listSales(filters = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_ENDPOINTS.sales}/sales${query ? `?${query}` : ""}`);
  },

  getSale(id) {
    return request(`${API_ENDPOINTS.sales}/sales/${id}`);
  },

  deleteSale(id) {
    return request(`${API_ENDPOINTS.sales}/sales/${id}`, {
      method: "DELETE",
    });
  },

  getMySales(filters = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_ENDPOINTS.sales}/my-sales${query ? `?${query}` : ""}`);
  },

  getMyCommissions(filters = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_ENDPOINTS.sales}/my-commissions${query ? `?${query}` : ""}`);
  },

  createServiceSale(payload) {
    return request(`${API_ENDPOINTS.sales}/service-sales`, {
      method: "POST",
      body: payload,
    });
  },

  createSale(payload) {
    return request(`${API_ENDPOINTS.sales}/sales`, {
      method: "POST",
      body: payload,
    });
  },

  createProductSale(payload) {
    return request(`${API_ENDPOINTS.sales}/product-sales`, {
      method: "POST",
      body: payload,
    });
  },
};
