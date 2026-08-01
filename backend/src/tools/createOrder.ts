import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { CreateOrderInput, CreateOrderOutput } from "./types.js";

const TABLE_NAME = process.env.DYNAMO_USER_LISTS_TABLE ?? "UserLists";

/**
 * 建立訂單草稿（需使用者確認後才正式成立）
 * 寫入 DynamoDB UserLists table
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderOutput> {
  const orderId = `ord-${Date.now()}`;
  const now = new Date().toISOString();
  const totalPrice = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    orderId,
    userId: input.userId,
    items: input.items,
    totalPrice,
    status: "draft" as const,
    remark: input.remark,
    createdAt: now,
  };

  // 寫入 DynamoDB
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        user_id: input.userId,
        list_type_id: `ORDER#${orderId}`,
        type: "order_record",
        order_no: orderId,
        order_type: "05", // 商品訂單
        order_status: "01", // 待確認
        order_items: input.items,
        final_amount: totalPrice,
        remark: input.remark ?? "",
        order_time: now,
        updated_at: now,
      },
    })
  );

  return { order };
}
