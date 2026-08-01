import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { GetUserProfileInput, GetUserProfileOutput } from "./types.js";

const TABLE_NAME = process.env.DYNAMO_USER_PROFILE_TABLE ?? "UserProfile";

/**
 * 取得使用者偏好 Profile
 * 從 DynamoDB UserProfile table 查詢
 */
export async function getUserProfile(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { user_id: input.userId },
    })
  );

  if (!Item) {
    // 找不到就回傳預設 profile
    return {
      profile: {
        userId: input.userId,
        hashtags: [],
        preferences: { decisionStyle: "未設定", lifestyle: "未設定", habits: [] },
      },
    };
  }

  return {
    profile: {
      userId: Item.user_id,
      hashtags: Item.tags ?? [],
      preferences: {
        decisionStyle: Item.preferences?.priority ?? "未設定",
        lifestyle: Item.role_title ?? "未設定",
        habits: Item.tags?.filter((t: string) => t.startsWith("#")) ?? [],
      },
    },
  };
}
