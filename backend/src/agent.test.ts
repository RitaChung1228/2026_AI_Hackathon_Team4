import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeBedrockClaude = vi.fn();
vi.mock("./bedrock.js", () => ({
  invokeBedrockClaude: (...args: unknown[]) => invokeBedrockClaude(...args),
}));

vi.mock("./tools.js", () => ({
  getToolDefinitions: () => [{ name: "search_vendor", description: "", input_schema: { type: "object", properties: {} } }],
  runTool: vi.fn(async () => [{ vendor_name: "測試商行", service_name: "居家清潔" }]),
}));

import { runAgentLoop } from "./agent.js";

describe("runAgentLoop", () => {
  beforeEach(() => {
    invokeBedrockClaude.mockReset();
  });

  it("模型不呼叫工具時直接回傳文字", async () => {
    invokeBedrockClaude.mockResolvedValueOnce({
      content: [{ type: "text", text: "你好" }],
      stop_reason: "end_turn",
    });

    const reply = await runAgentLoop([{ role: "user", content: "hi" }]);
    expect(reply).toBe("你好");
    expect(invokeBedrockClaude).toHaveBeenCalledTimes(1);
  });

  it("模型呼叫工具查資料庫後，把結果餵回去拿到最終回覆", async () => {
    invokeBedrockClaude
      .mockResolvedValueOnce({
        content: [{ type: "tool_use", id: "t1", name: "search_vendor", input: { type: "1" } }],
        stop_reason: "tool_use",
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "幫你找到測試商行的居家清潔服務" }],
        stop_reason: "end_turn",
      });

    const reply = await runAgentLoop([{ role: "user", content: "幫我找清潔服務" }]);
    expect(reply).toBe("幫你找到測試商行的居家清潔服務");
    expect(invokeBedrockClaude).toHaveBeenCalledTimes(2);
  });

  it("超過 MAX_STEPS 仍在呼叫工具則丟出錯誤", async () => {
    invokeBedrockClaude.mockResolvedValue({
      content: [{ type: "tool_use", id: "t1", name: "search_vendor", input: { type: "1" } }],
      stop_reason: "tool_use",
    });

    await expect(runAgentLoop([{ role: "user", content: "hi" }])).rejects.toThrow();
  });
});
