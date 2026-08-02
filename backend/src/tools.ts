import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./lib/dynamo.js";
import type { ToolDefinition } from "./bedrock.js";

export interface Tool extends ToolDefinition {
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export const tools: Tool[] = [
  {
    name: "search_vendor",
    description: "依服務類型（與選填關鍵字）查詢服務商與服務項目",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "服務類型代碼：1清潔/2家電清洗/3寄件/6訂位/9外送/10水電修繕/11購物",
        },
        keyword: { type: "string", description: "服務商或服務名稱關鍵字（選填）" },
      },
      required: ["type"],
    },
    async execute(input) {
      // ponytail: table/key schema is still being designed by the DynamoDB owner —
      // assumes a table with partition key "type" (service type code) and attributes
      // vendor_name/service_name/description. Update TableName + key names once confirmed.
      const { Items } = await ddb.send(
        new QueryCommand({
          TableName: process.env.DYNAMO_VENDOR_TABLE ?? "service_vendor",
          KeyConditionExpression: "#type = :type",
          ExpressionAttributeNames: { "#type": "type" },
          ExpressionAttributeValues: { ":type": input.type },
          Limit: 10,
        })
      );

      const keyword = typeof input.keyword === "string" ? input.keyword.toLowerCase() : undefined;
      const items = Items ?? [];
      return keyword
        ? items.filter(
            (item) =>
              item.service_name?.toLowerCase().includes(keyword) ||
              item.vendor_name?.toLowerCase().includes(keyword)
          )
        : items;
    },
  },
];

export function getToolDefinitions(): ToolDefinition[] {
  return tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`未知工具: ${name}`);
  return tool.execute(input);
}
