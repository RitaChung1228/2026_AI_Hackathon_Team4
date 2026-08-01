import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { executeTool, toolDefinitions } from "./tools/index.js";
import type { ToolName } from "./tools/types.js";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-west-2",
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";
const MAX_STEPS = 10;

const SYSTEM_PROMPT = `你是 UNI Flow 智慧零售管家，一個基於 AI 的智慧社區與零售服務助手。

你的角色：
- 理解使用者的生活需求（食衣住行育樂）
- 根據使用者偏好推薦適合的服務和商品
- 將複雜需求拆解為具體步驟
- 協助打包行程、下單商品、預約服務

規則：
- 建立訂單或行程包前，先確認使用者意願
- 回覆使用繁體中文
- 保持簡潔親切的語氣
- 如果需要更多資訊，主動詢問使用者`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: any;
}

/**
 * Agent Loop：讓 Claude 自己決定要呼叫哪些工具、執行幾步
 */
export async function agentChat(
  userId: string,
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
): Promise<{ reply: string; history: ConversationMessage[] }> {
  // 組裝訊息歷史
  const messages: ConversationMessage[] = [
    ...conversationHistory,
    { role: "user", content: [{ text: userMessage }] },
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT + `\n\n目前使用者 ID: ${userId}` }],
      messages: messages as any,
      toolConfig: {
        tools: toolDefinitions as any,
      },
    });

    const response = await client.send(command);
    const stopReason = response.stopReason;
    const outputMessage = response.output?.message;

    if (!outputMessage) {
      throw new Error("Bedrock 沒有回傳訊息");
    }

    // 把 assistant 回覆加入歷史
    messages.push({ role: "assistant", content: outputMessage.content });

    // 如果 Claude 決定結束對話
    if (stopReason === "end_turn") {
      const textContent = outputMessage.content?.find((block: any) => block.text);
      const reply = textContent?.text ?? "";
      return { reply, history: messages };
    }

    // 如果 Claude 想用工具
    if (stopReason === "tool_use") {
      const toolUseBlocks = outputMessage.content?.filter(
        (block: any) => block.toolUse
      ) ?? [];

      const toolResults: any[] = [];

      for (const block of toolUseBlocks) {
        const toolUse = block.toolUse!;
        const toolUseId = toolUse.toolUseId!;
        const name = toolUse.name!;
        const input = toolUse.input;
        console.log(`[Agent] 使用工具: ${name}`, JSON.stringify(input));

        try {
          const result = await executeTool(name as ToolName, input);
          toolResults.push({
            toolResult: {
              toolUseId,
              content: [{ json: result }],
            },
          });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "工具執行失敗";
          console.error(`[Agent] 工具錯誤: ${name}`, errorMsg);
          toolResults.push({
            toolResult: {
              toolUseId,
              content: [{ text: `工具執行失敗: ${errorMsg}` }],
              status: "error",
            },
          });
        }
      }

      // 把工具結果塞回對話讓 Claude 繼續
      messages.push({ role: "user", content: toolResults });
    }
  }

  // 超過最大步數，強制回覆
  return {
    reply: "抱歉，我處理這個請求花了太長時間。可以簡化你的需求再試一次嗎？",
    history: messages,
  };
}
