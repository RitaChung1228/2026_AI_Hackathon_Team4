import { useEffect, useState } from "react";
import { todayISO, isoInDays, formatDateLabel, relativeDayLabel, parseDateInput } from "../dateUtils";

/* 星期表頭（週日起） */
const WEEK_HEAD = ["日", "一", "二", "三", "四", "五", "六"];

/** ISO 字串 → { y, m }（m 為 0-based，配合 Date） */
function isoToCursor(iso: string): { y: number; m: number } {
  const [y, m] = iso.split("-").map(Number);
  return { y, m: (m ?? 1) - 1 };
}

/** 組出 YYYY-MM-DD（純字串運算，ISO 可直接比大小，不受時區影響） */
function makeISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface InlineCalendarProps {
  /** 目前選取的日期（YYYY-MM-DD），null = 尚未選 */
  value: string | null;
  onChange: (iso: string) => void;
  /** 主色，預設沿用品牌藍 */
  accent?: string;
  /** 可選的最早日期，預設今天（不讓使用者選過去） */
  minISO?: string;
}

/**
 * 純手寫的月曆格（不引入日期套件）。
 * 一律用本地日曆日的字串比較，避免時區造成差一天。
 */
export function InlineCalendar({ value, onChange, accent = "#4C6E91", minISO = todayISO() }: InlineCalendarProps) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => isoToCursor(value ?? minISO ?? today));

  /* 外部改了日期（例如點快選）→ 月曆跟著翻到那個月 */
  useEffect(() => {
    if (value) setCursor(isoToCursor(value));
  }, [value]);

  const firstDow = new Date(cursor.y, cursor.m, 1).getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  /* 整個月都早於 minISO 就不能再往前翻 */
  const lastOfMonth = makeISO(cursor.y, cursor.m, daysInMonth);
  const canGoPrev = lastOfMonth > minISO;

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const navBtn = (disabled: boolean) => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "white",
    color: disabled ? "#CBD5E1" : "#4C6E91",
    fontSize: 13,
    lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "10px 12px 12px" }}>
      {/* 月份切換 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button
          type="button"
          aria-label="上一個月"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && shiftMonth(-1)}
          style={navBtn(!canGoPrev)}
        >
          ‹
        </button>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#16232E" }}>
          {cursor.y} 年 {cursor.m + 1} 月
        </span>
        <button type="button" aria-label="下一個月" onClick={() => shiftMonth(1)} style={navBtn(false)}>
          ›
        </button>
      </div>

      {/* 星期表頭 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
        {WEEK_HEAD.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 10, color: "#94A3B8", fontWeight: 600, padding: "2px 0" }}>
            {w}
          </div>
        ))}
      </div>

      {/* 日期格 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const iso = makeISO(cursor.y, cursor.m, day);
          const disabled = iso < minISO;
          const selected = value === iso;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-label={formatDateLabel(iso)}
              aria-pressed={selected}
              onClick={() => onChange(iso)}
              style={{
                height: 30,
                borderRadius: 9,
                border: selected ? `1.5px solid ${accent}` : isToday ? `1.5px solid ${accent}55` : "1.5px solid transparent",
                background: selected ? accent : "transparent",
                color: selected ? "white" : disabled ? "#CBD5E1" : "#16232E",
                fontSize: 12,
                fontWeight: selected || isToday ? 700 : 500,
                fontFamily: "var(--font-display)",
                cursor: disabled ? "default" : "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 快選（今天 / 明天 / 後天 / 這週末 / 下週） */
function quickDates(): { label: string; iso: string }[] {
  const weekend = parseDateInput("這週末") ?? isoInDays(0);
  return [
    { label: "今天", iso: isoInDays(0) },
    { label: "明天", iso: isoInDays(1) },
    { label: "後天", iso: isoInDays(2) },
    { label: "這週末", iso: weekend },
    { label: "下週", iso: isoInDays(7) },
  ];
}

interface DateQuickChipsProps {
  value: string | null;
  onChange: (iso: string) => void;
  accent?: string;
}

/** 日期快選膠囊，樣式對齊聊天室既有的 quick reply chips */
export function DateQuickChips({ value, onChange, accent = "#4C6E91" }: DateQuickChipsProps) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {quickDates().map((q) => {
        const active = value === q.iso;
        return (
          <button
            key={q.label}
            type="button"
            onClick={() => onChange(q.iso)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1.5px solid ${active ? accent : "#E2E8F0"}`,
              background: active ? `${accent}15` : "white",
              color: active ? accent : "#64748B",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}
          >
            {q.label}
          </button>
        );
      })}
    </div>
  );
}

interface DatePickerCardProps {
  /** 按下確認後把日期送出（ISO 字串） */
  onConfirm: (iso: string) => void;
  accent?: string;
  title?: string;
  confirmLabel?: string;
  /** 預設選取的日期 */
  initial?: string | null;
}

/**
 * 聊天室裡的行事曆卡片：快選膠囊 + 月曆 + 確認按鈕。
 * AI 問到日期時（回覆帶 [日期] 標記或問句提到日期）就會顯示這張卡。
 */
export function DatePickerCard({
  onConfirm,
  accent = "#4C6E91",
  title = "選擇日期",
  confirmLabel = "確認日期",
  initial = null,
}: DatePickerCardProps) {
  const [selected, setSelected] = useState<string | null>(initial);

  return (
    <div style={{ marginTop: 8, background: "#F5F7FA", borderRadius: 16, border: "1px solid #E2E8F0", padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#16232E" }}>
          📅 {title}
        </span>
        {selected && (
          <span style={{ fontSize: 12, fontWeight: 700, color: accent, fontFamily: "var(--font-display)" }}>
            {relativeDayLabel(selected)}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <DateQuickChips value={selected} onChange={setSelected} accent={accent} />
      </div>

      <InlineCalendar value={selected} onChange={setSelected} accent={accent} />

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        style={{
          width: "100%",
          marginTop: 10,
          padding: "10px 14px",
          borderRadius: 12,
          border: "none",
          background: selected ? `linear-gradient(135deg, ${accent}, #3B5876)` : "#E2E8F0",
          color: selected ? "white" : "#94A3B8",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          cursor: selected ? "pointer" : "default",
        }}
      >
        {selected ? `${confirmLabel} · ${formatDateLabel(selected)}` : "請先選一個日期"}
      </button>
    </div>
  );
}

/**
 * 送給 AI 的日期文字。同時給 ISO 與中文標籤，
 * 讓模型不會誤判年份，也讀得懂是星期幾。
 */
export function dateReplyText(iso: string): string {
  return `日期選 ${iso}，${formatDateLabel(iso)}`;
}
