import { API_ENDPOINTS } from "../../../services/endpoints";
import { request } from "../../../services/http";

export const salesService = {
  getOptions() {
    return request(`${API_ENDPOINTS.sales}/options`);
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

  createProductSale(payload) {
    return request(`${API_ENDPOINTS.sales}/product-sales`, {
      method: "POST",
      body: payload,
    });
  },
};
