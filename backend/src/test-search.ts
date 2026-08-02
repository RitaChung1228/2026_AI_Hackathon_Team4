/**
 * 直接測試 searchProduct 和 searchService function
 * 用法：npx tsx src/test-search.ts
 */
import "./env.js";
import { searchProduct } from "./tools/searchProduct.js";
import { searchService } from "./tools/searchService.js";

async function test() {
  console.log("=== 測試 searchProduct ===\n");

  console.log("1. 搜尋「拿鐵」：");
  const r1 = await searchProduct({ keyword: "拿鐵" });
  console.log(JSON.stringify(r1, null, 2));

  console.log("\n2. 搜尋「咖啡」：");
  const r2 = await searchProduct({ keyword: "咖啡" });
  console.log(JSON.stringify(r2, null, 2));

  console.log("\n3. 搜尋所有商品（不帶 keyword）：");
  const r3 = await searchProduct({ keyword: "" });
  console.log(`  共 ${r3.products.length} 筆`);
  r3.products.forEach((p) => console.log(`  - ${p.name} (${p.price} 元)`));

  console.log("\n\n=== 測試 searchService ===\n");

  console.log("4. 搜尋所有服務：");
  const r4 = await searchService({});
  console.log(`  共 ${r4.services.length} 筆`);
  r4.services.forEach((s) => console.log(`  - ${s.service_name} (${s.vendor_name})`));
}

test().catch(console.error);
