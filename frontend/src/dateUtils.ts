/* 行程日期相關的小工具，一律以「本地日曆日」計算，避免時區造成差一天 */

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** ISO 日期字串 → 本地當天 00:00 的 Date */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 距離今天還有幾天：今天 0、明天 1、昨天 -1 */
export function daysUntil(iso: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseISODate(iso).getTime() - today.getTime()) / 86400000);
}

/** 「8月3日（週一）」 */
export function formatDateLabel(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日（週${WEEKDAYS[d.getDay()]}）`;
}

/** 「今天 / 明天 / 後天 / 3 天後 / 2 天前」 */
export function relativeDayLabel(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === 2) return "後天";
  return diff > 0 ? `${diff} 天後` : `${-diff} 天前`;
}

/** 從今天起算的 n 天，供快選日期用 */
export function isoInDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** 今天是星期幾（0=日） */
function todayDow(): number {
  return new Date().getDay();
}

/** 距離本週末（最近的週六）幾天；今天已是週六/週日就回 0 */
function daysToThisWeekend(): number {
  const dow = todayDow();
  return dow === 0 || dow === 6 ? 0 : 6 - dow;
}

/**
 * 把使用者輸入的日期說法轉成 ISO 日期字串，無法辨識時回 null。
 * 支援：2026-08-15、8/15、8月15日、今天、明天、後天、這週末、下週、3 天後…
 * 只給月日且已過today時，視為明年。
 */
export function parseDateInput(text: string): string | null {
  const t = text.trim();
  if (!t) return null;

  /* 完整年月日 */
  const ymd = t.match(/(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/);
  if (ymd) {
    const [y, m, d] = [Number(ymd[1]), Number(ymd[2]), Number(ymd[3])];
    const date = new Date(y, m - 1, d);
    return date.getMonth() === m - 1 && date.getDate() === d ? toISODate(date) : null;
  }

  /* 只有月日 → 已過的日期算明年 */
  const md = t.match(/(\d{1,2})\s*[-/.月]\s*(\d{1,2})/);
  if (md) {
    const [m, d] = [Number(md[1]), Number(md[2])];
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let date = new Date(now.getFullYear(), m - 1, d);
      if (date.getMonth() !== m - 1) return null;
      if (date.getTime() < today.getTime()) date = new Date(now.getFullYear() + 1, m - 1, d);
      return toISODate(date);
    }
  }

  /* N 天後 / N 週後 */
  const inDays = t.match(/(\d+)\s*天\s*(後|后)/);
  if (inDays) return isoInDays(Number(inDays[1]));
  const inWeeks = t.match(/(\d+)\s*(週|周|星期)\s*(後|后)/);
  if (inWeeks) return isoInDays(Number(inWeeks[1]) * 7);

  /* 關鍵字（順序有意義：週末類要先於「這週 / 下週」） */
  if (/今天|今日|現在|馬上|立刻/.test(t)) return isoInDays(0);
  if (/明天|明日/.test(t)) return isoInDays(1);
  if (/後天|后天/.test(t)) return isoInDays(2);
  if (/(下週末|下周末)/.test(t)) return isoInDays(daysToThisWeekend() + 7);
  if (/(這|本)?(週末|周末)/.test(t)) return isoInDays(daysToThisWeekend());
  if (/(下週|下周|下星期)/.test(t)) return isoInDays(7);
  if (/(這週|本週|這周|本周|這星期|本星期)/.test(t)) return isoInDays(Math.max(1, 5 - todayDow()));
  if (/(一個月後|下個月|下月)/.test(t)) return isoInDays(30);
  if (/(這個月|本月|月內|月底)/.test(t)) return isoInDays(14);

  return null;
}
