import { getHealth } from "../controllers/healthController.js";
import { sendJson } from "../utils/http.js";

export function handleHealthRoute(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, {
      ok: false,
      message: "Metodo no permitido.",
    });
    return true;
  }

  sendJson(response, 200, getHealth());
  return true;
}
