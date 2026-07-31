-- =====================================================================
-- 縣市區域檔 (sys_county / sys_district)
--
-- 注意：本檔案為根據主辦方 README 欄位說明「重建」的 DDL，
-- 尚未取得廠商正式提供的 縣市區域檔.sql。若日後取得正式檔案，
-- 請以正式檔案覆蓋本檔並重新執行 migrate。
-- =====================================================================

CREATE TABLE IF NOT EXISTS sys_county (
    code        varchar(2)    PRIMARY KEY,        -- 縣市代碼
    name        varchar(10)   NOT NULL,            -- 縣市名稱
    sort        int4          NOT NULL DEFAULT 0,  -- 排序
    is_deleted  varchar(2)    NOT NULL DEFAULT '0',-- 0->正常；1->刪除
    upd_time    timestamptz   NOT NULL DEFAULT now(),
    cre_time    timestamptz   NOT NULL DEFAULT now(),
    upd_id      uuid,
    cre_id      uuid
);

CREATE TABLE IF NOT EXISTS sys_district (
    code               varchar(3)    PRIMARY KEY,        -- 行政區代碼
    county_code        varchar(2)    NOT NULL REFERENCES sys_county(code), -- 對應 sys_county.code
    name               varchar(20)   NOT NULL,            -- 行政區名稱
    name_with_county   varchar(20)   NOT NULL,            -- 行政區名稱＋縣市名稱
    zip                varchar(6),                        -- 郵遞區號
    sort               int4          NOT NULL DEFAULT 0,  -- 排序
    is_deleted         varchar(2)    NOT NULL DEFAULT '0',-- 0->正常；1->刪除
    upd_time           timestamptz   NOT NULL DEFAULT now(),
    cre_time           timestamptz   NOT NULL DEFAULT now(),
    upd_id             uuid,
    cre_id             uuid
);

CREATE INDEX IF NOT EXISTS idx_sys_district_county_code ON sys_district(county_code);
