import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(__dirname, "..", "schema");

async function main() {
  const files = readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`[migrate] 找到 ${files.length} 支 SQL 檔案，依序執行：`);
  files.forEach((f) => console.log(`  - ${f}`));

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = readFileSync(join(SCHEMA_DIR, file), "utf8");
      console.log(`[migrate] 執行 ${file} ...`);
      await client.query(sql);
      console.log(`[migrate] ${file} 完成`);
    }
    console.log("[migrate] 全部建表完成");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] 失敗：", err);
  process.exit(1);
});
