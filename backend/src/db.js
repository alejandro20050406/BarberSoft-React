import mysql from "mysql2/promise";
import { env } from "./config/env.js";

export const db = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDatabaseConnection() {
  const [rows] = await db.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
