import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { executeTool, toolDefinitions } from "./tools/index.js";
import type { ToolName } from "./tools/types.js";
import {
  buildSessionId,
  loadChatHistory,
  saveChatHistory,
} from "./lib/chatHistory.js";
import { getStepIcon } from "./lib/stepIcon.js";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-west-2",
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

/** Agent loop 單輪最多執行幾步（每步 = 一次 Bedrock 呼叫） */
const MAX_STEPS = 10;
/** 單次回覆的最大 token 數 */
const MAX_TOKENS = 2048;
/** 對話歷史最多保留幾則訊息，避免 token 無限增長 */
const MAX_HISTORY_MESSAGES = 24;
/** 單一工具結果序列化後的長度上限，超過則截斷 */
const MAX_TOOL_RESULT_CHARS = 4000;

const SYSTEM_PROMPT = `你是 UNI Flow 智慧零售管家，一個基於 AI 的智慧社區與零售服務助手。

## 你的角色
- 理解使用者的生活需求（食衣住行育樂）
- 根據使用者偏好推薦適合的服務和商品
- 將複雜需求拆解為具體步驟
- 協助打包行程、下單商品、預約服務

## 可用工具與使用時機

你有以下工具可以呼叫，請根據使用者需求主動選擇合適的工具：

1. get_user_profile - 取得使用者偏好與標籤
   何時用：對話開始時、需要個人化推薦時
   輸入：userId

2. search_product - 搜尋可購買的零售商品
   何時用：使用者想買東西、需要商品推薦時
   輸入：keyword（必填）、category（飲品/食品/保健/生活用品）、limit

3. search_service - 搜尋可預約的服務
   何時用：使用者需要生活服務（清潔、修繕、外送、交通、訂位等）
   輸入：type（1=清潔, 2=家電清洗, 3=交通寄件, 6=訂位, 9=外送, 10=水電修繕, 11=購物）、keyword

4. get_weather - 查詢天氣
   何時用：使用者問天氣、或需要根據天氣推薦（下雨推薦叫車/雨具）
   輸入：city（必填）、date（YYYY-MM-DD，省略為今天）

5. create_bundle - 建立行程包（任務計畫）
   何時用：使用者有複合需求，且已經釐清需求細節後
   輸入：userId、title、steps[]
   重要：先問問題確認需求，收到回答後才呼叫此工具
   重要：任何一個 step 只要涉及「去哪家店」「買什麼商品」「用什麼服務」，一定要先呼叫
   search_service 或 search_product 拿到真實結果，並把該結果的 id 填進該 step 的
   serviceId 或 productId——不能只寫文字描述、不帶 id。只有跟具體店家/商品/服務無關的
   步驟（例如「回家後加熱享用」）才可以不帶 id。

6. create_order - 建立訂單草稿
   何時用：使用者確認要購買商品或預約服務時
   輸入：userId、items[]（每項需 name, quantity, price）、remark
   重要：建立前先向使用者確認品項與價格

## 核心行為：主動規劃行程

你最重要的能力是「主動幫使用者規劃」。流程如下：

第一步：先呼叫 get_user_profile 取得使用者標籤與偏好
第二步：根據使用者需求，一次問一個問題釐清需求（最多問 3 題，每題附上建議選項）
第三步：每次收到回答後，決定是否需要再問下一題，或已有足夠資訊可以開始規劃
第四步：資訊足夠後，搜尋相關商品和服務
第五步：呼叫 create_bundle 建立行程計畫
第六步：簡短告知使用者已建立計畫

提問格式（重要）：
每次提問時，在回覆最後一行用以下格式附上建議選項：
[選項: 選項A | 選項B | 選項C | 選項D]

範例：
使用者說「我明天要去台中玩」
→ 先取得 profile
→ 第一個問題：
  「大概幾個人一起去呀？」
  [選項: 1 個人 | 2 個人 | 3~5 人 | 5 人以上]

使用者回答後
→ 第二個問題：
  「想安排什麼類型的活動？」
  [選項: 吃美食 | 逛景點 | 購物 | 都來一點]

使用者回答後
→ 資訊夠了，直接搜尋+建立行程（不用再問第三題）

使用者說「家裡水管漏水」
→ 先取得 profile
→ 第一個問題：
  「是哪裡漏水？」
  [選項: 浴室 | 廚房 | 陽台 | 其他地方]

使用者回答後
→ 第二個問題：
  「漏得嚴重嗎？」
  [選項: 滴滴答答而已 | 一直在流 | 已經淹水了]

重要規則：
→ 一定要先 get_user_profile，將使用者標籤納入考量
→ 一次只問一個問題，等使用者回答後再問下一個
→ 每個問題都要附上 [選項: ...] 格式的建議答案（3~4 個選項）
→ 如果使用者標籤是 #BudgetFirst，問題中加入預算相關選項
→ 最多問 3 題，超過就直接用已有資訊規劃
→ 如果使用者一開始就給了足夠資訊，可以跳過提問直接規劃
→ 選項要具體、口語化，讓使用者容易選擇

## 工具搭配策略

個人化推薦流程：先 get_user_profile → 再根據標籤調整推薦方向
複合需求流程：get_user_profile → 問 1~3 個問題 → 使用者回答後 → search_product + search_service → create_bundle
購物流程：search_product → 展示結果 → 使用者確認 → create_order
天氣連動推薦：get_weather → 如果下雨 → search_service(type=3) 推薦叫車 或 search_product(keyword="雨傘")

標籤影響決策的範例：
→ #TimeSaver：少問問題、推薦最快速的選項
→ #BudgetFirst：優先推薦低價方案
→ #Foodie：出遊行程多安排餐廳美食
→ #Traveler：出差行程自動考慮 eSIM、轉接頭等
→ #FrequentPickup：優先推薦門市取貨方式

## 回覆格式（重要）
- 純文字回覆，禁止使用任何 Markdown 語法
- 不要用粗體標記、斜體標記、標題符號、程式碼區塊
- 不要用 - 或 * 開頭的列表符號，改用箭頭符號或直接換行
- 可以用 emoji 表達語意，但不要過度使用
- 換行分段即可，不需要特殊格式標記

## 回覆規則
- 回覆使用繁體中文
- 保持簡潔親切的語氣，像朋友般對話
- 如果需要更多資訊，主動詢問使用者
- 展示搜尋結果時，用簡潔文字列出（品名、價格、描述），每項一行
- 如果工具回傳空結果，誠實告知並建議其他選擇`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: any;
}

/** 工具呼叫記錄 */
interface ToolCallRecord {
  name: string;
  input: unknown;
  result: unknown;
}

/** Agent 回傳結果（包含結構化 UI 資料） */
export interface AgentResult {
  reply: string;
  history: ConversationMessage[];
  /** 如果 agent 呼叫了 create_bundle，會附帶 mission 資料供前端渲染任務卡片 */
  mission?: {
    title: string;
    subtitle: string;
    progress: number;
    tasks: Array<{
      id: string;
      icon: string;
      title: string;
      status: "confirmed" | "in-progress" | "pending";
      detail: string;
      /** 讓前端能連到商品/服務詳情或叫車等動作，而不是只顯示文字 */
      serviceId?: string;
      productId?: string;
      vendorName?: string;
      price?: number;
      imgUrl?: string;
      category?: string;
    }>;
  };
  /** Agent 過程中呼叫的工具清單（供前端顯示分析動畫步驟） */
  toolCalls: string[];
  /** 本次對話所屬的 session，前端下次請求帶回來即可續接 */
  sessionId: string;
}

// 工具名稱 → 分析步驟顯示文字
const TOOL_STEP_LABELS: Record<string, string> = {
  get_user_profile: "讀取你的偏好",
  search_product: "搜尋推薦商品",
  search_service: "搜尋相關服務",
  get_weather: "查詢天氣狀況",
  create_bundle: "建立行程計畫",
  create_order: "建立訂單草稿",
};

/**
 * Agent Loop：讓 Claude 自己決定要呼叫哪些工具、執行幾步
 * 回傳包含結構化 UI 資料，讓前端可以渲染任務卡片
 */
export async function agentChat(
  userId: string,
  userMessage: string,
  conversationHistory: ConversationMessage[] = [],
  sessionId?: string
): Promise<AgentResult> {
  const sid = sessionId ?? buildSessionId(userId);

  // 呼叫方沒帶歷史時，從 DynamoDB ChatHistory 撈回這個 session 上次的對話
  let priorMessages = conversationHistory;
  let priorIntent: string | undefined;

  if (priorMessages.length === 0) {
    const stored = await loadChatHistory(sid);
    if (stored) {
      priorMessages = stored.rawHistory as ConversationMessage[];
      priorIntent = stored.contextIntent;
      console.log(`[Agent] 載入 session ${sid} 歷史 ${priorMessages.length} 則`);
    }
  }

  const messages: ConversationMessage[] = [
    ...trimHistory(priorMessages),
    { role: "user", content: [{ text: userMessage }] },
  ];

  const toolCalls: ToolCallRecord[] = [];

  /**
   * 組裝回傳結果（含 create_bundle 產生的 mission 卡片資料），
   * 並把整輪對話寫回 ChatHistory。寫入失敗只記 log，不影響回覆。
   */
  const buildResult = async (reply: string): Promise<AgentResult> => {
    const mission = extractMission(toolCalls);

    await saveChatHistory({
      sessionId: sid,
      userId,
      messages,
      contextIntent: mission?.title ?? priorIntent,
    });

    return {
      reply,
      history: messages,
      mission,
      toolCalls: toolCalls.map((tc) => TOOL_STEP_LABELS[tc.name] ?? tc.name),
      sessionId: sid,
    };
  };

  for (let step = 0; step < MAX_STEPS; step++) {
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT + `\n\n目前使用者 ID: ${userId}` }],
      messages: messages as any,
      inferenceConfig: {
        maxTokens: MAX_TOKENS,
        temperature: 0.7,
      },
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

    messages.push({ role: "assistant", content: outputMessage.content });

    // Claude 想用工具 → 執行後把結果餵回去，繼續下一步
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
          toolCalls.push({ name, input, result });
          toolResults.push({
            toolResult: {
              toolUseId,
              content: [capToolResult(result)],
            },
          });
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "工具執行失敗";
          console.error(`[Agent] 工具錯誤: ${name}`, errorMsg);
          toolCalls.push({ name, input, result: { error: errorMsg } });
          toolResults.push({
            toolResult: {
              toolUseId,
              content: [{ text: `工具執行失敗: ${errorMsg}` }],
              status: "error",
            },
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // 其他情況（end_turn / max_tokens / stop_sequence 等）→ 回傳目前累積的文字
    if (stopReason === "max_tokens") {
      console.warn("[Agent] 回覆被 max_tokens 截斷");
    }
    return await buildResult(extractText(outputMessage.content));
  }

  // 超過最大步數
  console.warn(`[Agent] 已達 MAX_STEPS (${MAX_STEPS})，強制結束`);
  return await buildResult("抱歉，我處理這個請求花了太長時間。可以簡化你的需求再試一次嗎？");
}

/**
 * 從 Bedrock 回傳的 content blocks 取出所有文字並合併
 * （Claude 可能回傳多個 text block，只取第一個會漏內容）
 */
function extractText(content: any[] | undefined): string {
  if (!content) return "";
  return content
    .filter((block: any) => typeof block?.text === "string")
    .map((block: any) => block.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * 從工具呼叫記錄中取出 create_bundle 的結果，轉成前端可渲染的 mission 卡片資料
 * 同一輪若多次呼叫，取最後一次（使用者可能要求調整行程）
 *
 * detail 欄位會用同一輪 search_service / search_product 撈到的真實資料回填
 * （店家名稱、服務/商品名稱、價格），而不是只顯示內部 id 或空泛文字。
 */
function extractMission(toolCalls: ToolCallRecord[]): AgentResult["mission"] {
  const bundleCalls = toolCalls.filter((tc) => tc.name === "create_bundle");
  const latest = bundleCalls[bundleCalls.length - 1];
  const bundle = (latest?.result as any)?.bundle;
  if (!bundle?.steps) return undefined;

  const serviceById = new Map<string, any>();
  const productById = new Map<string, any>();
  for (const tc of toolCalls) {
    // Service 的主鍵欄位是 service_id（snake_case，見 types.ts），不是 id
    if (tc.name === "search_service") {
      for (const s of (tc.result as any)?.services ?? []) serviceById.set(s.service_id, s);
    }
    if (tc.name === "search_product") {
      for (const p of (tc.result as any)?.products ?? []) productById.set(p.id, p);
    }
  }

  return {
    title: bundle.title,
    subtitle: `${bundle.steps.length} 個步驟`,
    progress: 0,
    tasks: bundle.steps.map((s: any, i: number) => {
      const service = s.serviceId ? serviceById.get(s.serviceId) : undefined;
      const product = s.productId ? productById.get(s.productId) : undefined;
      const detail = service
        ? `${service.vendor_name || service.service_name} · ${service.service_name}`
        : product
          ? `${product.name} · NT$${product.price}`
          : s.serviceId
            ? `服務: ${s.serviceId}`
            : s.productId
              ? `商品: ${s.productId}`
              : "待處理";

      return {
        id: s.stepId ?? `step-${i + 1}`,
        icon: getStepIcon(s.description),
        title: s.description,
        status: "pending" as const,
        detail,
        serviceId: s.serviceId,
        productId: s.productId,
        vendorName: service?.vendor_name,
        price: service?.price ?? product?.price,
        imgUrl: service?.img_url,
        category: service?.category ?? (product ? "product" : undefined),
      };
    }),
  };
}

/**
 * 限制單一工具結果塞進對話的大小，避免 token 爆量。
 * 太大就改用截斷後的文字描述。
 */
function capToolResult(result: unknown): { json: unknown } | { text: string } {
  const serialized = JSON.stringify(result);
  if (serialized && serialized.length > MAX_TOOL_RESULT_CHARS) {
    return {
      text: `${serialized.slice(0, MAX_TOOL_RESULT_CHARS)}\n\n(結果過長已截斷，如需完整資料請縮小查詢範圍)`,
    };
  }
  return { json: result };
}

/**
 * 修剪對話歷史，避免 token 無限增長。
 * 只在「使用者的純文字訊息」邊界切斷，才不會破壞 toolUse 與 toolResult 的配對。
 */
function trimHistory(history: ConversationMessage[]): ConversationMessage[] {
  if (history.length <= MAX_HISTORY_MESSAGES) return history;

  for (let i = history.length - MAX_HISTORY_MESSAGES; i < history.length; i++) {
    const msg = history[i];
    const isPlainUserMessage =
      msg.role === "user" &&
      Array.isArray(msg.content) &&
      msg.content.some((block: any) => typeof block?.text === "string");

    if (isPlainUserMessage) {
      console.log(`[Agent] 歷史修剪: ${history.length} → ${history.length - i} 則`);
      return history.slice(i);
    }
  }

  // 找不到安全的切點就保留原樣
  return history;
}


