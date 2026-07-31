import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { encryptField } from "../../src/crypto/crypto.js";
import { generateUUIDv7 } from "../../src/crypto/uuid.js";
import { pool } from "./client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, "..", "seed");

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(SEED_DIR, file), "utf8")) as T;
}

const SYSTEM_ID = generateUUIDv7();

// ---------------------------------------------------------------------------
// 01. 縣市區域
// ---------------------------------------------------------------------------
interface CountyDistrictSeed {
  sys_county: { code: string; name: string; sort: number }[];
  sys_district: {
    code: string;
    county_code: string;
    name: string;
    name_with_county: string;
    zip: string;
    sort: number;
  }[];
}

async function seedCountyDistrict(client: PoolClient) {
  const data = loadJson<CountyDistrictSeed>("01_縣市區域範例資料.json");

  for (const c of data.sys_county) {
    await client.query(
      `INSERT INTO sys_county (code, name, sort, cre_id, upd_id)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort`,
      [c.code, c.name, c.sort, SYSTEM_ID],
    );
  }
  console.log(`[seed] sys_county 匯入 ${data.sys_county.length} 筆`);

  for (const d of data.sys_district) {
    await client.query(
      `INSERT INTO sys_district (code, county_code, name, name_with_county, zip, sort, cre_id, upd_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (code) DO UPDATE SET
         county_code = EXCLUDED.county_code,
         name = EXCLUDED.name,
         name_with_county = EXCLUDED.name_with_county,
         zip = EXCLUDED.zip,
         sort = EXCLUDED.sort`,
      [d.code, d.county_code, d.name, d.name_with_county, d.zip, d.sort, SYSTEM_ID],
    );
  }
  console.log(`[seed] sys_district 匯入 ${data.sys_district.length} 筆`);
}

// ---------------------------------------------------------------------------
// 02. 服務商 & 服務項目主檔
// ---------------------------------------------------------------------------
interface VendorSeed {
  vendors: {
    name: string;
    description: string;
    services: { type: string; name: string; img_url: string; description: string }[];
  }[];
}

const vendorIdByName = new Map<string, number>();
const serviceIdByKey = new Map<string, number>(); // key: `${vendorName}::${serviceName}`

async function seedVendorsAndServices(client: PoolClient) {
  const data = loadJson<VendorSeed>("02_相關主檔設定.json");

  for (const v of data.vendors) {
    const result = await client.query<{ id: number }>(
      `INSERT INTO cms_homepage_service_vendor (name, description, cre_id, upd_id)
       VALUES ($1, $2, $3, $3)
       RETURNING id`,
      [v.name, v.description, SYSTEM_ID],
    );
    const vendorId = result.rows[0].id;
    vendorIdByName.set(v.name, vendorId);

    for (const s of v.services) {
      const svcResult = await client.query<{ id: number }>(
        `INSERT INTO cms_homepage_service (service_vendor_id, type, name, img_url, description, cre_id, upd_id)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING id`,
        [vendorId, s.type, s.name, s.img_url, s.description, SYSTEM_ID],
      );
      serviceIdByKey.set(`${v.name}::${s.name}`, svcResult.rows[0].id);
    }
  }
  console.log(
    `[seed] cms_homepage_service_vendor 匯入 ${vendorIdByName.size} 筆，cms_homepage_service 匯入 ${serviceIdByKey.size} 筆`,
  );
}

// ---------------------------------------------------------------------------
// 03. 諮詢單表單 & 範例回饋
// ---------------------------------------------------------------------------
interface FormSeed {
  forms: {
    vendor_name: string;
    type: string;
    sub_type: string;
    name: string;
    intro_content: string;
    notice_content: string;
    terms_content: string;
    is_enable: string;
    groups: {
      name: string;
      remark: string;
      topics: {
        type: string;
        title: string;
        remark: string;
        is_required: string;
        minimum_medias_upload?: number;
        maximum_medias_upload?: number;
        start_date_offset_days?: number;
        end_date_offset_days?: number;
        options?: { name: string }[];
        media?: { img_url: string }[];
      }[];
    }[];
  }[];
  feedback_examples: {
    form_name: string;
    service_name: string;
    type: string;
    is_read: string;
    status: string;
    answers: Record<string, string>;
    contact_name: string;
    contact_mobile: string;
    contact_email: string;
    preferred_contact_time: string;
    contact_address_county: string;
    contact_address_district: string;
    contact_address_detail: string;
    description: string;
  }[];
}

const formIdByName = new Map<string, number>();
const formVendorIdByName = new Map<string, number>();

async function seedForms(client: PoolClient) {
  const data = loadJson<FormSeed>("03_諮詢單相關範例資料.json");

  for (const f of data.forms) {
    const vendorId = vendorIdByName.get(f.vendor_name);
    if (!vendorId) {
      throw new Error(`找不到服務商「${f.vendor_name}」，請確認 02_相關主檔設定.json 是否已匯入`);
    }

    const formResult = await client.query<{ id: number }>(
      `INSERT INTO pms_form
         (service_vendor_id, type, sub_type, name, intro_content, notice_content, terms_content, is_enable, cre_id, upd_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING id`,
      [
        vendorId,
        f.type,
        f.sub_type,
        f.name,
        f.intro_content,
        f.notice_content,
        f.terms_content,
        f.is_enable,
        SYSTEM_ID,
      ],
    );
    const formId = formResult.rows[0].id;
    formIdByName.set(f.name, formId);
    formVendorIdByName.set(f.name, vendorId);

    for (const [groupSort, g] of f.groups.entries()) {
      const groupResult = await client.query<{ id: number }>(
        `INSERT INTO pms_form_group (form_id, name, remark, sort, cre_id, upd_id)
         VALUES ($1, $2, $3, $4, $5, $5)
         RETURNING id`,
        [formId, g.name, g.remark, groupSort, SYSTEM_ID],
      );
      const groupId = groupResult.rows[0].id;

      for (const [topicSort, t] of g.topics.entries()) {
        const topicResult = await client.query<{ id: number }>(
          `INSERT INTO pms_form_topic
             (form_group_id, type, title, remark, is_required, sort,
              minimum_medias_upload, maximum_medias_upload,
              start_date_offset_days, end_date_offset_days, cre_id, upd_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
           RETURNING id`,
          [
            groupId,
            t.type,
            t.title,
            t.remark,
            t.is_required,
            topicSort,
            t.minimum_medias_upload ?? null,
            t.maximum_medias_upload ?? null,
            t.start_date_offset_days ?? null,
            t.end_date_offset_days ?? null,
            SYSTEM_ID,
          ],
        );
        const topicId = topicResult.rows[0].id;

        for (const [optSort, opt] of (t.options ?? []).entries()) {
          await client.query(
            `INSERT INTO pms_topic_option (topic_id, name, sort, cre_id, upd_id)
             VALUES ($1, $2, $3, $4, $4)`,
            [topicId, opt.name, optSort, SYSTEM_ID],
          );
        }

        for (const [mediaSort, media] of (t.media ?? []).entries()) {
          await client.query(
            `INSERT INTO pms_topic_media (form_id, topic_id, img_url, sort, cre_id, upd_id)
             VALUES ($1, $2, $3, $4, $5, $5)`,
            [formId, topicId, media.img_url, mediaSort, SYSTEM_ID],
          );
        }
      }
    }
  }
  console.log(`[seed] pms_form 系列匯入完成，共 ${formIdByName.size} 張表單`);

  let feedbackCount = 0;
  for (const fb of data.feedback_examples) {
    const formId = formIdByName.get(fb.form_name);
    const vendorId = formVendorIdByName.get(fb.form_name);
    const serviceId = serviceIdByKey.get(
      `${[...vendorIdByName.entries()].find(([, id]) => id === vendorId)?.[0]}::${fb.service_name}`,
    );
    if (!formId || !vendorId) {
      throw new Error(`找不到表單「${fb.form_name}」，請確認表單已匯入`);
    }

    const name = encryptField(fb.contact_name, "text");
    const mobile = encryptField(fb.contact_mobile, "phone");
    const email = encryptField(fb.contact_email, "email");
    const addressDetail = encryptField(fb.contact_address_detail, "text");

    await client.query(
      `INSERT INTO pms_form_feedback
         (form_id, service_vendor_id, service_id, type, is_read, status, answers,
          contact_name, contact_name_hash,
          contact_mobile, contact_mobile_hash,
          contact_email, contact_email_hash,
          preferred_contact_time, contact_address_county, contact_address_district,
          contact_address_detail, contact_address_detail_hash,
          description, inbr_account_id, cre_id, upd_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
               $8, $9, $10, $11, $12, $13,
               $14, $15, $16, $17, $18, $19, $20, $21, $21)`,
      [
        formId,
        vendorId,
        serviceId ?? null,
        fb.type,
        fb.is_read,
        fb.status,
        JSON.stringify(fb.answers),
        name.encrypted,
        name.hash,
        mobile.encrypted,
        mobile.hash,
        email.encrypted,
        email.hash,
        fb.preferred_contact_time,
        fb.contact_address_county,
        fb.contact_address_district,
        addressDetail.encrypted,
        addressDetail.hash,
        fb.description,
        generateUUIDv7(),
        SYSTEM_ID,
      ],
    );
    feedbackCount++;
  }
  console.log(`[seed] pms_form_feedback 匯入 ${feedbackCount} 筆（個資已加密）`);
}

// ---------------------------------------------------------------------------
// 04. 訂單紀錄
// ---------------------------------------------------------------------------
interface OrderSeed {
  orders: {
    order_no: string;
    vendor_name: string;
    service_name: string;
    form_name?: string;
    order_type: string;
    order_status: string;
    member_name: string;
    member_phone: string;
    member_email: string;
    contact_address_county: string;
    contact_address_district: string;
    contact_address_detail: string;
    service_time?: string;
    deposit_amount?: number;
    original_amount?: number;
    discount_amount?: number;
    shipping_fee_amount?: number;
    final_amount?: number;
    order_points?: number;
    earn_points?: number;
    point_status?: string;
    order_items?: unknown;
    vendor_data?: unknown;
    remark: string;
  }[];
}

async function seedOrders(client: PoolClient) {
  const data = loadJson<OrderSeed>("04_order_record範例資料.json");

  for (const o of data.orders) {
    const vendorId = vendorIdByName.get(o.vendor_name);
    if (!vendorId) {
      throw new Error(`找不到服務商「${o.vendor_name}」`);
    }
    const serviceId = serviceIdByKey.get(`${o.vendor_name}::${o.service_name}`);
    if (!serviceId) {
      throw new Error(`找不到服務項目「${o.vendor_name} / ${o.service_name}」`);
    }
    const formId = o.form_name ? formIdByName.get(o.form_name) ?? null : null;

    const name = encryptField(o.member_name, "text");
    const phone = encryptField(o.member_phone, "phone");
    const email = encryptField(o.member_email, "email");
    const addressDetail = encryptField(o.contact_address_detail, "text");

    await client.query(
      `INSERT INTO mms_order_record
         (order_no, service_vendor_id, service_id, form_id, order_type, order_status,
          inbr_account_id,
          member_name, member_name_hash, member_phone, member_phone_hash,
          member_email, member_email_hash,
          contact_address_county, contact_address_district,
          contact_address_detail, contact_address_detail_hash,
          service_time, deposit_amount, original_amount, discount_amount,
          shipping_fee_amount, final_amount, order_points, earn_points, point_status,
          order_items, vendor_data, remark, cre_id, upd_id)
       VALUES ($1, $2, $3, $4, $5, $6,
               $7,
               $8, $9, $10, $11,
               $12, $13,
               $14, $15,
               $16, $17,
               $18, $19, $20, $21,
               $22, $23, $24, $25, $26,
               $27, $28, $29, $30, $30)
       ON CONFLICT (order_no, service_id) DO NOTHING`,
      [
        o.order_no,
        vendorId,
        serviceId,
        formId,
        o.order_type,
        o.order_status,
        generateUUIDv7(),
        name.encrypted,
        name.hash,
        phone.encrypted,
        phone.hash,
        email.encrypted,
        email.hash,
        o.contact_address_county,
        o.contact_address_district,
        addressDetail.encrypted,
        addressDetail.hash,
        o.service_time ?? null,
        o.deposit_amount ?? 0,
        o.original_amount ?? 0,
        o.discount_amount ?? 0,
        o.shipping_fee_amount ?? 0,
        o.final_amount ?? 0,
        o.order_points ?? 0,
        o.earn_points ?? 0,
        o.point_status ?? "01",
        JSON.stringify(o.order_items ?? []),
        JSON.stringify(o.vendor_data ?? {}),
        o.remark,
        SYSTEM_ID,
      ],
    );
  }
  console.log(`[seed] mms_order_record 匯入 ${data.orders.length} 筆`);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedCountyDistrict(client);
    await seedVendorsAndServices(client);
    await seedForms(client);
    await seedOrders(client);
    await client.query("COMMIT");
    console.log("[seed] 全部種子資料匯入完成");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed] 失敗：", err);
  process.exit(1);
});
