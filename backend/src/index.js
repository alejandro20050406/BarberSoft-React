import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { testDatabaseConnection } from "./db.js";

const server = createApp();

try {
  await testDatabaseConnection();
  console.log("Conexion a MySQL exitosa");
} catch (error) {
  console.error("Error conectando a MySQL:", error.message);
}

server.listen(env.port, env.host, () => {
  console.log(
    `BarberSoft API escuchando en http://${env.host}:${env.port}${env.apiPrefix}`,
  );
});
