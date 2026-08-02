import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "seed", "05_ServicesCatalog.json");

const NEW_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Two_AC_Converter_Adapters.jpg/500px-Two_AC_Converter_Adapters.jpg";

const data = JSON.parse(readFileSync(FILE, "utf8")) as {
  _note: string[];
  items: { service_id: string; img_url: string }[];
};

let fixed = 0;
for (const item of data.items) {
  if (item.img_url.startsWith("data:")) {
    console.log(`${item.service_id}: 移除 data URI（${item.img_url.length} 字元）`);
    item.img_url = NEW_URL;
    fixed++;
  }
}

writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`修正 ${fixed} 筆，已寫回 ${FILE}`);
