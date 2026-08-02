import { useState, useCallback } from "react"; // v2
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import ScenarioPackDetail from "./screens/ScenarioPackDetail";
import ChatPanel from "./components/ChatPanel";
import ContextPanel from "./components/ContextPanel";
import BottomNav from "./components/BottomNav";
import Missions from "./screens/Missions";
import Profile from "./screens/Profile";
import type { ContextView, CartItem, AuthUser, ScheduledTrip } from "./types";
import { scenarioPacks } from "./data";
import { todayISO } from "./dateUtils";

type AppPage = "login" | "onboarding" | "home" | "pack-detail" | "chat" | "missions" | "profile" | "cart";

export default function App() {
  const [page, setPage] = useState<AppPage>("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>("business-trip");
  const [savedPackIds, setSavedPackIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  /* 已排定日期的行程（由情境包建立），同時也是「我的任務」清單 */
  const [trips, setTrips] = useState<ScheduledTrip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  /* Chat / context state (forwarded to ChatPanel + ContextPanel) */
  const [contextView, setContextView] = useState<ContextView>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transportTime, setTransportTime] = useState<string | undefined>(undefined);

  /* 註冊的新帳號才走標籤設定，一般登入直接進主頁 */
  const handleLogin = (loggedIn: AuthUser, isNewUser: boolean) => {
    setUser(loggedIn);
    setActiveTab("home");
    setPage(isNewUser ? "onboarding" : "home");
  };

  /* Logout → reset session state back to login */
  const handleLogout = useCallback(() => {
    setUser(null);
    setUserTags([]);
    setSavedPackIds([]);
    setTrips([]);
    setActiveTripId(null);
    setCartItems([]);
    setContextView("idle");
    setPanelOpen(false);
    setTransportTime(undefined);
    setActiveTab("home");
    setPage("login");
  }, []);

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

  /**
   * 建立或更新某個情境包對應的行程，並同步出現在「我的任務」。
   * date 省略時沿用既有日期，全新任務則預設今天。
   */
  const upsertTrip = useCallback((packId: string, date?: string) => {
    const pack = scenarioPacks.find((p) => p.id === packId);
    if (!pack) return;
    setActiveTripId(pack.id);
    setTrips((prev) => {
      const existing = prev.find((t) => t.packId === pack.id);
      const trip: ScheduledTrip = {
        id: pack.id,
        packId: pack.id,
        name: pack.name,
        icon: pack.icon,
        color: pack.color,
        bgColor: pack.bgColor,
        date: date ?? existing?.date ?? todayISO(),
        progress: existing?.progress ?? 0,
      };
      return existing ? prev.map((t) => (t.packId === pack.id ? trip : t)) : [...prev, trip];
    });
  }, []);

  /* Use pack → 建立（或更新）該情境包的行程，再進入對話 */
  const handlePackUse = (date: string) => {
    upsertTrip(selectedPackId, date);
    setPage("chat");
    setActiveTab("ai");
  };

  /* 對話中完成一個服務流程 → 自動新增到「我的任務」，帶上對話中問到的行程日期 */
  const handleChatMissionCreate = useCallback((packId: string, date?: string) => {
    upsertTrip(packId, date);
  }, [upsertTrip]);

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

  /* 結帳完成 → 進行中的任務標記為完成 */
  const handleCheckout = useCallback(() => {
    setContextView(cartItems.some((i) => i.id === "cake") ? "birthday-complete" : "complete");
    if (activeTripId) {
      setTrips((prev) => prev.map((t) => (t.id === activeTripId ? { ...t, progress: 100 } : t)));
    }
  }, [cartItems, activeTripId]);

  const handleSaveComplete = useCallback(() => {
    setContextView("idle");
    setPanelOpen(false);
  }, []);

  const handleCartUpdate = useCallback((items: CartItem[]) => setCartItems(items), []);

  const showBottomNav = page !== "onboarding" && page !== "login";
  const cartCount = cartItems.length;

  const renderScreen = () => {
    if (page === "login") {
      return <Login onLogin={handleLogin} />;
    }

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
          scheduledDate={trips.find((t) => t.packId === selectedPackId)?.date}
        />
      );
    }

    if (page === "missions") {
      return (
        <Missions
          trips={trips}
          onMissionClick={(packId) => { setActiveTripId(packId); setPage("chat"); setActiveTab("ai"); }}
          onBrowsePacks={() => { setContextView("idle"); setPanelOpen(false); setPage("chat"); setActiveTab("ai"); }}
          savedPackIds={savedPackIds}
          onSavePack={handleSavePack}
        />
      );
    }

    if (page === "profile") {
      return (
        <Profile
          user={user}
          savedPackIds={savedPackIds}
          onPackSelect={(packId) => { setSelectedPackId(packId); setPage("pack-detail"); }}
          onUnsavePack={handleSavePack}
          onLogout={handleLogout}
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
            onMissionCreate={handleChatMissionCreate}
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
        user={user}
        trips={trips}
        cartItems={cartItems}
        onProductAdd={handleProductAdd}
        onScenarioPack={handleScenarioPack}
        onOpenCart={() => handleTabChange("cart")}
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
  };
  return labels[view] ?? "詳情";
}
