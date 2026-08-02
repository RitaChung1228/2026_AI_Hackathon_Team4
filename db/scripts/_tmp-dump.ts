import "dotenv/config";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./dynamo.js";

async function main() {
  const r = await ddb.send(new ScanCommand({ TableName: "ServicesCatalog" }));
  console.log("Count =", r.Count);
  console.log(JSON.stringify(r.Items, null, 1));
}

main();
