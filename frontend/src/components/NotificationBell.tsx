import { useEffect, useRef, useState } from "react";
import { LEVEL_STYLE } from "../notifications";
import type { AppNotification } from "../types";

interface NotificationBellProps {
  notifications: AppNotification[];
  /* 點通知後的動作（例如跳到情境包），沒有 packId 的通知不會帶值 */
  onSelect?: (n: AppNotification) => void;
  /* 展開清單時把通知標記為已讀 */
  onOpen?: () => void;
}

export default function NotificationBell({ notifications, onSelect, onOpen }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const prevUnread = useRef(0);
  const [ring, setRing] = useState(false);

  /* 有新通知進來時讓鈴鐺晃一下 */
  useEffect(() => {
    if (unread > prevUnread.current) {
      setRing(true);
      const t = window.setTimeout(() => setRing(false), 900);
      prevUnread.current = unread;
      return () => window.clearTimeout(t);
    }
    prevUnread.current = unread;
  }, [unread]);

  const toggle = () => {
    setOpen((v) => {
      if (!v) onOpen?.();
      return !v;
    });
  };

  const handleSelect = (n: AppNotification) => {
    setOpen(false);
    if (n.packId) onSelect?.(n);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggle}
        aria-label={unread > 0 ? `通知，${unread} 則未讀` : "通知"}
        aria-expanded={open}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: open ? "#E7EEF5" : "#F1F5F9",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          position: "relative",
          transition: "background 0.15s ease",
        }}
      >
        <span className={ring ? "bounce-in" : undefined} style={{ lineHeight: 1 }}>
          🔔
        </span>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 8,
              background: "#DC2626",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
              fontFamily: "var(--font-display)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* 點外面關閉 */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }}
          />
          <div
            className="bounce-in scrollbar-hide"
            style={{
              position: "absolute",
              top: 44,
              right: 0,
              width: 288,
              maxHeight: 340,
              overflowY: "auto",
              background: "white",
              borderRadius: 16,
              border: "1px solid #F1F5F9",
              boxShadow: "0 12px 32px rgba(22,35,46,0.16)",
              zIndex: 50,
              transformOrigin: "top right",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#16232E",
                }}
              >
                提醒
              </span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {notifications.length > 0 ? `${notifications.length} 則` : "無"}
              </span>
            </div>

            {notifications.length === 0 && (
              <div style={{ padding: "26px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>🌤</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", fontFamily: "var(--font-display)" }}>
                  目前沒有新的提醒
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, lineHeight: 1.5 }}>
                  行程快到或下單的商品到貨時，會在這裡通知你
                </div>
              </div>
            )}

            {notifications.map((n) => {
              const style = LEVEL_STYLE[n.level];
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "11px 14px",
                    border: "none",
                    borderBottom: "1px solid #F8FAFC",
                    background: n.read ? "white" : "#FAFCFE",
                    cursor: n.packId ? "pointer" : "default",
                    textAlign: "left",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      background: style.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {n.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#16232E",
                          lineHeight: 1.35,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {n.title}
                      </span>
                      {!n.read && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#4C6E91",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 3, lineHeight: 1.45 }}>
                      {n.detail}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: style.color,
                          background: style.bg,
                          padding: "2px 7px",
                          borderRadius: 20,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {n.meta}
                      </span>
                      {n.packId && (
                        <span style={{ fontSize: 10, color: "#4C6E91", fontWeight: 600 }}>查看行程 →</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
