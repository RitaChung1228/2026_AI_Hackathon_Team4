import { useState } from "react";

interface MissionsProps {
  onMissionClick: () => void;
  savedPackIds?: string[];
  onSavePack?: (packId: string) => void;
}

const missions = [
  {
    id: "tokyo",
    packId: "business-trip",
    icon: "💼",
    title: "東京商務出差",
    subtitle: "Tokyo · 2 Days · 週三出發",
    progress: 65,
    color: "#6246EA",
    bg: "#EDE9FF",
    status: "進行中",
    statusColor: "#6246EA",
    statusBg: "#EDE9FF",
  },
  {
    id: "birthday",
    packId: "birthday",
    icon: "🎂",
    title: "朋友生日準備",
    subtitle: "今晚 · 臨時任務",
    progress: 100,
    color: "#DB2777",
    bg: "#FCE7F3",
    status: "已完成",
    statusColor: "#16A34A",
    statusBg: "#DCFCE7",
  },
  {
    id: "daily",
    packId: "moving",
    icon: "🛒",
    title: "日常補給",
    subtitle: "本週 · 例行任務",
    progress: 30,
    color: "#16A34A",
    bg: "#DCFCE7",
    status: "待處理",
    statusColor: "#EA580C",
    statusBg: "#FFF7ED",
  },
];

export default function Missions({ onMissionClick, savedPackIds = [], onSavePack }: MissionsProps) {
  const [justSaved, setJustSaved] = useState<string | null>(null);

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
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map((m) => (
            <div
              key={m.id}
              onClick={onMissionClick}
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
                    background: m.bg,
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
                    {m.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.subtitle}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: m.statusColor,
                    background: m.statusBg,
                    padding: "4px 10px",
                    borderRadius: 20,
                    flexShrink: 0,
                  }}
                >
                  {m.status}
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>進度</span>
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
                        background: isSaved ? m.bg : "white",
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
          ))}
        </div>
      </div>
    </div>
  );
}
