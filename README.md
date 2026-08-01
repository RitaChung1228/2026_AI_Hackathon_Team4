# UNI Flow — AI 智慧零售管家

> 2026 雲湧智生：臺灣生成式 AI 應用黑客松

UNI Flow 是一款基於生成式 AI 的智慧社區與零售服務管家。透過自然語言對話，AI 自動理解使用者情境、
預測需求，一站式完成「食衣住行育樂」的服務整合與商品打包下單。

---

## 系統架構

```
┌──────────────┐     ┌────────────────────────────────────────────┐
│   Frontend   │     │               Backend (Express)             │
│  Vite+React  │────▶│  /api/chat/agent                            │
│   :5173      │     │       │                                     │
└──────────────┘     │       ▼                                     │
                     │  agent.ts (Bedrock Agent Loop)              │
                     │       │                                     │
                     │       ▼ Claude 決定呼叫哪個 Tool            │
                     │  ┌─────────────────────────────────┐        │
                     │  │ Tools                           │        │
                     │  │  get_user_profile  → DynamoDB   │        │
                     │  │  search_product    → DynamoDB   │        │
                     │  │  search_service    → DynamoDB   │        │
                     │  │  create_bundle     → DynamoDB   │        │
                     │  │  create_order      → DynamoDB   │        │
                     │  │  get_weather       → mock/API   │        │
                     │  └─────────────────────────────────┘        │
                     └────────────────────────────────────────────┘
                                        │
                              ┌─────────┴──────────┐
                              ▼                    ▼
                     ┌─────────────┐      ┌──────────────┐
                     │  DynamoDB   │      │   Bedrock    │
                     │  (us-west-2)│      │  Claude 4    │
                     │  4 Tables   │      │  (us-west-2) │
                     └─────────────┘      └──────────────┘
```

---

## 技術棧

| 層級 | 技術 |
|---|---|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Backend | Node.js + TypeScript + Express (ESM) |
| AI | AWS Bedrock (Claude Sonnet 4) |
| Database | AWS DynamoDB (4 tables) |
| Runtime | Node.js 22 |
| Package Manager | npm |

---

## 目錄結構

```
2026_AI_Hackathon/
├── backend/
│   └── src/
│       ├── index.ts           # Express server (API routes)
│       ├── agent.ts           # Bedrock Agent Loop (tool use)
│       ├── bedrock.ts         # Bedrock client 封裝
│       ├── lambda.ts          # Lambda handler (部署用)
│       ├── lib/
│       │   └── dynamo.ts      # DynamoDB client
│       └── tools/
│           ├── index.ts       # Tool 分發器 + 定義
│           ├── types.ts       # Tool input/output 型別
│           ├── getUserProfile.ts
│           ├── searchProduct.ts
│           ├── searchService.ts
│           ├── createBundle.ts
│           ├── createOrder.ts
│           └── getWeather.ts
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── components/        # UI 元件
│       ├── data.ts            # Mock data (情境包模板等)
│       └── types.ts           # 前端型別定義
├── db/                        # 主辦方規格參考 (PostgreSQL DDL + seed JSON)
├── docs/
│   └── DATABASE.md            # DynamoDB 資料庫交付文件
├── src/crypto/                # AES-256-GCM 加密工具
├── package.json
├── tsconfig.json
└── .env                       # 環境變數 (不進 git)
```

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

填入以下值（從 Workshop Studio 的 "Get AWS CLI credentials" 取得）：

```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-20250514-v1:0
```

### 3. 啟動後端

```bash
npm run dev
```

後端跑在 `http://localhost:3000`

### 4. 啟動前端

開另一個 terminal：

```bash
cd frontend
npm run dev
```

前端跑在 `http://localhost:5173`

### 5. 測試

在前端聊天框輸入任何訊息（如「幫我找咖啡」），觀察：
- 前端顯示 AI 回覆
- 後端 terminal 印出 `[Agent] 使用工具: search_product {...}`

---

## DynamoDB 資料庫

詳細規格見 [docs/DATABASE.md](./docs/DATABASE.md)

### 4 張 Table 總覽

| Table | PK | SK | 用途 |
|---|---|---|---|
| `UserProfile` | `user_id` | — | 使用者偏好、標籤 |
| `UserLists` | `user_id` | `list_type_id` | 行程包、購物車、訂單 |
| `ServicesCatalog` | `vendor_id` | `service_id` | 服務項目、零售商品 |
| `ChatHistory` | `session_id` | — | AI 對話紀錄 |

---

## AI Agent 工具

| Tool | 功能 | 讀/寫 |
|---|---|---|
| `get_user_profile` | 取得使用者偏好標籤 | 讀 UserProfile |
| `search_product` | 搜尋零售商品 | 讀 ServicesCatalog |
| `search_service` | 搜尋服務項目 | 讀 ServicesCatalog |
| `create_bundle` | 建立行程包草稿 | 寫 UserLists |
| `create_order` | 建立訂單草稿 | 寫 UserLists |
| `get_weather` | 查詢天氣（情境推薦觸發） | 外部 API |

---

## 部署

### Lambda 打包

```bash
npm run build:lambda
# 輸出：dist-lambda/index.js
```

將 `dist-lambda/index.js` 上傳至 AWS Lambda，搭配 API Gateway 即可對外服務。

---

## API Endpoints

| Method | Path | 說明 |
|---|---|---|
| GET | `/health` | 健康檢查 |
| POST | `/api/chat` | 簡易版 AI 回覆 |
| POST | `/api/chat/messages` | 多輪對話版 |
| POST | `/api/chat/agent` | Agent Loop（含 Tool Use） |

### Agent 請求格式

```json
POST /api/chat/agent
{
  "userId": "usr_jamie_888",
  "message": "幫我找咖啡",
  "history": []
}
```

### 回應格式

```json
{
  "reply": "找到以下咖啡商品...",
  "history": [...]
}
```

---

## 團隊分工

| 角色 | 負責內容 |
|---|---|
| 資料庫後端 | DynamoDB table 設計、seed 資料、Tool 串接實作 |
| AI 智能回覆 | Bedrock Agent Loop、System Prompt、Tool 定義 |
| 前端 | React UI、聊天介面、情境包展示 |
| 簡報/架構 | 系統架構圖、demo 腳本、投影片 |

---

## 注意事項

- Workshop Studio 的 credentials **會過期**，過期後需重新取得並更新 `.env`
- `.env` 已列入 `.gitignore`，不會進 git
- 所有服務商名稱皆為虛擬名稱，不使用真實品牌
- 不做真實金流模擬，訂單狀態以文字說明呈現
