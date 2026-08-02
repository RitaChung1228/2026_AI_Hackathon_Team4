import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../../db/scripts/dynamo.js";
import type { SearchServiceInput, SearchServiceOutput, Service } from "./types.js";

/**
 * 搜尋服務項目：查 DynamoDB 的 ServicesCatalog。
 *
 * 因為 Service 型別的欄位已與 DynamoDB 完全一致（snake_case），
 * 查到的資料不需再做欄位對映，直接當成 Service 使用即可。
 */
export async function searchService(input: SearchServiceInput): Promise<SearchServiceOutput> {
  const tableName = process.env.DYNAMO_SERVICE_TABLE ?? "ServicesCatalog";

  const { Items } = await ddb.send(new ScanCommand({ TableName: tableName }));

  let services = (Items ?? []) as Service[];

  if (input.type !== undefined) {
    // DB 的 type 是字串且格式不一致（"1" 與 "01" 意義相同），用 parseInt 正規化後比對
    services = services.filter((s) => parseInt(s.type, 10) === input.type);
  }

  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    services = services.filter(
      (s) =>
        s.service_name?.toLowerCase().includes(kw) ||
        s.description?.toLowerCase().includes(kw) ||
        s.vendor_name?.toLowerCase().includes(kw)
    );
  }

  return { services };
}
