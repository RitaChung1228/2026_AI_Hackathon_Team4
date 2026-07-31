import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV，GCM 建議長度
const AUTH_TAG_LENGTH = 16;

function loadKey(): Buffer {
  const keyB64 = process.env.PII_ENCRYPTION_KEY;
  if (!keyB64) {
    throw new Error("環境變數 PII_ENCRYPTION_KEY 未設定");
  }
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `PII_ENCRYPTION_KEY 長度需為 32 bytes（AES-256），目前為 ${key.length} bytes`,
    );
  }
  return key;
}

export interface EncryptedParts {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

/**
 * AES-256-GCM 加密，回傳拆解後的 ciphertext / iv / authTag
 */
export function encrypt(plaintext: string, key: Buffer = loadKey()): EncryptedParts {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

/**
 * AES-256-GCM 解密
 */
export function decrypt(
  parts: EncryptedParts,
  key: Buffer = loadKey(),
): string {
  const decipher = createDecipheriv(ALGORITHM, key, parts.iv);
  decipher.setAuthTag(parts.authTag);
  const decrypted = Buffer.concat([
    decipher.update(parts.ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * 將加密結果打包為單一 Buffer，格式：[iv(12)] + [authTag(16)] + [ciphertext(n)]
 * 對應資料庫 bytea 欄位（例如 contact_name, member_phone 等）直接存放此 Buffer。
 */
export function encryptToBuffer(plaintext: string, key?: Buffer): Buffer {
  const { ciphertext, iv, authTag } = encrypt(plaintext, key);
  return Buffer.concat([iv, authTag, ciphertext]);
}

/**
 * 解析 encryptToBuffer 打包格式並解密還原明文
 */
export function decryptFromBuffer(packed: Buffer, key?: Buffer): string {
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  return decrypt({ ciphertext, iv, authTag }, key);
}

/**
 * 正規化輸入後計算 SHA-256 Hash（hex），用於 *_hash 欄位查詢比對。
 * - 電話號碼：去除空白、中間橫線、括號等符號
 * - Email：轉小寫、去除前後空白
 * - 其他：僅去除前後空白
 */
export function normalize(plaintext: string, kind: "phone" | "email" | "text" = "text"): string {
  const trimmed = plaintext.trim();
  if (kind === "phone") {
    return trimmed.replace(/[\s\-()]/g, "");
  }
  if (kind === "email") {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

/**
 * 回傳 SHA-256 Hash 的 base64 編碼（44 字元），以符合 *_hash 欄位 varchar(50) 長度限制。
 * （SHA-256 的 hex 編碼長度為 64 字元，會超出 varchar(50)，故採用 base64。）
 */
export function hash(plaintext: string, kind: "phone" | "email" | "text" = "text"): string {
  return createHash("sha256").update(normalize(plaintext, kind), "utf8").digest("base64");
}

/**
 * 便利函式：同時產生加密 Buffer 與查詢用 Hash，對應一組 (bytea, hash) 欄位。
 */
export function encryptField(
  plaintext: string,
  kind: "phone" | "email" | "text" = "text",
  key?: Buffer,
): { encrypted: Buffer; hash: string } {
  return {
    encrypted: encryptToBuffer(plaintext, key),
    hash: hash(plaintext, kind),
  };
}
