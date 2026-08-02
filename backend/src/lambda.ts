import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../db/scripts/dynamo.js";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";

/**
 * Lambda handler，用 HTTP method 分流（API Gateway 與 Function URL 皆適用）：
 * - OPTIONS → CORS preflight
 * - GET     → 掃 DynamoDB 資料表回傳 JSON（給前端 fetch / 快速驗證連線用）
 * - POST    → Bedrock 聊天，涵蓋 index.ts 的 /api/chat、/api/chat/messages、/api/chat/agent
 *
 * POST 的 agent 模式 request / response 格式與 Express 版一致，前端只要換 URL 就能切換：
 *   Body: { userId, message, sessionId?, history?, agent?: true }
 *   回傳: { reply, history, mission, toolCalls, sessionId }
 *
 * 判斷是否走 agent：API Gateway 有路徑就看 rawPath 是否以 /agent 結尾；
 * 掛在 Function URL 或單一路徑的 API Gateway（沒有 /agent 這段）就靠 body.agent === true。
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext?.http?.method ?? "POST";

  // 瀏覽器跨域前的 preflight 請求
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  // GET：查 DynamoDB 資料回給前端
  if (method === "GET") {
    return handleGetData(event);
  }

  // POST：Bedrock chat / agent
  try {
    const body = JSON.parse(event.body || "{}");
    const isAgent = event.rawPath?.endsWith("/agent") || body.agent === true;

    if (isAgent) {
      // message 為字串（前端用）或 messages 陣列的最後一則（curl 測試用）
      const lastMsg = Array.isArray(body.messages)
        ? body.messages[body.messages.length - 1]
        : undefined;
      const userMessage =
        typeof body.message === "string"
          ? body.message
          : typeof lastMsg?.content === "string"
            ? lastMsg.content
            : "";

      if (!userMessage) {
        return json(400, { error: "message 欄位為必填且須為字串" });
      }

      const result = await agentChat(
        body.userId || "anonymous",
        userMessage,
        Array.isArray(body.history) ? body.history : [],
        typeof body.sessionId === "string" ? body.sessionId : undefined
      );

      return json(200, {
        reply: result.reply,
        history: result.history,
        mission: result.mission,
        toolCalls: result.toolCalls,
        sessionId: result.sessionId,
      });
    }

    if (Array.isArray(body.messages)) {
      if (body.messages.length === 0) {
        return json(400, { error: "messages 欄位為必填且須為非空陣列" });
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
 * 可用 ?table=xxx 指定資料表（方便測不同表），否則依序看 DYNAMO_SERVICE_TABLE、
 * DYNAMO_SERVICES_TABLE、DYNAMO_VENDOR_TABLE 這幾個環境變數。
 */
async function handleGetData(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const tableName =
    event.queryStringParameters?.table ??
    process.env.DYNAMO_SERVICE_TABLE ??
    process.env.DYNAMO_SERVICES_TABLE ??
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

/**
 * CORS header。
 * 目前對所有來源開放，等有正式前端網域後把 * 換成該網域。
 */
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
