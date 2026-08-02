import { useState } from "react";
import type { CartItem } from "../types";

interface TaskDetailProps {
  task: any;
  cartItems: CartItem[];
  onBack: () => void;
  onProductAdd: (item: CartItem) => void;
  onComplete: (taskId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:     { label: "已確認", bg: "#DCFCE7", color: "#16A34A" },
  "in-progress": { label: "進行中", bg: "#E7EEF5", color: "#4C6E91" },
  pending:       { label: "待處理", bg: "#FFF7ED", color: "#EA580C" },
  warning:       { label: "需確認", bg: "#FEE2E2", color: "#DC2626" },
};

const CATEGORY_TAGS: Record<string, { icon: string; label: string }> = {
  transport:    { icon: "🚗", label: "交通" },
  home_service: { icon: "🔧", label: "到府服務" },
  travel:       { icon: "✦", label: "體驗" },
  retail:       { icon: "🛍", label: "商品" },
  product:      { icon: "🛍", label: "商品" },
  fitness:      { icon: "🏋", label: "健身" },
};

/* ponytail: illustrative tips per category, not sourced from real service data */
const CATEGORY_TIPS: Record<string, string[]> = {
  transport:    ["請提前確認上車地點與時間", "留意即時路況，預留緩衝時間", "如有大件行李請提前告知司機"],
  home_service: ["請確認到府時間與聯絡方式", "建議提前準備好相關證件或資料", "完工後記得確認驗收內容"],
  travel:       ["請攜帶身分證件以備查驗", "依天氣狀況調整穿著與裝備", "如有特殊需求請提前告知店家"],
  retail:       ["建議提前確認商品庫存與到貨時間", "留意商品保存與使用期限"],
  product:      ["建議提前確認商品庫存與到貨時間", "留意商品保存與使用期限"],
  fitness:      ["建議先諮詢教練評估自身狀況", "運動前請做好熱身"],
};
const DEFAULT_TIPS = ["建議提前確認相關細節", "如有疑問可與 UNI 對話進一步詢問"];

/* ponytail: fallback suggestions when a task has no matching category data from the backend —
   keeps every tab populated instead of showing an empty state. Swap for a real recs API later. */
interface MockOption { id: string; icon: string; name: string; detail: string; price: number }
const MOCK_TABS: Record<"transport" | "buy" | "book", { heading: string; options: MockOption[] }> = {
  transport: {
    heading: "建議交通方式",
    options: [
      { id: "mock-transport-taxi", icon: "🚕", name: "計程車直達", detail: "約 15-20 分鐘・車資依里程計算", price: 0 },
      { id: "mock-transport-transit", icon: "🚇", name: "大眾運輸", detail: "捷運＋步行・約 25 分鐘", price: 0 },
      { id: "mock-transport-walk", icon: "🚶", name: "步行前往", detail: "適合天氣良好、距離較近時", price: 0 },
    ],
  },
  buy: {
    heading: "建議準備物品",
    options: [
      { id: "mock-buy-kit", icon: "🎒", name: "隨行用品組", detail: "常見必備小物", price: 150 },
      { id: "mock-buy-gift", icon: "🎁", name: "任務周邊小物", detail: "依任務內容建議準備", price: 280 },
    ],
  },
  book: {
    heading: "建議預約選項",
    options: [
      { id: "mock-book-slot", icon: "📅", name: "彈性預約時段", detail: "可依需求調整時間", price: 0 },
      { id: "mock-book-confirm", icon: "☎️", name: "電話確認預約", detail: "建議提前一天致電確認", price: 0 },
    ],
  },
};

const TABS = [
  { id: "suggest", label: "建議", icon: "📍" },
  { id: "transport", label: "交通", icon: "🚗" },
  { id: "buy", label: "購買", icon: "🛍" },
  { id: "book", label: "預約", icon: "📅" },
  { id: "remind", label: "提醒", icon: "🔔" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TaskDetail({ task, cartItems, onBack, onProductAdd, onComplete }: TaskDetailProps) {
  const [tab, setTab] = useState<TabId>("suggest");
  const [reminders, setReminders] = useState([{ id: "r1", label: `提醒我處理「${task.title}」`, on: true }]);

  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const catTag = task.category ? CATEGORY_TAGS[task.category] : undefined;
  const bookableId = task.serviceId || task.productId;
  const inCart = bookableId ? cartItems.some((c) => c.id === bookableId) : false;
  const tips = (task.category && CATEGORY_TIPS[task.category]) || DEFAULT_TIPS;

  const handleBook = () => {
    if (!bookableId || inCart) return;
    onProductAdd({
      id: bookableId,
      name: task.vendorName ? `${task.vendorName} · ${task.title}` : task.title,
      detail: task.detail,
      price: task.price ?? 0,
      qty: 1,
      icon: task.icon,
    });
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };

  const addReminder = () => {
    setReminders((prev) => [...prev, { id: `r${prev.length + 1}`, label: "自訂提醒", on: true }]);
  };

  const renderMockOptions = (kind: "transport" | "buy" | "book") => {
    const { heading, options } = MOCK_TABS[kind];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(76,110,145,0.07), rgba(110,146,180,0.04))", border: "1px solid rgba(76,110,145,0.15)", borderRadius: 14, padding: "10px 14px", fontSize: 12, color: "#4C6E91", fontWeight: 500 }}>
            ✦ 這個任務沒有指定方案，以下是 AI 建議選項
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#16232E", marginBottom: 8, fontFamily: "var(--font-display)" }}>{heading}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt) => {
              const inCart = cartItems.some((c) => c.id === opt.id);
              return (
                <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 12, padding: "10px 12px", border: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#16232E" }}>{opt.name}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{opt.detail}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {opt.price > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#16232E", fontFamily: "var(--font-display)" }}>NT${opt.price}</span>}
                    <button
                      onClick={() => !inCart && onProductAdd({ id: opt.id, name: opt.name, detail: opt.detail, price: opt.price, qty: 1, icon: opt.icon })}
                      disabled={inCart}
                      style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: inCart ? "default" : "pointer", background: inCart ? "#DCFCE7" : "#4C6E91", color: inCart ? "#16A34A" : "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      {inCart ? "✓ 已加入" : "加入"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const bookableCard = bookableId ? (
    <div style={{ background: "white", borderRadius: 14, padding: 14, border: "1px solid #F1F5F9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {task.imgUrl ? (
          <img src={task.imgUrl} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E7EEF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{task.icon}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#16232E" }}>{task.vendorName || task.title}</div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>{task.detail}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16232E" }}>
          {task.price ? `NT$ ${task.price}` : "免費"}
        </span>
        <button
          onClick={handleBook}
          disabled={inCart}
          style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: inCart ? "default" : "pointer", background: inCart ? "#DCFCE7" : "#4C6E91", color: inCart ? "#16A34A" : "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}
        >
          {inCart ? "✓ 已選擇" : "選擇此方案"}
        </button>
      </div>
    </div>
  ) : null;

  const infoRows = [
    catTag ? { icon: catTag.icon, text: catTag.label } : null,
    task.vendorName ? { icon: "🏪", text: task.vendorName } : null,
    task.price != null ? { icon: "💰", text: `NT$ ${task.price}` } : null,
  ].filter(Boolean) as { icon: string; text: string }[];

  /* ponytail: no API key needed — Google's unofficial `output=embed` query renders
     a live map from a place name; upgrade to Maps Embed API + key if this needs to be
     officially supported / geocode precise addresses instead of a text search. */
  const mapQuery = task.vendorName ? encodeURIComponent(task.vendorName) : "";
  const transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}&travelmode=transit`;
  const mapCard = task.vendorName ? (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid #F1F5F9", height: 140 }}>
      <iframe
        title={`map-${task.id}`}
        src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
      />
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: "absolute", right: 8, bottom: 8, display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 20, background: "white", boxShadow: "0 2px 8px rgba(22,35,46,0.2)", fontSize: 11, fontWeight: 700, color: "#4C6E91", fontFamily: "var(--font-display)", textDecoration: "none" }}
      >
        📍 導航前往
      </a>
    </div>
  ) : null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#F5F7FA" }}>
      {/* Header */}
      <div style={{ background: "white", padding: "16px 16px 0", flexShrink: 0, borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#64748B", flexShrink: 0 }}>‹</button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E7EEF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{task.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16232E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.detail}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 20, flexShrink: 0 }}>{sc.label}</span>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "8px 0 10px", border: "none", background: "none", cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #4C6E91" : "2px solid transparent",
                color: tab === t.id ? "#4C6E91" : "#94A3B8",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }} className="scrollbar-hide">
        {tab === "suggest" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(76,110,145,0.07), rgba(110,146,180,0.04))", border: "1px solid rgba(76,110,145,0.15)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>✦</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4C6E91", marginBottom: 4, fontFamily: "var(--font-display)" }}>AI 小幫手建議</div>
                <p style={{ fontSize: 13, color: "#4C6E91", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{task.detail || "建議提早規劃，確保行程順利進行。"}</p>
              </div>
            </div>

            {infoRows.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#16232E", marginBottom: 8, fontFamily: "var(--font-display)" }}>任務資訊</div>
                <div style={{ background: "white", borderRadius: 14, padding: "4px 14px", border: "1px solid #F1F5F9" }}>
                  {infoRows.map((row, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < infoRows.length - 1 ? "1px solid #F5F7FA" : "none" }}>
                      <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{row.icon}</span>
                      <span style={{ fontSize: 13, color: "#334155" }}>{row.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.vendorName && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#16232E", marginBottom: 8, fontFamily: "var(--font-display)" }}>位置</div>
                {mapCard}
              </div>
            )}

            {bookableCard && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#16232E", marginBottom: 8, fontFamily: "var(--font-display)" }}>推薦方案</div>
                {bookableCard}
              </div>
            )}

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16232E", marginBottom: 8, fontFamily: "var(--font-display)" }}>注意事項</div>
              <div style={{ background: "white", borderRadius: 14, padding: "12px 14px", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 8 }}>
                {tips.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#334155" }}>
                    <span style={{ color: "#16A34A" }}>✓</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "transport" && (
          task.category === "transport" && bookableCard ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {bookableCard}
              {task.vendorName && mapCard}
              <a
                href={transitUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#4C6E91", display: "flex", gap: 8, alignItems: "center", textDecoration: "none", fontWeight: 600 }}
              >
                <span>🚇</span> 在 Google Maps 規劃大眾運輸路線
              </a>
            </div>
          ) : (
            renderMockOptions("transport")
          )
        )}

        {tab === "buy" && (
          (task.category === "retail" || task.category === "product") && bookableCard
            ? bookableCard
            : renderMockOptions("buy")
        )}

        {tab === "book" && (
          (task.category === "travel" || task.category === "home_service" || task.category === "fitness") && bookableCard
            ? bookableCard
            : renderMockOptions("book")
        )}

        {tab === "remind" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reminders.map((r) => (
              <div key={r.id} style={{ background: "white", borderRadius: 14, padding: "12px 14px", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#334155" }}>{r.label}</span>
                <div
                  onClick={() => toggleReminder(r.id)}
                  style={{ width: 40, height: 22, borderRadius: 11, background: r.on ? "#4C6E91" : "#CBD5E1", position: "relative", cursor: "pointer", flexShrink: 0 }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: r.on ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            ))}
            <button onClick={addReminder} style={{ padding: "10px", borderRadius: 14, border: "1.5px dashed #E2E8F0", background: "white", color: "#4C6E91", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}>
              ＋ 新增提醒
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
        <button
          onClick={() => onComplete(task.id)}
          disabled={task.status === "confirmed"}
          style={{ width: "100%", padding: 14, borderRadius: 16, border: "none", background: task.status === "confirmed" ? "#DCFCE7" : "linear-gradient(135deg, #4C6E91, #6E92B4)", color: task.status === "confirmed" ? "#16A34A" : "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: task.status === "confirmed" ? "default" : "pointer", boxShadow: task.status === "confirmed" ? "none" : "0 8px 24px rgba(76,110,145,0.3)" }}
        >
          {task.status === "confirmed" ? "✓ 已完成此任務" : "已完成此任務"}
        </button>
      </div>
    </div>
  );
}
