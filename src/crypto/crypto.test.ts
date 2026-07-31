import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import {
  decrypt,
  decryptFromBuffer,
  encrypt,
  encryptField,
  encryptToBuffer,
  hash,
  normalize,
} from "./crypto.js";
import { generateUUIDv7 } from "./uuid.js";

beforeAll(() => {
  process.env.PII_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("AES-256-GCM encrypt/decrypt", () => {
  it("加密後可還原原始明文", () => {
    const plaintext = "0912-345-678";
    const parts = encrypt(plaintext);
    expect(decrypt(parts)).toBe(plaintext);
  });

  it("每次加密的 IV 皆不同（ciphertext 不重複）", () => {
    const a = encrypt("測試內容");
    const b = encrypt("測試內容");
    expect(a.iv.equals(b.iv)).toBe(false);
    expect(a.ciphertext.equals(b.ciphertext)).toBe(false);
  });

  it("打包格式 encryptToBuffer/decryptFromBuffer 可正確還原", () => {
    const plaintext = "test@example.com";
    const packed = encryptToBuffer(plaintext);
    expect(decryptFromBuffer(packed)).toBe(plaintext);
  });

  it("authTag 被竄改時應解密失敗", () => {
    const packed = encryptToBuffer("敏感資料");
    packed[packed.length - 1] ^= 0xff;
    expect(() => decryptFromBuffer(packed)).toThrow();
  });

  it("使用錯誤金鑰解密應失敗", () => {
    const packed = encryptToBuffer("敏感資料");
    const wrongKey = randomBytes(32);
    expect(() => decryptFromBuffer(packed, wrongKey)).toThrow();
  });
});

describe("SHA-256 hash 與正規化", () => {
  it("電話號碼正規化後 hash 應相同（忽略符號差異）", () => {
    expect(hash("0912-345-678", "phone")).toBe(hash("0912345678", "phone"));
    expect(hash("(0912) 345 678", "phone")).toBe(hash("0912345678", "phone"));
  });

  it("Email 正規化後 hash 應相同（忽略大小寫）", () => {
    expect(hash("Test@Example.com", "email")).toBe(hash("test@example.com", "email"));
  });

  it("相同輸入應產生相同 hash（可用於查詢比對）", () => {
    expect(hash("王小明")).toBe(hash("王小明"));
  });

  it("normalize 對 text 類型僅去除前後空白", () => {
    expect(normalize("  王小明  ")).toBe("王小明");
  });
});

describe("encryptField", () => {
  it("同時回傳加密結果與 hash", () => {
    const { encrypted, hash: h } = encryptField("0912345678", "phone");
    expect(decryptFromBuffer(encrypted)).toBe("0912345678");
    expect(h).toBe(hash("0912345678", "phone"));
  });
});

describe("UUID v7", () => {
  it("產生的格式符合 UUID 樣式", () => {
    const id = generateUUIDv7();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("版本碼固定為 7", () => {
    const id = generateUUIDv7();
    expect(id[14]).toBe("7");
  });

  it("變體碼開頭為 8~b", () => {
    const id = generateUUIDv7();
    expect(["8", "9", "a", "b"]).toContain(id[19]);
  });

  it("依時間遞增（後產生的 UUID 字串排序應較大）", async () => {
    const first = generateUUIDv7();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = generateUUIDv7();
    expect(first < second).toBe(true);
  });

  it("多次呼叫不應重複", () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateUUIDv7()));
    expect(set.size).toBe(1000);
  });
});
