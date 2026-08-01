import { useState } from "react";

interface OnboardingProps {
  onComplete: (tags: string[]) => void;
}

const TAG_CATEGORIES = [
  {
    id: "decision",
    label: "決策偏好",
    emoji: "⚡",
    tags: ["#效率優先", "#省錢優先", "#品質優先", "#方便至上", "#精打細算"],
  },
  {
    id: "lifestyle",
    label: "生活型態",
    emoji: "🌟",
    tags: ["#商務出差", "#旅行常客", "#通勤日常", "#家庭生活", "#戶外玩家"],
  },
  {
    id: "habit",
    label: "行為習慣",
    emoji: "🔁",
    tags: ["#超商取貨", "#外送常客", "#大眾運輸", "#行動支付", "#夜貓族"],
  },
  {
    id: "interest",
    label: "興趣偏好",
    emoji: "💡",
    tags: ["#咖啡控", "#美食控", "#旅遊控", "#健身日常", "#毛孩生活"],
  },
  {
    id: "context",
    label: "即時情境",
    emoji: "📍",
    tags: ["#出差中", "#旅行中", "#週末出遊", "#雨天模式", "#聚餐準備", "#生日將近"],
  },
];

type Step = "welcome" | "survey" | "profile";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [profileReady, setProfileReady] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const goToProfile = () => {
    setStep("profile");
    setTimeout(() => setProfileReady(true), 400);
  };

  /* ── Welcome ── */
  if (step === "welcome") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
        {/* Purple gradient hero */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(160deg, #130E28 0%, #6246EA 60%, #8B5CF6 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative rings */}
          {[160, 220, 290].map((size, i) => (
            <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          ))}

          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ color: "white", fontWeight: 900, fontSize: 32, fontFamily: "var(--font-display)" }}>U</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 32,
              color: "white",
              textAlign: "center",
              margin: 0,
              marginBottom: 14,
              letterSpacing: "-0.8px",
              lineHeight: 1.15,
            }}
          >
            UNI Flow
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            一站式 AI 生活管家<br />幫你把繁雜的事變成一個對話
          </p>
        </div>

        {/* Bottom CTA */}
        <div style={{ padding: "32px 28px 48px", background: "white" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "#0F0A2E", margin: 0, marginBottom: 8, letterSpacing: "-0.4px" }}>
            讓 AI 更懂你的生活
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, margin: 0, marginBottom: 28 }}>
            花 30 秒選擇你的標籤，之後你說一句話，我幫你搞定其他的。
          </p>
          <button
            onClick={() => setStep("survey")}
            style={{
              width: "100%",
              padding: "17px",
              borderRadius: 18,
              border: "none",
              background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 10px 32px rgba(98,70,234,0.35)",
            }}
          >
            開始設定 →
          </button>
          <button
            onClick={() => onComplete([])}
            style={{ width: "100%", marginTop: 12, padding: "12px", background: "none", border: "none", fontSize: 14, color: "#9CA3AF", cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            先跳過
          </button>
        </div>
      </div>
    );
  }

  /* ── Survey ── */
  if (step === "survey") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F8F9FC" }}>
        {/* Header */}
        <div style={{ background: "white", padding: "52px 20px 20px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6246EA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display)" }}>U</span>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#0F0A2E" }}>選擇你的標籤</span>
          </div>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
            選越多越準確，每個類別至少選一個 ✦
          </p>
          {/* Selected count */}
          {selectedTags.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto" }} className="scrollbar-hide">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="tag-pop"
                  style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 20, background: "#6246EA", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tag categories */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }} className="scrollbar-hide">
          {TAG_CATEGORIES.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E" }}>{cat.label}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {cat.tags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 24,
                        border: `2px solid ${active ? "#6246EA" : "#E5E7EB"}`,
                        background: active ? "#EDE9FF" : "white",
                        color: active ? "#6246EA" : "#6B7280",
                        fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                        transition: "all 0.15s ease",
                        transform: active ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ height: 100 }} />
        </div>

        {/* CTA */}
        <div style={{ padding: "14px 20px 36px", background: "white", borderTop: "1px solid #F3F4F6", flexShrink: 0 }}>
          <button
            onClick={goToProfile}
            disabled={selectedTags.length === 0}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: selectedTags.length > 0 ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB",
              color: selectedTags.length > 0 ? "white" : "#9CA3AF",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              cursor: selectedTags.length > 0 ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: selectedTags.length > 0 ? "0 8px 24px rgba(98,70,234,0.3)" : "none",
            }}
          >
            {selectedTags.length > 0 ? `生成我的偏好檔案 (${selectedTags.length} 個標籤)` : "至少選擇一個標籤"}
          </button>
        </div>
      </div>
    );
  }

  /* ── Profile Preview ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      {/* Gradient top */}
      <div
        style={{
          background: "linear-gradient(160deg, #130E28 0%, #6246EA 70%)",
          padding: "64px 24px 32px",
          flexShrink: 0,
        }}
      >
        <div className="bounce-in" style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 20 }}>
          ✦
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, color: "white", margin: 0, marginBottom: 8, letterSpacing: "-0.5px" }}>
          你的 AI 偏好檔案
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
          根據你的選擇，UNI AI 會用這些標籤幫你做更聰明的決策
        </p>
      </div>

      {/* Tags organized by category */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 0" }} className="scrollbar-hide">
        {TAG_CATEGORIES.map((cat) => {
          const catTags = selectedTags.filter((t) => cat.tags.includes(t));
          if (catTags.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", marginBottom: 8, fontFamily: "var(--font-display)" }}>
                {cat.emoji} {cat.label.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {catTags.map((tag, i) => (
                  <span
                    key={tag}
                    className="tag-pop"
                    style={{
                      padding: "7px 14px",
                      borderRadius: 24,
                      background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      animationDelay: `${i * 0.07}s`,
                      boxShadow: "0 4px 12px rgba(98,70,234,0.25)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* AI note */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(98,70,234,0.06), rgba(139,92,246,0.04))",
            border: "1px solid rgba(98,70,234,0.15)",
            borderRadius: 16,
            padding: "16px",
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "#6246EA", fontSize: 14, flexShrink: 0 }}>✦</span>
            <p style={{ fontSize: 13, color: "#6246EA", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              根據你選擇的 {selectedTags.length} 個標籤，我已為你預先推薦最適合的情境包。之後可以隨時在「我的」調整偏好。
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px 48px", flexShrink: 0 }}>
        <button
          onClick={() => onComplete(selectedTags)}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: 18,
            border: "none",
            background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 17,
            cursor: "pointer",
            boxShadow: "0 10px 32px rgba(98,70,234,0.35)",
          }}
        >
          開始使用 UNI Flow →
        </button>
      </div>
    </div>
  );
}
