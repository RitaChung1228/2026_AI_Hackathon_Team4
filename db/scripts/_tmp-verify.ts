import "dotenv/config";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo.js";

async function main() {
  const r = await ddb.send(
    new ScanCommand({
      TableName: process.env.DYNAMO_SERVICES_TABLE ?? "ServicesCatalog",
      ProjectionExpression: "service_id, img_url",
    })
  );
  const items = r.Items ?? [];
  const bad = items.filter((i) => String(i.img_url).includes("example.com"));
  for (const i of items) console.log(`${String(i.service_id).padEnd(24)} ${i.img_url}`);
  console.log(`\nCount=${items.length}  仍是 example.com 的筆數=${bad.length}`);
}

main();
