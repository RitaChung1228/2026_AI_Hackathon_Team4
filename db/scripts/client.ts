import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? "hackathon",
  password: process.env.DB_PASSWORD ?? "hackathon",
  database: process.env.DB_NAME ?? "hackathon",
});
