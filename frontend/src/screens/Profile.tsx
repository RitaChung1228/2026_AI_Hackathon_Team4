import { useEffect, useRef, useState } from "react"; // v2
import { avatarOptions, mockUser, pickupStores, scenarioPacks } from "../data";
import { fileToAvatarDataUrl, isPhotoAvatar } from "../avatarUtils";
import AvatarView from "../components/AvatarView";
import type { AuthUser } from "../types";

interface ProfileProps {
  user?: AuthUser | null;
  savedPackIds?: string[];
  onPackSelect?: (packId: string) => void;
  onUnsavePack?: (packId: string) => void;
  onLogout?: () => void;
  /* 偏好設定：常用取貨門市 */
  pickupStoreId?: string;
  onPickupStoreChange?: (storeId: string) => void;
  /* 偏好設定：是否允許通知 */
  notifyEnabled?: boolean;
  onNotifyToggle?: (enabled: boolean) => void;
  /* 偏好設定：更改頭像或名稱 */
  onProfileUpdate?: (patch: { name: string; avatar: string }) => void;
  /* Dynamic Tags：由外層保存，「編輯」會導到標籤選定頁 */
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  onEditTags?: () => void;
}

/* 偏好設定中展開的區塊 */
type EditingSection = "identity" | "store" | null;

export default function Profile({
  user,
  savedPackIds = [],
  onPackSelect,
  onUnsavePack,
  onLogout,
  pickupStoreId = pickupStores[0].id,
  onPickupStoreChange,
  notifyEnabled = true,
  onNotifyToggle,
  onProfileUpdate,
  tags = mockUser.tags,
  onTagsChange,
  onEditTags,
}: ProfileProps) {
  const [showTagSuggestion, setShowTagSuggestion] = useState(true);

  /* 登入帳號優先，未登入時退回示範資料 */
  const displayName = user?.name ?? mockUser.name;
  const displayAvatar = user?.avatar ?? mockUser.avatar;
  const displaySub = user?.isGuest ? "訪客模式" : user?.email || mockUser.profile;

  const [editing, setEditing] = useState<EditingSection>(null);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [avatarDraft, setAvatarDraft] = useState(displayAvatar);
  const [savedHint, setSavedHint] = useState<EditingSection>(null);

  /* 上傳頭像照片 */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const store = pickupStores.find((s) => s.id === pickupStoreId) ?? pickupStores[0];

  /* 帳號換人（例如重新登入）時同步草稿 */
  useEffect(() => {
    setNameDraft(displayName);
    setAvatarDraft(displayAvatar);
  }, [displayName, displayAvatar]);

  /* 儲存提示 1.8 秒後淡出 */
  useEffect(() => {
    if (!savedHint) return;
    const t = window.setTimeout(() => setSavedHint(null), 1800);
    return () => window.clearTimeout(t);
  }, [savedHint]);

  const toggleSection = (section: Exclude<EditingSection, null>) => {
    setEditing((prev) => {
      if (prev === section) return null;
      if (section === "identity") {
        setNameDraft(displayName);
        setAvatarDraft(displayAvatar);
        setAvatarError(null);
      }
      return section;
    });
  };

  /* 選好照片 → 置中裁切壓縮後當成頭像草稿 */
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 讓同一張照片可以重新選
    if (!file) return;
    setAvatarError(null);
    setUploading(true);
    try {
      setAvatarDraft(await fileToAvatarDataUrl(file));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "圖片處理失敗");
    } finally {
      setUploading(false);
    }
  };

  const saveIdentity = () => {
    const name = nameDraft.trim();
    if (!name) return;
    onProfileUpdate?.({ name, avatar: avatarDraft });
    setEditing(null);
    setSavedHint("identity");
  };

  const selectStore = (id: string) => {
    onPickupStoreChange?.(id);
    setEditing(null);
    setSavedHint("store");
  };

  const removeTag = (tag: string) => onTagsChange?.(tags.filter((t) => t !== tag));

  /* 偏好設定列的共用樣式 */
  const rowButton: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    textAlign: "left",
  };
  const rowLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
  const rowValue: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: "#16232E",
    fontFamily: "var(--font-display)",
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
  const fieldLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#94A3B8",
    fontFamily: "var(--font-display)",
    marginBottom: 6,
  };
  const chevron = (open: boolean) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
    >
      <path d="M9 18l6-6-6-6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  const savedPill = (section: EditingSection) =>
    savedHint === section ? (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#16A34A",
          background: "#DCFCE7",
          padding: "2px 7px",
          borderRadius: 20,
          fontFamily: "var(--font-display)",
        }}
      >
        ✓ 已更新
      </span>
    ) : null;

  return (
    <div
      style={{
        height: "100%",
        background: "#F5F7FA",
        overflowY: "auto",
        paddingBottom: 100,
      }}
      className="scrollbar-hide"
    >
      {/* Profile hero */}
      <div
        style={{
          background: "linear-gradient(160deg, #4C6E91 0%, #6E92B4 100%)",
          padding: "60px 24px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -20,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ marginBottom: 12 }}>
            <AvatarView
              value={displayAvatar}
              size={72}
              fontSize={28}
              background="rgba(255,255,255,0.2)"
              border="3px solid rgba(255,255,255,0.4)"
            />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              color: "white",
              margin: 0,
              marginBottom: 4,
            }}
          >
            {displayName}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {displaySub}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Dynamic Tags */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F1F5F9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: "#16232E",
                margin: 0,
              }}
            >
              Dynamic Tags
            </h3>
            <button
              onClick={onEditTags}
              style={{
                fontSize: 13,
                color: "#4C6E91",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              編輯
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "#E7EEF5",
                  border: "1px solid rgba(76,110,145,0.2)",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#4C6E91", fontFamily: "var(--font-display)" }}>
                  {tag}
                </span>
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "rgba(76,110,145,0.15)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 10,
                    color: "#4C6E91",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Tag suggestion */}
          {showTagSuggestion && (
            <div
              style={{
                marginTop: 12,
                background: "#F5F7FA",
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
              }}
            >
              <p style={{ fontSize: 12, color: "#64748B", margin: 0, marginBottom: 8 }}>
                最近你經常選擇門市取貨，要加入 #FrequentPickup 嗎？
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (!tags.includes("#FrequentPickup")) onTagsChange?.([...tags, "#FrequentPickup"]);
                    setShowTagSuggestion(false);
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "none",
                    background: "#4C6E91",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  加入
                </button>
                <button
                  onClick={() => setShowTagSuggestion(false)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "1px solid #E2E8F0",
                    background: "white",
                    color: "#64748B",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  不用
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F1F5F9",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#16232E",
              margin: 0,
              marginBottom: 12,
            }}
          >
            偏好設定
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* 1. 更改頭像或名稱 */}
            <div style={{ borderBottom: "1px solid #F1F5F9" }}>
              <button onClick={() => toggleSection("identity")} style={rowButton} aria-expanded={editing === "identity"}>
                <span style={rowLabel}>
                  <span style={{ fontSize: 14, color: "#64748B" }}>頭像與名稱</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {savedPill("identity")}
                  <AvatarView value={displayAvatar} size={24} fontSize={11} />
                  <span style={rowValue}>{displayName}</span>
                  {chevron(editing === "identity")}
                </span>
              </button>

              {editing === "identity" && (
                <div
                  className="step-reveal"
                  style={{ background: "#F5F7FA", borderRadius: 12, padding: 12, margin: "2px 0 12px", border: "1px solid #E2E8F0" }}
                >
                  <div style={fieldLabel}>顯示名稱</div>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={20}
                    placeholder="輸入你的名稱"
                    className="input-ring"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #E2E8F0",
                      background: "white",
                      fontSize: 14,
                      fontFamily: "var(--font-body)",
                      color: "#16232E",
                      outline: "none",
                      marginBottom: 12,
                    }}
                  />

                  <div style={fieldLabel}>頭像</div>

                  {/* 上傳照片 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <AvatarView value={avatarDraft} size={56} border="2px solid white" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            border: "1.5px solid #4C6E91",
                            background: "white",
                            color: "#4C6E91",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            cursor: uploading ? "default" : "pointer",
                          }}
                        >
                          {uploading ? "處理中…" : isPhotoAvatar(avatarDraft) ? "換一張照片" : "上傳照片"}
                        </button>
                        {isPhotoAvatar(avatarDraft) && (
                          <button
                            onClick={() => {
                              setAvatarDraft(avatarOptions[0]);
                              setAvatarError(null);
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              border: "1.5px solid #E2E8F0",
                              background: "white",
                              color: "#64748B",
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: "var(--font-display)",
                              cursor: "pointer",
                            }}
                          >
                            移除照片
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: avatarError ? "#DC2626" : "#94A3B8", marginTop: 6, lineHeight: 1.5 }}>
                        {avatarError ?? "支援 JPG / PNG，5MB 以內，會自動裁成正方形"}
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    style={{ display: "none" }}
                    aria-hidden="true"
                    tabIndex={-1}
                  />

                  <div style={{ ...fieldLabel, marginTop: 4 }}>或選一個現成樣式</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {avatarOptions.map((a) => {
                      const active = a === avatarDraft;
                      return (
                        <button
                          key={a}
                          onClick={() => setAvatarDraft(a)}
                          aria-label={`選擇頭像 ${a}`}
                          aria-pressed={active}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: active ? "2px solid #4C6E91" : "1.5px solid #E2E8F0",
                            background: active ? "linear-gradient(135deg, #4C6E91, #6E92B4)" : "white",
                            color: active ? "white" : "#64748B",
                            fontSize: a.length > 1 ? 13 : 18,
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={saveIdentity}
                      disabled={!nameDraft.trim()}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 10,
                        border: "none",
                        background: nameDraft.trim() ? "linear-gradient(135deg, #4C6E91, #6E92B4)" : "#CBD5E1",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        cursor: nameDraft.trim() ? "pointer" : "default",
                      }}
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        border: "1.5px solid #E2E8F0",
                        background: "white",
                        color: "#64748B",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        cursor: "pointer",
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 常用取貨門市 */}
            <div style={{ borderBottom: "1px solid #F1F5F9" }}>
              <button onClick={() => toggleSection("store")} style={rowButton} aria-expanded={editing === "store"}>
                <span style={rowLabel}>
                  <span style={{ fontSize: 14, color: "#64748B" }}>常用取貨門市</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {savedPill("store")}
                  <span style={rowValue}>{store.name}</span>
                  {chevron(editing === "store")}
                </span>
              </button>

              {editing === "store" && (
                <div className="step-reveal" style={{ display: "flex", flexDirection: "column", gap: 8, margin: "2px 0 12px" }}>
                  {pickupStores.map((s) => {
                    const active = s.id === store.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => selectStore(s.id)}
                        aria-pressed={active}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: active ? "1.5px solid #4C6E91" : "1.5px solid #E2E8F0",
                          background: active ? "#E7EEF5" : "white",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: active ? "5px solid #4C6E91" : "2px solid #CBD5E1",
                            background: "white",
                            flexShrink: 0,
                            transition: "border 0.15s",
                          }}
                        />
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              display: "block",
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: 13,
                              color: "#16232E",
                            }}
                          >
                            {s.name}
                          </span>
                          <span style={{ display: "block", fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.address}</span>
                          <span style={{ display: "block", fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{s.note}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. 允許通知 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>允許通知</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    {notifyEnabled ? "行程快到與商品到貨都會提醒你" : "已關閉，首頁鈴鐺不會有提醒"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNotifyToggle?.(!notifyEnabled)}
                role="switch"
                aria-checked={notifyEnabled}
                aria-label="允許通知"
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: notifyEnabled ? "#4C6E91" : "#CBD5E1",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  border: "none",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    left: notifyEnabled ? 22 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Saved packs */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid #F1F5F9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16232E", margin: 0 }}>
              🔖 常用行程包
            </h3>
            <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "var(--font-display)" }}>
              {savedPackIds.length} 個已儲存
            </span>
          </div>
          {savedPackIds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔖</div>
              <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "var(--font-display)" }}>尚未儲存任何行程包</div>
              <div style={{ fontSize: 11, color: "#A9C0D6", marginTop: 4 }}>在行程包頁面點擊書籤圖示即可儲存</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedPackIds.map((id) => {
                const pack = scenarioPacks.find((p) => p.id === id);
                if (!pack) return null;
                return (
                  <div
                    key={id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: pack.bgColor, border: `1px solid ${pack.color}20`, cursor: "pointer" }}
                    onClick={() => onPackSelect?.(id)}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: pack.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {pack.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16232E" }}>{pack.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{pack.description}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onPackSelect?.(id); }}
                        style={{ padding: "5px 12px", borderRadius: 20, border: "none", background: pack.color, color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)" }}
                      >使用</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onUnsavePack?.(id); }}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${pack.color}40`, background: "white", color: pack.color, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >🔖</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "15px",
              borderRadius: 16,
              border: "1.5px solid #FCA5A5",
              background: "white",
              color: "#DC2626",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            登出
          </button>
        )}
      </div>
    </div>
  );
}
