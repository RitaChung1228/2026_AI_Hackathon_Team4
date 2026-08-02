import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import { getStepIcon, normalizeTaskStatus } from "../lib/stepIcon.js";
import type {
  BundleSummary,
  BundleTask,
  CartItem,
  CartSummary,
  OrderItem,
  OrderSummary,
} from "./types.js";

const TABLE_NAME = process.env.DYNAMO_USER_LISTS_TABLE ?? "UserLists";

/**
 * UserLists 這張表用 SK 的 prefix 區分三種資料：
 *   TASK#<id>    行程包
 *   CART#current 購物車（每人一筆）
 *   ORDER#<id>   訂單
 * 所以查詢一律是 user_id + begins_with(list_type_id, prefix)。
 */
const SK = {
  task: "TASK#",
  cart: "CART#current",
  order: "ORDER#",
} as const;

/** 訂單狀態碼 → 顯示文字（對照 docs/DATABASE.md 主辦方規格） */
const ORDER_STATUS_LABELS: Record<string, string> = {
  "01": "待確認",
  "02": "已接單",
  "80": "已完成",
  "99": "已取消",
};

/** 訂單類型碼 → 顯示文字 */
const ORDER_TYPE_LABELS: Record<string, string> = {
  "01": "服務",
  "02": "訂位",
  "05": "商品",
};

async function queryByPrefix(userId: string, prefix: string) {
  const { Items } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "user_id = :uid AND begins_with(list_type_id, :prefix)",
      ExpressionAttributeValues: { ":uid": userId, ":prefix": prefix },
    })
  );
  return Items ?? [];
}

/** 從 SK 取出 id，例如 "TASK#bnd-123" → "bnd-123" */
function stripPrefix(sk: unknown, prefix: string): string {
  const s = String(sk ?? "");
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}

function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * 取得使用者的所有行程包，最新的排前面。
 */
export async function listBundles(userId: string): Promise<BundleSummary[]> {
  const items = await queryByPrefix(userId, SK.task);

  const bundles = items.map<BundleSummary>((item) => {
    const modules = Array.isArray(item.modules) ? item.modules : [];

    const tasks = modules.map<BundleTask>((m: Record<string, unknown>, i: number) => {
      const title = String(m.module_name ?? "");
      return {
        id: String(m.step_id ?? `step-${i + 1}`),
        icon: getStepIcon(title),
        title,
        status: normalizeTaskStatus(m.status),
        detail: String(m.detail ?? "") || "待處理",
      };
    });

    return {
      bundleId: stripPrefix(item.list_type_id, SK.task),
      title: String(item.title ?? "未命名行程包"),
      subtitle: String(item.subtitle ?? `${tasks.length} 個步驟`),
      status: String(item.status ?? "draft"),
      progress: toNumber(item.progress_percent),
      isTemplate: Boolean(item.is_saved_as_template),
      createdAt: String(item.created_at ?? ""),
      updatedAt: String(item.updated_at ?? item.created_at ?? ""),
      tasks,
    };
  });

  // created_at 是 ISO 字串，直接字串比較即可，新的排前面
  return bundles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 取得購物車。
 * 還沒有購物車時回一個空的（而不是 404），前端才不用處理兩種狀態。
 */
export async function getCart(userId: string): Promise<CartSummary> {
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { user_id: userId, list_type_id: SK.cart },
    })
  );

  const rawItems = Array.isArray(Item?.items)
    ? Item.items
    : Array.isArray(Item?.order_items)
      ? Item.order_items
      : [];

  const items = rawItems.map<CartItem>((it: Record<string, unknown>, i: number) => ({
    id: String(it.id ?? it.productId ?? it.serviceId ?? `item-${i + 1}`),
    name: String(it.name ?? ""),
    detail: String(it.detail ?? ""),
    price: toNumber(it.price),
    quantity: toNumber(it.quantity ?? it.qty, 1),
  }));

  return {
    items,
    totalQuantity: items.reduce((sum, it) => sum + it.quantity, 0),
    totalPrice: items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    updatedAt: Item?.updated_at ? String(Item.updated_at) : null,
  };
}

/**
 * 取得使用者的訂單，最新的排前面。
 */
export async function listOrders(userId: string): Promise<OrderSummary[]> {
  const items = await queryByPrefix(userId, SK.order);

  const orders = items.map<OrderSummary>((item) => {
    const rawItems = Array.isArray(item.order_items) ? item.order_items : [];
    const orderItems = rawItems.map<OrderItem>((it: Record<string, unknown>) => ({
      name: String(it.name ?? ""),
      quantity: toNumber(it.quantity ?? it.qty, 1),
      price: toNumber(it.price),
      productId: it.productId ? String(it.productId) : undefined,
      serviceId: it.serviceId ? String(it.serviceId) : undefined,
    }));

    const status = String(item.order_status ?? "01");
    const type = String(item.order_type ?? "05");

    return {
      orderId: stripPrefix(item.list_type_id, SK.order),
      orderNo: String(item.order_no ?? ""),
      status,
      statusLabel: ORDER_STATUS_LABELS[status] ?? status,
      typeLabel: ORDER_TYPE_LABELS[type] ?? type,
      items: orderItems,
      totalPrice: toNumber(
        item.final_amount,
        orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
      ),
      remark: String(item.remark ?? ""),
      createdAt: String(item.order_time ?? item.created_at ?? ""),
    };
  });

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
