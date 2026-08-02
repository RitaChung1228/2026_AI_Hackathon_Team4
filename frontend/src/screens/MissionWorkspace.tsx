import { useState } from "react";

interface Task {
  id: string;
  icon: string;
  title: string;
  status: string;
  detail: string;
  action: string;
  color: string;
}

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  aiSummary: string;
  tasks: Task[];
}

interface MissionWorkspaceProps {
  mission: Mission;
  onContinue: () => void;
  transportTime?: string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  confirmed: { label: "已確認", bg: "#DCFCE7", color: "#16A34A" },
  "in-progress": { label: "進行中", bg: "#E7EEF5", color: "#4C6E91" },
  pending: { label: "待處理", bg: "#FFF7ED", color: "#EA580C" },
  warning: { label: "需確認", bg: "#FEE2E2", color: "#DC2626" },
};

export default function MissionWorkspace({ mission, onContinue, transportTime }: MissionWorkspaceProps) {
  const [tasks, setTasks] = useState<Task[]>(mission.tasks);
  const [updatedIds, setUpdatedIds] = useState<string[]>([]);

  const displayTasks = tasks.map((t) => {
    if (t.id === "transport" && transportTime) {
      return { ...t, detail: `yoxi ${transportTime} Pickup` };
    }
    return t;
  });

  const handleAction = (taskId: string) => {
    setUpdatedIds((prev) => [...prev, taskId]);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.status === "pending") {
          return { ...t, status: "confirmed" };
        }
        if (t.id === taskId && t.status === "warning") {
          return { ...t, status: "confirmed", detail: t.detail.replace("尚未確認", "已選擇方案 NT$450") };
        }
        return t;
      })
    );
    setTimeout(() => setUpdatedIds((prev) => prev.filter((id) => id !== taskId)), 2000);
  };

  const confirmedCount = displayTasks.filter((t) => t.status === "confirmed").length;
  const progressPct = Math.round((confirmedCount / displayTasks.length) * 100);

  return (
    <div
      style={{
        height: "100%",
        background: "#F5F7FA",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "52px 20px 20px",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "#E7EEF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            💼
          </div>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 18,
                color: "#16232E",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              {mission.title}
            </h2>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0, marginTop: 2 }}>{mission.subtitle}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>任務進度</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#4C6E91",
                fontFamily: "var(--font-display)",
              }}
            >
              {progressPct}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "#F1F5F9",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #4C6E91, #6E92B4)",
                borderRadius: 3,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }} className="scrollbar-hide">
        {/* AI Summary */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(76,110,145,0.07), rgba(110,146,180,0.04))",
            border: "1px solid rgba(76,110,145,0.15)",
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 16,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
          <p style={{ fontSize: 13, color: "#4C6E91", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            {mission.aiSummary}
          </p>
        </div>

        {/* Task cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 100 }}>
          {displayTasks.map((task) => {
            const sc = statusConfig[task.status] || statusConfig.pending;
            const isUpdated = updatedIds.includes(task.id);
            return (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "14px 14px",
                  boxShadow: "0 1px 4px rgba(22,35,46,0.05)",
                  border: isUpdated ? "1.5px solid #16A34A" : "1px solid #F1F5F9",
                  transition: "border-color 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `${task.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {task.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#16232E",
                        marginBottom: 3,
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {task.id === "transport" && transportTime
                        ? `yoxi ${transportTime} Pickup`
                        : task.detail}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: sc.color,
                        background: sc.bg,
                        padding: "3px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {sc.label}
                    </span>
                    <button
                      onClick={() => handleAction(task.id)}
                      style={{
                        fontSize: 12,
                        color: "#4C6E91",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {task.action}
                    </button>
                  </div>
                </div>
                {isUpdated && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>✓</span> 已更新
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 20,
          right: 20,
        }}
      >
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #4C6E91, #6E92B4)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(76,110,145,0.35)",
          }}
        >
          繼續完成任務 →
        </button>
      </div>
    </div>
  );
}
