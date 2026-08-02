import { useState, useEffect } from "react";
import { scenarioPacks } from "../data";
import { formatDateLabel, isoInDays, relativeDayLabel, todayISO } from "../dateUtils";

interface ScenarioPackDetailProps {
  packId: string;
  onUse: (date: string) => void;
  onBack: () => void;
  onSave?: (packId: string) => void;
  isSaved?: boolean;
  /* 此情境包已排定的日期（回到頁面時帶回顯示） */
  scheduledDate?: string;
}

const PACK_STEPS: Record<string, { icon: string; title: string; detail: string }[]> = {
  "business-trip": [
    { icon: "📋", title: "確認出差需求", detail: "行程、天數、預算確認" },
    { icon: "✈️", title: "訂機票 & 交通", detail: "查詢最優價格航班" },
    { icon: "🏨", title: "訂住宿", detail: "依需求推薦商務旅館" },
    { icon: "📱", title: "購買 SIM 卡", detail: "當地網路方案比較" },
    { icon: "💴", title: "換匯", detail: "推薦匯率最佳時機" },
    { icon: "🧳", title: "行李 & 清單", detail: "AI 自動生成打包清單" },
  ],
  "home-repair": [
    { icon: "🔍", title: "問題診斷", detail: "描述症狀，AI 分析原因" },
    { icon: "👷", title: "搜尋師傅", detail: "附近評價最高的師傅" },
    { icon: "📅", title: "安排時間", detail: "選擇方便的上門時段" },
    { icon: "🛠️", title: "確認報價", detail: "比較不同師傅報價" },
    { icon: "✅", title: "驗收完工", detail: "完工後拍照記錄" },
  ],
  "pet-care": [
    { icon: "🐾", title: "選擇診所", detail: "附近評分最高的動物醫院" },
    { icon: "📅", title: "預約掛號", detail: "線上掛號，減少等待" },
    { icon: "📝", title: "準備病歷", detail: "整理寵物健康紀錄" },
    { icon: "🚗", title: "安排接送", detail: "寵物友善計程車" },
    { icon: "💊", title: "用藥管理", detail: "設定餵藥提醒" },
  ],
  moving: [
    { icon: "📦", title: "整理物品", detail: "AI 協助分類清單" },
    { icon: "🚚", title: "預約搬家公司", detail: "比較報價，安排時間" },
    { icon: "📋", title: "地址變更通知", detail: "一次更新多個重要帳號" },
    { icon: "⚡", title: "水電轉移", detail: "辦理水電瓦斯過戶" },
    { icon: "🏠", title: "新居清潔", detail: "預約專業清潔服務" },
    { icon: "📬", title: "郵件轉址", detail: "設定舊地址信件轉發" },
  ],
  fitness: [
    { icon: "🎯", title: "設定目標", detail: "體重、體脂、力量目標" },
    { icon: "📅", title: "制定計畫", detail: "AI 客製化週訓練表" },
    { icon: "🥗", title: "飲食規劃", detail: "配合訓練的飲食建議" },
    { icon: "⏱️", title: "追蹤進度", detail: "每週紀錄數據" },
    { icon: "💪", title: "調整計畫", detail: "根據進度動態優化" },
  ],
  birthday: [
    { icon: "🎂", title: "選擇蛋糕", detail: "口味、尺寸、造型確認" },
    { icon: "🌸", title: "預訂花束", detail: "推薦季節花材搭配" },
    { icon: "🍽️", title: "訂位餐廳", detail: "依人數找合適場地" },
    { icon: "🎁", title: "準備禮物", detail: "AI 推薦個人化禮物" },
    { icon: "✉️", title: "發送邀請", detail: "製作精美邀請訊息" },
    { icon: "📸", title: "拍照記錄", detail: "推薦拍照打卡地點" },
  ],
};

export default function ScenarioPackDetail({ packId, onUse, onBack, onSave, isSaved = false, scheduledDate }: ScenarioPackDetailProps) {
  const pack = scenarioPacks.find((p) => p.id === packId) || scenarioPacks[0];
  const [modules, setModules] = useState(pack.modules);
  const [date, setDate] = useState(scheduledDate ?? todayISO());
  const [showSteps, setShowSteps] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [planning, setPlanning] = useState(false);

  const steps = PACK_STEPS[packId] || PACK_STEPS["business-trip"];

  const toggleModule = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const startPlanning = () => {
    setPlanning(true);
    setShowSteps(false);
    setVisibleSteps(0);
    setTimeout(() => {
      setPlanning(false);
      setShowSteps(true);
      let count = 0;
      const reveal = () => {
        if (count < steps.length) {
          count++;
          setVisibleSteps(count);
          setTimeout(reveal, 180);
        }
      };
      reveal();
    }, 1600);
  };

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const enabledCount = modules.filter((m) => m.enabled).length;
  const progress = showSteps && steps.length > 0 ? Math.round((checkedSteps.length / steps.length) * 100) : 0;

  return (
    <div style={{ height: "100%", background: "#F8F9FC", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(160deg, ${pack.color} 0%, ${pack.color}CC 100%)`,
          padding: "52px 20px 24px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <button
          onClick={onBack}
          style={{ position: "relative", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 20, padding: "6px 14px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← 返回
        </button>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{pack.icon}</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "white", margin: 0, marginBottom: 8, letterSpacing: "-0.3px" }}>
              {pack.name}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0 }}>{pack.description}</p>
          </div>
          {onSave && (
            <button
              onClick={() => onSave(packId)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: isSaved ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
                transition: "all 0.2s",
              }}
              title={isSaved ? "已儲存" : "儲存情境包"}
            >
              {isSaved ? "🔖" : "🔗"}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 120px" }} className="scrollbar-hide">

        {/* 行程日期 */}
        <div style={{ background: "white", borderRadius: 16, padding: "14px", marginBottom: 16, border: `1px solid ${pack.color}30` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0F0A2E", margin: 0 }}>
              📅 行程日期
            </h3>
            <span style={{ fontSize: 12, color: pack.color, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {relativeDayLabel(date)}
            </span>
          </div>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 12px",
              borderRadius: 12,
              border: "1.5px solid #E5E7EB",
              background: "#F8F9FC",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              color: "#0F0A2E",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "今天", offset: 0 },
              { label: "明天", offset: 1 },
              { label: "3 天後", offset: 3 },
              { label: "下週", offset: 7 },
            ].map((q) => {
              const iso = isoInDays(q.offset);
              const active = date === iso;
              return (
                <button
                  key={q.label}
                  onClick={() => setDate(iso)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1.5px solid ${active ? pack.color : "#E5E7EB"}`,
                    background: active ? `${pack.color}15` : "white",
                    color: active ? pack.color : "#6B7280",
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
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "10px 0 0", lineHeight: 1.5 }}>
            {formatDateLabel(date)} · 建立後會依日期在首頁「今日重點」提醒你
          </p>
        </div>

        {/* AI Planning CTA */}
        {!showSteps && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={startPlanning}
              disabled={planning}
              style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: planning ? "#E5E7EB" : "linear-gradient(135deg, #130E28, #6246EA)",
                color: planning ? "#9CA3AF" : "white",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                cursor: planning ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: planning ? "none" : "0 6px 20px rgba(98,70,234,0.3)",
                transition: "all 0.3s",
              }}
            >
              {planning ? (
                <>
                  <span className="spin-slow" style={{ display: "inline-block", fontSize: 18 }}>✦</span>
                  AI 正在規劃步驟...
                </>
              ) : (
                <>✦ AI 幫你規劃步驟</>
              )}
            </button>
          </div>
        )}

        {/* Step checklist */}
        {showSteps && (
          <div className="screen-up" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0F0A2E", margin: 0 }}>
                AI 規劃步驟
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ height: 6, width: 60, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${pack.color}, ${pack.color}AA)`, transition: "width 0.4s ease", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{progress}%</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {steps.slice(0, visibleSteps).map((step, i) => {
                const checked = checkedSteps.includes(i);
                return (
                  <div
                    key={i}
                    className="step-reveal"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      background: "white",
                      borderRadius: 14,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: `1.5px solid ${checked ? pack.color + "40" : "#F3F4F6"}`,
                      opacity: checked ? 0.7 : 1,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => toggleStep(i)}
                  >
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        border: `2px solid ${checked ? pack.color : "#D1D5DB"}`,
                        background: checked ? pack.color : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "all 0.2s",
                      }}
                    >
                      {checked && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#0F0A2E", textDecoration: checked ? "line-through" : "none" }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{step.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modules section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0F0A2E", margin: 0 }}>
              工具模組
            </h3>
            <span style={{ fontSize: 13, color: "#6B7280" }}>已啟用 {enabledCount}/{modules.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {modules.map((mod) => (
              <div
                key={mod.id}
                style={{
                  background: "white", borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  border: `1px solid ${mod.enabled ? `${pack.color}30` : "#F3F4F6"}`,
                  opacity: mod.enabled ? 1 : 0.5, transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 22 }}>{mod.icon}</span>
                <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#0F0A2E" }}>
                  {mod.name}
                </span>
                <div
                  onClick={() => toggleModule(mod.id)}
                  style={{ width: 40, height: 22, borderRadius: 11, background: mod.enabled ? pack.color : "#D1D5DB", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: mod.enabled ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 14, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600, cursor: "pointer" }}>
            ↗ 分享
          </button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 14, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600, cursor: "pointer" }}>
            ⊞ 複製
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: "absolute", bottom: 88, left: 20, right: 20 }}>
        <button
          onClick={() => onUse(date)}
          style={{
            width: "100%", padding: "16px", borderRadius: 16, border: "none",
            background: `linear-gradient(135deg, ${pack.color}, ${pack.color}CC)`,
            color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
            cursor: "pointer", boxShadow: `0 8px 24px ${pack.color}40`,
          }}
        >
          {relativeDayLabel(date)}使用此情境包 →
        </button>
      </div>
    </div>
  );
}
