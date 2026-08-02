import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import ScenarioPackDetail from "./screens/ScenarioPackDetail";
import ChatPanel, { WELCOME_MESSAGES } from "./components/ChatPanel";
import ContextPanel from "./components/ContextPanel";
import BottomNav from "./components/BottomNav";
import Missions from "./screens/Missions";
import Profile from "./screens/Profile";
import type { ContextView, CartItem, AuthUser, ScheduledTrip, ChatMessage, Order, AppNotification } from "./types";
import { scenarioPacks, pickupStores, mockUser } from "./data";
import { todayISO, isoInDays } from "./dateUtils";
import { buildNotifications } from "./notifications";

type AppPage = "login" | "onboarding" | "edit-tags" | "home" | "pack-detail" | "chat" | "missions" | "profile" | "cart";

export default function App() {
  const [page, setPage] = useState<AppPage>("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userTags, setUserTags] = useState<string[]>(mockUser.tags);
  const [selectedPackId, setSelectedPackId] = useState<string>("business-trip");
  const [savedPackIds, setSavedPackIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  /* 已排定日期的行程（由情境包建立），同時也是「我的任務」清單 */
  const [trips, setTrips] = useState<ScheduledTrip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const [contextView, setContextView] = useState<ContextView>("idle");
  const [panelOpen, setPanelOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transportTime, setTransportTime] = useState<string | undefined>(undefined);
  const [agentMission, setAgentMission] = useState<any>(null);
  /* AI 規劃卡片上的快速操作（重新規劃／調整預算…）→ 當作使用者訊息送給 AI */
  const [quickPrompt, setQuickPrompt] = useState<string | null>(null);

  /* 對話紀錄提升到 App 層級，切換頁面時 ChatPanel 會被卸載重掛，紀錄放這裡才不會消失 */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const agentHistory = useRef<any[]>([]);

  /* 已結帳的訂單，用來產生「到貨」提醒 */
  const [orders, setOrders] = useState<Order[]>([]);
  /* 已讀過的通知 id */
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  /* 偏好設定：常用取貨門市 + 是否允許通知 */
  const [pickupStoreId, setPickupStoreId] = useState<string>(pickupStores[0].id);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const pickupStore = pickupStores.find((s) => s.id === pickupStoreId) ?? pickupStores[0];

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
    setOrders([]);
    setReadNotificationIds([]);
    setContextView("idle");
    setPanelOpen(false);
    setTransportTime(undefined);
    setPickupStoreId(pickupStores[0].id);
    setNotifyEnabled(true);
    setActiveTab("home");
    setPage("login");
    setChatMessages(WELCOME_MESSAGES);
    agentHistory.current = [];
  }, []);

  /* Onboarding complete；跳過（沒選任何標籤）時保留示範標籤 */
  const handleOnboardingComplete = (tags: string[]) => {
    if (tags.length > 0) setUserTags(tags);
    setPage("home");
    setActiveTab("home");
  };

  /* 「我的」→ Dynamic Tags →「編輯」：改完存回並退回個人頁 */
  const handleTagsSaved = (tags: string[]) => {
    setUserTags(tags);
    setPage("profile");
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

  /* 紫色 AI 按鈕 → 直接進服務畫面；購物車等面板正開著時先自動收起，不用手動打叉 */
  const handleAIOpen = () => {
    setActiveTab("ai");
    setPanelOpen(false);
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

  /* 結帳完成 → 進行中的任務標記為完成，同時建立訂單以便追蹤到貨 */
  const handleCheckout = useCallback(() => {
    setContextView(cartItems.some((i) => i.id === "cake") ? "birthday-complete" : "complete");
    if (activeTripId) {
      setTrips((prev) => prev.map((t) => (t.id === activeTripId ? { ...t, progress: 100 } : t)));
    }
    if (cartItems.length > 0) {
      const order: Order = {
        id: `o${Date.now()}`,
        items: cartItems,
        placedDate: todayISO(),
        etaDate: isoInDays(2),
        status: "preparing",
        store: pickupStore.name,
      };
      setOrders((prev) => [order, ...prev]);
    }
  }, [cartItems, activeTripId, pickupStore]);

  /**
   * Demo 用的物流模擬：下單後自動由「準備中 → 配送中 → 已到貨」，
   * 讓鈴鐺可以即時跳出到貨提醒。用 ref 記住已排的計時器，避免重複排程。
   */
  const orderTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    orders.forEach((order) => {
      if (order.status === "arrived") return;
      const key = `${order.id}:${order.status}`;
      if (orderTimersRef.current[key]) return;
      const next: Order["status"] = order.status === "preparing" ? "shipped" : "arrived";
      const delay = order.status === "preparing" ? 6000 : 10000;
      orderTimersRef.current[key] = window.setTimeout(() => {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
      }, delay);
    });
  }, [orders]);

  /* 卸載時清掉所有計時器 */
  useEffect(
    () => () => {
      Object.values(orderTimersRef.current).forEach((id) => window.clearTimeout(id));
      orderTimersRef.current = {};
    },
    []
  );

  /* 行程時程 + 訂單到貨 → 鈴鐺通知清單；偏好設定關閉通知時不顯示任何提醒 */
  const notifications = useMemo<AppNotification[]>(
    () =>
      notifyEnabled
        ? buildNotifications(trips, orders).map((n) => ({
            ...n,
            read: readNotificationIds.includes(n.id),
          }))
        : [],
    [trips, orders, readNotificationIds, notifyEnabled]
  );

  /* 展開鈴鐺 → 全部標記已讀 */
  const handleNotificationsRead = useCallback(() => {
    setReadNotificationIds((prev) => {
      const ids = notifications.map((n) => n.id);
      const merged = [...prev, ...ids.filter((id) => !prev.includes(id))];
      return merged.length === prev.length ? prev : merged;
    });
  }, [notifications]);

  /* 點通知 → 有對應情境包就跳到行程詳情 */
  const handleNotificationSelect = useCallback((n: AppNotification) => {
    if (!n.packId) return;
    setSelectedPackId(n.packId);
    setPage("pack-detail");
  }, []);

  /* 偏好設定 → 更改頭像或名稱 */
  const handleProfileUpdate = useCallback((patch: { name: string; avatar: string }) => {
    setUser((prev) => (prev ? { ...prev, name: patch.name, avatar: patch.avatar } : prev));
  }, []);

  const handleSaveComplete = useCallback(() => {
    setContextView("idle");
    setPanelOpen(false);
  }, []);

  const handleCartUpdate = useCallback((items: CartItem[]) => setCartItems(items), []);

  const showBottomNav = page !== "onboarding" && page !== "login" && page !== "edit-tags";
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

    if (page === "edit-tags") {
      return (
        <Onboarding
          mode="edit"
          initialTags={userTags}
          onComplete={handleTagsSaved}
          onCancel={() => setPage("profile")}
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
          pickupStoreId={pickupStoreId}
          onPickupStoreChange={setPickupStoreId}
          notifyEnabled={notifyEnabled}
          onNotifyToggle={setNotifyEnabled}
          onProfileUpdate={handleProfileUpdate}
          tags={userTags}
          onTagsChange={setUserTags}
          onEditTags={() => setPage("edit-tags")}
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
            onMissionCreate={handleChatMissionCreate}
            cartItems={cartItems}
            contextView={contextView}
            onAgentMission={setAgentMission}
            quickPrompt={quickPrompt}
            onQuickPromptConsumed={() => setQuickPrompt(null)}
            messages={chatMessages}
            setMessages={setChatMessages}
            agentHistory={agentHistory}
          />

          {panelOpen && contextView !== "idle" && (
            <>
              <div
                onClick={handlePanelClose}
                style={{ position: "absolute", inset: 0, background: "rgba(22,35,46,0.35)", zIndex: 100, backdropFilter: "blur(2px)", animation: "fadeIn 0.2s ease both" }}
              />
              <div
                className="panel-slide-in"
                style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", background: "#F5F7FA", zIndex: 110, display: "flex", flexDirection: "column", overflow: "hidden" }}
              >
                <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #E2E8F0", background: "white", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 700, color: "#16232E" }}>
                    {viewLabel(contextView)}
                  </span>
                  <button
                    onClick={handlePanelClose}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 14 }}
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
                    onQuickPrompt={(text) => { setQuickPrompt(text); setPanelOpen(false); }}
                    onOpenChat={handlePanelClose}
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
        user={user}
        trips={trips}
        cartItems={cartItems}
        onProductAdd={handleProductAdd}
        onScenarioPack={handleScenarioPack}
        onOpenCart={() => handleTabChange("cart")}
        notifications={notifications}
        onNotificationsRead={handleNotificationsRead}
        onNotificationSelect={handleNotificationSelect}
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
