import { API_ENDPOINTS } from "./endpoints";
import { request } from "./http";
import { getCurrentUser, getSession, saveSession } from "./storage";

export const profileService = {
  get() {
    return request(API_ENDPOINTS.auth.me);
  },

  async update(payload) {
    const response = await request(API_ENDPOINTS.auth.me, {
      method: "PATCH",
      body: payload,
    });

    if (response.ok) {
      saveSession({
        token: getSession()?.token ?? "",
        user: response.data,
      });
    }

    return response;
  },

  getCached() {
    return getCurrentUser();
  },
};
