import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";

/**
 * Lambda 版 Bedrock chat handler，涵蓋 index.ts 的 /api/chat、/api/chat/messages、/api/chat/agent。
 * 不依賴前端；DynamoDB 只有 agent 模式才會用到。
 * 路由方式：走 API Gateway 用 rawPath 判斷，走 Function URL（無路徑）就用 body.agent 判斷。
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
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

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
