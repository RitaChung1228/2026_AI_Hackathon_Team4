import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";

/**
 * Lambda 版 chat handler，涵蓋 index.ts 的 /api/chat、/api/chat/messages、/api/chat/agent。
 *
 * Agent 模式的 request / response 格式與 Express 版一致，前端只要換 URL 就能切換：
 *   Body: { userId, message, sessionId?, history?, agent?: true }
 *   回傳: { reply, history, mission, toolCalls, sessionId }
 *
 * 判斷是否走 agent：API Gateway 有路徑就看 rawPath 是否以 /agent 結尾；
 * 掛在 Function URL 或單一路徑的 API Gateway（沒有 /agent 這段）就靠 body.agent === true。
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  // CORS preflight
  const method = event.requestContext?.http?.method ?? "POST";
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

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
 * CORS header。
 * 目前對所有來源開放，等有正式前端網域後把 * 換成該網域。
 */
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body),
  };
}
