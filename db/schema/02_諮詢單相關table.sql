-- =====================================================================
-- 諮詢/服務預約表單系列 (pms_form 系列)
--
-- 注意：本檔案為根據主辦方 README 欄位說明「重建」的 DDL，尚未取得廠商
-- 正式提供的 諮詢單相關table.sql。部分欄位（如 pms_form_topic.type 的
-- 完整選項清單、pms_topic_option 詳細欄位）README 未完整列出，已依常見
-- 表單設計慣例合理推測，標註於註解中；取得正式檔案後請覆蓋本檔。
-- =====================================================================

-- pms_form：表單主檔
-- type：1 C端(無現場評估) / 2 C端(需評估) / 3 B端 / 4 轉訂單流程 / 5 客服
-- sub_type：1 一般 / 2 估價
CREATE TABLE IF NOT EXISTS pms_form (
    id                 serial4       PRIMARY KEY,
    service_vendor_id  int4          NOT NULL REFERENCES cms_homepage_service_vendor(id),
    type               varchar(2)    NOT NULL,
    sub_type           varchar(2)    NOT NULL DEFAULT '1',
    name               varchar(200)  NOT NULL,
    intro_content      text,
    notice_content     text,
    terms_content      text,
    is_enable          varchar(2)    NOT NULL DEFAULT '1',
    feature            jsonb,
    sort               int4          NOT NULL DEFAULT 0,
    is_deleted         varchar(2)    NOT NULL DEFAULT '0',
    upd_time           timestamptz   NOT NULL DEFAULT now(),
    cre_time           timestamptz   NOT NULL DEFAULT now(),
    upd_id             uuid,
    cre_id             uuid
);

-- pms_form_group：表單題組主檔
CREATE TABLE IF NOT EXISTS pms_form_group (
    id          serial4       PRIMARY KEY,
    form_id     int4          NOT NULL REFERENCES pms_form(id),
    name        varchar(200)  NOT NULL,
    remark      varchar(500),
    sort        int4          NOT NULL DEFAULT 0,
    is_deleted  varchar(2)    NOT NULL DEFAULT '0',
    upd_time    timestamptz   NOT NULL DEFAULT now(),
    cre_time    timestamptz   NOT NULL DEFAULT now(),
    upd_id      uuid,
    cre_id      uuid
);

-- pms_form_topic：表單題目主檔
-- type（題目類型，README 未列完整清單，暫依常見表單題型推測）：
--   01 單行文字 / 02 多行文字 / 03 單選 / 04 多選 / 05 日期 / 06 照片上傳 / 07 數字
CREATE TABLE IF NOT EXISTS pms_form_topic (
    id                        serial4       PRIMARY KEY,
    form_group_id             int4          NOT NULL REFERENCES pms_form_group(id),
    type                      varchar(2)    NOT NULL,
    title                     varchar(200)  NOT NULL,
    remark                    varchar(500),
    is_required               varchar(2)    NOT NULL DEFAULT '0', -- 0 非必填 / 1 必填
    sort                      int4          NOT NULL DEFAULT 0,
    is_number_only            varchar(2)    DEFAULT '0',          -- 簡答題：0 未指定 / 1 指定數字
    minimum_medias_upload     int4,
    maximum_medias_upload     int4,
    specified_medias_upload   int4,
    start_date_offset_days    int4,
    end_date_offset_days      int4,
    feature                   jsonb,
    is_deleted                varchar(2)    NOT NULL DEFAULT '0',
    upd_time                  timestamptz   NOT NULL DEFAULT now(),
    cre_time                  timestamptz   NOT NULL DEFAULT now(),
    upd_id                    uuid,
    cre_id                    uuid
);

-- pms_topic_media：題目輔助圖片檔
CREATE TABLE IF NOT EXISTS pms_topic_media (
    id          serial4     PRIMARY KEY,
    form_id     int4        NOT NULL REFERENCES pms_form(id),
    topic_id    int4        NOT NULL REFERENCES pms_form_topic(id),
    img_url     text        NOT NULL,
    sort        int4        NOT NULL DEFAULT 0,
    is_deleted  varchar(2)  NOT NULL DEFAULT '0',
    upd_time    timestamptz NOT NULL DEFAULT now(),
    cre_time    timestamptz NOT NULL DEFAULT now(),
    upd_id      uuid,
    cre_id      uuid
);

-- pms_topic_option：題目選項主檔（單選/多選題使用，README 未列完整欄位，依常見設計推測）
CREATE TABLE IF NOT EXISTS pms_topic_option (
    id          serial4       PRIMARY KEY,
    topic_id    int4          NOT NULL REFERENCES pms_form_topic(id),
    name        varchar(200)  NOT NULL,
    img_url     text,
    sort        int4          NOT NULL DEFAULT 0,
    is_deleted  varchar(2)    NOT NULL DEFAULT '0',
    upd_time    timestamptz   NOT NULL DEFAULT now(),
    cre_time    timestamptz   NOT NULL DEFAULT now(),
    upd_id      uuid,
    cre_id      uuid
);

-- pms_form_feedback：表單回饋檔（使用者填寫結果，含加密個資）
-- type：表單類型（同 pms_form.type）
-- is_read：0 未讀 / 1 已讀
-- status：回饋處理狀態（依業務流程自訂，例：01 待處理 / 02 處理中 / 80 已完成 / 90 已取消）
-- preferred_contact_time：1 上午 / 2 下午 / 3 皆可
CREATE TABLE IF NOT EXISTS pms_form_feedback (
    id                            serial4       PRIMARY KEY,
    form_id                       int4          NOT NULL REFERENCES pms_form(id),
    service_vendor_id             int4          NOT NULL REFERENCES cms_homepage_service_vendor(id),
    service_id                    int4          REFERENCES cms_homepage_service(id),
    type                          varchar(2)    NOT NULL,
    is_read                       varchar(2)    NOT NULL DEFAULT '0',
    status                        varchar(2)    NOT NULL DEFAULT '01',
    answers                       jsonb,                 -- 題目作答內容（題目ID對應答案）

    -- 個資欄位：AES-256-GCM 加密儲存，對應 _hash 欄位存放 SHA-256 Hash 供查詢比對
    contact_name                  bytea,
    contact_name_hash             varchar(50),
    contact_mobile                bytea,
    contact_mobile_hash           varchar(50),
    contact_landline              bytea,
    contact_landline_hash         varchar(50),
    contact_email                 bytea,
    contact_email_hash            varchar(50),

    preferred_contact_time        varchar(2),
    contact_address_county        varchar(2)  REFERENCES sys_county(code),
    contact_address_district      varchar(3)  REFERENCES sys_district(code),
    contact_address_detail        bytea,
    contact_address_detail_hash   varchar(50),

    description                   varchar(1000),
    inbr_account_id               uuid,          -- 會員編號（UUID v7）
    confirm_time                  timestamptz,   -- 確認時間

    is_deleted                    varchar(2)    NOT NULL DEFAULT '0',
    upd_time                      timestamptz   NOT NULL DEFAULT now(),
    cre_time                      timestamptz   NOT NULL DEFAULT now(),
    upd_id                        uuid,
    cre_id                        uuid
);

CREATE INDEX IF NOT EXISTS idx_pms_form_group_form_id ON pms_form_group(form_id);
CREATE INDEX IF NOT EXISTS idx_pms_form_topic_group_id ON pms_form_topic(form_group_id);
CREATE INDEX IF NOT EXISTS idx_pms_topic_media_topic_id ON pms_topic_media(topic_id);
CREATE INDEX IF NOT EXISTS idx_pms_topic_option_topic_id ON pms_topic_option(topic_id);
CREATE INDEX IF NOT EXISTS idx_pms_form_feedback_form_id ON pms_form_feedback(form_id);
CREATE INDEX IF NOT EXISTS idx_pms_form_feedback_contact_mobile_hash ON pms_form_feedback(contact_mobile_hash);
