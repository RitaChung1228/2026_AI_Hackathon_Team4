import { describe, expect, it, vi } from "vitest";

vi.mock("./bedrock.js", () => ({
  chat: vi.fn(async (message: string) => `echo: ${message}`),
  invokeBedrockClaude: vi.fn(async () => ({
    id: "1",
    content: [{ type: "text", text: "multi-turn reply" }],
    model: "test",
    stop_reason: "end_turn",
    usage: { input_tokens: 1, output_tokens: 1 },
  })),
}));

vi.mock("./agent.js", () => ({
  runAgentLoop: vi.fn(async () => "agent reply"),
}));

import { handler } from "./lambda.js";

function event(body: unknown) {
  return { body: JSON.stringify(body) } as never;
}

describe("lambda handler", () => {
  it("單句訊息走 chat()", async () => {
    const res = await handler(event({ message: "hi" }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body as string)).toEqual({ reply: "echo: hi" });
  });

  it("messages 陣列走 invokeBedrockClaude()", async () => {
    const res = await handler(event({ messages: [{ role: "user", content: "hi" }] }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body as string).reply).toBe("multi-turn reply");
  });

  it("缺 message/messages 回 400", async () => {
    const res = await handler(event({}));
    expect(res.statusCode).toBe(400);
  });

  it("空 messages 陣列回 400", async () => {
    const res = await handler(event({ messages: [] }));
    expect(res.statusCode).toBe(400);
  });

  it("body.agent=true 時走 runAgentLoop()", async () => {
    const res = await handler(
      event({ messages: [{ role: "user", content: "hi" }], agent: true })
    );
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body as string)).toEqual({ reply: "agent reply" });
  });
});
