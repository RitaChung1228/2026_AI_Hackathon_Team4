import { useState } from "react";
import { recommendations } from "../data";

interface RecommendationsProps {
  onSelect: (id: string) => void;
}

export default function Recommendations({ onSelect }: RecommendationsProps) {
  const [selected, setSelected] = useState("fastest");

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 300);
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#F8F9FC",
        overflowY: "auto",
        paddingBottom: 80,
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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#EDE9FF",
            borderRadius: 20,
            padding: "4px 12px",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 12 }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6246EA", fontFamily: "var(--font-display)" }}>
            AI 推薦方案
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            color: "#0F0A2E",
            margin: 0,
            letterSpacing: "-0.3px",
          }}
        >
          為你選擇最適合的方案
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0, marginTop: 6 }}>
          根據你的 #TimeSaver 偏好自動推薦
        </p>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recommendations.map((rec) => {
            const isSelected = selected === rec.id;
            return (
              <button
                key={rec.id}
                onClick={() => handleSelect(rec.id)}
                style={{
                  background: "white",
                  borderRadius: 20,
                  border: isSelected ? `2px solid ${rec.tagColor}` : "2px solid transparent",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: isSelected
                    ? `0 4px 20px rgba(98,70,234,0.15)`
                    : "0 1px 4px rgba(15,10,46,0.05)",
                  transition: "all 0.2s ease",
                  overflow: "hidden",
                }}
              >
                {rec.isDefault && (
                  <div
                    style={{
                      background: "linear-gradient(90deg, #6246EA, #8B5CF6)",
                      padding: "6px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ✦ AI 推薦 · 最符合你的偏好
                  </div>
                )}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: `${rec.tagColor}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        {rec.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 16,
                            color: "#0F0A2E",
                          }}
                        >
                          {rec.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{rec.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 18,
                          color: "#0F0A2E",
                        }}
                      >
                        NT${rec.total.toLocaleString()}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: rec.tagColor,
                          background: `${rec.tagColor}18`,
                          padding: "2px 8px",
                          borderRadius: 20,
                        }}
                      >
                        {rec.tag}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {rec.items.map((item) => (
                      <span
                        key={item}
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          background: "#F8F9FC",
                          padding: "4px 10px",
                          borderRadius: 20,
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Reason */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: `${rec.tagColor}10`,
                      borderRadius: 10,
                      padding: "8px 12px",
                    }}
                  >
                    <span style={{ fontSize: 12 }}>✦</span>
                    <span style={{ fontSize: 12, color: rec.tagColor, fontWeight: 500 }}>
                      {rec.reason}
                    </span>
                  </div>

                  {/* Select indicator */}
                  {isSelected && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        color: rec.tagColor,
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      <span>✓</span> 已選擇此方案
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
