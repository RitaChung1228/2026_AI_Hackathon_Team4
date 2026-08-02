import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 檢查 seed 檔裡的 img_url 是否真的抓得到圖。
 *
 * 對每個 URL 發 HEAD，確認 HTTP 200 且 Content-Type 是 image/*。
 * 換圖之後跑一次，避免又塞進顯示不出來的網址。
 *
 * 執行方式：
 *   npm run db:check:images
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = join(__dirname, "..", "seed", "05_ServicesCatalog.json");

interface CatalogItem {
  service_id: string;
  service_name: string;
  img_url: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 逐一檢查，不並行：圖床（例如 Wikimedia）會對短時間大量請求回 429，
 * 並行檢查會把「被限流」誤判成「圖是壞的」。429 / 連線錯誤都會退避重試。
 */
async function check(url: string, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": "UNIFlow-Hackathon/0.1 (seed image check)" },
      });
      const type = res.headers.get("content-type") ?? "";
      const size = res.headers.get("content-length") ?? "?";

      if (res.status === 429 && i < tries - 1) {
        await sleep(3000 * (i + 1));
        continue;
      }
      return {
        ok: res.ok && type.startsWith("image/"),
        detail: `${res.status} ${type} ${size}B`,
      };
    } catch (e) {
      if (i === tries - 1) {
        return { ok: false, detail: `fetch failed: ${e instanceof Error ? e.message : e}` };
      }
      await sleep(3000 * (i + 1));
    }
  }
  return { ok: false, detail: "重試耗盡" };
}

async function main() {
  const { items } = JSON.parse(readFileSync(SEED_FILE, "utf8")) as { items: CatalogItem[] };

  const results: { item: CatalogItem; ok: boolean; detail: string }[] = [];
  for (const item of items) {
    const r = await check(item.img_url);
    results.push({ item, ...r });
    console.log(`${r.ok ? "OK  " : "FAIL"} ${item.service_id.padEnd(24)} ${r.detail}`);
    if (!r.ok) console.log(`     ${item.img_url}`);
    await sleep(600);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n共 ${results.length} 筆，成功 ${results.length - failed.length}，失敗 ${failed.length}`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[check:images] 失敗：", err instanceof Error ? err.message : err);
  process.exit(1);
});
