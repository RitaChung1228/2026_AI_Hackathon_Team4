import { getUserProfile } from "../tools/getUserProfile.js";
import type { UserProfile } from "../tools/types.js";

/**
 * 取得使用者偏好 Profile。
 *
 * 直接沿用 get_user_profile tool 的實作，確保「AI 看到的 profile」
 * 和「前端畫面顯示的 profile」永遠是同一份資料、同一種形狀。
 * 查不到使用者時 tool 會回一個空的預設 profile，不會拋錯。
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const { profile } = await getUserProfile({ userId });
  return profile;
}
