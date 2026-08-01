# API Endpoints 需求規格

> 根據系統模組拆分，定義後端需實作的 REST API。

---

## 模組分類

### 有資料庫的模組（需 CRUD + Bedrock 整合）
- User Profile（偏好設定）
- 使用者清單（購物車、行程包、交易紀錄）
- 歷史紀錄（對話上下文）
- 服務（零售商品、交通）

### 寫死的模組（靜態資料 / 固定回傳）
- 保險
- 提醒
- 旅遊網卡 eSIM

---

## 1. User Profile（使用者偏好）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/profile/:userId` | 取得使用者 Profile（含 hashtag 標籤） |
| PUT | `/api/profile/:userId` | 更新偏好標籤與設定 |
| POST | `/api/profile/init` | 首次使用，透過 AI 問答建立初始 Profile |

### 資料結構
```json
{
  "userId": "uuid",
  "hashtags": ["#效率優先", "#通勤日常", "#咖啡控"],
  "preferences": {
    "decisionStyle": "效率優先",
    "lifestyle": "商務出差",
    "habits": ["超商取貨", "行動支付"]
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 2. 使用者清單

### 2.1 購物車（商品）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/cart/:userId` | 取得購物車內容 |
| POST | `/api/cart/:userId/items` | 新增商品到購物車 |
| PUT | `/api/cart/:userId/items/:itemId` | 更新商品數量 |
| DELETE | `/api/cart/:userId/items/:itemId` | 移除商品 |
| POST | `/api/cart/:userId/checkout` | 結帳（建立訂單） |

### 2.2 行程包（Scenario Bundles）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/bundles` | 取得預設行程包列表 |
| GET | `/api/bundles/:bundleId` | 取得單一行程包詳情（含 AI 步驟拆解） |
| GET | `/api/bundles/user/:userId` | 取得使用者自訂/儲存的行程包 |
| POST | `/api/bundles/user/:userId` | 儲存自訂行程包 |
| PUT | `/api/bundles/user/:userId/:bundleId` | 更新行程包進度 |
| DELETE | `/api/bundles/user/:userId/:bundleId` | 刪除自訂行程包 |

### 2.3 交易紀錄

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/orders/:userId` | 取得使用者訂單列表 |
| GET | `/api/orders/:userId/:orderId` | 取得單筆訂單詳情 |
| POST | `/api/orders/:userId` | 建立新訂單（從購物車或行程包確認） |

---

## 3. 歷史紀錄（對話上下文）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/conversations/:userId` | 取得對話列表 |
| GET | `/api/conversations/:userId/:conversationId` | 取得單筆對話歷史訊息 |
| POST | `/api/conversations/:userId` | 建立新對話 |
| DELETE | `/api/conversations/:userId/:conversationId` | 刪除對話紀錄 |

---

## 4. 服務模組

### 4.1 零售商品

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/services/products` | 取得商品列表（支援分類篩選） |
| GET | `/api/services/products/:productId` | 取得單一商品詳情 |
| GET | `/api/services/vendors` | 取得服務商列表 |
| GET | `/api/services/vendors/:vendorId` | 取得單一服務商詳情與旗下服務 |

### 4.2 交通

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/services/transport/options` | 取得可用交通選項（計程車、代駕等） |
| POST | `/api/services/transport/book` | 預約交通服務 |
| GET | `/api/services/transport/bookings/:userId` | 取得使用者交通預約紀錄 |

---

## 5. AI 對話（核心 Bedrock 整合）

| Method | Endpoint | 說明 |
|--------|----------|------|
| POST | `/api/chat` | 單次對話（簡易版） |
| POST | `/api/chat/messages` | 多輪對話（帶歷史） |
| POST | `/api/chat/agent` | Agent Loop 模式（Tool Use，AI 自行決定呼叫工具） |

---

## 6. 寫死的模組（靜態資料）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/static/insurance` | 取得保險方案列表（固定資料） |
| GET | `/api/static/esim` | 取得旅遊網卡 eSIM 方案（固定資料） |
| GET | `/api/static/reminders/:userId` | 取得使用者提醒列表 |
| POST | `/api/static/reminders/:userId` | 新增提醒 |

---

## 7. Bedrock 使用場景

以下列出需要呼叫 AWS Bedrock (Claude) 的場景：

### 場景 1：自然語言理解 → 意圖解析

**觸發時機**：使用者在對話框輸入任何訊息時

**Bedrock 任務**：
- 判斷使用者意圖（要買東西？要預約服務？要問問題？）
- 抽取關鍵實體（時間、地點、商品名稱、人數）
- 決定下一步動作（呼叫哪個工具 / 回覆什麼）

**範例**：
- 輸入：「下週三要去東京出差」
- AI 解析：意圖=出差規劃，時間=下週三，地點=東京
- 動作：生成出差行程包、推薦 eSIM、機場接送

---

### 場景 2：情境包生成 / 修改

**觸發時機**：使用者要建立或修改行程包

**Bedrock 任務**：
- 根據 user profile + 輸入需求，生成客製化行程包
- 將行程拆解為步驟清單（Task List）
- 為每個步驟匹配對應的服務/商品

**System Prompt 設計**：
```
你是 UNI Flow 智慧管家，擅長將使用者的生活需求拆解為具體可執行的步驟。
根據使用者的偏好標籤和需求，生成行程包並推薦對應服務。
回覆請使用 JSON 格式。
```

---

### 場景 3：Tool Use — Agent Loop

**觸發時機**：臨時任務 / 非標準需求，AI 需要主動查詢資料

**Bedrock 可呼叫的工具**：

| Tool Name | 說明 | 對接 |
|-----------|------|------|
| `search_products` | 搜尋零售商品 | DB: 商品表 |
| `search_vendors` | 搜尋服務商 | DB: `cms_homepage_service_vendor` |
| `search_services` | 搜尋服務項目 | DB: `cms_homepage_service` |
| `get_user_profile` | 取得使用者偏好 | DB: user profile |
| `add_to_cart` | 加入購物車 | DB: 購物車表 |
| `create_bundle_draft` | 建立行程包草稿 | DB: 行程包表 |
| `create_order_draft` | 建立訂單草稿 | DB: `mms_order_record` |
| `book_transport` | 預約交通服務 | DB: 交通預約表 |
| `get_weather` | 查詢天氣 | 外部 Weather API |

**流程**：
1. 使用者輸入自然語言
2. Claude 判斷需要使用哪些工具
3. 後端執行工具、回傳結果給 Claude
4. Claude 根據結果決定下一步或回覆使用者
5. 重複直到任務完成（設 MAX_STEPS=10 防無限迴圈）

---

### 場景 4：多輪表單問答

**觸發時機**：複雜服務需要收集資訊（如清潔服務需問坪數、地址等）

**Bedrock 任務**：
- 依據 `pms_form_topic` 的題目，逐步引導使用者回答
- 以自然對話方式收集資訊，而非生硬表單
- 收集完成後自動填入 `pms_form_feedback`

---

### 場景 5：個人化推薦

**觸發時機**：使用者開啟 APP 時 / 閒置時的主動推送

**Bedrock 任務**：
- 結合 user profile hashtags + 歷史訂單 + 天氣/時間
- 生成個人化推薦（推薦行程包 or 商品）
- 判斷推薦時機是否適當

---

### 場景 6：對話摘要與上下文壓縮

**觸發時機**：對話過長時（超過 token 上限前）

**Bedrock 任務**：
- 將歷史對話壓縮為摘要
- 保留關鍵資訊（使用者偏好、已確認的決定）
- 作為下次對話的 system prompt 補充

---

## 8. 優先順序建議

### Phase 1（核心 Demo）
1. `/api/chat/agent` — Agent Loop + Tool Use
2. User Profile CRUD
3. 行程包生成與查看
4. 商品 / 服務查詢

### Phase 2（完整功能）
5. 購物車 + 訂單
6. 多輪表單問答
7. 對話歷史儲存
8. 交通預約

### Phase 3（加分項）
9. 天氣感知推薦
10. 靜態模組（保險、eSIM、提醒）
11. 對話摘要壓縮
