-- =====================================================================
-- 統一訂單紀錄表 (mms_order_record)
--
-- 注意：本檔案為根據主辦方 README 欄位說明「重建」的 DDL，尚未取得廠商
-- 正式提供的 mms_order_record.sql，部分片段文字有缺漏（例如確認時間欄
-- 位名稱疑似為 confirm_time），已依上下文合理推測並於註解標註。取得正
-- 式檔案後請覆蓋本檔。
-- =====================================================================

-- order_type：01 服務訂單 / 02 訂位 / 03 預約 / 04 其他 / 05 商品訂單 / 06 訂餐
-- order_status：依 order_type 而異，例如服務訂單：
--   11 待訂金支付 → 12 已支付訂金待報價 → 13 已報價待客戶同意 → 14 客戶同意報價 →
--   15 已驗收待尾款支付 → 80 已完成 / 90 已取消
--   訂位/預約類：01 待確認 → 02 待確認 → 03 已確認 → 04 進行中 → 80 已完成 / 90 已取消 / 99 已退款
-- point_status：01 待發放（預設） / 02 已發放 / 03 不發放 / 04 已取消
CREATE TABLE IF NOT EXISTS mms_order_record (
    id                            bigserial     PRIMARY KEY,
    order_no                      varchar(50)   NOT NULL,           -- 訂單編號
    service_vendor_id             int4          NOT NULL REFERENCES cms_homepage_service_vendor(id),
    service_id                    int4          NOT NULL REFERENCES cms_homepage_service(id),
    form_id                       int4          REFERENCES pms_form(id), -- 若由諮詢單轉單而來
    order_type                    varchar(2)    NOT NULL,
    order_status                  varchar(2)    NOT NULL,

    inbr_account_id               uuid,          -- 會員編號（UUID v7）

    -- 個資欄位：AES-256-GCM 加密儲存，對應 _hash 欄位存放 SHA-256 Hash 供查詢比對
    member_name                   bytea,
    member_name_hash              varchar(50),
    member_phone                  bytea,
    member_phone_hash             varchar(50),
    member_email                  bytea,
    member_email_hash             varchar(50),

    contact_address_county        varchar(2)  REFERENCES sys_county(code),
    contact_address_district      varchar(3)  REFERENCES sys_district(code),
    contact_address_detail        bytea,
    contact_address_detail_hash   varchar(50),

    confirm_time                  timestamptz,   -- 確認時間
    service_time                  timestamptz,   -- 服務/使用時間
    complete_time                 timestamptz,   -- 完成時間（用於判斷點數發放時機）
    cancel_time                   timestamptz,   -- 取消時間
    cancel_reason                 varchar(500),

    deposit_amount                numeric(10,2) DEFAULT 0,   -- 訂金金額
    original_amount               numeric(10,2) DEFAULT 0,   -- 原始金額
    discount_amount               numeric(10,2) DEFAULT 0,   -- 折扣金額
    shipping_fee_amount           numeric(10,2) DEFAULT 0,   -- 運費金額
    final_amount                  numeric(10,2) DEFAULT 0,   -- 實付金額（點數計算基礎）
    refund_amount                 numeric(10,2) DEFAULT 0,   -- 退款金額

    order_points                  numeric(10,2) DEFAULT 0,   -- 點數費用（訂單點數使用）
    used_points                   numeric(10,2) DEFAULT 0,   -- 使用點數折抵金額
    refund_points                 numeric(10,2) DEFAULT 0,   -- 退回點數
    earn_points                   numeric(10,2) DEFAULT 0,   -- 應獲得點數（由點數計算引擎填入）
    point_status                  varchar(2)    NOT NULL DEFAULT '01',
    point_grant_time              timestamptz,

    vendor_data                   jsonb,         -- 服務商特定欄位（JSON 格式，各服務商可自訂）
    order_items                   jsonb,         -- 訂單項目明細（JSON 陣列格式）
    remark                        text,          -- 備註說明（例：不做真實金流，此處註記「已成立，預計X月完成匯款」）

    is_deleted                    varchar(2)    NOT NULL DEFAULT '0',
    upd_time                      timestamptz   NOT NULL DEFAULT now(),
    cre_time                      timestamptz   NOT NULL DEFAULT now(),
    upd_id                        uuid,
    cre_id                        uuid,

    CONSTRAINT uq_order_no_service_id UNIQUE (order_no, service_id)
);

CREATE INDEX IF NOT EXISTS idx_mms_order_record_vendor_id ON mms_order_record(service_vendor_id);
CREATE INDEX IF NOT EXISTS idx_mms_order_record_service_id ON mms_order_record(service_id);
CREATE INDEX IF NOT EXISTS idx_mms_order_record_status ON mms_order_record(order_status);
CREATE INDEX IF NOT EXISTS idx_mms_order_record_member_phone_hash ON mms_order_record(member_phone_hash);
