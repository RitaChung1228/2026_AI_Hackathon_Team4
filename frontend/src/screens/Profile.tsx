import { useState } from "react"; // v2
import { mockUser, scenarioPacks } from "../data";

interface ProfileProps {
  savedPackIds?: string[];
  onPackSelect?: (packId: string) => void;
  onUnsavePack?: (packId: string) => void;
}

export default function Profile({ savedPackIds = [], onPackSelect, onUnsavePack }: ProfileProps) {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [tags, setTags] = useState(mockUser.tags);
  const [showTagSuggestion, setShowTagSuggestion] = useState(true);

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const preferences = [
    { icon: "⚡", label: "優先順序", value: "速度優先" },
    { icon: "📦", label: "取貨方式", value: "門市取貨" },
    { icon: "🔔", label: "通知", value: "重要才通知" },
  ];

  const historyItems = [
    { icon: "💼", title: "東京商務出差", sub: "3天前 · 已完成", color: "#EDE9FF" },
    { icon: "🎂", title: "朋友生日", sub: "1週前 · 已完成", color: "#FCE7F3" },
    { icon: "🛒", title: "日常補給", sub: "2週前 · 已完成", color: "#DCFCE7" },
  ];

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
      {/* Profile hero */}
      <div
        style={{
          background: "linear-gradient(160deg, #6246EA 0%, #8B5CF6 100%)",
          padding: "60px 24px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -20,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "3px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              fontSize: 28,
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "white",
            }}
          >
            {mockUser.avatar}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              color: "white",
              margin: 0,
              marginBottom: 4,
            }}
          >
            {mockUser.name}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {mockUser.profile}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Dynamic Tags */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F3F4F6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: "#0F0A2E",
                margin: 0,
              }}
            >
              Dynamic Tags
            </h3>
            <button
              style={{
                fontSize: 13,
                color: "#6246EA",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              編輯
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "#EDE9FF",
                  border: "1px solid rgba(98,70,234,0.2)",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6246EA", fontFamily: "var(--font-display)" }}>
                  {tag}
                </span>
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(98,70,234,0.15)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 10,
                    color: "#6246EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Tag suggestion */}
          {showTagSuggestion && (
            <div
              style={{
                marginTop: 12,
                background: "#F8F9FC",
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
              }}
            >
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0, marginBottom: 8 }}>
                最近你經常選擇門市取貨，要加入 #FrequentPickup 嗎？
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (!tags.includes("#FrequentPickup")) setTags((prev) => [...prev, "#FrequentPickup"]);
                    setShowTagSuggestion(false);
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "none",
                    background: "#6246EA",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  加入
                </button>
                <button
                  onClick={() => setShowTagSuggestion(false)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "1px solid #E5E7EB",
                    background: "white",
                    color: "#6B7280",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  不用
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F3F4F6",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            偏好設定
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {preferences.map((pref, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < preferences.length - 1 ? "1px solid #F3F4F6" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{pref.icon}</span>
                  <span style={{ fontSize: 14, color: "#6B7280" }}>{pref.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>
                    {pref.value}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>✦</span>
                <span style={{ fontSize: 14, color: "#6B7280" }}>AI 個人化</span>
              </div>
              <div
                onClick={() => setAiEnabled((v) => !v)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: aiEnabled ? "#6246EA" : "#D1D5DB",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    left: aiEnabled ? 22 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Saved packs */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F3F4F6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E", margin: 0 }}>
              🔖 常用行程包
            </h3>
            <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "var(--font-display)" }}>
              {savedPackIds.length} 個已儲存
            </span>
          </div>
          {savedPackIds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔖</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "var(--font-display)" }}>尚未儲存任何行程包</div>
              <div style={{ fontSize: 11, color: "#C4B5FD", marginTop: 4 }}>在行程包頁面點擊書籤圖示即可儲存</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedPackIds.map((id) => {
                const pack = scenarioPacks.find((p) => p.id === id);
                if (!pack) return null;
                return (
                  <div
                    key={id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: pack.bgColor, border: `1px solid ${pack.color}20`, cursor: "pointer" }}
                    onClick={() => onPackSelect?.(id)}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: pack.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {pack.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E" }}>{pack.name}</div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{pack.description}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onPackSelect?.(id); }}
                        style={{ padding: "5px 12px", borderRadius: 20, border: "none", background: pack.color, color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}
                      >使用</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onUnsavePack?.(id); }}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${pack.color}40`, background: "white", color: pack.color, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >🔖</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent missions */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid #F3F4F6",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            最近任務
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {historyItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0F0A2E",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{item.sub}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
