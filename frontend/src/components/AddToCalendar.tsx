import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { formatDateLabel } from "../dateUtils";

interface AddToCalendarProps {
  /** 用來記住哪些任務已匯入，通常給 packId */
  id: string;
  /** 事件日期，YYYY-MM-DD */
  date: string;
  /** 主色，跟著任務／情境包配色 */
  color?: string;
  /** 放在可點擊的卡片裡時要避免觸發外層點擊 */
  stopPropagation?: boolean;
}

/**
 * 匯入狀態存在 module scope，讓使用者切換分頁、元件重新掛載後
 * 仍記得已匯入過（demo 用，重新整理就會清空）。
 */
const importedKeys = new Set<string>();

/**
 * 「匯入行事曆」按鈕（展示用）。
 * 不會真的寫入行事曆，點擊後短暫顯示匯入中，然後固定為已匯入狀態。
 */
export default function AddToCalendar({ id, date, color = "#4C6E91", stopPropagation = true }: AddToCalendarProps) {
  const key = `${id}:${date}`;
  const [status, setStatus] = useState<"idle" | "importing" | "done">(() =>
    importedKeys.has(key) ? "done" : "idle"
  );

  /* 換成另一筆任務／日期時要重新判斷狀態 */
  useEffect(() => {
    setStatus(importedKeys.has(key) ? "done" : "idle");
  }, [key]);

  const handleClick = (e: ReactMouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (status !== "idle") return;
    setStatus("importing");
    setTimeout(() => {
      importedKeys.add(key);
      setStatus("done");
    }, 700);
  };

  const done = status === "done";
  const importing = status === "importing";

  return (
    <button
      onClick={handleClick}
      disabled={done || importing}
      aria-live="polite"
      title={done ? `${formatDateLabel(date)} 已匯入行事曆` : `將 ${formatDateLabel(date)} 匯入行事曆`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: `1.5px solid ${done ? "#BBF7D0" : color}`,
        background: done ? "#DCFCE7" : "white",
        color: done ? "#16A34A" : color,
        fontSize: 12,
        fontWeight: 600,
        cursor: done || importing ? "default" : "pointer",
        fontFamily: "var(--font-display)",
        transition: "all 0.2s",
        opacity: importing ? 0.7 : 1,
      }}
    >
      {importing ? (
        <span
          className="spin-slow"
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            borderTopColor: "transparent",
            flexShrink: 0,
          }}
        />
      ) : (
        <span style={{ fontSize: 13 }}>{done ? "✓" : "📅"}</span>
      )}
      {importing ? "匯入中…" : done ? `已匯入行事曆（${formatDateLabel(date)}）` : "匯入行事曆"}
    </button>
  );
}
