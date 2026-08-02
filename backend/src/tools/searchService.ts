import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { SearchServiceInput, SearchServiceOutput, Service } from "./types.js";

const TABLE_NAME =
  process.env.DYNAMO_SERVICE_TABLE ?? process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog";

/**
 * 搜尋服務項目：查 DynamoDB 的 ServicesCatalog。
 *
 * ServicesCatalog 同時存放「商品」與「服務」，靠 category 欄位區分
 * （category="product" 為商品，交給 searchProduct 處理），
 * 這裡用 FilterExpression 在 DynamoDB 端先排除商品，減少回傳的資料量。
 *
 * type 篩選則在應用層做：DB 的 type 欄位格式不一致（例如 "01" 與 "1" 意義相同），
 * 用 parseInt 正規化後比對，這在 DynamoDB FilterExpression 裡做不到。
 *
 * Service 型別的欄位已與 DynamoDB 完全一致（snake_case），查到的資料不需再做欄位對映。
 */
export async function searchService(input: SearchServiceInput): Promise<SearchServiceOutput> {
  const { Items } = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#cat <> :cat",
      ExpressionAttributeNames: { "#cat": "category" },
      ExpressionAttributeValues: { ":cat": "product" },
    })
  );

  const all = (Items ?? []) as Service[];
  const kw = input.keyword?.toLowerCase();

  const byKeyword = (list: Service[]) =>
    kw
      ? list.filter(
          (s) =>
            s.service_name?.toLowerCase().includes(kw) ||
            s.description?.toLowerCase().includes(kw) ||
            s.vendor_name?.toLowerCase().includes(kw)
        )
      : list;

  const byType = (list: Service[]) =>
    input.type !== undefined ? list.filter((s) => parseInt(s.type, 10) === input.type) : list;

  let services = byKeyword(byType(all));

  // type 是 AI 自己猜的（它只知道系統提示裡列的 7 種代碼），遇到目錄裡沒對應到的分類
  // （例如「搬家」沒有專屬代碼，AI 常誤猜成 3=交通寄件）就會把關鍵字明明對得上的結果濾光。
  // 這種情況下退回只用關鍵字比對，不要讓猜錯的 type 蓋掉正確的搜尋結果。
  if (services.length === 0 && input.type !== undefined && kw) {
    services = byKeyword(all);
  }

  return { services };
}
