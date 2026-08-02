/**
 * 根據步驟描述推斷對應的 emoji icon。
 *
 * agent 產生 mission 卡片、以及 API 從 DynamoDB 讀回行程包時都用這一份，
 * 才不會出現「剛建立時是 🚕、重新載入後變 📋」這種不一致。
 */
export function getStepIcon(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("交通") || lower.includes("車") || lower.includes("接送")) return "🚕";
  if (lower.includes("天氣") || lower.includes("雨")) return "🌧";
  if (lower.includes("住宿") || lower.includes("飯店") || lower.includes("旅館")) return "🏨";
  if (lower.includes("餐") || lower.includes("吃") || lower.includes("食")) return "🍽";
  if (lower.includes("購物") || lower.includes("買") || lower.includes("商品") || lower.includes("採購")) return "🛒";
  if (lower.includes("預約") || lower.includes("預訂")) return "📅";
  if (lower.includes("清潔") || lower.includes("打掃")) return "🧹";
  if (lower.includes("修繕") || lower.includes("水電") || lower.includes("修理")) return "🔧";
  if (lower.includes("蛋糕") || lower.includes("生日")) return "🎂";
  if (lower.includes("禮物")) return "🎁";
  if (lower.includes("搬家") || lower.includes("打包")) return "📦";
  if (lower.includes("健身") || lower.includes("運動")) return "💪";
  if (lower.includes("寵物") || lower.includes("醫院")) return "🐾";
  if (lower.includes("提醒") || lower.includes("通知")) return "⏰";
  if (lower.includes("保險")) return "🛡";
  return "📋";
}

/** 任務狀態：DynamoDB 用底線、前端用連字號，這裡統一轉成前端的格式 */
export type TaskStatus = "confirmed" | "in-progress" | "pending";

export function normalizeTaskStatus(raw: unknown): TaskStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "confirmed" || s === "done" || s === "completed") return "confirmed";
  if (s === "in-progress" || s === "in_progress" || s === "active") return "in-progress";
  return "pending";
}
