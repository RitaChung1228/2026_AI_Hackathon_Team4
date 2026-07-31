-- =====================================================================
-- 服務商 & 服務項目主檔 (cms_homepage_service_vendor / cms_homepage_service)
--
-- 注意：主辦方僅提供「相關主檔設定.json」種子資料，並未提供對應建表
-- SQL。本檔案為根據 README 欄位說明（id, name, description 等）與其他
-- 資料表共通的稽核欄位慣例「重建」而成，若取得正式 DDL 請覆蓋本檔。
-- =====================================================================

CREATE TABLE IF NOT EXISTS cms_homepage_service_vendor (
    id           serial4       PRIMARY KEY,
    name         varchar(100)  NOT NULL,            -- 服務商名稱（虛擬名稱，禁止使用真實品牌）
    description  varchar(500),                       -- 服務商描述
    sort         int4          NOT NULL DEFAULT 0,
    is_deleted   varchar(2)    NOT NULL DEFAULT '0',
    upd_time     timestamptz   NOT NULL DEFAULT now(),
    cre_time     timestamptz   NOT NULL DEFAULT now(),
    upd_id       uuid,
    cre_id       uuid
);

-- service type 對照：
-- 1 一般居家清潔 / 2 家電清洗 / 3 包裹寄送 / 6 餐廳訂位 /
-- 9 美食外送 / 10 水電修繕 / 11 商城購物（可自行擴充新的 type）
CREATE TABLE IF NOT EXISTS cms_homepage_service (
    id                  serial4       PRIMARY KEY,
    service_vendor_id   int4          NOT NULL REFERENCES cms_homepage_service_vendor(id),
    type                varchar(2)    NOT NULL,           -- 服務類型代碼
    name                varchar(100)  NOT NULL,           -- 服務項目名稱
    img_url             text,                              -- 服務項目示意圖
    description          varchar(500),                     -- 服務項目描述
    sort                int4          NOT NULL DEFAULT 0,
    is_deleted          varchar(2)    NOT NULL DEFAULT '0',
    upd_time            timestamptz   NOT NULL DEFAULT now(),
    cre_time            timestamptz   NOT NULL DEFAULT now(),
    upd_id              uuid,
    cre_id              uuid
);

CREATE INDEX IF NOT EXISTS idx_cms_homepage_service_vendor_id ON cms_homepage_service(service_vendor_id);
