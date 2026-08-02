/**
 * 測試 DynamoDB 連線
 * 用法：npx tsx src/test-dynamo.ts
 * 
 * 這個 script 會嘗試 scan ServicesCatalog table，
 * 用來驗證 AWS credentials 和 DynamoDB 是否連通。
 */
import "./env.js"; // 必須第一行，載入 .env
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./lib/dynamo.js";

const TABLE_NAME = process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog";

async function testConnection() {
  console.log("=== DynamoDB 連線測試 ===");
  console.log(`Region: ${process.env.AWS_REGION}`);
  console.log(`Table: ${TABLE_NAME}`);
  console.log("");

  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 20, // 多抓一些看看有什麼資料
      })
    );

    console.log("✓ DynamoDB 連線成功！");
    console.log(`  回傳筆數: ${result.Items?.length ?? 0}`);
    console.log(`  ScannedCount: ${result.ScannedCount}`);
    console.log("");

    if (result.Items && result.Items.length > 0) {
      console.log("資料內容：");
      result.Items.forEach((item, i) => {
        console.log(`\n  [${i + 1}]`, JSON.stringify(item, null, 4));
      });
    } else {
      console.log("⚠ Table 存在但目前沒有資料");
    }
  } catch (err: unknown) {
    const error = err as Error & { name?: string; $metadata?: any };
    console.error("✗ DynamoDB 連線失敗！");
    console.error("");

    if (error.name === "ExpiredTokenException" || error.message?.includes("expired")) {
      console.error("  原因: AWS Session Token 已過期");
      console.error("  解法: 去 Workshop 重新取得 credentials，更新 .env 後重跑");
    } else if (error.name === "ResourceNotFoundException") {
      console.error(`  原因: Table「${TABLE_NAME}」不存在`);
      console.error("  解法: 確認 DynamoDB 裡有建立此 table，或更新 .env 中的 DYNAMO_SERVICES_TABLE");
    } else if (error.name === "UnrecognizedClientException") {
      console.error("  原因: AWS credentials 無效");
      console.error("  解法: 確認 .env 中的 AWS_ACCESS_KEY_ID / SECRET / TOKEN 是否正確");
    } else {
      console.error(`  錯誤類型: ${error.name}`);
      console.error(`  錯誤訊息: ${error.message}`);
    }
  }
}

testConnection();
