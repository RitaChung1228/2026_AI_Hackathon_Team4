import type { GetWeatherInput, GetWeatherOutput } from "./types.js";

/**
 * 查詢天氣資訊
 * 後端 B 實作：接外部 Weather API
 */
export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput> {
  // TODO: 後端 B 實作真正的 Weather API 呼叫
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const today = new Date().toISOString().split("T")[0];

  return {
    city: input.city,
    date: input.date ?? today,
    temperature: 28,
    condition: "多雲",
    rainProbability: 60,
    suggestion: "降雨機率偏高，建議攜帶雨具",
  };
}
