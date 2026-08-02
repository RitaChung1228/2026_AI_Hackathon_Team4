import type { ContextView } from "../types";

interface SidebarProps {
  activeView: ContextView;
  onNav: (view: ContextView) => void;
  onClose?: () => void;
  collapsed?: boolean;
}

const navItems: { icon: string; label: string; view: ContextView }[] = [
  { icon: "⌂", label: "首頁", view: "idle" },
  { icon: "◈", label: "任務", view: "missions" },
  { icon: "⊞", label: "情境包", view: "packs" },
  { icon: "◻", label: "購物車", view: "cart" },
];

export default function Sidebar({ activeView, onNav, onClose, collapsed }: SidebarProps) {
  const isActive = (view: ContextView) => activeView === view;

  return (
    <aside
      style={{
        width: collapsed ? 60 : 220,
        background: "#1B2A38",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "20px 8px" : "20px 14px",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        transition: "width 0.25s ease",
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Close button for mobile drawer */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 12,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      )}

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
          paddingLeft: collapsed ? 0 : 4,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <img
          src="/logo-mark.png"
          alt="Lifepack"
          style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }}
        />
        {!collapsed && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              color: "white",
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
            }}
          >
            Lifepack
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => { onNav(item.view); onClose?.(); }}
            className={`sidebar-link${isActive(item.view) ? " active" : ""}`}
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px 0" : "10px 12px",
            }}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            margin: "12px 0",
          }}
        />

        {/* New conversation */}
        <button
          onClick={() => { onNav("idle"); onClose?.(); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 0" : "10px 12px",
            borderRadius: 10,
            border: "1px dashed rgba(76,110,145,0.4)",
            background: "rgba(76,110,145,0.08)",
            cursor: "pointer",
            color: "#8FB0CC",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            width: "100%",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span>
          {!collapsed && <span>新對話</span>}
        </button>
      </nav>

      {/* Profile */}
      <button
        onClick={() => { onNav("profile"); onClose?.(); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "10px 0" : "10px 12px",
          borderRadius: 10,
          background: isActive("profile") ? "rgba(76,110,145,0.2)" : "transparent",
          border: "none",
          cursor: "pointer",
          width: "100%",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4C6E91, #6E92B4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          JL
        </div>
        {!collapsed && (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-display)" }}>
              Jamie
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Busy Professional</div>
          </div>
        )}
      </button>
    </aside>
  );
}
