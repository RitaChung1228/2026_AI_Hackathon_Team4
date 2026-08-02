/**
 * 環境變數載入器
 * 必須在所有其他 import 之前被 import
 * 確保不管從哪個目錄執行，都能找到專案根目錄的 .env
 */
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });
