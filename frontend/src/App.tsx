<<<<<<< HEAD
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function App() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!input.trim() || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          systemPrompt: systemPrompt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "請求失敗");

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <h1 className="mb-2 text-xl font-bold">Bedrock Chat 測試</h1>

      <input
        className="mb-3 rounded border px-3 py-2 text-sm"
        placeholder="System prompt（選填）"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
      />

      <div className="flex-1 space-y-3 overflow-y-auto rounded border p-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                (m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400">思考中…</div>}
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="輸入訊息…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={send}
          disabled={loading}
        >
          送出
        </button>
=======
import { useState, useCallback } from "react"; // v2
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import ScenarioPackDetail from "./screens/ScenarioPackDetail";
import ChatPanel from "./components/ChatPanel";
import ContextPanel from "./components/ContextPanel";
import BottomNav from "./components/BottomNav";
import Missions from "./screens/Missions";
import Profile from "./screens/Profile";
import type { ContextView, CartItem } from "./types";
import { cartItems as defaultCart } from "./data";

type AppPage = "onboarding" | "home" | "pack-detail" | "chat" | "missions" | "profile" | "cart";

export default function App() {
  const [page, setPage] = useState<AppPage>("onboarding");
  const [userTags, setUserTags] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>("business-trip");
  const [savedPackIds, setSavedPackIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("home");

  /* Chat / context state (forwarded to ChatPanel + ContextPanel) */
  const [contextView, setContextView] = useState<ContextView>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(defaultCart);
  const [transportTime, setTransportTime] = useState<string | undefined>(undefined);

  /* Onboarding complete */
  const handleOnboardingComplete = (tags: string[]) => {
    setUserTags(tags);
    setPage("home");
    setActiveTab("home");
  };

  /* Open pack detail */
  const handleScenarioPack = (packId: string) => {
    setSelectedPackId(packId);
    setPage("pack-detail");
  };

  /* Use pack → open chat with context */
  const handlePackUse = () => {
    setPage("chat");
    setActiveTab("ai");
  };

  /* Home input → open chat */
  const handleHomeInput = (_text: string) => {
    setPage("chat");
    setActiveTab("ai");
  };

  /* Save pack */
  const handleSavePack = (packId: string) => {
    setSavedPackIds((prev) =>
      prev.includes(packId) ? prev.filter((id) => id !== packId) : [...prev, packId]
    );
  };

  /* Tab navigation */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") setPage("home");
    else if (tab === "missions") setPage("missions");
    else if (tab === "cart") { setContextView("cart"); setPanelOpen(true); setPage("chat"); }
    else if (tab === "profile") setPage("profile");
  };

  const handleAIOpen = () => {
    setActiveTab("ai");
    setPage("chat");
  };

  /* Chat panel callbacks */
  const handleContextChange = useCallback((view: ContextView) => {
    setContextView(view);
    if (view !== "idle") setPanelOpen(true);
  }, []);

  const handlePanelToggle = useCallback(() => setPanelOpen((v) => !v), []);
  const handlePanelClose = useCallback(() => setPanelOpen(false), []);
  const handleTransportUpdate = useCallback((time: string) => setTransportTime(time), []);

  const handleProductAdd = useCallback((item: CartItem) => {
    setCartItems((prev) => prev.find((i) => i.id === item.id) ? prev : [...prev, item]);
  }, []);

  const handleCheckout = useCallback(() => {
    setContextView(cartItems.some((i) => i.id === "cake") ? "birthday-complete" : "complete");
  }, [cartItems]);

  const handleSaveComplete = useCallback(() => {
    setContextView("idle");
    setPanelOpen(false);
  }, []);

  const handleCartUpdate = useCallback((items: CartItem[]) => setCartItems(items), []);

  const showBottomNav = page !== "onboarding";
  const cartCount = cartItems.length;

  const renderScreen = () => {
    if (page === "onboarding") {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    if (page === "pack-detail") {
      return (
        <ScenarioPackDetail
          packId={selectedPackId}
          onUse={handlePackUse}
          onBack={() => setPage("home")}
          onSave={handleSavePack}
          isSaved={savedPackIds.includes(selectedPackId)}
        />
      );
    }

    if (page === "missions") {
      return (
        <Missions
          onMissionClick={() => { setPage("chat"); setActiveTab("ai"); }}
          savedPackIds={savedPackIds}
          onSavePack={handleSavePack}
        />
      );
    }

    if (page === "profile") {
      return (
        <Profile
          savedPackIds={savedPackIds}
          onPackSelect={(packId) => { setSelectedPackId(packId); setPage("pack-detail"); }}
          onUnsavePack={handleSavePack}
        />
      );
    }

    if (page === "chat") {
      return (
        <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
          <ChatPanel
            onContextChange={handleContextChange}
            onTransportUpdate={handleTransportUpdate}
            onProductAdd={handleProductAdd}
            onPanelToggle={handlePanelToggle}
            onMenuOpen={() => {}}
            cartItems={cartItems}
            contextView={contextView}
            panelOpen={panelOpen}
            isMobile={true}
          />

          {/* Context panel overlay */}
          {panelOpen && contextView !== "idle" && (
            <>
              <div
                onClick={handlePanelClose}
                style={{ position: "absolute", inset: 0, background: "rgba(15,10,46,0.35)", zIndex: 100, backdropFilter: "blur(2px)", animation: "fadeIn 0.2s ease both" }}
              />
              <div
                className="panel-slide-in"
                style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", background: "#F7F8FC", zIndex: 110, display: "flex", flexDirection: "column", overflow: "hidden" }}
              >
                <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #E5E7EB", background: "white", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 700, color: "#0F0A2E" }}>
                    {viewLabel(contextView)}
                  </span>
                  <button
                    onClick={handlePanelClose}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <ContextPanel
                    view={contextView}
                    transportTime={transportTime}
                    cartItems={cartItems}
                    onCartUpdate={handleCartUpdate}
                    onCheckout={handleCheckout}
                    onSaveComplete={handleSaveComplete}
                    onDismissComplete={() => { setContextView("idle"); setPanelOpen(false); }}
                    onProductAdd={handleProductAdd}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    /* Default: home */
    return (
      <Home
        onInputSubmit={handleHomeInput}
        onScenarioPack={handleScenarioPack}
        userTags={userTags}
        savedPackIds={savedPackIds}
      />
    );
  };

  return (
    <div className="phone-shell">
      <div className="phone-side-btn vol-up" />
      <div className="phone-side-btn vol-down" />
      <div className="phone-side-btn power" />
      <div className="app-frame">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {renderScreen()}
          </div>
          {showBottomNav && (
            <BottomNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onAIOpen={handleAIOpen}
              cartCount={cartCount}
            />
          )}
        </div>
>>>>>>> b06c164aaed31121740ed3ca1c4c1f17e506a877
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

function viewLabel(view: ContextView): string {
  const labels: Record<ContextView, string> = {
    idle: "總覽",
    mission: "💼 東京出差任務",
    "birthday-mission": "🎂 生日準備任務",
    "home-repair": "🔧 居家修繕",
    "pet-care": "🐾 寵物看診",
    moving: "📦 搬家準備",
    fitness: "💪 健身計畫",
    shopping: "🛍 推薦商品",
    "home-repair-shop": "🛍 修繕材料",
    "pet-shop": "🛍 寵物用品",
    cart: "🛒 購物車",
    complete: "✅ 任務完成",
    "birthday-complete": "🎉 準備完成",
    profile: "👤 個人檔案",
    missions: "◈ 我的任務",
    packs: "⊞ 情境包",
  };
  return labels[view] ?? "詳情";
}
>>>>>>> b06c164aaed31121740ed3ca1c4c1f17e506a877
