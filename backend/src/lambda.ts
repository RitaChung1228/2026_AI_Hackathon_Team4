import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../db/scripts/dynamo.js";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";

/**
 * Lambda handler，同時處理：
 * - GET  /api/services   → 查 DynamoDB 資料回傳 JSON（給前端 fetch 用）
 * - POST /api/chat 系列  → Bedrock 聊天 / agent（沿用原本邏輯）
 *
 * 路由方式：用 HTTP method 分流（API Gateway HTTP API / Function URL 皆適用）。
 * 已加上 CORS header，前端跨域 fetch 才不會被瀏覽器擋。
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext?.http?.method ?? "POST";

  // 瀏覽器跨域前的 preflight 請求，直接回 200 + CORS
  if (method === "OPTIONS") {
    return json(200, {});
  }

  // GET：查 DynamoDB 資料回給前端
  if (method === "GET") {
    return handleGetData(event);
  }

  // POST：原本的 Bedrock chat 邏輯
  try {
    const body = JSON.parse(event.body || "{}");
    const isAgent = event.rawPath?.endsWith("/agent") || body.agent === true;

    if (Array.isArray(body.messages)) {
      if (body.messages.length === 0) {
        return json(400, { error: "messages 欄位為必填且須為非空陣列" });
      }

      if (isAgent) {
        const lastMsg = body.messages[body.messages.length - 1];
        const userMessage = typeof lastMsg?.content === "string" ? lastMsg.content : "";
        const result = await agentChat(body.userId || "anonymous", userMessage, []);
        return json(200, { reply: result.reply });
      }

      const response = await invokeBedrockClaude(
        body.messages as ChatMessage[],
        body.systemPrompt,
        body.maxTokens
      );
      return json(200, {
        reply: response.content[0]?.text ?? "",
        usage: response.usage,
        stop_reason: response.stop_reason,
      });
    }

    if (typeof body.message === "string") {
      const reply = await chat(body.message, body.systemPrompt);
      return json(200, { reply });
    }

    return json(400, { error: "message 或 messages 欄位為必填" });
  } catch (err: unknown) {
    console.error("Bedrock 呼叫失敗:", err);
    const detail = err instanceof Error ? err.message : "未知錯誤";
    return json(500, { error: "AI 回覆失敗", detail });
  }
}

/**
 * GET：掃描 DynamoDB 資料表並回傳。
 * 可用 ?table=xxx 指定資料表（方便測不同表），否則用 .env 的 DYNAMO_SERVICE_TABLE。
 */
async function handleGetData(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const tableName =
    event.queryStringParameters?.table ??
    process.env.DYNAMO_SERVICE_TABLE ??
    process.env.DYNAMO_VENDOR_TABLE;

  if (!tableName) {
    return json(500, {
      error: "未設定資料表名稱",
      detail: "請用 ?table=資料表名稱，或在環境變數設定 DYNAMO_SERVICE_TABLE",
    });
  }

  try {
    const { Items } = await ddb.send(
      new ScanCommand({ TableName: tableName, Limit: 20 })
    );
    return json(200, { table: tableName, count: Items?.length ?? 0, items: Items ?? [] });
  } catch (err: unknown) {
    console.error("DynamoDB 查詢失敗:", err);
    const detail = err instanceof Error ? err.message : "未知錯誤";
    return json(500, { error: "資料查詢失敗", detail });
  }
}

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}
