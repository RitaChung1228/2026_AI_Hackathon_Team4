/* 頭像可以是文字（英文縮寫 / emoji）或使用者上傳的照片（data URL） */

/** 上傳照片的大小上限（原始檔案） */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** 壓縮後儲存的邊長，避免 data URL 過大 */
const AVATAR_SIZE = 240;

/** 是否為照片型頭像 */
export function isPhotoAvatar(value: string): boolean {
  return value.startsWith("data:image") || value.startsWith("http");
}

/**
 * 讀取使用者選的圖片，置中裁成正方形並縮到 240px 後回傳 data URL。
 * 檔案不是圖片或過大時 reject，由呼叫端顯示錯誤訊息。
 */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("請選擇圖片檔"));
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return Promise.reject(new Error("圖片請小於 5MB"));
  }

  const url = URL.createObjectURL(file);
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("瀏覽器不支援圖片處理");

        /* 置中裁切成正方形 */
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("圖片處理失敗"));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("圖片讀取失敗"));
    };
    img.src = url;
  });
}
