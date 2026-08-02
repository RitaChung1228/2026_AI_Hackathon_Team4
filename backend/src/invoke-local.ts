import "dotenv/config";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "./lambda.js";

/**
 * 本機測試 Lambda handler 用的腳本。
 * 不需要部署，直接在本機組一個假的 GET 請求丟給 handler，看回傳結果。
 *
 * 執行方式：
 *   npx tsx backend/src/invoke-local.ts <資料表名稱>
 * 若不帶參數，會用 .env 的 DYNAMO_SERVICE_TABLE。
 */
async function main() {
  const table = process.argv[2] ?? process.env.DYNAMO_SERVICE_TABLE;

  // 組一個假的 API Gateway GET event（模擬前端打 GET /api/services）
  const fakeEvent = {
    requestContext: { http: { method: "GET" } },
    rawPath: "/api/services",
    queryStringParameters: table ? { table } : undefined,
  } as unknown as APIGatewayProxyEventV2;

  console.log(`📨 呼叫 handler（GET，table=${table ?? "(用 env 預設值)"}）\n`);

  const result = await handler(fakeEvent);

  console.log("HTTP 狀態碼:", result.statusCode);
  console.log("回傳內容:");
  console.log(JSON.stringify(JSON.parse(result.body as string), null, 2));
}

main();
