import { mockUser } from "../data";
import { daysUntil, formatDateLabel, relativeDayLabel } from "../dateUtils";
import { featuredRecos, recosForCart, tripSections, type RecoItem } from "../recommendations";
import type { AuthUser, CartItem, ScheduledTrip } from "../types";

interface HomeProps {
  user?: AuthUser | null;
  trips?: ScheduledTrip[];
  cartItems?: CartItem[];
  onProductAdd?: (item: CartItem) => void;
  onScenarioPack?: (packId: string) => void;
  onOpenCart?: () => void;
}

export default function Home({ user, trips = [], cartItems = [], onProductAdd, onScenarioPack, onOpenCart }: HomeProps) {
  const cartIds = cartItems.map((i) => i.id);
  const displayName = user?.name ?? mockUser.name;
  const displayAvatar = user?.avatar ?? mockUser.avatar;

  const sortedTrips = [...trips].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const sections = tripSections(sortedTrips, cartIds);
  const cartRecos = recosForCart(cartItems);
  const featured = featuredRecos(cartIds);
  const hasContext = sections.length > 0 || cartRecos.length > 0;

  const addToCart = (r: RecoItem) => {
    onProductAdd?.({ id: r.id, name: r.name, detail: r.detail, price: r.price, qty: 1, icon: r.icon });
  };

  const renderCard = (r: RecoItem, because?: string) => {
    const inCart = cartIds.includes(r.id);
    return (
      <div
        key={r.id}
        style={{
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #F3F4F6",
          boxShadow: "0 1px 4px rgba(15,10,46,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 圖片 / 服務磁磚 */}
        <div style={{ position: "relative", height: 96, flexShrink: 0, background: r.tint ?? "#F3F4F6" }}>
          {r.image ? (
            <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                background: `linear-gradient(135deg, ${r.tint ?? "#EDE9FF"}, white)`,
              }}
            >
              {r.icon}
            </div>
          )}
          {r.tag && (
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                background: "rgba(15,10,46,0.65)",
                padding: "3px 7px",
                borderRadius: 20,
                fontFamily: "var(--font-display)",
                backdropFilter: "blur(4px)",
              }}
            >
              {r.tag}
            </span>
          )}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 10,
              fontWeight: 700,
              color: r.kind === "service" ? "#6246EA" : "#16A34A",
              background: "rgba(255,255,255,0.92)",
              padding: "3px 7px",
              borderRadius: 20,
              fontFamily: "var(--font-display)",
            }}
          >
            {r.kind === "service" ? "服務" : "商品"}
          </span>
        </div>

        {/* 內容 */}
        <div style={{ padding: "10px 11px 11px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#0F0A2E", lineHeight: 1.3 }}>
            {r.name}
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3, lineHeight: 1.4 }}>{r.detail}</div>
          <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>🏬 {r.vendor}</div>

          {because && (
            <div style={{ fontSize: 10, color: "#6246EA", marginTop: 6, lineHeight: 1.4, fontWeight: 600 }}>
              ✦ 常與「{because}」一起準備
            </div>
          )}

          <div style={{ flex: 1, minHeight: 8 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>
              NT${r.price.toLocaleString()}
            </span>
            <button
              onClick={() => !inCart && addToCart(r)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: inCart ? "1.5px solid #16A34A" : "none",
                background: inCart ? "white" : "linear-gradient(135deg, #6246EA, #8B5CF6)",
                color: inCart ? "#16A34A" : "white",
                fontSize: 11,
                fontWeight: 700,
                cursor: inCart ? "default" : "pointer",
                fontFamily: "var(--font-display)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {inCart ? "✓ 已加入" : "＋ 加入"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sectionTitle = (title: string, sub: string, action?: { label: string; onClick: () => void }) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0F0A2E", margin: 0 }}>
          {title}
        </h3>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{sub}</div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{ fontSize: 12, color: "#6246EA", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-display)", whiteSpace: "nowrap", flexShrink: 0, padding: 0 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );

  const grid = (children: React.ReactNode) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#F8F9FC", paddingBottom: 90 }} className="scrollbar-hide">
      {/* Header */}
      <div style={{ background: "white", padding: "56px 20px 18px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6246EA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)" }}>U</span>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#0F0A2E", letterSpacing: "-0.3px" }}>
              UNI Flow
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {cartItems.length > 0 && (
              <button
                onClick={onOpenCart}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, position: "relative" }}
              >
                🛒
                <span style={{ position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "#EA580C", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", fontFamily: "var(--font-display)" }}>
                  {cartItems.length}
                </span>
              </button>
            )}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>
              {displayAvatar}
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "#0F0A2E", margin: 0, marginBottom: 6, letterSpacing: "-0.5px" }}>
          Hi {displayName} 👋
        </h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
          {hasContext
            ? "根據你的行程與購物車，為你挑選了這些商品與服務"
            : "先建立一個行程，我就能依你的計畫推薦商品與服務"}
        </p>
      </div>

      <div style={{ padding: "20px" }}>
        {/* 依行程包推薦 */}
        {sections.map(({ trip, items }) => {
          const diff = daysUntil(trip.date);
          return (
            <div key={trip.id} style={{ marginBottom: 26 }}>
              {sectionTitle(
                `${trip.icon} ${trip.name}｜為你準備`,
                `${formatDateLabel(trip.date)} · ${diff >= 0 ? relativeDayLabel(trip.date) : `已過 ${-diff} 天`}`,
                onScenarioPack ? { label: "查看行程 →", onClick: () => onScenarioPack(trip.packId) } : undefined
              )}
              {grid(items.map((r) => renderCard(r)))}
            </div>
          );
        })}

        {/* 依購物車搭配推薦 */}
        {cartRecos.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            {sectionTitle(
              "🛒 購物車搭配推薦",
              `你的購物車有 ${cartItems.length} 件，這些常一起被準備`,
              onOpenCart ? { label: "看購物車 →", onClick: onOpenCart } : undefined
            )}
            {grid(cartRecos.map(({ item, because }) => renderCard(item, because)))}
          </div>
        )}

        {/* 沒有行程也沒有購物車 → 精選 */}
        {!hasContext && (
          <div style={{ marginBottom: 26 }}>
            {sectionTitle("✦ 熱門商品與服務", "建立行程後，這裡會換成專屬於你的推薦")}
            {grid(featured.map((r) => renderCard(r)))}
          </div>
        )}
      </div>
    </div>
  );
}
