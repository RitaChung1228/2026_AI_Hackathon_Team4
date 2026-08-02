import "dotenv/config";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo.js";

/**
 * DynamoDB 連線 / 欄位測試腳本
 *
 * 用途：確認能連上 DynamoDB，並印出資料表實際回傳的欄位，
 * 方便後端 B 把 searchProduct / searchService 的 mock data 換成真實查詢。
 *
 * 執行方式：
 *   npx tsx db/scripts/test-dynamo.ts <資料表名稱>
 * 若不帶參數，會用 .env 的 DYNAMO_VENDOR_TABLE。
 */

async function main() {
  const tableName = process.argv[2] ?? process.env.DYNAMO_VENDOR_TABLE;

  if (!tableName) {
    console.error(
      "❌ 未指定資料表名稱。請用：npx tsx db/scripts/test-dynamo.ts <資料表名稱>\n" +
        "   或在 .env 設定 DYNAMO_VENDOR_TABLE。"
    );
    process.exit(1);
  }

  console.log(`🔍 正在掃描資料表：${tableName}（region=${process.env.AWS_REGION}）\n`);

  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: tableName,
        Limit: 5, // 只撈前 5 筆，測試用
      })
    );

    const items = result.Items ?? [];

    console.log(`✅ 連線成功，共取回 ${items.length} 筆（Count=${result.Count}）\n`);

    if (items.length === 0) {
      console.log("⚠️  資料表是空的，或這幾筆沒有資料。請確認資料是否已匯入。");
      return;
    }

    // 印出第一筆所有欄位名稱，方便對照
    console.log("📋 第一筆的欄位名稱：");
    console.log(Object.keys(items[0]).join(", "));
    console.log();

    // 完整印出每一筆內容
    items.forEach((item, i) => {
      console.log(`--- 第 ${i + 1} 筆 ---`);
      console.log(JSON.stringify(item, null, 2));
      console.log();
    });
  } catch (err) {
    console.error("❌ 查詢失敗：", err instanceof Error ? err.message : err);
    console.error(
      "\n常見原因：\n" +
        "  1. 資料表名稱打錯（大小寫也要對）\n" +
        "  2. AWS 憑證沒設定或已過期（AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN）\n" +
        "  3. AWS_REGION 跟資料表所在區域不一致\n" +
        "  4. IAM 權限缺少 dynamodb:Scan"
    );
    process.exit(1);
  }
}

main();
