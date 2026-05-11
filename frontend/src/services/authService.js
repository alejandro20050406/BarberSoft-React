import { API_ENDPOINTS } from "./endpoints";
import { request } from "./http";
import { clearSession, saveSession } from "./storage";

export const authService = {
  async login(payload) {
    const response = await request(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: payload,
    });

    if (response.ok) {
      saveSession(response.data);
    }

    return response;
  },

  logout() {
    clearSession();
  },
};
