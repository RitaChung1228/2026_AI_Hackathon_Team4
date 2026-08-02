import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo.js";

const TABLE_NAME = process.env.DYNAMO_CHAT_HISTORY_TABLE ?? "ChatHistory";

/**
 * raw_history 存成 JSON 字串，超過此上限就只留純文字對話。
 * DynamoDB 單筆 item 上限 400KB，留餘裕給其他欄位。
 */
const MAX_RAW_HISTORY_BYTES = 300 * 1024;

/** 給人看的對話輪次，對應 table 的 dialog_history 欄位 */
export interface DialogTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Bedrock Converse API 的訊息格式。
 * content 可能是純字串，也可能是 content block 陣列（含 toolUse / toolResult）。
 */
export interface RawMessage {
  role: "user" | "assistant";
  content: unknown;
}

export interface ChatHistoryRecord {
  sessionId: string;
  userId: string;
  dialogHistory: DialogTurn[];
  rawHistory: RawMessage[];
  contextIntent?: string;
  timestamp?: string;
}

/** session_id 命名規則：sess_<user_id>（對齊 docs/DATABASE.md Table 4） */
export function buildSessionId(userId: string): string {
  return `sess_${userId}`;
}

/**
 * 把 Bedrock 的 content block 訊息壓成純文字對話。
 * 只有 toolUse / toolResult 的訊息（沒有任何 text）會被略過，
 * 因為那些是 agent loop 的內部往返，不是使用者看到的對話。
 */
export function toDialogTurns(messages: RawMessage[]): DialogTurn[] {
  const turns: DialogTurn[] = [];

  for (const msg of messages) {
    let text = "";

    if (typeof msg.content === "string") {
      text = msg.content;
    } else if (Array.isArray(msg.content)) {
      text = msg.content
        .map((block) =>
          block && typeof block === "object" && typeof (block as { text?: unknown }).text === "string"
            ? (block as { text: string }).text
            : ""
        )
        .filter(Boolean)
        .join("\n");
    }

    text = text.trim();
    if (text) {
      turns.push({ role: msg.role, content: text });
    }
  }

  return turns;
}

/**
 * 讀取某個 session 最新的對話快照。
 *
 * ChatHistory 的 key 是 session_id(PK) + timestamp(SK)，等於每輪對話都留一筆快照，
 * 所以要用 Query 由新到舊取第一筆，而不是 GetCommand。
 * 讀失敗不拋錯（table 不存在、credentials 過期等），回 null 讓對話照常進行。
 */
export async function loadChatHistory(sessionId: string): Promise<ChatHistoryRecord | null> {
  try {
    const { Items } = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "session_id = :sid",
        ExpressionAttributeValues: { ":sid": sessionId },
        ScanIndexForward: false, // timestamp 由大到小 → 最新的在前面
        Limit: 1,
      })
    );

    const Item = Items?.[0];
    if (!Item) return null;

    let rawHistory: RawMessage[] = [];
    if (typeof Item.raw_history === "string") {
      try {
        rawHistory = JSON.parse(Item.raw_history) as RawMessage[];
      } catch {
        console.error(`[chatHistory] raw_history 解析失敗，session=${sessionId}`);
      }
    }

    const dialogHistory = (Item.dialog_history ?? []) as DialogTurn[];

    // 舊資料只有 dialog_history（沒有 raw_history），退回用純文字重建
    if (rawHistory.length === 0 && dialogHistory.length > 0) {
      rawHistory = dialogHistory.map((turn) => ({
        role: turn.role,
        content: [{ text: turn.content }],
      }));
    }

    return {
      sessionId,
      userId: Item.user_id ?? "",
      dialogHistory,
      rawHistory,
      contextIntent: Item.context_intent,
      timestamp: Item.timestamp,
    };
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "未知錯誤";
    console.error(`[chatHistory] 讀取失敗 session=${sessionId}:`, detail);
    return null;
  }
}

/**
 * 寫入一筆對話快照。
 *
 * 因為 SK 是 timestamp，每次呼叫都是新增而非覆蓋，等於保留完整的版本軌跡；
 * 讀取時只會取最新那筆。寫失敗不拋錯，只記 log — 對話能回覆比留紀錄重要。
 */
export async function saveChatHistory(input: {
  sessionId: string;
  userId: string;
  messages: RawMessage[];
  contextIntent?: string;
}): Promise<void> {
  const { sessionId, userId, messages, contextIntent } = input;

  try {
    const dialogHistory = toDialogTurns(messages);
    let rawHistory: string | undefined = JSON.stringify(messages);

    if (Buffer.byteLength(rawHistory, "utf8") > MAX_RAW_HISTORY_BYTES) {
      console.warn(
        `[chatHistory] raw_history 過大（${Buffer.byteLength(rawHistory, "utf8")} bytes），只保留純文字對話`
      );
      rawHistory = undefined;
    }

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          session_id: sessionId,
          user_id: userId,
          dialog_history: dialogHistory,
          ...(rawHistory ? { raw_history: rawHistory } : {}),
          ...(contextIntent ? { context_intent: contextIntent } : {}),
          timestamp: new Date().toISOString(),
        },
      })
    );
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "未知錯誤";
    console.error(`[chatHistory] 寫入失敗 session=${sessionId}:`, detail);
  }
}
