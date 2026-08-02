interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAIOpen: () => void;
  cartCount?: number;
}

export default function BottomNav({ activeTab, onTabChange, onAIOpen, cartCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: "home", icon: HomeIcon, label: "首頁" },
    { id: "missions", icon: MissionsIcon, label: "任務" },
    { id: "cart", icon: CartIcon, label: "購物車" },
    { id: "profile", icon: ProfileIcon, label: "我的" },
  ];

  return (
    <div
      style={{
        height: 72,
        background: "white",
        borderTop: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: 8,
        flexShrink: 0,
      }}
    >
      {tabs.slice(0, 2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}

      {/* AI Center Button */}
      <button
        onClick={onAIOpen}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "white",
          border: "1.5px solid #E2E8F0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(76,110,145,0.4), 0 2px 8px rgba(76,110,145,0.2)",
          position: "relative",
          top: -12,
          flexShrink: 0,
          transition: "transform 0.15s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="/logo-mark.png"
          alt="Lifepack AI"
          style={{ width: 40, height: 40, objectFit: "contain", pointerEvents: "none" }}
        />
      </button>

      {tabs.slice(2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          badge={tab.id === "cart" && cartCount > 0 ? cartCount : undefined}
        />
      ))}
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick,
  badge,
}: {
  tab: { id: string; icon: React.FC<{ color: string }>; label: string };
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const color = active ? "#4C6E91" : "#94A3B8";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 12px",
        position: "relative",
      }}
    >
      {badge !== undefined && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 8,
            background: "#4C6E91",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </span>
      )}
      <tab.icon color={color} />
      <span
        style={{
          fontSize: 11,
          fontWeight: active ? 600 : 400,
          color,
          fontFamily: "var(--font-body)",
        }}
      >
        {tab.label}
      </span>
    </button>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        fill={color}
        opacity={color === "#4C6E91" ? 1 : 0.7}
      />
    </svg>
  );
}

function MissionsIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <path d="M8 8H16M8 12H16M8 16H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path d="M3 6H21M16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
      <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
