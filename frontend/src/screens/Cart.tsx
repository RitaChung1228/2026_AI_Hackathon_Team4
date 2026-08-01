import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  qty: number;
  icon: string;
}

interface CartProps {
  items: CartItem[];
  onCheckout: () => void;
  onUpdateItems: (items: CartItem[]) => void;
}

export default function Cart({ items, onCheckout, onUpdateItems }: CartProps) {
  const [useOpenPoint, setUseOpenPoint] = useState(true);
  const [useCoupon, setUseCoupon] = useState(true);
  const [checkedOut, setCheckedOut] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const openPointDiscount = useOpenPoint ? 120 : 0;
  const couponDiscount = useCoupon ? 60 : 0;
  const total = subtotal - openPointDiscount - couponDiscount;

  const handleRemove = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
  };

  const handleCheckout = () => {
    setConfirming(true);
  };

  const handleConfirm = () => {
    setCheckedOut(true);
    setTimeout(onCheckout, 1200);
  };

  if (checkedOut) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          className="animate-bounce-in"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          ✓
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color: "#0F0A2E",
            margin: 0,
          }}
        >
          結帳成功！
        </p>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>正在更新任務...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        background: "#F8F9FC",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "52px 20px 16px",
          borderBottom: "1px solid #F3F4F6",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 20,
            color: "#0F0A2E",
            margin: 0,
          }}
        >
          購物車
        </h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, marginTop: 4 }}>
          東京商務出差 · {items.length} 件商品
        </p>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }} className="scrollbar-hide">
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "white",
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 1px 3px rgba(15,10,46,0.05)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#F8F9FC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0F0A2E",
                  }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{item.detail}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#0F0A2E",
                  }}
                >
                  NT${(item.price * item.qty).toLocaleString()}
                </span>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#F3F4F6",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pickup info */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "14px",
            marginBottom: 16,
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>📦</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: "#0F0A2E",
              }}
            >
              門市取貨
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            7-ELEVEN 松仁門市 · 今天 18:30 後可取
          </div>
        </div>

        {/* Discounts */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "14px",
            marginBottom: 16,
            border: "1px solid #E5E7EB",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#0F0A2E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            優惠與點數
          </h3>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>
                  OPENPOINT 點數
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>使用 240 點 → 折抵 NT$120</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>- NT$120</span>
              <div
                onClick={() => setUseOpenPoint((v) => !v)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: useOpenPoint ? "#6246EA" : "#D1D5DB",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    left: useOpenPoint ? 20 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎟</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0A2E", fontFamily: "var(--font-display)" }}>
                  出差優惠券
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>商品滿 NT$1,000 折 NT$60</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>- NT$60</span>
              <div
                onClick={() => setUseCoupon((v) => !v)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: useCoupon ? "#6246EA" : "#D1D5DB",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    left: useCoupon ? 20 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          </label>
        </div>

        {/* Summary */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "14px",
            marginBottom: 100,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>商品小計</span>
            <span style={{ fontSize: 13, color: "#0F0A2E" }}>NT${subtotal.toLocaleString()}</span>
          </div>
          {useOpenPoint && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>OPENPOINT 折抵</span>
              <span style={{ fontSize: 13, color: "#16A34A" }}>- NT${openPointDiscount}</span>
            </div>
          )}
          {useCoupon && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>優惠券折抵</span>
              <span style={{ fontSize: 13, color: "#16A34A" }}>- NT${couponDiscount}</span>
            </div>
          )}
          <div
            style={{
              borderTop: "1px solid #F3F4F6",
              marginTop: 8,
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "#0F0A2E",
              }}
            >
              合計
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                color: "#6246EA",
              }}
            >
              NT${total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div style={{ position: "absolute", bottom: 88, left: 20, right: 20 }}>
        <button
          onClick={handleCheckout}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(98,70,234,0.35)",
          }}
        >
          確認結帳 · NT${total.toLocaleString()}
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirming && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,10,46,0.5)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 200,
          }}
        >
          <div
            className="bottom-sheet"
            style={{
              background: "white",
              borderRadius: "24px 24px 0 0",
              padding: "24px 24px 48px",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "#D1D5DB",
                margin: "0 auto 24px",
              }}
            />
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                color: "#0F0A2E",
                margin: 0,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              確認結帳
            </h3>
            <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
              共 {items.length} 件商品 · 合計 NT${total.toLocaleString()}
            </p>
            <div
              style={{
                background: "#F8F9FC",
                borderRadius: 14,
                padding: "14px",
                marginBottom: 20,
                border: "1px solid #E5E7EB",
              }}
            >
              <div style={{ fontSize: 13, color: "#6B7280", textAlign: "center" }}>
                📦 7-ELEVEN 松仁門市取貨 · 今天 18:30 後
              </div>
            </div>
            <button
              onClick={handleConfirm}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              確認付款
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 16,
                border: "1.5px solid #E5E7EB",
                background: "white",
                color: "#6B7280",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
