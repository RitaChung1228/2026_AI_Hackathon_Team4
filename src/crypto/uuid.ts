import { randomBytes } from "node:crypto";

/**
 * 產生 UUID v7（時間排序 + 隨機性）
 * 格式範例：0198a3f1-6e42-7d3a-9c1b-4f8e2a7d5c60
 * - 前 48 bits：unix 毫秒時間戳
 * - 第 3 段開頭固定為 7（版本碼）
 * - 第 4 段開頭為 8~b（變體碼）
 * - 其餘為隨機亂數
 */
export function generateUUIDv7(): string {
  const unixTsMs = BigInt(Date.now());
  const rand = randomBytes(10);

  const bytes = Buffer.alloc(16);

  bytes[0] = Number((unixTsMs >> 40n) & 0xffn);
  bytes[1] = Number((unixTsMs >> 32n) & 0xffn);
  bytes[2] = Number((unixTsMs >> 24n) & 0xffn);
  bytes[3] = Number((unixTsMs >> 16n) & 0xffn);
  bytes[4] = Number((unixTsMs >> 8n) & 0xffn);
  bytes[5] = Number(unixTsMs & 0xffn);

  bytes[6] = 0x70 | (rand[0] & 0x0f);
  bytes[7] = rand[1];

  bytes[8] = 0x80 | (rand[2] & 0x3f);
  bytes[9] = rand[3];

  rand.copy(bytes, 10, 4, 10);

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}
