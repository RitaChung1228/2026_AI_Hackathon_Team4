# UNI Flow — DynamoDB 資料庫交付文件

## 環境資訊

| 項目 | 值 |
|---|---|
| 資料庫 | AWS DynamoDB |
| Region | `us-west-2` |
| 帳號來源 | Workshop Studio（AIWave 黑客松） |
| Table 數量 | 4 張 |
| 計費模式 | PAY_PER_REQUEST |

---

## 為什麼選 DynamoDB

| 理由 | 說明 |
|---|---|
| AWS 全家桶 | Lambda + Bedrock + DynamoDB 權限一次搞定，不用設 VPC |
| 黑客松速度 | 不用 schema/migration，建表一行指令 |
| 彈性欄位 | AI 回傳的 JSON 直接存，不用 ALTER TABLE |
| Serverless | 不用管 server，Lambda 直連 |
| 跟 Bedrock 搭配 | Tool 查完直接回傳 JSON，不需 ORM |

---

## 為什麼只有 4 張 Table

DynamoDB **不能 JOIN**。分太多 table 會導致查一個頁面要打多次 API。

設計原則：**相同查詢入口的資料放同一張 table，用 Sort Key 的 prefix 區分類型。**

- 某人的行程包/訂單/購物車 → 都從 `user_id` 查 → 合併為 `UserLists`
- 可購買的服務/商品 → 都從 `vendor_id` 查 → 合併為 `ServicesCatalog`

---

## Table 1：`UserProfile`

> 使用者偏好與標籤

| Key | 型別 | 說明 |
|---|---|---|
| **PK** `user_id` | String | 使用者 ID（如 `usr_jamie_888`） |

### 屬性

| 欄位 | 型別 | 範例 |
|---|---|---|
| `name` | String | "Jamie" |
| `role_title` | String | "Busy Professional" |
| `email` | String | "jamie.lin@example.com" |
| `tags` | List\<String\> | ["#精打細算", "#商務出差", "#外送常客", "#咖啡控"] |
| `preferences` | Map | {"priority": "速度優先", "pickup_method": "門市取貨", ...} |
| `openpoint_balance` | Number | 240 |
| `frequent_store` | String | "7-ELEVEN 松仁門市" |
| `updated_at` | String (ISO) | "2026-08-01T10:00:00Z" |

### 查詢方式

```typescript
// 取得某用戶 profile
const { Item } = await ddb.send(new GetCommand({
  TableName: "UserProfile",
  Key: { user_id: "usr_jamie_888" }
}));
```

---

## Table 2：`UserLists`

> 使用者的行程包、購物車、訂單

| Key | 型別 | 說明 |
|---|---|---|
| **PK** `user_id` | String | 使用者 ID |
| **SK** `list_type_id` | String | 用 prefix 區分類型 |

### SK 命名規則

| SK Pattern | type 欄位 | 代表 |
|---|---|---|
| `CART#current` | `shopping_cart` | 購物車（每人一筆） |
| `TASK#<task_id>` | `scenario_package` | 行程包/情境包 |
| `ORDER#<order_id>` | `order_record` | 訂單紀錄 |

### 情境包屬性

| 欄位 | 型別 | 說明 |
|---|---|---|
| `title` | String | "東京商務出差" |
| `subtitle` | String | "Tokyo · 2 Days" |
| `status` | String | "in_progress" / "completed" / "draft" |
| `progress_percent` | Number | 0-100 |
| `modules` | List\<Map\> | 步驟列表 [{module_name, status, detail}] |
| `is_saved_as_template` | Boolean | 是否存為範本 |

### 訂單屬性

| 欄位 | 型別 | 對應主辦方 |
|---|---|---|
| `order_no` | String | mms_order_record.order_no |
| `order_type` | String | "01"服務 / "02"訂位 / "05"商品 |
| `order_status` | String | "01"待確認 / "80"已完成 |
| `order_items` | List\<Map\> | [{name, price, qty}] |
| `final_amount` | Number | 實付金額 |
| `vendor_data` | Map | 服務商自訂欄位 |

### 查詢方式

```typescript
// 查某用戶所有行程包
const { Items } = await ddb.send(new QueryCommand({
  TableName: "UserLists",
  KeyConditionExpression: "user_id = :uid AND begins_with(list_type_id, :prefix)",
  ExpressionAttributeValues: { ":uid": "usr_jamie_888", ":prefix": "TASK#" }
}));

// 查某用戶購物車
const { Item } = await ddb.send(new GetCommand({
  TableName: "UserLists",
  Key: { user_id: "usr_jamie_888", list_type_id: "CART#current" }
}));
```

---

## Table 3：`ServicesCatalog`

> 服務商、服務項目、零售商品

| Key | 型別 | 說明 |
|---|---|---|
| **PK** `vendor_id` | String | 服務商 ID（如 `vendor_711`） |
| **SK** `service_id` | String | 服務/商品 ID |

### 用 `category` 欄位區分類型

| category 值 | 代表 | 對應 Tool |
|---|---|---|
| `"service"` | 服務（清潔/外送/訂位等） | `search_service` |
| `"product"` | 零售商品（咖啡/雨傘/eSIM等） | `search_product` |

### 屬性

| 欄位 | 型別 | 說明 |
|---|---|---|
| `vendor_name` | String | "7-ELEVEN" / "Klook" |
| `service_name` | String | 商品或服務名稱 |
| `type` | String | 服務類型碼（1清潔/3寄件/6訂位/9外送/11購物/"retail"） |
| `category` | String | "service" 或 "product" |
| `price` | Number | 價格 |
| `description` | String | 描述 |
| `img_url` | String | 圖片 URL |

### Service Type 對照（主辦方規格）

| type | 說明 |
|---|---|
| 1 | 一般居家清潔 |
| 2 | 家電清洗 |
| 3 | 包裹寄送 |
| 6 | 餐廳訂位 |
| 9 | 美食外送 |
| 10 | 水電修繕 |
| 11 | 商城購物 |

### 查詢方式

```typescript
// 查所有商品
const { Items } = await ddb.send(new ScanCommand({
  TableName: "ServicesCatalog",
  FilterExpression: "category = :cat",
  ExpressionAttributeValues: { ":cat": "product" }
}));

// 查特定類型的服務
const { Items } = await ddb.send(new ScanCommand({
  TableName: "ServicesCatalog",
  FilterExpression: "category = :cat AND #tp = :tp",
  ExpressionAttributeNames: { "#tp": "type" },
  ExpressionAttributeValues: { ":cat": "service", ":tp": "1" }
}));
```

---

## Table 4：`ChatHistory`

> AI 對話紀錄

| Key | 型別 | 說明 |
|---|---|---|
| **PK** `session_id` | String | 格式：`sess_<user_id>` |

### 屬性

| 欄位 | 型別 | 說明 |
|---|---|---|
| `user_id` | String | 使用者 ID |
| `dialog_history` | List\<Map\> | [{role: "user"/"assistant", content: "..."}] |
| `context_intent` | String | 目前意圖（如 "business_trip_tokyo"） |
| `timestamp` | String (ISO) | 最後更新時間 |

---

## Tool ↔ Table 對應總表

| Tool 名稱 | 讀/寫 | Table | DynamoDB 操作 |
|---|---|---|---|
| `get_user_profile` | 讀 | UserProfile | GetCommand(PK=userId) |
| `search_service` | 讀 | ServicesCatalog | Scan + Filter(category="service") |
| `search_product` | 讀 | ServicesCatalog | Scan + Filter(category="product") |
| `create_bundle` | 寫 | UserLists | PutCommand(SK=TASK#xxx) |
| `create_order` | 寫 | UserLists | PutCommand(SK=ORDER#xxx) |
| `get_weather` | — | 不查 DB | 外部 API / mock |

---

## 程式碼連接方式

DynamoDB client 位置：`backend/src/lib/dynamo.ts`

```typescript
import { ddb } from "../lib/dynamo.js";
```

環境變數（`.env`）：

```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=（Workshop Studio 取得）
AWS_SECRET_ACCESS_KEY=（Workshop Studio 取得）
AWS_SESSION_TOKEN=（Workshop Studio 取得，會過期需重新取得）
```

---

## Seed 資料現況

| Table | 筆數 | 內容 |
|---|---|---|
| UserProfile | 2 | Jamie, Alex |
| UserLists | 5 | 1 購物車 + 3 行程包 + 1 訂單 |
| ServicesCatalog | 16 | 4 服務 + 12 商品 |
| ChatHistory | 1 | Jamie 的出差對話 |
