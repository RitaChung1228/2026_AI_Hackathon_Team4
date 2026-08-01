import type { ToolName } from "./types.js";
import { searchProduct } from "./searchProduct.js";
import { searchService } from "./searchService.js";
import { getUserProfile } from "./getUserProfile.js";
import { createBundle } from "./createBundle.js";
import { createOrder } from "./createOrder.js";
import { getWeather } from "./getWeather.js";

/**
 * Tool 分發器
 * 後端 A 的 Agent Loop 呼叫這個 function，
 * 根據 tool name 分發到後端 B 實作的對應函式。
 */
export async function executeTool(toolName: ToolName, input: unknown): Promise<unknown> {
  switch (toolName) {
    case "search_product":
      return await searchProduct(input as Parameters<typeof searchProduct>[0]);
    case "search_service":
      return await searchService(input as Parameters<typeof searchService>[0]);
    case "get_user_profile":
      return await getUserProfile(input as Parameters<typeof getUserProfile>[0]);
    case "create_bundle":
      return await createBundle(input as Parameters<typeof createBundle>[0]);
    case "create_order":
      return await createOrder(input as Parameters<typeof createOrder>[0]);
    case "get_weather":
      return await getWeather(input as Parameters<typeof getWeather>[0]);
    default:
      throw new Error(`未知的工具: ${toolName}`);
  }
}

/**
 * Bedrock Converse API 需要的 Tool 定義
 * 告訴 Claude 有哪些工具可用、input schema 是什麼
 */
export const toolDefinitions = [
  {
    toolSpec: {
      name: "search_product",
      description: "搜尋零售商品。根據關鍵字或分類尋找可購買的商品。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            keyword: { type: "string", description: "搜尋關鍵字" },
            category: { type: "string", description: "商品分類（飲品、食品、保健、生活用品）" },
            limit: { type: "number", description: "回傳數量上限" },
          },
          required: ["keyword"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "search_service",
      description: "搜尋服務項目。根據類型或關鍵字尋找可預約的服務（清潔、交通、外送、訂位等）。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            type: {
              type: "number",
              description: "服務類型：1=清潔, 2=家電清洗, 3=交通寄件, 6=訂位, 9=外送, 10=水電修繕, 11=購物",
            },
            keyword: { type: "string", description: "搜尋關鍵字" },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: "get_user_profile",
      description: "取得使用者的偏好設定與 hashtag 標籤，用來個人化推薦。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            userId: { type: "string", description: "使用者 ID" },
          },
          required: ["userId"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "create_bundle",
      description: "建立行程包草稿。將多個服務和商品打包成一個行程計畫，包含步驟清單。需使用者確認後才正式生效。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            userId: { type: "string", description: "使用者 ID" },
            title: { type: "string", description: "行程包標題" },
            steps: {
              type: "array",
              description: "行程步驟列表",
              items: {
                type: "object",
                properties: {
                  description: { type: "string", description: "步驟描述" },
                  serviceId: { type: "string", description: "關聯的服務 ID" },
                  productId: { type: "string", description: "關聯的商品 ID" },
                },
                required: ["description"],
              },
            },
          },
          required: ["userId", "title", "steps"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "create_order",
      description: "建立訂單草稿。將商品或服務加入訂單，需使用者確認後才正式成立。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            userId: { type: "string", description: "使用者 ID" },
            items: {
              type: "array",
              description: "訂單項目",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", description: "商品 ID" },
                  serviceId: { type: "string", description: "服務 ID" },
                  name: { type: "string", description: "項目名稱" },
                  quantity: { type: "number", description: "數量" },
                  price: { type: "number", description: "單價" },
                },
                required: ["name", "quantity", "price"],
              },
            },
            remark: { type: "string", description: "備註" },
          },
          required: ["userId", "items"],
        },
      },
    },
  },
  {
    toolSpec: {
      name: "get_weather",
      description: "查詢指定城市的天氣資訊，用於情境感知推薦（如下雨推薦雨具、叫車）。",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            city: { type: "string", description: "城市名稱" },
            date: { type: "string", description: "日期 (YYYY-MM-DD)，省略則為今天" },
          },
          required: ["city"],
        },
      },
    },
  },
];
