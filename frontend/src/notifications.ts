/* 鈴鐺通知的來源邏輯：行程時程快到 + 下單物品到貨 */

import { daysUntil, formatDateLabel, relativeDayLabel } from "./dateUtils";
import type { AppNotification, NotificationLevel, Order, ScheduledTrip } from "./types";

/** 幾天內的行程算「快到了」 */
const SOON_DAYS = 3;

/** 通知排序權重：越緊急越前面 */
const LEVEL_WEIGHT: Record<NotificationLevel, number> = {
  urgent: 0,
  arrived: 1,
  soon: 2,
  info: 3,
};

/** 各緊急程度對應的配色，沿用 Missions 既有的色票 */
export const LEVEL_STYLE: Record<NotificationLevel, { color: string; bg: string }> = {
  urgent: { color: "#DC2626", bg: "#FEF2F2" },
  soon: { color: "#EA580C", bg: "#FFF7ED" },
  arrived: { color: "#16A34A", bg: "#DCFCE7" },
  info: { color: "#4C6E91", bg: "#E7EEF5" },
};

/** 尚未完成、且日期已逼近（或已過期）的行程 → 時程提醒 */
export function scheduleNotifications(trips: ScheduledTrip[]): AppNotification[] {
  return trips
    .filter((t) => t.progress < 100)
    .map((trip) => ({ trip, diff: daysUntil(trip.date) }))
    .filter(({ diff }) => diff <= SOON_DAYS)
    .map(({ trip, diff }) => {
      const overdue = diff < 0;
      const level: NotificationLevel = overdue || diff <= 1 ? "urgent" : "soon";
      const title = overdue
        ? `${trip.name} 已過期`
        : diff === 0
          ? `${trip.name} 就是今天`
          : `${trip.name} 快到了`;
      const detail = overdue
        ? `原定 ${formatDateLabel(trip.date)}，準備進度 ${trip.progress}%`
        : `${formatDateLabel(trip.date)} · 準備進度 ${trip.progress}%`;
      return {
        id: `trip-${trip.id}-${trip.date}`,
        kind: "schedule" as const,
        icon: trip.icon,
        title,
        detail,
        meta: overdue ? `已過 ${-diff} 天` : relativeDayLabel(trip.date),
        level,
        packId: trip.packId,
      };
    });
}

/** 訂單商品摘要，例如「生日蛋糕 等 3 項」 */
function itemsLabel(order: Order): string {
  const first = order.items[0]?.name ?? "商品";
  return order.items.length > 1 ? `${first} 等 ${order.items.length} 項` : first;
}

/** 訂單狀態 → 到貨提醒 */
export function deliveryNotifications(orders: Order[]): AppNotification[] {
  return orders.map((order) => {
    const label = itemsLabel(order);
    if (order.status === "arrived") {
      return {
        id: `order-${order.id}-arrived`,
        kind: "delivery" as const,
        icon: "📦",
        title: `${label} 已到貨`,
        detail: `${order.store} 可取貨了`,
        meta: "已到貨",
        level: "arrived" as const,
      };
    }
    const shipped = order.status === "shipped";
    return {
      id: `order-${order.id}-${order.status}`,
      kind: "delivery" as const,
      icon: shipped ? "🚚" : "🧾",
      title: shipped ? `${label} 配送中` : `${label} 已下單`,
      detail: shipped
        ? `預計 ${formatDateLabel(order.etaDate)} 送達 ${order.store}`
        : `賣家準備中 · 預計 ${formatDateLabel(order.etaDate)} 到貨`,
      meta: relativeDayLabel(order.etaDate),
      level: "info" as const,
    };
  });
}

/** 合併兩種來源並依緊急程度排序 */
export function buildNotifications(trips: ScheduledTrip[], orders: Order[]): AppNotification[] {
  return [...scheduleNotifications(trips), ...deliveryNotifications(orders)].sort(
    (a, b) => LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level]
  );
}
