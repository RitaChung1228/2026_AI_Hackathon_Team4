import { useState } from "react";
import { products, services } from "../data";

interface ShoppingProps {
  onAddToCart: (item: { id: string; name: string; price: number; qty: number; icon: string; detail: string }) => void;
  onViewCart: () => void;
  cartCount: number;
}

export default function Shopping({ onAddToCart, onViewCart, cartCount }: ShoppingProps) {
  const [addedIds, setAddedIds] = useState<string[]>(["esim"]);
  const [tab, setTab] = useState<"products" | "services">("products");

  const handleAdd = (product: typeof products[0]) => {
    if (addedIds.includes(product.id)) return;
    setAddedIds((prev) => [...prev, product.id]);
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      icon: product.icon,
      detail: product.detail,
    });
  };

  const tagColors: Record<string, string> = {
    timesaver: "#4C6E91",
    pickup: "#16A34A",
    business: "#0EA5E9",
    traveler: "#6E92B4",
    birthday: "#DB2777",
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#F5F7FA",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "52px 20px 0",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 20,
              color: "#16232E",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            商品與服務
          </h2>
          {cartCount > 0 && (
            <button
              onClick={onViewCart}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 20,
                background: "#4C6E91",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              🛒 {cartCount}
            </button>
          )}
        </div>

        {/* AI context */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(76,110,145,0.07), rgba(110,146,180,0.04))",
            border: "1px solid rgba(76,110,145,0.15)",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 14 }}>✦</span>
          <p style={{ fontSize: 12, color: "#4C6E91", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            根據你的東京出差任務，為你推薦以下商品與服務。
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {(["products", "services"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "#4C6E91" : "#94A3B8",
                fontFamily: "var(--font-display)",
                borderBottom: `2px solid ${tab === t ? "#4C6E91" : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              {t === "products" ? "商品" : "服務"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", paddingBottom: 100 }} className="scrollbar-hide">
        {tab === "products" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((p) => {
              const isAdded = addedIds.includes(p.id);
              const reasonColor = tagColors[p.reasonTag] || "#4C6E91";
              return (
                <div
                  key={p.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "14px",
                    boxShadow: "0 1px 4px rgba(22,35,46,0.05)",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#F5F7FA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {p.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#16232E",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#4C6E91",
                            background: "#E7EEF5",
                            padding: "2px 6px",
                            borderRadius: 20,
                          }}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{p.detail}</div>
                      <div style={{ fontSize: 12, color: reasonColor, display: "flex", alignItems: "center", gap: 4 }}>
                        <span>✦</span> {p.reason}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 16,
                          color: "#16232E",
                        }}
                      >
                        NT${p.price}
                      </span>
                      <button
                        onClick={() => handleAdd(p)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: isAdded ? "1.5px solid #16A34A" : "none",
                          background: isAdded ? "white" : "#4C6E91",
                          color: isAdded ? "#16A34A" : "white",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isAdded ? "default" : "pointer",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {isAdded ? "✓ 已加入" : "加入"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "services" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {services.map((s) => {
              const reasonColor = tagColors[s.reasonTag] || "#4C6E91";
              return (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "14px",
                    boxShadow: "0 1px 4px rgba(22,35,46,0.05)",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#F5F7FA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#16232E",
                          }}
                        >
                          {s.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#0EA5E9",
                            background: "#E0F2FE",
                            padding: "2px 6px",
                            borderRadius: 20,
                          }}
                        >
                          {s.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{s.detail}</div>
                      <div style={{ fontSize: 12, color: reasonColor, display: "flex", alignItems: "center", gap: 4 }}>
                        <span>✦</span> {s.reason}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 16,
                          color: "#16232E",
                        }}
                      >
                        NT${s.price.toLocaleString()}
                      </span>
                      <button
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: "none",
                          background: "#4C6E91",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        選擇
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Button */}
      {cartCount > 0 && (
        <div style={{ position: "absolute", bottom: 88, left: 20, right: 20 }}>
          <button
            onClick={onViewCart}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #4C6E91, #6E92B4)",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(76,110,145,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span>查看購物車</span>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 13,
              }}
            >
              {cartCount} 件
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
