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
        borderTop: "1px solid #E5E7EB",
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
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6246EA 0%, #8B5CF6 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(98,70,234,0.4), 0 2px 8px rgba(98,70,234,0.2)",
          position: "relative",
          top: -8,
          flexShrink: 0,
          transition: "transform 0.15s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M6 14C4 15.5 3 17.5 3 20H21C21 17.5 20 15.5 18 14C16.5 15.2 14.4 16 12 16C9.6 16 7.5 15.2 6 14Z"
            fill="white"
            opacity="0.7"
          />
          <circle cx="18" cy="6" r="2.5" fill="white" opacity="0.6" />
          <circle cx="20" cy="10" r="1.5" fill="white" opacity="0.4" />
        </svg>
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
  const color = active ? "#6246EA" : "#9CA3AF";
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
            background: "#6246EA",
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
        opacity={color === "#6246EA" ? 1 : 0.7}
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
