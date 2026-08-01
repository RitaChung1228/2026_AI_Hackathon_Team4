import type { CreateOrderInput, CreateOrderOutput } from "./types.js";

/**
 * 建立訂單草稿（需使用者確認後才正式成立）
 * 後端 B 實作：寫入 DynamoDB
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderOutput> {
  // TODO: 後端 B 實作真正的 DynamoDB 寫入
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const totalPrice = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    orderId: `ord-${Date.now()}`,
    userId: input.userId,
    items: input.items,
    totalPrice,
    status: "draft" as const,
    remark: input.remark,
    createdAt: new Date().toISOString(),
  };

  return { order };
}
