# 2026 雲湧智生：AI 智慧管家 黑客松專案

透過 AI 統整使用者需求，串接後端資料表產生諮詢單／訂單紀錄的智慧管家 Demo。
核心主推情境：**水電修繕**（居家水電問題諮詢 → AI 對話收集資訊 → 產生諮詢單／訂單）。

> 黑客松規則重點：所有服務商／服務名稱皆為自創虛擬名稱，不使用任何真實/競業品牌；
> 不做真實金流模擬，訂單狀態一律以文字說明呈現（例：「已成立，預計 X 月完成匯款」）。

## 目前進度

- [x] **Phase 1**：專案目錄結構
- [x] **Phase 2**：本機 PostgreSQL（Docker）+ 建表 + 種子資料匯入
- [x] **Phase 3**：個資加密工具（AES-256-GCM + SHA-256 Hash）+ UUID v7
- [ ] **Phase 4**：AI 對話與意圖理解（水電修繕場景，待團隊到齊後設計）
- [ ] **Phase 5**：部署至 AWS

## 技術棧

- **Runtime**：Node.js 22 + TypeScript（`tsx` 直接執行，免額外編譯）
- **資料庫**：PostgreSQL 16（本地 Docker，未來可換 AWS RDS）
- **加密**：Node `crypto` 原生模組（AES-256-GCM + SHA-256），無額外套件依賴
- **測試**：Vitest

## 目錄結構

```
2026_AI_Hackathon/
├── docker-compose.yml       # 本機 PostgreSQL 容器設定
├── .env.example             # 環境變數範本（複製為 .env 後填值）
├── db/
│   ├── schema/               # 建表 DDL（依檔名順序執行）
│   │   ├── 00_相關主檔.sql         # cms_homepage_service_vendor / cms_homepage_service
│   │   ├── 01_縣市區域檔.sql        # sys_county / sys_district
│   │   ├── 02_諮詢單相關table.sql   # pms_form 系列
│   │   └── 03_mms_order_record.sql # 訂單紀錄表
│   ├── seed/                 # 種子資料（虛擬示範資料，依檔名順序匯入）
│   │   ├── 01_縣市區域範例資料.json
│   │   ├── 02_相關主檔設定.json
│   │   ├── 03_諮詢單相關範例資料.json
│   │   ├── 04_order_record範例資料.json
│   │   └── 04_order_record範例資料.csv   # 與上者內容相同，CSV 格式備用
│   └── scripts/               # 匯入/管理腳本
│       ├── client.ts          # pg Pool 連線
│       ├── migrate.ts         # 依序執行 schema/*.sql 建表
│       ├── seed.ts            # 依序匯入 seed/*.json（含個資加密）
│       └── reset.ts           # 依 FK 反向順序清空所有資料表
└── src/
    └── crypto/
        ├── crypto.ts          # AES-256-GCM 加解密 + SHA-256 Hash
        ├── uuid.ts            # UUID v7 產生器
        └── crypto.test.ts     # 單元測試
```

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
# 產生一組 32 bytes 的 AES-256 金鑰並填入 PII_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. 啟動本機 PostgreSQL

```bash
npm run db:up      # docker compose up -d
```

### 4. 建表 + 匯入種子資料

```bash
npm run db:migrate
npm run db:seed
```

若需重來，先清空再重新建表匯入：

```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

### 5. 執行測試

```bash
npm test
```

## 資料表關聯

```
sys_county ─┬─ sys_district
            │
cms_homepage_service_vendor ─┬─ cms_homepage_service
                              │
pms_form ─┬─ pms_form_group ─┬─ pms_form_topic ─┬─ pms_topic_media
          │                  │                   └─ pms_topic_option
          │                  └───────────────────────┘
          └─ pms_form_feedback（使用者填寫結果，含加密個資）

mms_order_record（統一訂單紀錄表，對應 service_vendor_id / service_id）
```

## 個資加密設計

`contact_name`、`contact_mobile`、`contact_email`、`member_name`、`member_phone`、
`member_email`、`contact_address_detail` 等欄位皆以 **AES-256-GCM** 加密後存入
`bytea` 欄位（格式：`iv(12 bytes) + authTag(16 bytes) + ciphertext`），對應的
`*_hash` 欄位存放正規化後的 **SHA-256 base64** Hash（44 字元，符合 `varchar(50)`
長度限制），供查詢比對使用而不需解密。

```ts
import { encryptField, decryptFromBuffer } from "./src/crypto/crypto.js";

const { encrypted, hash } = encryptField("0912345678", "phone");
// encrypted -> 存入 bytea 欄位；hash -> 存入 *_hash 欄位

const plaintext = decryptFromBuffer(encrypted); // "0912345678"
```

## 虛擬種子資料說明

⚠️ 目前尚未取得主辦方正式提供的 `.sql` / `.json` 檔案，`db/schema/` 與
`db/seed/` 皆為依 README 規格文件**重建**的版本（各檔案開頭皆有註記）。
取得正式檔案後，直接覆蓋對應檔案並重新執行 `db:reset` → `db:migrate` →
`db:seed` 即可。

種子資料涵蓋的虛擬服務商（皆為自創名稱，非真實品牌）：

| 服務商         | 服務項目                     | type |
| -------------- | ----------------------------- | ---- |
| 晴語家居服務   | 居家深層清潔 / 冷氣家電清洗   | 1 / 2 |
| 職人水電工坊   | 居家水電修繕（核心主推情境）  | 10   |
| 好味餐旅集團   | 餐廳訂位服務 / 美食外送服務   | 6 / 9 |
| 順遞快運       | 包裹寄送服務                  | 3    |
| 悠選生活商城   | 生活選物商城                  | 11   |

## 注意事項

- 不做真實金流模擬：訂單狀態一律顯示「已成立」+ 文字說明（見 `mms_order_record.remark`）
- 種子資料中的縣市/行政區僅為示範子集（3 縣市 x 3 行政區），待正式檔案提供後補齊全台資料
- `.env` 已列入 `.gitignore`，切勿提交金鑰或資料庫密碼
