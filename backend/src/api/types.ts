/**
 * 前端讀取用的回傳型別。
 *
 * 這些是「給 UI 直接渲染」的形狀，刻意用 camelCase 並攤平 DynamoDB 的 snake_case，
 * 讓前端不需要知道 UserLists 的 SK prefix 規則。
 */
import type { TaskStatus } from "../lib/stepIcon.js";

/** 行程包裡的單一步驟，形狀與 agent 回傳的 mission.tasks 一致 */
export interface BundleTask {
  id: string;
  icon: string;
  title: string;
  status: TaskStatus;
  detail: string;
}

/**
 * 行程包。
 * 欄位刻意對齊 AgentResult["mission"]，前端可以用同一個元件渲染
 * 「AI 剛建立的」和「從 DB 讀回來的」兩種來源。
 */
export interface BundleSummary {
  bundleId: string;
  title: string;
  subtitle: string;
  status: string;
  progress: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  tasks: BundleTask[];
}

export interface CartItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  updatedAt: string | null;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
  serviceId?: string;
}

export interface OrderSummary {
  orderId: string;
  orderNo: string;
  status: string;
  statusLabel: string;
  typeLabel: string;
  items: OrderItem[];
  totalPrice: number;
  remark: string;
  createdAt: string;
}
