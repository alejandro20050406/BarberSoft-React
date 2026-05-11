import { API_ENDPOINTS } from "../../../services/endpoints";
import { request } from "../../../services/http";

export const salesService = {
  getOptions() {
    return request(`${API_ENDPOINTS.sales}/options`);
  },

  createServiceSale(payload) {
    return request(`${API_ENDPOINTS.sales}/service-sales`, {
      method: "POST",
      body: payload,
    });
  },
};
