import "dotenv/config";
import express from "express";
import cors from "cors";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 健康檢查
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * POST /api/chat
 * Body: { message: string, systemPrompt?: string }
 * 簡易版：送一段文字，取得 AI 回覆
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message 欄位為必填且須為字串" });
      return;
    }

    const reply = await chat(message, systemPrompt);
    res.json({ reply });
  } catch (err: unknown) {
    console.error("Bedrock 呼叫失敗:", err);
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    res.status(500).json({ error: "AI 回覆失敗", detail: errorMessage });
  }
});

/**
 * POST /api/chat/messages
 * Body: { messages: ChatMessage[], systemPrompt?: string, maxTokens?: number }
 * 多輪對話版：傳入完整對話歷史
 */
app.post("/api/chat/messages", async (req, res) => {
  try {
    const { messages, systemPrompt, maxTokens } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages 欄位為必填且須為非空陣列" });
      return;
    }

    const response = await invokeBedrockClaude(
      messages as ChatMessage[],
      systemPrompt,
      maxTokens
    );

    res.json({
      reply: response.content[0]?.text ?? "",
      usage: response.usage,
      stop_reason: response.stop_reason,
    });
  } catch (err: unknown) {
    console.error("Bedrock 呼叫失敗:", err);
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    res.status(500).json({ error: "AI 回覆失敗", detail: errorMessage });
  }
});

/**
 * POST /api/chat/agent
 * Body: { userId: string, message: string, history?: array }
 * Agent Loop 版：Claude 自行決定呼叫工具，完成後回覆
 */
app.post("/api/chat/agent", async (req, res) => {
  try {
    const { userId, message, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message 欄位為必填且須為字串" });
      return;
    }

    const result = await agentChat(userId || "anonymous", message, history || []);
    res.json({ reply: result.reply, history: result.history });
  } catch (err: unknown) {
    console.error("Agent Loop 呼叫失敗:", err);
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    res.status(500).json({ error: "AI 回覆失敗", detail: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
