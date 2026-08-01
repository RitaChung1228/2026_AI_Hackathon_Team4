import type { GetUserProfileInput, GetUserProfileOutput } from "./types.js";

/**
 * 取得使用者偏好 Profile
 * 後端 B 實作：接上 DynamoDB 查詢
 */
export async function getUserProfile(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
  // TODO: 後端 B 實作真正的 DynamoDB 查詢
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const mockProfile = {
    userId: input.userId,
    hashtags: ["#效率優先", "#商務出差", "#咖啡控", "#行動支付"],
    preferences: {
      decisionStyle: "效率優先",
      lifestyle: "商務出差",
      habits: ["超商取貨", "行動支付", "外送常客"],
    },
  };

  return { profile: mockProfile };
}
