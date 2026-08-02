import { useState } from "react";
import { daysUntil, formatDateLabel, relativeDayLabel } from "../dateUtils";
import type { ScheduledTrip } from "../types";

interface MissionsProps {
  trips?: ScheduledTrip[];
  onMissionClick: (packId: string) => void;
  onBrowsePacks?: () => void;
  savedPackIds?: string[];
  onSavePack?: (packId: string) => void;
}

/* 任務狀態由行程日期與完成度推導 */
function missionStatus(trip: ScheduledTrip) {
  const diff = daysUntil(trip.date);
  if (trip.progress >= 100) return { label: "已完成", color: "#16A34A", bg: "#DCFCE7" };
  if (diff < 0) return { label: "已過期", color: "#9CA3AF", bg: "#F3F4F6" };
  if (diff === 0) return { label: "進行中", color: trip.color, bg: trip.bgColor };
  return { label: "準備中", color: "#EA580C", bg: "#FFF7ED" };
}

function missionSubtitle(trip: ScheduledTrip) {
  const diff = daysUntil(trip.date);
  const when = diff >= 0 ? relativeDayLabel(trip.date) : `已過 ${-diff} 天`;
  return `${formatDateLabel(trip.date)} · ${when}`;
}

export default function Missions({ trips = [], onMissionClick, onBrowsePacks, savedPackIds = [], onSavePack }: MissionsProps) {
  const [justSaved, setJustSaved] = useState<string | null>(null);

  /* 未完成的排前面，同組再依日期由近到遠 */
  const missions = [...trips].sort((a, b) => {
    const done = (a.progress >= 100 ? 1 : 0) - (b.progress >= 100 ? 1 : 0);
    return done !== 0 ? done : daysUntil(a.date) - daysUntil(b.date);
  });

  const handleSave = (e: React.MouseEvent, packId: string) => {
    e.stopPropagation();
    onSavePack?.(packId);
    setJustSaved(packId);
    setTimeout(() => setJustSaved(null), 1800);
  };
  return (
    <div
      style={{
        height: "100%",
        background: "#F8F9FC",
        overflowY: "auto",
        paddingBottom: 100,
      }}
      className="scrollbar-hide"
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "52px 20px 20px",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              color: "#0F0A2E",
              margin: 0,
            }}
          >
            我的任務
          </h2>
          {missions.length > 0 && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#6246EA",
                background: "#EDE9FF",
                padding: "4px 10px",
                borderRadius: 20,
              }}
            >
              {missions.length} 個任務
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* 尚未建立任何任務 */}
        {missions.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: "36px 24px",
              border: "1px dashed #E5E7EB",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#EDE9FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 14px",
              }}
            >
              ◈
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0F0A2E", marginBottom: 6 }}>
              還沒有任務
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: "0 0 20px" }}>
              選一個情境包、設定行程日期後，<br />任務會自動出現在這裡。
            </p>
            {onBrowsePacks && (
              <button
                onClick={onBrowsePacks}
                style={{
                  padding: "12px 24px",
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(98,70,234,0.3)",
                }}
              >
                使用情境包 →
              </button>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m) => {
            const status = missionStatus(m);
            const done = m.progress >= 100;
            return (
            <div
              key={m.id}
              onClick={() => onMissionClick(m.packId)}
              style={{
                background: "white",
                borderRadius: 18,
                padding: "16px",
                border: "1px solid #F3F4F6",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 1px 4px rgba(15,10,46,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: m.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#0F0A2E",
                      marginBottom: 3,
                    }}
                  >
                    {m.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{missionSubtitle(m)}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: status.color,
                    background: status.bg,
                    padding: "4px 10px",
                    borderRadius: 20,
                    flexShrink: 0,
                  }}
                >
                  {status.label}
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{done ? "已完成準備" : "進度"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: m.color }}>{m.progress}%</span>
                </div>
                <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${m.progress}%`,
                      background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Save as pack button */}
              <div style={{ marginTop: 12, borderTop: "1px solid #F3F4F6", paddingTop: 10 }}>
                {(() => {
                  const isSaved = savedPackIds.includes(m.packId);
                  const isJustSaved = justSaved === m.packId;
                  return (
                    <button
                      onClick={(e) => handleSave(e, m.packId)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                        borderRadius: 20, border: `1.5px solid ${isSaved ? m.color : "#E5E7EB"}`,
                        background: isSaved ? m.bgColor : "white",
                        color: isSaved ? m.color : "#6B7280",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: "var(--font-display)", transition: "all 0.2s",
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{isSaved ? "🔖" : "🔖"}</span>
                      {isJustSaved ? "✓ 已儲存！" : isSaved ? "已儲存為常用行程包" : "儲存為常用行程包"}
                    </button>
                  );
                })()}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
