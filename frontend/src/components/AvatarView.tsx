import { isPhotoAvatar } from "../avatarUtils";

interface AvatarViewProps {
  /* 文字（縮寫 / emoji）或照片 data URL */
  value: string;
  size: number;
  fontSize?: number;
  /* 文字頭像的底色，照片頭像會被照片蓋掉 */
  background?: string;
  border?: string;
  color?: string;
}

/** 依頭像內容自動決定顯示照片或文字 */
export default function AvatarView({
  value,
  size,
  fontSize,
  background = "linear-gradient(135deg, #4C6E91, #6E92B4)",
  border,
  color = "white",
}: AvatarViewProps) {
  const photo = isPhotoAvatar(value);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: photo ? "#E7EEF5" : background,
        border,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {photo ? (
        <img src={value} alt="頭像" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: fontSize ?? Math.round(size * 0.4),
            color,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
