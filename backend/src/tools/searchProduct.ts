import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { SearchProductInput, SearchProductOutput } from "./types.js";

const TABLE_NAME = process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog";

/**
 * 搜尋零售商品
 * 從 DynamoDB ServicesCatalog table 查詢 category="product" 的項目
 */
export async function searchProduct(input: SearchProductInput): Promise<SearchProductOutput> {
  const { Items } = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#cat = :cat",
      ExpressionAttributeNames: { "#cat": "category" },
      ExpressionAttributeValues: { ":cat": "product" },
    })
  );

  let results = (Items ?? []).map((item) => ({
    id: item.service_id,
    name: item.service_name,
    price: item.price ?? 0,
    description: item.description ?? "",
    category: item.type ?? "retail",
    imgUrl: item.img_url,
    vendorName: item.vendor_name,
  }));

  // keyword filter
  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    );
  }

  // category filter
  if (input.category) {
    const cat = input.category.toLowerCase();
    results = results.filter((p) => p.category.toLowerCase().includes(cat));
  }

  // limit
  if (input.limit) {
    results = results.slice(0, input.limit);
  }

  return { products: results };
}
