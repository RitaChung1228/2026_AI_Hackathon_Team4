import { useState, useCallback } from "react";
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

  const [contextView, setContextView] = useState<ContextView>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(defaultCart);
  const [transportTime, setTransportTime] = useState<string | undefined>(undefined);
  const [agentMission, setAgentMission] = useState<any>(null);

  const handleOnboardingComplete = (tags: string[]) => {
    setUserTags(tags);
    setPage("home");
    setActiveTab("home");
  };

  const handleScenarioPack = (packId: string) => {
    setSelectedPackId(packId);
    setPage("pack-detail");
  };

  const handlePackUse = () => {
    setPage("chat");
    setActiveTab("ai");
  };

  const handleHomeInput = (_text: string) => {
    setPage("chat");
    setActiveTab("ai");
  };

  const handleSavePack = (packId: string) => {
    setSavedPackIds((prev) =>
      prev.includes(packId) ? prev.filter((id) => id !== packId) : [...prev, packId]
    );
  };

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
            onAgentMission={setAgentMission}
          />

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
                    agentMission={agentMission}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

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
      </div>
    </div>
  );
}

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
    "agent-mission": "📋 AI 規劃任務",
  };
  return labels[view] ?? "詳情";
}
