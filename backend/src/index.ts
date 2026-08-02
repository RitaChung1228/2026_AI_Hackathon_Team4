import "dotenv/config";
import express from "express";
import cors from "cors";
import { chat, invokeBedrockClaude, ChatMessage } from "./bedrock.js";
import { agentChat } from "./agent.js";
import { getCart, listBundles, listOrders } from "./api/userLists.js";
import { getProfile } from "./api/profile.js";

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
 * Body: { userId: string, message: string, sessionId?: string, history?: array }
 * Agent Loop 版：Claude 自行決定呼叫工具，完成後回覆
 * 不帶 history 時會自動從 DynamoDB ChatHistory 讀回該 session 的上下文
 */
app.post("/api/chat/agent", async (req, res) => {
  try {
    const { userId, message, sessionId, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message 欄位為必填且須為字串" });
      return;
    }

    const result = await agentChat(
      userId || "anonymous",
      message,
      history || [],
      typeof sessionId === "string" ? sessionId : undefined
    );
    res.json({
      reply: result.reply,
      history: result.history,
      mission: result.mission,
      toolCalls: result.toolCalls,
      sessionId: result.sessionId,
    });
  } catch (err: unknown) {
    console.error("Agent Loop 呼叫失敗:", err);
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    res.status(500).json({ error: "AI 回覆失敗", detail: errorMessage });
  }
});

// ---------------------------------------------------------------------------
// 讀取類 endpoint
// 邏輯都在 backend/src/api/ 底下，與 Lambda 版共用同一份實作。
// ---------------------------------------------------------------------------

/** 把讀取邏輯包成 Express handler，統一錯誤處理 */
function readRoute<T>(
  label: string,
  fn: (userId: string) => Promise<T>
): (req: express.Request, res: express.Response) => Promise<void> {
  return async (req, res) => {
    // Express 5 的 params 型別是 string | string[]，正規化成單一字串
    const raw = req.params.userId;
    const userId = Array.isArray(raw) ? raw[0] : raw;

    if (!userId) {
      res.status(400).json({ error: "userId 為必填" });
      return;
    }

    try {
      res.json(await fn(userId));
    } catch (err: unknown) {
      console.error(`${label} 查詢失敗:`, err);
      const detail = err instanceof Error ? err.message : "未知錯誤";
      res.status(500).json({ error: `${label}查詢失敗`, detail });
    }
  };
}

/** GET /api/profile/:userId — 使用者偏好標籤（與 AI 看到的同一份） */
app.get("/api/profile/:userId", readRoute("Profile", getProfile));

/** GET /api/bundles/:userId — 行程包列表，最新的排前面 */
app.get("/api/bundles/:userId", readRoute("行程包", async (userId) => ({
  bundles: await listBundles(userId),
})));

/** GET /api/cart/:userId — 購物車，沒有時回空的 */
app.get("/api/cart/:userId", readRoute("購物車", getCart));

/** GET /api/orders/:userId — 訂單列表，最新的排前面 */
app.get("/api/orders/:userId", readRoute("訂單", async (userId) => ({
  orders: await listOrders(userId),
})));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
