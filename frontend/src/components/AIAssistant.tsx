import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
  options?: string[];
  updated?: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle?: string;
  onTransportUpdate?: (time: string) => void;
}

const getAIResponse = (input: string): Message => {
  const lower = input.toLowerCase();

  if (lower.includes("六點") || lower.includes("6點") || lower.includes("06:00") || lower.includes("6:00")) {
    return {
      role: "ai",
      text: "已更新機場接送時間為 06:00，yoxi 已重新確認行程。",
      updated: "transport",
    };
  }
  if (lower.includes("esim") || lower.includes("便宜") || lower.includes("換")) {
    return {
      role: "ai",
      text: "為你找到以下替代方案：",
      options: ["📶 3GB / 5天 · NT$299 省100元", "📶 10GB / 5天 · NT$599 更大流量", "📶 無限流量 / 5天 · NT$899 最方便"],
    };
  }
  if (lower.includes("旅平險") || lower.includes("保險") || lower.includes("移除") || lower.includes("不要")) {
    return {
      role: "ai",
      text: "已從這次任務移除旅平險。如有需要隨時可以重新加入。",
    };
  }
  if (lower.includes("天氣") || lower.includes("東京")) {
    return {
      role: "ai",
      text: "東京週三預計 8°C 並有降雨。我已幫你在 Checklist 加入雨傘與保暖外套，是否需要更新行李清單？",
      options: ["更新清單", "查看清單", "不用"],
    };
  }
  if (lower.includes("checklist")) {
    return {
      role: "ai",
      text: "目前 Checklist 進度：6/8 完成。待完成項目：護照確認、換外幣。需要我幫你完成其中一項嗎？",
      options: ["換外幣服務", "標記完成", "不用"],
    };
  }
  return {
    role: "ai",
    text: "收到！我已幫你處理這個需求。如有其他調整需要，隨時告訴我。",
  };
};

export default function AIAssistant({ isOpen, onClose, missionTitle, onTransportUpdate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: missionTitle
        ? `你目前在「${missionTitle}」任務中。有什麼需要調整的嗎？`
        : "你好！我是 UNI AI，有什麼需要幫忙的嗎？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: "ai",
          text: missionTitle
            ? `你目前在「${missionTitle}」任務中。有什麼需要調整的嗎？`
            : "你好！我是 UNI AI，有什麼需要幫忙的嗎？",
        },
      ]);
    }
  }, [isOpen, missionTitle]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiResp = getAIResponse(msg);
      setMessages((prev) => [...prev, aiResp]);
      if (aiResp.updated === "transport" && onTransportUpdate) {
        onTransportUpdate("06:00");
      }
    }, 1200);
  };

  const quickActions = ["接送改成早上六點", "eSIM 換便宜一點", "旅平險先不要", "查看 Checklist"];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,10,46,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <div
        className="bottom-sheet"
        style={{
          position: "relative",
          background: "#F8F9FC",
          borderRadius: "24px 24px 0 0",
          height: "82%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Handle + Header */}
        <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "#D1D5DB",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 16 }}>✦</span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#0F0A2E",
                }}
              >
                UNI AI
              </div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>隨時幫你調整任務</div>
            </div>
            <button
              onClick={onClose}
              style={{
                marginLeft: "auto",
                background: "#F3F4F6",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 16,
                color: "#6B7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }} className="scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid #E5E7EB",
                  background: "white",
                  fontSize: 12,
                  color: "#6246EA",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px 12px",
          }}
          className="scrollbar-hide"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
                animation: "fadeIn 0.3s ease both",
              }}
              className="animate-fade-in"
            >
              {msg.role === "ai" && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: 8,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  ✦
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6246EA, #8B5CF6)"
                        : "white",
                    color: msg.role === "user" ? "white" : "#0F0A2E",
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {msg.text}
                </div>
                {msg.options && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {msg.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => handleSend(opt)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: 12,
                          border: "1.5px solid #6246EA",
                          background: "white",
                          color: "#6246EA",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {msg.updated && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>✓</span> 任務已更新
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6246EA, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: 4,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6246EA",
                      animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px 20px",
            borderTop: "1px solid #E5E7EB",
            background: "white",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="告訴我需要調整什麼..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 20,
              border: "1.5px solid #E5E7EB",
              background: "#F8F9FC",
              fontSize: 14,
              outline: "none",
              fontFamily: "var(--font-body)",
              color: "#0F0A2E",
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: input.trim() ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
