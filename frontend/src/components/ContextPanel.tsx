import { useState, useRef } from "react";
import {
  tokyoMission, birthdayMission, homeRepairMission, petCareMission,
  movingMission, fitnessMission,
  products, homeRepairProducts, petProducts,
  recommendations, scenarioPacks, UNSPLASH,
} from "../data";
import type { ContextView, CartItem, Mission, Task } from "../types";

interface ContextPanelProps {
  view: ContextView;
  transportTime?: string;
  cartItems: CartItem[];
  onCartUpdate: (items: CartItem[]) => void;
  onCheckout: () => void;
  onSaveComplete: () => void;
  onDismissComplete: () => void;
  onProductAdd: (item: CartItem) => void;
  agentMission?: any;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:    { label: "已確認", bg: "#DCFCE7", color: "#16A34A" },
  "in-progress":{ label: "進行中", bg: "#EDE9FF", color: "#6246EA" },
  pending:      { label: "待處理", bg: "#FFF7ED", color: "#EA580C" },
  warning:      { label: "需確認", bg: "#FEE2E2", color: "#DC2626" },
};

/* Map view → mission data */
const MISSION_MAP: Partial<Record<ContextView, Mission>> = {
  "mission":          tokyoMission as Mission,
  "birthday-mission": birthdayMission as Mission,
  "home-repair":      homeRepairMission as Mission,
  "pet-care":         petCareMission as Mission,
  "moving":           movingMission as Mission,
  "fitness":          fitnessMission as Mission,
};

const MISSION_VIEWS = new Set<ContextView>(["mission", "birthday-mission", "home-repair", "pet-care", "moving", "fitness"]);

/* Map view → products for contextual shopping */
const SHOP_PRODUCTS: Partial<Record<ContextView, typeof products>> = {
  "shopping":          products,
  "home-repair-shop":  homeRepairProducts as any,
  "pet-shop":          petProducts as any,
};

export default function ContextPanel({
  view, transportTime, cartItems, onCartUpdate, onCheckout,
  onSaveComplete, onDismissComplete, onProductAdd, agentMission,
}: ContextPanelProps) {
  const [taskStates, setTaskStates] = useState<Record<string, string>>({});
  const [useOpenPoint, setUseOpenPoint] = useState(true);
  const [useCoupon, setUseCoupon] = useState(true);
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [cakeSize, setCakeSize] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [checklistInput, setChecklistInput] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [calorieGoal, setCalorieGoal] = useState("");
  const [calorieConfirmed, setCalorieConfirmed] = useState(false);
  const DAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
  const MUSCLE_GROUPS = ["休息", "胸肌", "背部", "腿部", "肩膀", "手臂", "核心", "全身"];
  const [workoutSchedule, setWorkoutSchedule] = useState<Record<string, string>>({
    星期一: "胸肌", 星期二: "休息", 星期三: "背部", 星期四: "休息", 星期五: "腿部", 星期六: "肩膀", 星期日: "休息",
  });

  const handleTaskAction = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  interface TaskRec { id: string; icon: string; name: string; detail: string; price: number }
  const TASK_RECS: Record<string, TaskRec[]> = {
    // Tokyo mission
    checklist: [
      { id: "neck-pillow", icon: "🛏", name: "記憶棉頸枕", detail: "飛機長途必備", price: 590 },
      { id: "luggage-bag", icon: "🧳", name: "旅行收納袋組", detail: "6件套 · 防水", price: 399 },
      { id: "travel-card", icon: "💳", name: "悠遊聯名卡", detail: "日本交通免換幣", price: 0 },
    ],
    transport: [
      { id: "yoxi-upgrade", icon: "🚕", name: "yoxi 商務型", detail: "06:00 · 桃園機場 T2", price: 1200 },
      { id: "uber-black", icon: "🚙", name: "Uber Black", detail: "附行李服務", price: 980 },
      { id: "mrt-ticket", icon: "🚇", name: "機場捷運票", detail: "直達台北車站 · 35 分", price: 160 },
    ],
    esim: [
      { id: "esim-3g", icon: "📶", name: "日本 eSIM 3GB", detail: "5 天 · 最省", price: 299 },
      { id: "esim-5g", icon: "📶", name: "日本 eSIM 5GB", detail: "5 天 · 推薦", price: 399 },
      { id: "esim-unlimited", icon: "📶", name: "日本 eSIM 無限", detail: "7 天 · 最方便", price: 799 },
    ],
    goods: [
      { id: "adapter", icon: "🔌", name: "萬國轉接頭", detail: "日本 A 型適用", price: 299 },
      { id: "powerbank", icon: "🔋", name: "行動電源 10000mAh", detail: "登機可攜帶", price: 599 },
      { id: "bottle", icon: "🧴", name: "旅行分裝瓶組", detail: "30ml × 6入 · TSA 合格", price: 189 },
    ],
    insurance: [
      { id: "ins-basic", icon: "🛡", name: "旅平險基本版", detail: "醫療 200萬 · 行李 5萬", price: 299 },
      { id: "ins-plus", icon: "🛡", name: "旅平險全包版", detail: "醫療 500萬 · 班機延誤", price: 599 },
      { id: "ins-cancel", icon: "🛡", name: "取消保險", detail: "含不可抗力取消", price: 399 },
    ],
    pickup: [
      { id: "snack-jp", icon: "🍫", name: "日本限定零食組", detail: "門市預購取貨", price: 349 },
      { id: "coffee-7", icon: "☕", name: "7-ELEVEN 咖啡 × 5", detail: "出發前補充能量", price: 125 },
      { id: "mask-pack", icon: "😷", name: "醫療口罩 10入", detail: "出差防護必備", price: 99 },
    ],
    // Home repair
    parts: [
      { id: "tape-seal", icon: "🔧", name: "止水帶", detail: "20mm · 3捲", price: 89 },
      { id: "tape-raw", icon: "🔩", name: "生料帶", detail: "水管用 · 5捲", price: 59 },
      { id: "waterproof", icon: "🪣", name: "防水膠", detail: "快乾型 · 500g", price: 199 },
    ],
    technician: [
      { id: "tech-xinsheng", icon: "👷", name: "鑫盛水電", detail: "評分 4.9 · NT$1,200起", price: 1200 },
      { id: "tech-taiwan", icon: "👷", name: "台灣水電王", detail: "評分 4.7 · NT$950起", price: 950 },
      { id: "tech-diy", icon: "🛠", name: "DIY 工具包", detail: "適合簡單修繕", price: 399 },
    ],
    // Pet care
    supplies: [
      { id: "cat-food", icon: "🐱", name: "主食罐 × 12入", detail: "貓咪專用 · 無穀", price: 499 },
      { id: "cat-litter", icon: "🪣", name: "礦物砂 10kg", detail: "凝結型 · 低粉塵", price: 349 },
      { id: "cat-toy", icon: "🎾", name: "逗貓棒組", detail: "4種款式", price: 199 },
    ],
    // Moving
    company: [
      { id: "move-aplus",  icon: "🚚", name: "A+ 搬家",     detail: "評分 4.9 · 含拆裝服務 · NT$6,800起", price: 6800 },
      { id: "move-quick",  icon: "🚛", name: "快捷搬家",     detail: "評分 4.7 · 最快明日到府 · NT$5,500起", price: 5500 },
      { id: "move-careful",icon: "📦", name: "細心搬家公司", detail: "評分 4.8 · 鋼琴/藝術品專業 · NT$7,200起", price: 7200 },
    ],
    packing: [
      { id: "box-set", icon: "📦", name: "搬家紙箱 20入", detail: "大 / 中 / 小混搭", price: 599 },
      { id: "bubble-wrap", icon: "🫧", name: "氣泡布 50m", detail: "防撞保護", price: 299 },
      { id: "tape-pack", icon: "🗂", name: "打包膠帶 × 6", detail: "強力黏著", price: 149 },
    ],
    // Fitness
    gym: [
      { id: "gym-fitlife", icon: "🏋️", name: "FitLife 信義店", detail: "24H · 月費 NT$1,200 · 含教練課程", price: 1200 },
      { id: "gym-worldgym", icon: "💪", name: "World Gym 松山店", detail: "月費 NT$1,380 · 設備齊全", price: 1380 },
      { id: "gym-anytime", icon: "🌙", name: "Anytime Fitness", detail: "24H · 月費 NT$980 · 全台互通", price: 980 },
    ],
    supplements: [
      { id: "whey", icon: "💪", name: "乳清蛋白 1kg", detail: "巧克力口味 · 33份", price: 1299 },
      { id: "creatine", icon: "⚡", name: "肌酸粉 300g", detail: "純肌酸 · 無添加", price: 599 },
      { id: "vitamins", icon: "💊", name: "綜合維他命", detail: "90顆 · 30天份", price: 399 },
    ],
    // Birthday (dynamic — size applied at render)
    cake: [],
    venue: [
      { id: "venue-rooftop", icon: "🌆", name: "信義區空中酒吧", detail: "頂樓露台 · 可包場 · 20人以下", price: 3800 },
      { id: "venue-cafe",    icon: "☕", name: "私人包廂咖啡廳", detail: "安和路 · 10人以下 · 無低消",   price: 0 },
      { id: "venue-ktv",     icon: "🎤", name: "Party World KTV", detail: "大包廂 · 含餐點 · 10~20人",  price: 2400 },
    ],
    gift: [
      { id: "gift-skincare", icon: "🧴", name: "保養品禮盒", detail: "LANEIGE 精選組 · NT$1,280", price: 1280 },
      { id: "gift-fragrance", icon: "🌸", name: "香氛蠟燭組", detail: "YANKEE CANDLE · NT$680", price: 680 },
      { id: "gift-flower", icon: "💐", name: "鮮花束", detail: "季節花材 · 含包裝 · NT$580", price: 580 },
    ],
    nutrition: [],
  };

  /* 「已加入」狀態直接由購物車推導，移除商品後標記會同步還原 */
  const addedProducts = cartItems.map((i) => i.id);

  const addProduct = (p: (typeof products)[0]) => {
    if (addedProducts.includes(p.id)) return;
    onProductAdd({ id: p.id, name: p.name, detail: p.detail, price: p.price, qty: 1, icon: p.icon });
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = subtotal > 0 ? (useOpenPoint ? 120 : 0) + (useCoupon ? 60 : 0) : 0;
  const total = Math.max(0, subtotal - discount);

  /* ── IDLE ── */
  if (view === "idle") {
    const quickPacks = scenarioPacks.slice(0, 4);
    return (
      <div className="panel-enter" style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: 150, flexShrink: 0, overflow: "hidden" }}>
          <img src={UNSPLASH.tokyoAerial} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(19,14,40,0.2), rgba(19,14,40,0.75))" }} />
          <div style={{ position: "absolute", bottom: 14, left: 18, right: 18 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white", marginBottom: 3 }}>任務看板</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>開始對話後，任務進度即時顯示在這裡</p>
          </div>
        </div>
        <div style={{ padding: "14px 14px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "var(--font-display)" }}>快速啟動</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 14px 16px" }}>
          {quickPacks.map((pack) => (
            <div key={pack.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB", cursor: "pointer", position: "relative" }}>
              <img src={(pack as any).image} alt={pack.name} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.2))", display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{pack.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "white" }}>{pack.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{pack.description}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 16, padding: "3px 10px", fontSize: 11, color: "white", fontWeight: 600 }}>啟動</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── AGENT MISSION VIEW (dynamic from AI) ── */
  if (view === "agent-mission" && agentMission) {
    const tasks = agentMission.tasks || [];
    const confirmedCount = tasks.filter((t: any) => (taskStates[t.id] || t.status) === "confirmed").length;
    const prog = tasks.length > 0 ? Math.round((confirmedCount / tasks.length) * 100) || agentMission.progress : 0;

    return (
      <div className="panel-enter" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Hero banner */}
        <div style={{ position: "relative", height: 130, flexShrink: 0, overflow: "hidden" }}>
          <img src={agentMission.image || "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=720&h=200&fit=crop&auto=format"} alt={agentMission.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(15,10,46,0.82))" }} />
          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white", marginBottom: 1 }}>{agentMission.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{agentMission.subtitle}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: "12px 16px 8px", background: "white", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6246EA", fontFamily: "var(--font-display)" }}>進度 {prog}%</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{confirmedCount}/{tasks.length} 完成</span>
          </div>
          <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${prog}%`, background: "linear-gradient(90deg, #6246EA, #8B5CF6)", borderRadius: 2, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* AI Summary */}
        {agentMission.aiSummary && (
          <div style={{ margin: "12px 16px 0", padding: "10px 14px", background: "linear-gradient(135deg, rgba(98,70,234,0.06), rgba(139,92,246,0.04))", border: "1px solid rgba(98,70,234,0.15)", borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>✦</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6246EA", fontFamily: "var(--font-display)" }}>AI 摘要</span>
            </div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{agentMission.aiSummary}</div>
          </div>
        )}

        {/* Task list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }} className="scrollbar-hide">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task: any) => {
              const currentStatus = taskStates[task.id] || task.status;
              const cfg = statusConfig[currentStatus] || statusConfig["pending"];
              const bookableId = task.serviceId || task.productId;
              const inCart = bookableId ? cartItems.some((c) => c.id === bookableId) : false;
              const actionLabel = task.category === "transport" ? "叫車" : task.productId ? "加入購物車" : "預約";
              return (
                <div key={task.id} style={{ background: "white", borderRadius: 12, padding: "12px 14px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
                  {task.imgUrl ? (
                    <img src={task.imgUrl} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{task.icon}</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "#0F0A2E", marginBottom: 2 }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.detail}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "3px 8px", borderRadius: 20, fontFamily: "var(--font-display)" }}>{cfg.label}</span>
                    {bookableId && (
                      <button
                        onClick={() => {
                          if (inCart) return;
                          onProductAdd({
                            id: bookableId,
                            name: task.vendorName ? `${task.vendorName} · ${task.title}` : task.title,
                            detail: task.detail,
                            price: task.price ?? 0,
                            qty: 1,
                            icon: task.icon,
                          });
                        }}
                        style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "none", cursor: inCart ? "default" : "pointer", background: inCart ? "#DCFCE7" : "#6246EA", color: inCart ? "#16A34A" : "white", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}
                      >
                        {inCart ? "✓ 已加入" : actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── GENERIC MISSION VIEW ── */
  if (MISSION_VIEWS.has(view)) {
    const mission = MISSION_MAP[view]!;
    const confirmedCount = mission.tasks.filter((t) => (taskStates[t.id] || t.status) === "confirmed").length;
    const prog = Math.round((confirmedCount / mission.tasks.length) * 100) || mission.progress;

    return (
      <div className="panel-enter" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Hero banner */}
        <div style={{ position: "relative", height: 130, flexShrink: 0, overflow: "hidden" }}>
          <img src={mission.image} alt={mission.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(15,10,46,0.82))" }} />
          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white", marginBottom: 1 }}>{mission.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>{mission.subtitle}</div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${prog}%`, background: "linear-gradient(90deg, #A78BFA, #8B5CF6)", borderRadius: 2, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{prog}% 完成</span>
            </div>
          </div>
        </div>

        {/* AI note */}
        {mission.aiSummary && (
          <div style={{ margin: "10px 12px 0", background: "linear-gradient(135deg, rgba(98,70,234,0.07), rgba(139,92,246,0.04))", border: "1px solid rgba(98,70,234,0.14)", borderRadius: 10, padding: "8px 12px", display: "flex", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "#6246EA", flexShrink: 0 }}>✦</span>
            <p style={{ fontSize: 12, color: "#6246EA", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{mission.aiSummary}</p>
          </div>
        )}

        {/* Task list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }} className="scrollbar-hide">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {mission.tasks.map((task: Task) => {
              const status = (taskStates[task.id] || task.status) as Task["status"];
              const sc = statusConfig[status] || statusConfig.pending;
              const detail = task.id === "transport" && transportTime && view === "mission"
                ? `yoxi ${transportTime} Pickup`
                : task.detail;
              const isExpanded = expandedTaskId === task.id;
              const recs = TASK_RECS[task.id] ?? [];
              return (
                <div key={task.id} className="msg-enter" style={{ background: "white", borderRadius: 12, border: isExpanded ? "1.5px solid rgba(98,70,234,0.25)" : "1px solid #F3F4F6", overflow: "hidden", transition: "border-color 0.2s" }}>
                  {/* Task header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${task.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{task.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: sc.color, background: sc.bg, padding: "2px 7px", borderRadius: 20 }}>{sc.label}</span>
                      <button
                        onClick={() => handleTaskAction(task.id)}
                        style={{ fontSize: 11, color: isExpanded ? "#8B5CF6" : "#6246EA", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", padding: 0 }}
                      >
                        {isExpanded ? "收起 ↑" : task.action}
                      </button>
                    </div>
                  </div>

                  {/* Recommendation drawer */}
                  {isExpanded && (recs.length > 0 || task.id === "diagnose" || task.id === "cake" || task.id === "notify" || (task.id === "checklist" && view === "moving") || (task.id === "schedule" && view === "fitness") || (task.id === "nutrition" && view === "fitness")) && (
                    <div style={{ borderTop: "1px solid #F3F4F6", background: "#FAFBFF", padding: "8px 10px 10px" }}>

                      {/* Cake size picker — cake task only */}
                      {task.id === "cake" && (() => {
                        const SIZES = ["4吋", "6吋", "8吋", "10吋"];
                        const CAKE_RECS: Record<string, TaskRec[]> = {
                          "4吋": [
                            { id: "cake-straw-4", icon: "🍓", name: "草莓奶油蛋糕 4吋", detail: "1~2 人份 · 7-ELEVEN", price: 480 },
                            { id: "cake-choc-4",  icon: "🍫", name: "巧克力蛋糕 4吋",   detail: "1~2 人份 · 全家",   price: 420 },
                            { id: "cake-matcha-4",icon: "🍵", name: "抹茶蛋糕 4吋",     detail: "1~2 人份 · 萊爾富", price: 450 },
                          ],
                          "6吋": [
                            { id: "cake-straw-6", icon: "🍓", name: "草莓奶油蛋糕 6吋", detail: "4~6 人份 · 7-ELEVEN", price: 780 },
                            { id: "cake-choc-6",  icon: "🍫", name: "巧克力生日蛋糕 6吋",detail: "4~6 人份 · 全家",   price: 650 },
                            { id: "cake-custom-6",icon: "🎨", name: "客製化蛋糕 6吋",   detail: "3天前預訂",        price: 1200 },
                          ],
                          "8吋": [
                            { id: "cake-straw-8", icon: "🍓", name: "草莓奶油蛋糕 8吋", detail: "8~10 人份 · 門市預購", price: 1080 },
                            { id: "cake-choc-8",  icon: "🍫", name: "巧克力蛋糕 8吋",   detail: "8~10 人份 · 全家",  price: 950 },
                            { id: "cake-custom-8",icon: "🎨", name: "客製化蛋糕 8吋",   detail: "3天前預訂",         price: 1680 },
                          ],
                          "10吋": [
                            { id: "cake-straw-10",icon: "🍓", name: "草莓奶油蛋糕 10吋",detail: "12~15 人份 · 預訂", price: 1580 },
                            { id: "cake-choc-10", icon: "🍫", name: "巧克力蛋糕 10吋",  detail: "12~15 人份 · 預訂", price: 1380 },
                            { id: "cake-custom-10",icon:"🎨", name: "客製化蛋糕 10吋",  detail: "3天前預訂",         price: 2200 },
                          ],
                        };
                        const sizeRecs = cakeSize ? CAKE_RECS[cakeSize] ?? [] : [];
                        return (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>🎂 選擇吋數</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                              {SIZES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setCakeSize(s)}
                                  style={{
                                    padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
                                    borderColor: cakeSize === s ? "#6246EA" : "#E5E7EB",
                                    background: cakeSize === s ? "#EDE9FF" : "white",
                                    color: cakeSize === s ? "#6246EA" : "#6B7280",
                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "var(--font-display)", transition: "all 0.15s",
                                  }}
                                >{s}</button>
                              ))}
                            </div>
                            {sizeRecs.length > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {sizeRecs.map((rec) => {
                                  const inCart = addedProducts.includes(rec.id);
                                  return (
                                    <div key={rec.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "8px 10px", border: "1px solid #F3F4F6" }}>
                                      <span style={{ fontSize: 18, flexShrink: 0 }}>{rec.icon}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{rec.name}</div>
                                        <div style={{ fontSize: 10, color: "#9CA3AF" }}>{rec.detail}</div>
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>NT${rec.price}</span>
                                        <button
                                          onClick={() => {
                                            if (inCart) return;
                                            onProductAdd({ id: rec.id, name: rec.name, detail: rec.detail, price: rec.price, qty: 1, icon: rec.icon });
                                          }}
                                          style={{
                                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, border: "none",
                                            cursor: inCart ? "default" : "pointer",
                                            background: inCart ? "#DCFCE7" : "#6246EA",
                                            color: inCart ? "#16A34A" : "white",
                                            fontFamily: "var(--font-display)", whiteSpace: "nowrap",
                                          }}
                                        >{inCart ? "✓ 已加入" : "+ 加入"}</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!cakeSize && (
                              <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", padding: "6px 0" }}>請先選擇吋數查看推薦 ↑</div>
                            )}

                          </div>
                        );
                      })()}

                      {/* Checklist input — moving checklist only */}
                      {task.id === "checklist" && view === "moving" && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>📋 搬家項目清單</div>
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            <input
                              value={checklistInput}
                              onChange={(e) => setChecklistInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && checklistInput.trim()) {
                                  setChecklistItems((prev) => [...prev, checklistInput.trim()]);
                                  setChecklistInput("");
                                }
                              }}
                              placeholder="輸入項目名稱..."
                              style={{
                                flex: 1, padding: "8px 12px", borderRadius: 10,
                                border: "1.5px solid #E5E7EB", fontSize: 13, color: "#0F0A2E",
                                fontFamily: "var(--font-body)", outline: "none", background: "white",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#6246EA")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                            />
                            <button
                              onClick={() => {
                                if (!checklistInput.trim()) return;
                                setChecklistItems((prev) => [...prev, checklistInput.trim()]);
                                setChecklistInput("");
                              }}
                              style={{
                                width: 36, height: 36, borderRadius: 10, border: "none", flexShrink: 0,
                                background: checklistInput.trim() ? "#6246EA" : "#E5E7EB",
                                color: "white", fontSize: 20, cursor: checklistInput.trim() ? "pointer" : "default",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.15s",
                              }}
                            >＋</button>
                          </div>
                          {checklistItems.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {checklistItems.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 9, padding: "7px 10px", border: "1px solid #F3F4F6" }}>
                                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid #D1D5DB", flexShrink: 0 }} />
                                  <span style={{ flex: 1, fontSize: 13, color: "#0F0A2E", fontFamily: "var(--font-body)" }}>{item}</span>
                                  <button
                                    onClick={() => setChecklistItems((prev) => prev.filter((_, idx) => idx !== i))}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 0, lineHeight: 1 }}
                                  >✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                          {checklistItems.length === 0 && (
                            <div style={{ fontSize: 11, color: "#C4B5FD", textAlign: "center", padding: "6px 0" }}>還沒有項目，輸入後按 ＋ 加入</div>
                          )}
                        </div>
                      )}

                      {/* Address input — notify task only */}
                      {task.id === "notify" && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>📮 輸入新地址</div>
                          <input
                            value={newAddress}
                            onChange={(e) => { setNewAddress(e.target.value); setAddressSaved(false); }}
                            placeholder="例：台北市信義區松仁路100號"
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: "1.5px solid #E5E7EB", fontSize: 13, color: "#0F0A2E",
                              fontFamily: "var(--font-body)", outline: "none", background: "white",
                              boxSizing: "border-box",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#6246EA")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                          />
                          <button
                            onClick={() => { if (newAddress.trim()) setAddressSaved(true); }}
                            disabled={!newAddress.trim()}
                            style={{
                              marginTop: 8, width: "100%", padding: "9px", borderRadius: 10, border: "none",
                              background: newAddress.trim() ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB",
                              color: newAddress.trim() ? "white" : "#9CA3AF",
                              fontSize: 13, fontWeight: 700, cursor: newAddress.trim() ? "pointer" : "default",
                              fontFamily: "var(--font-display)", transition: "all 0.2s",
                            }}
                          >
                            {addressSaved ? "✓ 已儲存，AI 將自動通知各單位" : "確認地址，自動寄送通知"}
                          </button>
                          {addressSaved && (
                            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                              {["銀行帳戶", "健保署", "公司人資", "保險公司"].map((unit) => (
                                <div key={unit} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#16A34A", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                                  <span>✓</span><span>{unit} — 通知已寄送</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Photo upload — diagnose task only */}
                      {task.id === "diagnose" && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>📷 問題照片</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {uploadedPhotos.map((src, i) => (
                              <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                                <img src={src} alt={`photo-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button
                                  onClick={() => setUploadedPhotos((p) => p.filter((_, idx) => idx !== i))}
                                  style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", color: "white", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                                >✕</button>
                              </div>
                            ))}
                            <button
                              onClick={() => photoInputRef.current?.click()}
                              style={{ width: 64, height: 64, borderRadius: 8, border: "1.5px dashed #C4B5FD", background: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: "#8B5CF6", flexShrink: 0 }}
                            >
                              <span style={{ fontSize: 18 }}>＋</span>
                              <span style={{ fontSize: 9, fontWeight: 600, fontFamily: "var(--font-display)" }}>上傳</span>
                            </button>
                            <input
                              ref={photoInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                files.forEach((file) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setUploadedPhotos((prev) => [...prev, ev.target!.result as string]);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                                e.target.value = "";
                              }}
                            />
                          </div>
                          {uploadedPhotos.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, background: "#EDE9FF", borderRadius: 8, padding: "5px 8px" }}>
                              <span style={{ fontSize: 10 }}>✦</span>
                              <span style={{ fontSize: 10, color: "#6246EA", fontWeight: 600, fontFamily: "var(--font-display)" }}>AI 已收到 {uploadedPhotos.length} 張照片，正在分析問題...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nutrition plan — nutrition task in fitness view */}
                      {task.id === "nutrition" && view === "fitness" && (() => {
                        const kcal = parseInt(calorieGoal) || 0;
                        const protein = Math.round(kcal * 0.30 / 4);
                        const carbs   = Math.round(kcal * 0.40 / 4);
                        const fat     = Math.round(kcal * 0.30 / 9);
                        interface FoodRec { icon: string; name: string; detail: string; kcal: number; tag: string }
                        const FOOD_RECS: FoodRec[] = kcal <= 0 ? [] : kcal < 1800
                          ? [
                              { icon: "🥚", name: "水煮蛋 × 2", detail: "高蛋白低脂 · 156 kcal", kcal: 156, tag: "蛋白質" },
                              { icon: "🍗", name: "雞胸肉 100g", detail: "低脂瘦肉 · 165 kcal", kcal: 165, tag: "蛋白質" },
                              { icon: "🥗", name: "生菜沙拉", detail: "纖維豐富 · 80 kcal", kcal: 80, tag: "蔬菜" },
                              { icon: "🍎", name: "蘋果 1顆", detail: "低GI · 95 kcal", kcal: 95, tag: "水果" },
                            ]
                          : kcal < 2400
                          ? [
                              { icon: "🍗", name: "雞胸肉 150g", detail: "高蛋白 · 247 kcal", kcal: 247, tag: "蛋白質" },
                              { icon: "🍚", name: "糙米飯 150g", detail: "複合碳水 · 165 kcal", kcal: 165, tag: "碳水" },
                              { icon: "🥑", name: "酪梨半顆", detail: "健康脂肪 · 120 kcal", kcal: 120, tag: "好油" },
                              { icon: "🥛", name: "無糖豆漿 300ml", detail: "植物蛋白 · 108 kcal", kcal: 108, tag: "蛋白質" },
                              { icon: "🫐", name: "藍莓 100g", detail: "抗氧化 · 57 kcal", kcal: 57, tag: "水果" },
                            ]
                          : [
                              { icon: "🥩", name: "牛排 200g", detail: "肌酸 + 鐵質 · 420 kcal", kcal: 420, tag: "蛋白質" },
                              { icon: "🍠", name: "地瓜 200g", detail: "優質碳水 · 180 kcal", kcal: 180, tag: "碳水" },
                              { icon: "🥚", name: "全蛋 × 3", detail: "完全蛋白 · 234 kcal", kcal: 234, tag: "蛋白質" },
                              { icon: "🌰", name: "綜合堅果 30g", detail: "健康脂肪 · 185 kcal", kcal: 185, tag: "好油" },
                              { icon: "🍌", name: "香蕉 1根", detail: "運動前補碳 · 105 kcal", kcal: 105, tag: "碳水" },
                              { icon: "🥛", name: "全脂牛奶 300ml", detail: "鈣質 + 蛋白 · 186 kcal", kcal: 186, tag: "蛋白質" },
                            ];
                        const TAG_COLORS: Record<string, string> = { 蛋白質: "#6246EA", 碳水: "#0EA5E9", 好油: "#F59E0B", 蔬菜: "#16A34A", 水果: "#EC4899" };
                        return (
                          <div style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>🔥 每日目標攝取</div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                              <input
                                type="number"
                                value={calorieGoal}
                                onChange={(e) => { setCalorieGoal(e.target.value); setCalorieConfirmed(false); }}
                                placeholder="輸入卡路里..."
                                style={{
                                  flex: 1, padding: "9px 12px", borderRadius: 10,
                                  border: "1.5px solid #E5E7EB", fontSize: 13, color: "#0F0A2E",
                                  fontFamily: "var(--font-display)", fontWeight: 700, outline: "none", background: "white",
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#6246EA")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                              />
                              <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "var(--font-display)", flexShrink: 0 }}>kcal</span>
                              <button
                                onClick={() => { if (parseInt(calorieGoal) > 0) setCalorieConfirmed(true); }}
                                style={{
                                  padding: "9px 14px", borderRadius: 10, border: "none", flexShrink: 0,
                                  background: parseInt(calorieGoal) > 0 ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB",
                                  color: parseInt(calorieGoal) > 0 ? "white" : "#9CA3AF",
                                  fontSize: 12, fontWeight: 700, cursor: parseInt(calorieGoal) > 0 ? "pointer" : "default",
                                  fontFamily: "var(--font-display)", transition: "all 0.15s",
                                }}
                              >確認</button>
                            </div>
                            {calorieConfirmed && kcal > 0 && (
                              <>
                                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                                  {[["蛋白質", `${protein}g`, "#6246EA"], ["碳水", `${carbs}g`, "#0EA5E9"], ["脂肪", `${fat}g`, "#F59E0B"]].map(([label, val, color]) => (
                                    <div key={label} style={{ flex: 1, background: "white", borderRadius: 9, padding: "7px 8px", border: "1px solid #F3F4F6", textAlign: "center" }}>
                                      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>{val}</div>
                                      <div style={{ fontSize: 9, color: "#9CA3AF", fontFamily: "var(--font-display)", marginTop: 1 }}>{label}</div>
                                    </div>
                                  ))}
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 6, fontFamily: "var(--font-display)" }}>✦ AI 推薦食物</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                  {FOOD_RECS.map((food) => (
                                    <div key={food.name} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "8px 10px", border: "1px solid #F3F4F6" }}>
                                      <span style={{ fontSize: 18, flexShrink: 0 }}>{food.icon}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{food.name}</div>
                                        <div style={{ fontSize: 10, color: "#9CA3AF" }}>{food.detail}</div>
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: TAG_COLORS[food.tag] + "20", color: TAG_COLORS[food.tag], fontFamily: "var(--font-display)" }}>{food.tag}</span>
                                        <span style={{ fontSize: 10, color: "#6B7280", fontFamily: "var(--font-display)" }}>{food.kcal} kcal</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            {!calorieConfirmed && (
                              <div style={{ fontSize: 11, color: "#C4B5FD", textAlign: "center", padding: "4px 0", fontFamily: "var(--font-display)" }}>輸入卡路里後 AI 將推薦適合食物</div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Workout schedule — schedule task in fitness view */}
                      {task.id === "schedule" && view === "fitness" && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.6px", marginBottom: 8, fontFamily: "var(--font-display)" }}>📅 本週訓練課表</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {DAYS.map((day) => (
                              <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "8px 10px", border: "1px solid #F3F4F6" }}>
                                <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: workoutSchedule[day] === "休息" ? "#9CA3AF" : "#6246EA", fontFamily: "var(--font-display)", flexShrink: 0 }}>{day.replace("星期", "週")}</div>
                                <select
                                  value={workoutSchedule[day]}
                                  onChange={(e) => setWorkoutSchedule((prev) => ({ ...prev, [day]: e.target.value }))}
                                  style={{
                                    flex: 1, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #E5E7EB",
                                    fontSize: 12, color: workoutSchedule[day] === "休息" ? "#9CA3AF" : "#0F0A2E",
                                    fontFamily: "var(--font-display)", fontWeight: 600, background: "white",
                                    outline: "none", cursor: "pointer", appearance: "none",
                                  }}
                                >
                                  {MUSCLE_GROUPS.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>
                                  {workoutSchedule[day] === "休息" ? "😴" : workoutSchedule[day] === "胸肌" ? "💪" : workoutSchedule[day] === "背部" ? "🏋️" : workoutSchedule[day] === "腿部" ? "🦵" : workoutSchedule[day] === "肩膀" ? "🏊" : workoutSchedule[day] === "手臂" ? "💪" : workoutSchedule[day] === "核心" ? "🔥" : "⚡"}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 8, padding: "6px 10px", background: "#EDE9FF", borderRadius: 8, fontSize: 10, color: "#6246EA", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                            ✦ 本週訓練 {Object.values(workoutSchedule).filter((v) => v !== "休息").length} 天，休息 {Object.values(workoutSchedule).filter((v) => v === "休息").length} 天
                          </div>
                        </div>
                      )}

                      {/* Generic recs — tasks with TASK_RECS entries and no special UI */}
                      {recs.length > 0 && task.id !== "cake" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {recs.map((rec) => {
                            const inCart = addedProducts.includes(rec.id);
                            return (
                              <div key={rec.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 10, padding: "8px 10px", border: "1px solid #F3F4F6" }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{rec.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{rec.name}</div>
                                  <div style={{ fontSize: 10, color: "#9CA3AF" }}>{rec.detail}</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                  {rec.price > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>NT${rec.price}</span>}
                                  <button
                                    onClick={() => {
                                      if (inCart) return;
                                      onProductAdd({ id: rec.id, name: rec.name, detail: rec.detail, price: rec.price, qty: 1, icon: rec.icon });
                                    }}
                                    style={{
                                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, border: "none",
                                      cursor: inCart ? "default" : "pointer",
                                      background: inCart ? "#DCFCE7" : "#6246EA",
                                      color: inCart ? "#16A34A" : "white",
                                      fontFamily: "var(--font-display)", whiteSpace: "nowrap", transition: "all 0.15s",
                                    }}
                                  >{inCart ? "✓ 已加入" : rec.price === 0 ? "免費申請" : "+ 加入"}</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── PROFILE ── */
  if (view === "profile") {
    const tags = ["#TimeSaver", "#FrequentPickup", "#Traveler", "#CoffeeLover"];
    return (
      <div className="panel-enter" style={{ height: "100%", overflowY: "auto" }}>
        <div style={{ position: "relative", height: 130, overflow: "hidden" }}>
          <img src={UNSPLASH.professional} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(98,70,234,0.75), rgba(139,92,246,0.6))" }} />
          <div style={{ position: "absolute", bottom: 14, left: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "white" }}>JL</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "white" }}>Jamie</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Busy Professional</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "var(--font-display)" }}>DYNAMIC TAGS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((t) => <span key={t} style={{ padding: "4px 10px", borderRadius: 20, background: "#EDE9FF", color: "#6246EA", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)" }}>{t}</span>)}
            </div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 14, border: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "var(--font-display)" }}>偏好設定</div>
            {[["⚡", "優先順序", "速度優先"], ["📦", "取貨方式", "門市取貨"], ["🔔", "通知", "重要才通知"]].map(([icon, label, value]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>{icon} {label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── MISSIONS ── */
  if (view === "missions") {
    const missionData = [
      { icon: "💼", title: "東京商務出差", sub: "進行中 · 65%", prog: 65, color: "#6246EA", img: UNSPLASH.tokyo },
      { icon: "🔧", title: "居家修繕", sub: "進行中 · 40%", prog: 40, color: "#EA580C", img: UNSPLASH.homeRepair },
      { icon: "🎂", title: "朋友生日準備", sub: "已完成", prog: 100, color: "#DB2777", img: UNSPLASH.birthdayCake },
    ];
    return (
      <div className="panel-enter" style={{ height: "100%", overflowY: "auto", padding: 18 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#0F0A2E", margin: 0, marginBottom: 12 }}>我的任務</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {missionData.map((m) => (
            <div key={m.title} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB", background: "white" }}>
              <div style={{ position: "relative", height: 68 }}>
                <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white", fontFamily: "var(--font-display)" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{m.sub}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "6px 14px 8px" }}>
                <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.prog}%`, background: m.color, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── PACKS ── */
  if (view === "packs") {
    return (
      <div className="panel-enter" style={{ height: "100%", overflowY: "auto", padding: 18 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#0F0A2E", margin: 0, marginBottom: 12 }}>情境包</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scenarioPacks.map((p) => (
            <div key={p.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB", cursor: "pointer" }}>
              <div style={{ position: "relative", height: 80 }}>
                <img src={(p as any).image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${p.color}CC, ${p.color}55)`, display: "flex", alignItems: "center", padding: "0 14px", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "white" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{p.description}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{p.modules.length} 個工具模組</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── SHOPPING (context-aware) ── */
  const shopProducts = SHOP_PRODUCTS[view];
  if (shopProducts) {
    const headerImg = view === "home-repair-shop" ? UNSPLASH.homeRepair : view === "pet-shop" ? UNSPLASH.petCare : UNSPLASH.convenienceStore;
    const headerTitle = view === "home-repair-shop" ? "修繕材料" : view === "pet-shop" ? "寵物用品" : "推薦商品";
    return (
      <div className="panel-enter" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ position: "relative", height: 90, flexShrink: 0, overflow: "hidden" }}>
          <img src={headerImg} alt={headerTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,10,46,0.65)", padding: "0 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white" }}>{headerTitle}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>根據你的任務需求推薦</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }} className="scrollbar-hide">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shopProducts.map((p: any) => {
              const added = addedProducts.includes(p.id);
              return (
                <div key={p.id} style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: 76, flexShrink: 0, overflow: "hidden", background: "#F3F4F6" }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div style={{ flex: 1, padding: "10px 10px 10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{p.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#6246EA", background: "#EDE9FF", padding: "1px 5px", borderRadius: 20 }}>{p.tag}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>{p.detail}</div>
                        <div style={{ fontSize: 10, color: "#6246EA", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}><span>✦</span>{p.reason}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0F0A2E", fontFamily: "var(--font-display)", marginBottom: 4 }}>NT${p.price}</div>
                        <button
                          onClick={() => addProduct(p)}
                          style={{ padding: "4px 12px", borderRadius: 20, border: added ? "1.5px solid #16A34A" : "none", background: added ? "white" : "#6246EA", color: added ? "#16A34A" : "white", fontSize: 11, fontWeight: 600, cursor: added ? "default" : "pointer", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}
                        >
                          {added ? "✓ 加入" : "加入"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {cartItems.length > 0 && (
          <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6", flexShrink: 0 }}>
            <button onClick={() => onCartUpdate(cartItems)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              查看購物車 · {cartItems.length} 件
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── CART ── */
  if (view === "cart") {
    /* 空購物車 */
    if (cartItems.length === 0) {
      return (
        <div className="panel-enter" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>購物車</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 14 }}>
              🛒
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0F0A2E", marginBottom: 6 }}>
              購物車是空的
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
              跟 UNI AI 說說你想準備什麼，<br />推薦的商品會出現在這裡。
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="panel-enter" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>購物車</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }} className="scrollbar-hide">
          {cartItems.map((item) => (
            <div key={item.id} style={{ background: "white", borderRadius: 12, padding: "10px 12px", marginBottom: 8, border: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{item.detail}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0A2E", fontFamily: "var(--font-display)", flexShrink: 0 }}>NT${item.price}</div>
              <button onClick={() => onCartUpdate(cartItems.filter((i) => i.id !== item.id))} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>
          ))}
          <div style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid #F3F4F6" }}>
            {[
              { icon: "⭐", label: "OPENPOINT 折抵", sub: "240點 → NT$120", val: 120, state: useOpenPoint, toggle: () => setUseOpenPoint((v) => !v) },
              { icon: "🎟", label: "出差優惠券", sub: "滿千折60", val: 60, state: useCoupon, toggle: () => setUseCoupon((v) => !v) },
            ].map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F8F9FC" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>{d.label}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>{d.sub}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>-NT${d.val}</span>
                  <div onClick={d.toggle} style={{ width: 36, height: 20, borderRadius: 10, background: d.state ? "#6246EA" : "#D1D5DB", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: d.state ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E" }}>合計</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#6246EA" }}>NT${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #F3F4F6", flexShrink: 0 }}>
          <button onClick={() => setConfirmingCheckout(true)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(98,70,234,0.35)" }}>
            確認結帳 · NT${total.toLocaleString()}
          </button>
        </div>
        {confirmingCheckout && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,10,46,0.5)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
            <div className="slide-up" style={{ background: "white", borderRadius: "18px 18px 0 0", padding: "22px 22px 36px", width: "100%" }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: "#D1D5DB", margin: "0 auto 18px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, textAlign: "center", margin: 0, marginBottom: 6 }}>確認結帳</h3>
              <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginBottom: 18 }}>共 {cartItems.length} 件 · NT${total.toLocaleString()}</p>
              <button onClick={() => { setConfirmingCheckout(false); onCheckout(); }} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10 }}>確認付款</button>
              <button onClick={() => setConfirmingCheckout(false)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>取消</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── COMPLETE ── */
  if (view === "complete" || view === "birthday-complete") {
    const isBirthday = view === "birthday-complete";
    const completed = isBirthday
      ? ["生日蛋糕", "精品禮物組", "交通安排", "出發提醒"]
      : ["出差 Checklist", "日本 eSIM", "yoxi 機場接送", "必備用品採買", "門市取貨", "Reminder"];
    const heroImg = isBirthday ? UNSPLASH.birthdayCake : UNSPLASH.tokyo;
    return (
      <div className="panel-enter" style={{ height: "100%", overflowY: "auto" }}>
        <div style={{ position: "relative", height: 130, overflow: "hidden" }}>
          <img src={heroImg} alt="Complete" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,10,46,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <div className="bounce-in" style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #16A34A, #22C55E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(22,163,74,0.4)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white" }}>
              {isBirthday ? "生日準備完成！🎂" : "出差準備完成！"}
            </div>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", marginBottom: 10, fontFamily: "var(--font-display)" }}>已完成</div>
            {completed.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: "#16A34A" }}>✓</span>
                </div>
                <span style={{ fontSize: 13, color: "#0F0A2E" }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.07), rgba(139,92,246,0.04))", border: "1px solid rgba(98,70,234,0.14)", borderRadius: 12, padding: 14 }}>
            <p style={{ fontSize: 13, color: "#0F0A2E", margin: 0, marginBottom: 12, fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {isBirthday ? "要儲存成「生日慶祝包」嗎？" : "要儲存成你的預設商務出差包嗎？"}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onSaveComplete} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#6246EA", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>儲存</button>
              <button onClick={onDismissComplete} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", color: "#6B7280", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>不用</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
