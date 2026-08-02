import { useState } from "react";
import type { AuthUser } from "../types";

interface LoginProps {
  /* isNewUser：註冊的新帳號才需要走個人化標籤設定 */
  onLogin: (user: AuthUser, isNewUser: boolean) => void;
}

type Mode = "login" | "signup";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px 14px 42px",
  borderRadius: 14,
  border: "1.5px solid #E2E8F0",
  background: "#F5F7FA",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  color: "#16232E",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748B",
  fontFamily: "var(--font-display)",
  marginBottom: 6,
  display: "block",
};

/* Build display name + avatar initials from the account info */
function toUser(email: string, name?: string): AuthUser {
  const display = name?.trim() || email.split("@")[0] || "訪客";
  const avatar = display.slice(0, 2).toUpperCase();
  return { name: display, email: email.trim(), avatar, isGuest: false };
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (mode === "signup" && !name.trim()) {
      setError("請輸入你的名字");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("請輸入有效的 Email");
      return;
    }
    if (password.length < 6) {
      setError("密碼至少需要 6 個字元");
      return;
    }

    setError("");
    setLoading(true);
    /* Demo 版：不串接真實驗證，短暫延遲模擬登入 */
    setTimeout(() => {
      setLoading(false);
      const signingUp = mode === "signup";
      onLogin(toUser(email, signingUp ? name : undefined), signingUp);
    }, 600);
  };

  const handleGuest = () => {
    onLogin({ name: "訪客", email: "", avatar: "訪", isGuest: true }, false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white", overflowY: "auto" }} className="scrollbar-hide">
      {/* Gradient hero */}
      <div
        style={{
          background: "linear-gradient(160deg, #1B2A38 0%, #4C6E91 75%, #6E92B4 100%)",
          padding: "68px 28px 34px",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[150, 220, 300].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              top: -40,
              right: -60,
            }}
          />
        ))}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
              padding: 9,
            }}
          >
            <img src="/logo-mark.png" alt="Lifepack" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 28,
              color: "white",
              margin: 0,
              marginBottom: 8,
              letterSpacing: "-0.6px",
            }}
          >
            {mode === "login" ? "歡迎回來" : "建立帳號"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.6 }}>
            {mode === "login"
              ? "登入 Lifepack，繼續你的 AI 生活管家"
              : "註冊後，Lifepack AI 會記住你的偏好與任務"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, padding: "26px 28px 0", display: "flex", flexDirection: "column" }}>
        {/* Mode switch */}
        <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 14, padding: 4, marginBottom: 22 }}>
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 11,
                border: "none",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#4C6E91" : "#94A3B8",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: mode === m ? "0 2px 8px rgba(22,35,46,0.08)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {m === "login" ? "登入" : "註冊"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle} htmlFor="login-name">名字</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>👤</span>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你想被怎麼稱呼？"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="login-email">Email</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>✉️</span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle} htmlFor="login-password">密碼</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔒</span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 個字元"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={{ ...inputStyle, paddingRight: 48 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                padding: 4,
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
            <button
              type="button"
              style={{ background: "none", border: "none", color: "#4C6E91", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)", padding: 0 }}
            >
              忘記密碼？
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: 12,
              padding: "10px 12px",
              marginTop: 8,
              marginBottom: 4,
              fontSize: 13,
              color: "#DC2626",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "17px",
            borderRadius: 18,
            border: "none",
            background: loading ? "#A9C0D6" : "linear-gradient(135deg, #4C6E91, #6E92B4)",
            color: "white",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 17,
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 10px 32px rgba(76,110,145,0.35)",
            transition: "background 0.2s",
          }}
        >
          {loading ? "登入中…" : mode === "login" ? "登入 →" : "建立帳號 →"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "var(--font-display)" }}>或</span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          style={{
            width: "100%",
            margin: "0 0 36px",
            padding: "12px",
            background: "none",
            border: "none",
            fontSize: 14,
            color: "#94A3B8",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          先以訪客身分體驗
        </button>
      </form>
    </div>
  );
}
