import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { SearchServiceInput, SearchServiceOutput } from "./types.js";

const TABLE_NAME = process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog";

/**
 * 搜尋服務項目
 * 從 DynamoDB ServicesCatalog table 查詢非 product 類別的項目（即服務類）
 */
export async function searchService(input: SearchServiceInput): Promise<SearchServiceOutput> {
  // 建立 filter 條件：排除 category="product"，其餘都算服務
  let filterExpr = "#cat <> :cat";
  const exprNames: Record<string, string> = { "#cat": "category" };
  const exprValues: Record<string, unknown> = { ":cat": "product" };

  // 如果有指定 type，加入 filter
  if (input.type !== undefined) {
    filterExpr += " AND #tp = :tp";
    exprNames["#tp"] = "type";
    exprValues[":tp"] = String(input.type);
  }

  const { Items } = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpr,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
    })
  );

  let results = (Items ?? []).map((item) => ({
    id: item.service_id,
    vendorId: item.vendor_id,
    vendorName: item.vendor_name ?? "",
    name: item.service_name ?? "",
    type: Number(item.type) || 0,
    description: item.description ?? "",
  }));

  // keyword filter
  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        s.description.toLowerCase().includes(kw) ||
        s.vendorName.toLowerCase().includes(kw)
    );
  }

  return { services: results };
}
