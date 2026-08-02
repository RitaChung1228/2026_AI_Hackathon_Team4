interface MissionCompleteProps {
  isBirthday?: boolean;
  onSave: () => void;
  onDismiss: () => void;
  onGoHome: () => void;
}

export default function MissionComplete({ isBirthday, onSave, onDismiss, onGoHome }: MissionCompleteProps) {
  const completed = isBirthday
    ? ["生日蛋糕", "精品禮物組", "交通安排", "出發提醒"]
    : ["出差 Checklist", "日本 eSIM", "yoxi 機場接送", "必備用品採買", "門市取貨", "Reminder"];

  const upcoming = isBirthday
    ? [
        { time: "今天 17:30", text: "出發提醒" },
        { time: "今天 18:30", text: "門市取貨 · 松仁門市" },
      ]
    : [
        { time: "明天 21:00", text: "行李確認提醒" },
        { time: "週三 05:30", text: "出發提醒" },
        { time: "週三 06:00", text: "yoxi 接送出發" },
      ];

  const savePrompt = isBirthday
    ? "這類任務之後還會用到嗎？要儲存成「生日慶祝包」嗎？"
    : "這次的設定要儲存成你的預設商務出差包嗎？";

  return (
    <div
      style={{
        height: "100%",
        background: "#F5F7FA",
        overflowY: "auto",
        paddingBottom: 100,
      }}
      className="scrollbar-hide"
    >
      {/* Success header */}
      <div
        style={{
          background: "white",
          padding: "60px 24px 32px",
          textAlign: "center",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div
          className="animate-bounce-in"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #16A34A, #22C55E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 32px rgba(22,163,74,0.3)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12L10 17L19 8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 0,
                animation: "check-draw 0.5s ease 0.4s both",
              }}
            />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            color: "#16232E",
            margin: 0,
            marginBottom: 8,
            letterSpacing: "-0.3px",
          }}
        >
          {isBirthday ? "生日準備完成！🎂" : "東京出差準備完成！"}
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
          所有任務已準備就緒，出發順利！
        </p>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Completed tasks */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F1F5F9",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#16232E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            已完成
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {completed.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#DCFCE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#16A34A" }}>✓</span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: "#16232E",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F1F5F9",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#16232E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            即將提醒
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4C6E91",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                />
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, minWidth: 80 }}>
                  {item.time}
                </span>
                <span style={{ fontSize: 13, color: "#16232E" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save prompt */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(76,110,145,0.07), rgba(110,146,180,0.04))",
            border: "1px solid rgba(76,110,145,0.15)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>✦</span>
            <p
              style={{
                fontSize: 14,
                color: "#16232E",
                margin: 0,
                lineHeight: 1.5,
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              {savePrompt}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onSave}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                border: "none",
                background: "#4C6E91",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {isBirthday ? "儲存情境包" : "儲存"}
            </button>
            <button
              onClick={onDismiss}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                border: "1.5px solid #E2E8F0",
                background: "white",
                color: "#64748B",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              不用
            </button>
          </div>
        </div>

        <button
          onClick={onGoHome}
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
            boxShadow: "0 8px 24px rgba(76,110,145,0.3)",
          }}
        >
          回到首頁
        </button>
      </div>
    </div>
  );
}
