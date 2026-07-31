import { pool } from "./client.js";

const DROP_ORDER = [
  "mms_order_record",
  "pms_form_feedback",
  "pms_topic_option",
  "pms_topic_media",
  "pms_form_topic",
  "pms_form_group",
  "pms_form",
  "cms_homepage_service",
  "cms_homepage_service_vendor",
  "sys_district",
  "sys_county",
];

async function main() {
  const client = await pool.connect();
  try {
    for (const table of DROP_ORDER) {
      console.log(`[reset] DROP TABLE IF EXISTS ${table} ...`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    }
    console.log("[reset] 所有資料表已清除");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[reset] 失敗：", err);
  process.exit(1);
});
