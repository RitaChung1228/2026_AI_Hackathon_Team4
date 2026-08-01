import { useState } from "react";
import { mockUser, scenarioPacks, todayCards, aiSuggestions } from "../data";

interface HomeProps {
  onInputSubmit: (text: string) => void;
  onScenarioPack: (packId: string) => void;
  userTags?: string[];
  savedPackIds?: string[];
}

const TAG_TO_PACKS: Record<string, string[]> = {
  "#商務出差": ["business-trip"],
  "#旅行常客": ["business-trip"],
  "#出差中": ["business-trip"],
  "#旅行中": ["business-trip"],
  "#毛孩生活": ["pet-care"],
  "#健身日常": ["fitness"],
  "#家庭生活": ["home-repair", "moving"],
  "#週末出遊": ["fitness"],
  "#生日將近": ["birthday"],
  "#聚餐準備": ["birthday"],
};

export default function Home({ onInputSubmit, onScenarioPack, userTags = [], savedPackIds = [] }: HomeProps) {
  const [inputValue, setInputValue] = useState("");
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);

  const examplePrompts = [
    "下週三要去東京出差兩天。",
    "今晚朋友生日。",
    "下班順路幫我取貨。",
    "週末要去露營。",
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onInputSubmit(inputValue.trim());
    }
  };

  const handleExample = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => onInputSubmit(prompt), 150);
  };

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#F8F9FC",
        paddingBottom: 80,
      }}
      className="scrollbar-hide"
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "56px 20px 20px",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)" }}>U</span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 17,
                color: "#0F0A2E",
                letterSpacing: "-0.3px",
              }}
            >
              UNI Flow
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#F3F4F6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                position: "relative",
              }}
            >
              🔔
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#6246EA",
                  border: "2px solid white",
                }}
              />
            </button>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {mockUser.avatar}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 4 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 4,
              letterSpacing: "-0.5px",
            }}
          >
            Hi {mockUser.name} 👋
          </h2>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {/* Dynamic Tags */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "#0F0A2E",
                margin: 0,
              }}
            >
              你的標籤
            </h3>
            <button style={{ fontSize: 13, color: "#6246EA", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
              編輯
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(userTags.length > 0 ? userTags : mockUser.tags).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "#EDE9FF",
                  color: "#6246EA",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Today Cards */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            今日重點
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayCards.map((card, i) => {
              const isWarning = card.type === "warning";
              return (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 1px 3px rgba(15,10,46,0.05)",
                    border: `1px solid ${isWarning ? "#FED7AA" : "#F3F4F6"}`,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{card.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>
                      {card.text}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{card.sub}</div>
                  </div>
                  {isWarning && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#EA580C",
                        background: "#FFF7ED",
                        padding: "3px 8px",
                        borderRadius: 20,
                      }}
                    >
                      即將到期
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario Packs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "#0F0A2E",
                margin: 0,
              }}
            >
              {userTags.length > 0 ? "為你推薦" : "我的情境包"}
            </h3>
            <button style={{ fontSize: 13, color: "#6246EA", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
              全部
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginLeft: -20, paddingLeft: 20, paddingRight: 20 }} className="scrollbar-hide">
            {(userTags.length > 0
              ? [...scenarioPacks].sort((a, b) => {
                  const recIds = new Set(userTags.flatMap((t) => TAG_TO_PACKS[t] ?? []));
                  const aRec = recIds.has(a.id) ? 0 : 1;
                  const bRec = recIds.has(b.id) ? 0 : 1;
                  return aRec - bRec;
                })
              : scenarioPacks
            ).map((pack) => {
                const recIds = new Set(userTags.flatMap((t) => TAG_TO_PACKS[t] ?? []));
                const isRec = recIds.has(pack.id);
                const isSaved = savedPackIds.includes(pack.id);
                return (
                  <button
                    key={pack.id}
                    onClick={() => onScenarioPack(pack.id)}
                    style={{
                      flexShrink: 0,
                      width: 120,
                      padding: "14px 12px",
                      borderRadius: 16,
                      border: isRec ? `1.5px solid ${pack.color}40` : "none",
                      background: "white",
                      cursor: "pointer",
                      boxShadow: isRec ? `0 4px 16px ${pack.color}20` : "0 1px 3px rgba(15,10,46,0.06)",
                      textAlign: "left",
                      position: "relative",
                    }}
                  >
                    {isRec && (
                      <div style={{ position: "absolute", top: -6, right: -6, background: pack.color, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10, fontFamily: "var(--font-display)" }}>
                        推薦
                      </div>
                    )}
                    {isSaved && (
                      <div style={{ position: "absolute", top: -6, left: -6, fontSize: 14 }}>🔖</div>
                    )}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: pack.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 10 }}>
                      {pack.icon}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#0F0A2E", lineHeight: 1.3 }}>
                      {pack.name}
                    </div>
                  </button>
                );
              })}
            <button
              style={{
                flexShrink: 0,
                width: 120,
                padding: "14px 12px",
                borderRadius: 16,
                border: "2px dashed #E5E7EB",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#9CA3AF",
              }}
            >
              <span style={{ fontSize: 24 }}>＋</span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-display)", fontWeight: 600 }}>建立新的</span>
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            AI 建議
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aiSuggestions
              .filter((_, i) => !dismissedSuggestions.includes(i))
              .map((s, idx) => {
                const origIdx = aiSuggestions.indexOf(s);
                return (
                  <div
                    key={origIdx}
                    style={{
                      background: "linear-gradient(135deg, rgba(98,70,234,0.06), rgba(139,92,246,0.04))",
                      border: "1px solid rgba(98,70,234,0.15)",
                      borderRadius: 16,
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                      <p style={{ fontSize: 13, color: "#0F0A2E", margin: 0, lineHeight: 1.5, flex: 1 }}>
                        {s.text}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      {s.actions.map((a, ai) => (
                        <button
                          key={ai}
                          onClick={() => setDismissedSuggestions((prev) => [...prev, origIdx])}
                          style={{
                            padding: "7px 16px",
                            borderRadius: 20,
                            border: ai === 0 ? "none" : "1px solid #E5E7EB",
                            background: ai === 0 ? "#6246EA" : "white",
                            color: ai === 0 ? "white" : "#6B7280",
                            fontSize: 13,
                            fontWeight: ai === 0 ? 600 : 400,
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
