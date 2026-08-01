import { invokeBedrockClaude, ChatMessage, ContentBlock } from "./bedrock.js";
import { getToolDefinitions, runTool } from "./tools.js";

const MAX_STEPS = 5;

/**
 * Agent Loop：模型自行決定要不要呼叫工具（查資料庫），
 * 呼叫後把結果餵回去，直到模型給出最終文字回覆或達到 MAX_STEPS。
 */
export async function runAgentLoop(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const history = [...messages];
  const tools = getToolDefinitions();

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await invokeBedrockClaude(history, systemPrompt, 1024, tools);

    if (response.stop_reason !== "tool_use") {
      return response.content.find((c) => c.type === "text")?.text ?? "";
    }

    history.push({ role: "assistant", content: response.content });

    const toolUses = response.content.filter((c): c is ContentBlock & { type: "tool_use" } => c.type === "tool_use");
    const toolResults: ContentBlock[] = await Promise.all(
      toolUses.map(async (call) => {
        try {
          const result = await runTool(call.name!, call.input ?? {});
          return {
            type: "tool_result",
            tool_use_id: call.id!,
            content: JSON.stringify(result),
          };
        } catch (err) {
          return {
            type: "tool_result",
            tool_use_id: call.id!,
            content: `error: ${err instanceof Error ? err.message : "未知錯誤"}`,
          };
        }
      })
    );

    history.push({ role: "user", content: toolResults });
  }

  throw new Error(`Agent Loop 超過 ${MAX_STEPS} 步仍未得到最終回覆`);
}
