import { env } from "../config/env.js";

export function getHealth() {
  return {
    ok: true,
    service: "barbersoft-api",
    environment: env.nodeEnv,
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}
