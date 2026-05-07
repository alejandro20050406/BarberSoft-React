import { createApp } from "./app.js";
import { env } from "./config/env.js";

const server = createApp();

server.listen(env.port, env.host, () => {
  console.log(`BarberSoft API escuchando en http://${env.host}:${env.port}${env.apiPrefix}`);
});
