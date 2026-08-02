import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo.js";

/**
 * ServicesCatalog（DynamoDB）種子資料匯入腳本
 *
 * 資料來源：db/seed/05_ServicesCatalog.json
 * PK = vendor_id、SK = service_id，同一組 key 會被覆蓋（upsert），所以可以重複執行。
 *
 * 執行方式：
 *   npm run db:seed:services              # 實際寫入
 *   npm run db:seed:services -- --dry-run # 只驗證資料，不寫入
 */

const TABLE_NAME = process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog";
const BATCH_SIZE = 25; // DynamoDB BatchWriteItem 上限

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = join(__dirname, "..", "seed", "05_ServicesCatalog.json");

interface CatalogItem {
  vendor_id: string;
  service_id: string;
  vendor_name: string;
  service_name: string;
  category: string;
  type: string;
  price: number;
  description: string;
  img_url: string;
  service_vendor_id?: number;
}

const REQUIRED_FIELDS: (keyof CatalogItem)[] = [
  "vendor_id",
  "service_id",
  "vendor_name",
  "service_name",
  "category",
  "type",
  "price",
  "description",
  "img_url",
];

function loadItems(): CatalogItem[] {
  const raw = JSON.parse(readFileSync(SEED_FILE, "utf8")) as { items?: CatalogItem[] };
  if (!Array.isArray(raw.items)) {
    throw new Error(`${SEED_FILE} 缺少 items 陣列`);
  }
  return raw.items;
}

function validate(items: CatalogItem[]) {
  const seen = new Set<string>();

  items.forEach((item, i) => {
    for (const field of REQUIRED_FIELDS) {
      if (item[field] === undefined || item[field] === null || item[field] === "") {
        throw new Error(`第 ${i + 1} 筆缺少必填欄位「${field}」：${JSON.stringify(item)}`);
      }
    }
    if (typeof item.price !== "number") {
      throw new Error(`第 ${i + 1} 筆的 price 必須是數字（目前：${typeof item.price}）`);
    }
    if (typeof item.type !== "string") {
      throw new Error(`第 ${i + 1} 筆的 type 必須是字串（DB 慣例存 "1" / "02" / "retail"）`);
    }

    const key = `${item.vendor_id}::${item.service_id}`;
    if (seen.has(key)) {
      throw new Error(`重複的 key（vendor_id + service_id）：${key}`);
    }
    seen.add(key);
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function writeBatch(batch: CatalogItem[]) {
  let unprocessed = {
    [TABLE_NAME]: batch.map((Item) => ({ PutRequest: { Item } })),
  };

  // BatchWrite 可能因為 throttling 回傳未處理的項目，重試最多 5 次
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await ddb.send(new BatchWriteCommand({ RequestItems: unprocessed }));
    const left = res.UnprocessedItems?.[TABLE_NAME];
    if (!left || left.length === 0) return;

    unprocessed = { [TABLE_NAME]: left } as typeof unprocessed;
    await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
  }

  throw new Error("BatchWrite 重試 5 次後仍有未寫入的項目");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const items = loadItems();

  validate(items);

  const products = items.filter((i) => i.category === "product").length;
  console.log(
    `[seed:services] 來源 ${SEED_FILE}\n` +
      `[seed:services] 共 ${items.length} 筆（商品 ${products} / 服務 ${items.length - products}）` +
      `→ table=${TABLE_NAME} region=${process.env.AWS_REGION ?? "us-west-2"}`
  );

  if (dryRun) {
    console.log("[seed:services] --dry-run：資料驗證通過，未寫入 DynamoDB");
    return;
  }

  for (const [i, batch] of chunk(items, BATCH_SIZE).entries()) {
    await writeBatch(batch);
    console.log(`[seed:services] batch ${i + 1} 寫入 ${batch.length} 筆`);
  }

  const { Count } = await ddb.send(new ScanCommand({ TableName: TABLE_NAME, Select: "COUNT" }));
  console.log(`[seed:services] 完成，table 目前共 ${Count} 筆`);
}

main().catch((err) => {
  console.error("[seed:services] 失敗：", err instanceof Error ? err.message : err);
  process.exit(1);
});
