import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, ContextView, CartItem } from "../types";
import { recommendations, UNSPLASH } from "../data";

interface ChatPanelProps {
  onContextChange: (view: ContextView) => void;
  onTransportUpdate: (time: string) => void;
  onProductAdd: (item: CartItem) => void;
  onPanelToggle: () => void;
  onMenuOpen: () => void;
  cartItems: CartItem[];
  contextView: ContextView;
  panelOpen: boolean;
  isMobile: boolean;
  onAgentMission?: (mission: any) => void;
}

/**
 * Agent API 位址。
 * 本機不用設，預設打 Express 的 localhost:3000。
 * 要改打部署好的 Lambda：在 frontend/.env.local 設 VITE_AGENT_URL 為完整 URL
 * （API Gateway 的路徑沒有 /api/chat/agent 這段，所以要整條換掉）。
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? `${API_BASE}/api/chat/agent`;

/**
 * Demo 使用者 ID。
 * DynamoDB UserProfile 目前只有 usr_jamie_888 / usr_alex_666，
 * 用 u1 會查不到 profile（AI 拿不到偏好標籤）。
 * 要讓個人化生效就設 VITE_USER_ID=usr_jamie_888。
 */
const USER_ID = import.meta.env.VITE_USER_ID ?? "u1";

let msgCounter = 1;
const mkId = () => `msg-${++msgCounter}-${Date.now()}`;

/* Planning animation step */
interface PlanStep {
  text: string;
  delay: number;
  pending?: boolean;
}

/* Service tray item config */
interface ServiceTrayItem {
  id: string;
  icon: string;
  label: string;
  view: ContextView;
  progress?: number;
  badge?: string;
  color: string;
}

/* Scenario card → natural language prompt sent to the AI */
const SCENARIO_PROMPTS: Record<string, string> = {
  "business-trip": "我想規劃一趟商務出差",
  "home-repair": "我家需要修繕",
  "birthday": "我要幫朋友準備生日",
  "pet-care": "我的寵物需要照護",
  "moving": "我要搬家",
  "fitness": "我想開始健身",
};

const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "w1",
    role: "ai",
    type: "text",
    text: "Hi Jamie 👋 我是 UNI AI，你的一站式智慧管家。\n\n告訴我你想做什麼，我來搞定。",
    ts: Date.now(),
  },
  {
    id: "w2",
    role: "ai",
    type: "service-grid",
    ts: Date.now() + 1,
  },
];

/** 依任務標題挑選合適的封面圖 */
function pickMissionImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("出差") || t.includes("商務")) return UNSPLASH.tokyo;
  if (t.includes("生日") || t.includes("蛋糕")) return UNSPLASH.birthdayCake;
  if (t.includes("修繕") || t.includes("水電") || t.includes("漏水")) return UNSPLASH.homeRepair;
  if (t.includes("寵物") || t.includes("看診")) return UNSPLASH.petCare;
  if (t.includes("搬家") || t.includes("打包")) return UNSPLASH.moving;
  if (t.includes("健身") || t.includes("運動")) return UNSPLASH.fitness;
  if (t.includes("旅") || t.includes("玩") || t.includes("行程")) return UNSPLASH.tokyoStreet;
  return UNSPLASH.tokyoAerial;
}

/** 解析 AI 回覆中的 [選項: A | B | C] 標記 */
function parseReply(reply: string): { text: string; quickReplies?: string[] } {
  const optionMatch = reply.match(/\[選項[:：]\s*(.+?)\]\s*$/s);
  if (!optionMatch) return { text: reply.trim() };

  const cleanText = reply.replace(/\[選項[:：]\s*(.+?)\]\s*$/s, "").trim();
  const options = optionMatch[1]
    .split("|")
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    text: cleanText,
    quickReplies: options.length > 0 ? options : undefined,
  };
}

export default function ChatPanel({
  onContextChange, onPanelToggle, onMenuOpen,
  cartItems, contextView, panelOpen, isMobile, onAgentMission,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [planningActive, setPlanningActive] = useState(false);
  const [planningProgress, setPlanningProgress] = useState(0);
  const [planningStepsVisible, setPlanningStepsVisible] = useState<number[]>([]);
  const [currentPlanningSteps, setCurrentPlanningSteps] = useState<PlanStep[]>([]);
  const [currentPlanningTitle, setCurrentPlanningTitle] = useState("");
  const agentHistory = useRef<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, planningActive]);

  /* Derive tray items from current state */
  const trayItems: ServiceTrayItem[] = [];
  if (contextView === "agent-mission") {
    trayItems.push({ id: "agent-mission", icon: "📋", label: "AI 計畫", view: "agent-mission", progress: 10, color: "#6246EA" });
  }
  if (cartItems.length > 0) {
    trayItems.push({ id: "cart", icon: "🛒", label: "購物車", view: "cart", badge: String(cartItems.length), color: "#EA580C" });
  }
  if (contextView === "shopping") {
    trayItems.push({ id: "shopping", icon: "🛍", label: "推薦商品", view: "shopping", color: "#0EA5E9" });
  }

  const appendMessage = useCallback((msg: Omit<ChatMessage, "id" | "ts">) => {
    setMessages((prev) => [...prev, { ...msg, id: mkId(), ts: Date.now() }]);
  }, []);

  const runPlanning = useCallback((steps: PlanStep[], title: string, onDone: () => void) => {
    if (steps.length === 0) {
      onDone();
      return;
    }
    setPlanningActive(true);
    setCurrentPlanningSteps(steps);
    setCurrentPlanningTitle(title);
    setPlanningStepsVisible([]);
    setPlanningProgress(0);
    steps.forEach((s, i) => {
      setTimeout(() => {
        setPlanningStepsVisible((prev) => [...prev, i]);
        setPlanningProgress(Math.min(((i + 1) / steps.length) * 100, 92));
      }, s.delay);
    });
    const totalTime = steps[steps.length - 1].delay + 1000;
    setTimeout(() => {
      setPlanningProgress(100);
      setPlanningActive(false);
      onDone();
    }, totalTime);
  }, []);

  /* 所有輸入一律交給 AI Agent 處理 */
  const callAgent = useCallback((text: string) => {
    setIsTyping(true);

    fetch(AGENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // agent: true 讓沒有 /agent 路徑的 Lambda（API Gateway 單一路徑 / Function URL）也能判斷；
      // Express 版會忽略這個欄位。
      body: JSON.stringify({
        agent: true,
        userId: USER_ID,
        message: text,
        history: agentHistory.current,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsTyping(false);

        if (data.error) {
          appendMessage({ role: "ai", type: "text", text: `${data.error}${data.detail ? `\n\n${data.detail}` : ""}` });
          return;
        }

        // 保存對話歷史，下一輪帶回後端維持上下文
        if (data.history) {
          agentHistory.current = data.history;
        }

        const parsed = data.reply ? parseReply(data.reply) : { text: "" };
        const toolLabels: string[] = data.toolCalls ?? [];

        const showReply = () => {
          if (!parsed.text) return;
          appendMessage({
            role: "ai",
            type: "text",
            text: parsed.text,
            quickReplies: parsed.quickReplies,
          });
        };

        // 沒有呼叫任何工具 → 直接顯示回覆
        if (toolLabels.length === 0) {
          showReply();
          return;
        }

        // 有工具呼叫 → 先跑分析動畫
        const stepGap = data.mission ? 600 : 500;
        const agentSteps: PlanStep[] = [
          { text: "理解你的需求", delay: 0 },
          ...toolLabels.map((label, i) => ({ text: label, delay: (i + 1) * stepGap })),
          {
            text: data.mission ? "整合方案中..." : "整理結果中...",
            delay: (toolLabels.length + 1) * stepGap,
            pending: true,
          },
        ];
        const planningTitle = data.mission ? "AI 正在規劃中..." : "AI 正在查詢中...";

        runPlanning(agentSteps, planningTitle, () => {
          // 建立了行程包 → 顯示任務卡片
          if (data.mission) {
            const missionData = {
              id: `agent-${Date.now()}`,
              title: data.mission.title,
              subtitle: data.mission.subtitle,
              progress: data.mission.progress ?? 0,
              image: pickMissionImage(data.mission.title),
              aiSummary: parsed.text,
              tasks: (data.mission.tasks ?? []).map((t: any) => ({
                ...t,
                action: "查看",
                color: "#6246EA",
              })),
            };

            appendMessage({
              role: "ai",
              type: "agent-mission-created",
              text: `已幫你建立「${data.mission.title}」計畫 📋`,
              data: missionData,
            });
            onContextChange("agent-mission");
            onAgentMission?.(missionData);

            setTimeout(showReply, 500);
            return;
          }

          showReply();
        });
      })
      .catch((err) => {
        setIsTyping(false);
        console.error("Agent API 錯誤:", err);
        appendMessage({ role: "ai", type: "text", text: "連線失敗，請確認後端服務是否已啟動。" });
      });
  }, [appendMessage, onContextChange, onAgentMission, runPlanning]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    appendMessage({ role: "user", type: "text", text: msg });
    setTimeout(() => callAgent(msg), 250);
  }, [input, appendMessage, callAgent]);

  /* 情境卡片點選 → 送出對應的自然語言需求給 AI */
  const handleScenarioStart = useCallback((scenarioId: string) => {
    const prompt = SCENARIO_PROMPTS[scenarioId];
    if (!prompt) return;
    handleSend(prompt);
  }, [handleSend]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>

      {/* Top bar */}
      <div style={{ height: 56, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button onClick={onMenuOpen} style={{ width: 34, height: 34, borderRadius: 9, background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#0F0A2E" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          )}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>UNI AI</span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>· 一站式智慧管家</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["#TimeSaver", "#Traveler"].map((tag) => (
            <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: "#6246EA", background: "#EDE9FF", padding: "3px 9px", borderRadius: 20, fontFamily: "var(--font-display)" }}>{tag}</span>
          ))}
          {/* Panel toggle button */}
          {contextView !== "idle" && (
            <button
              onClick={onPanelToggle}
              style={{ marginLeft: 4, width: 34, height: 34, borderRadius: 9, border: "none", background: panelOpen ? "#EDE9FF" : "#F3F4F6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: panelOpen ? "#6246EA" : "#9CA3AF", transition: "all 0.15s", flexShrink: 0 }}
              title="開啟服務面板"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M15 3v18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 8px" }} className="scrollbar-hide">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onReply={handleSend}
            onScenarioStart={handleScenarioStart}
            onContextChange={onContextChange}
            onPanelToggle={onPanelToggle}
            isLast={idx === messages.length - 1}
          />
        ))}

        {/* Planning animation */}
        {planningActive && (
          <div className="msg-ai" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <AIAvatar />
              <div style={{ flex: 1, maxWidth: 520 }}>
                <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "16px 18px", border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div className="spin-slow" style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid #6246EA", borderTopColor: "transparent" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#6246EA" }}>{currentPlanningTitle}</span>
                  </div>
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ height: "100%", width: `${planningProgress}%`, background: "linear-gradient(90deg, #6246EA, #8B5CF6)", transition: "width 0.5s ease", borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentPlanningSteps.map((step, i) => {
                      const visible = planningStepsVisible.includes(i);
                      const isPending = step.pending && visible;
                      const isDone = visible && !step.pending;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: visible ? 1 : 0.2, transition: "opacity 0.4s ease" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: isDone ? "#6246EA" : "transparent", border: isPending ? "2px solid #6246EA" : isDone ? "none" : "2px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                            {isDone && <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: isDone ? 600 : 500, color: isPending ? "#6246EA" : isDone ? "#0F0A2E" : "#6B7280" }}>{step.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="msg-ai" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <AIAvatar />
              <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", gap: 4, alignItems: "center", border: "1px solid #E5E7EB" }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6246EA", animation: `typing 1.2s ease ${d * 0.18}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, alignItems: "center", flexShrink: 0, background: "white" }}>
        <div className="input-ring" style={{ flex: 1, display: "flex", alignItems: "center", background: "#F8F9FC", borderRadius: 24, border: "1.5px solid #E5E7EB", padding: "0 16px", transition: "all 0.15s" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="輸入你的需求或直接說話..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 14, fontFamily: "var(--font-body)", color: "#0F0A2E" }}
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: input.trim() ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Active services tray */}
      {trayItems.length > 0 && (
        <div style={{ padding: "8px 16px", borderTop: "1px solid #F8F9FC", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }} className="scrollbar-hide">
          <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, flexShrink: 0, alignSelf: "center", fontFamily: "var(--font-display)" }}>進行中</span>
          {trayItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onContextChange(item.view); onPanelToggle(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 8px", borderRadius: 20, background: `${item.color}12`, border: `1.5px solid ${item.color}30`, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: item.color, fontFamily: "var(--font-display)" }}>{item.label}</span>
              {item.badge && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: item.color, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{item.badge}</span>
              )}
              {item.progress !== undefined && (
                <div style={{ width: 32, height: 3, background: `${item.color}25`, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.progress}%`, background: item.color, borderRadius: 2 }} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

function AIAvatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "white", marginTop: 2 }}>✦</div>
  );
}

/* Service category grid — shown as welcome AI message */
function ServiceGrid({ onScenarioStart }: { onScenarioStart: (id: string) => void }) {
  const services = [
    { id: "business-trip", icon: "💼", label: "商務出差", img: UNSPLASH.tokyo, color: "#6246EA" },
    { id: "home-repair",   icon: "🔧", label: "居家修繕", img: UNSPLASH.homeRepair, color: "#EA580C" },
    { id: "birthday",      icon: "🎂", label: "朋友生日", img: UNSPLASH.birthdayCake, color: "#DB2777" },
    { id: "pet-care",      icon: "🐾", label: "寵物照護", img: UNSPLASH.petCare, color: "#16A34A" },
    { id: "moving",        icon: "📦", label: "搬家準備", img: UNSPLASH.moving, color: "#0EA5E9" },
    { id: "fitness",       icon: "💪", label: "健身計畫", img: UNSPLASH.fitness, color: "#7C3AED" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
      {services.map((s) => (
        <button
          key={s.id}
          onClick={() => onScenarioStart(s.id)}
          style={{ borderRadius: 12, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", position: "relative", height: 76, background: "#F3F4F6" }}
        >
          <img src={s.img} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${s.color}D0 0%, ${s.color}80 100%)`, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", padding: "8px 12px", gap: 1 }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "white" }}>{s.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ msg, onReply, onScenarioStart, onContextChange, onPanelToggle, isLast }: {
  msg: ChatMessage;
  onReply: (text: string) => void;
  onScenarioStart: (id: string) => void;
  onContextChange: (view: ContextView) => void;
  onPanelToggle: () => void;
  isLast: boolean;
}) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="msg-enter" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <div style={{ maxWidth: "72%", background: "linear-gradient(135deg, #6246EA, #7C3AED)", color: "white", padding: "11px 16px", borderRadius: "18px 18px 4px 18px", fontSize: 14, lineHeight: 1.5, fontFamily: "var(--font-body)", boxShadow: "0 4px 16px rgba(98,70,234,0.25)" }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-ai" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <AIAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Service grid (welcome) */}
        {msg.type === "service-grid" && (
          <ServiceGrid onScenarioStart={onScenarioStart} />
        )}

        {/* Text message */}
        {msg.type === "text" && msg.text && (
          <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", fontSize: 14, lineHeight: 1.6, color: "#0F0A2E", border: "1px solid #E5E7EB", marginBottom: msg.quickReplies ? 8 : 0, whiteSpace: "pre-line" }}>
            {msg.text}
          </div>
        )}

        {/* Mission created card (from AI agent) */}
        {msg.type === "agent-mission-created" && (
          <div>
            {msg.text && <div style={{ fontSize: 14, color: "#0F0A2E", marginBottom: 10, lineHeight: 1.5 }}>{msg.text}</div>}
            <div
              onClick={() => { onContextChange("agent-mission"); onPanelToggle(); }}
              style={{ background: "white", borderRadius: 16, border: "1.5px solid #6246EA", cursor: "pointer", overflow: "hidden", marginBottom: 8, transition: "box-shadow 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(98,70,234,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ position: "relative", height: 96, overflow: "hidden" }}>
                <img src={msg.data?.image} alt={msg.data?.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(15,10,46,0.7) 100%)", display: "flex", alignItems: "flex-end", padding: "10px 14px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white", flex: 1 }}>{msg.data?.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>查看詳情 →</div>
                </div>
              </div>
              <div style={{ padding: "10px 14px 12px" }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>{msg.data?.subtitle}</div>
                <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${msg.data?.progress ?? 0}%`, background: "linear-gradient(90deg, #6246EA, #8B5CF6)", borderRadius: 2 }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(msg.data?.tasks ?? []).slice(0, 4).map((t: any) => (
                    <span key={t.id} style={{ fontSize: 11, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 }}>{t.icon} {t.title}</span>
                  ))}
                  {(msg.data?.tasks?.length ?? 0) > 4 && <span style={{ fontSize: 11, color: "#9CA3AF", padding: "2px 6px" }}>+{msg.data.tasks.length - 4}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation cards */}
        {msg.type === "recommendation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            {(msg.data as typeof recommendations).map((rec) => (
              <div
                key={rec.id}
                onClick={() => { onReply(`選擇${rec.label}方案`); onContextChange("shopping"); onPanelToggle(); }}
                style={{ background: "white", borderRadius: 14, padding: "12px 14px", border: rec.isDefault ? `2px solid ${rec.tagColor}` : "1px solid #E5E7EB", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(98,70,234,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {rec.isDefault && <div style={{ position: "absolute", top: 0, right: 0, background: rec.tagColor, fontSize: 10, fontWeight: 700, color: "white", padding: "3px 10px", borderRadius: "0 12px 0 10px", fontFamily: "var(--font-display)" }}>推薦</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{rec.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E" }}>{rec.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{rec.desc}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>NT${rec.total.toLocaleString()}</div>
                    <span style={{ fontSize: 10, color: rec.tagColor, fontWeight: 600 }}>{rec.tag}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: rec.tagColor, display: "flex", alignItems: "center", gap: 4 }}><span>✦</span> {rec.reason}</div>
              </div>
            ))}
          </div>
        )}

        {/* Task update */}
        {msg.type === "task-update" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 12, padding: "10px 14px", marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{msg.data?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", fontFamily: "var(--font-display)" }}>✓ {msg.data?.change}</div>
              {msg.text && <div style={{ fontSize: 12, color: "#15803D", marginTop: 2 }}>{msg.text}</div>}
            </div>
          </div>
        )}

        {/* Products */}
        {msg.type === "products" && (
          <div style={{ background: "#F8F9FC", borderRadius: 14, padding: "12px 14px", border: "1px solid #E5E7EB", marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#0F0A2E", marginBottom: 8, lineHeight: 1.5 }}>{msg.text}</div>
            <div style={{ fontSize: 12, color: "#6246EA", display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}><span>✦</span> {msg.data?.reason}</div>
            <button onClick={() => { onContextChange("shopping"); onPanelToggle(); }} style={{ padding: "7px 16px", borderRadius: 20, border: "none", background: "#6246EA", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)" }}>
              查看推薦商品 →
            </button>
          </div>
        )}

        {/* Quick replies */}
        {msg.quickReplies && isLast && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {msg.quickReplies.map((r) => (
              <button
                key={r}
                onClick={() => onReply(r)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid #E5E7EB", background: "white", fontSize: 13, color: "#0F0A2E", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 500, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6246EA"; e.currentTarget.style.color = "#6246EA"; e.currentTarget.style.background = "#EDE9FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#0F0A2E"; e.currentTarget.style.background = "white"; }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
