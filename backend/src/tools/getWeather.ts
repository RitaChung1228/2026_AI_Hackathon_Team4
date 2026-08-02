import type { GetWeatherInput, GetWeatherOutput } from "./types.js";

/**
 * 城市 → 經緯度對照（台灣 + 常見國際城市）
 */
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // 台灣
  台北: { lat: 25.033, lon: 121.565 },
  新北: { lat: 25.012, lon: 121.465 },
  桃園: { lat: 24.994, lon: 121.301 },
  台中: { lat: 24.148, lon: 120.674 },
  台南: { lat: 22.999, lon: 120.227 },
  高雄: { lat: 22.627, lon: 120.301 },
  新竹: { lat: 24.804, lon: 120.972 },
  基隆: { lat: 25.128, lon: 121.739 },
  嘉義: { lat: 23.480, lon: 120.449 },
  花蓮: { lat: 23.992, lon: 121.601 },
  宜蘭: { lat: 24.757, lon: 121.753 },
  屏東: { lat: 22.669, lon: 120.486 },
  彰化: { lat: 24.081, lon: 120.538 },
  南投: { lat: 23.749, lon: 120.688 },
  雲林: { lat: 23.709, lon: 120.432 },
  苗栗: { lat: 24.560, lon: 120.821 },
  台東: { lat: 22.756, lon: 121.144 },
  澎湖: { lat: 23.571, lon: 119.579 },
  // 國際
  東京: { lat: 35.682, lon: 139.759 },
  大阪: { lat: 34.694, lon: 135.502 },
  首爾: { lat: 37.566, lon: 126.978 },
  新加坡: { lat: 1.352, lon: 103.820 },
  香港: { lat: 22.302, lon: 114.177 },
  上海: { lat: 31.230, lon: 121.474 },
  北京: { lat: 39.904, lon: 116.407 },
  紐約: { lat: 40.713, lon: -74.006 },
  倫敦: { lat: 51.507, lon: -0.128 },
  巴黎: { lat: 48.857, lon: 2.352 },
};

/**
 * 把 WMO weather code 轉成中文天氣描述
 */
function weatherCodeToCondition(code: number): string {
  if (code === 0) return "晴天";
  if (code <= 3) return "多雲";
  if (code <= 48) return "霧";
  if (code <= 57) return "毛毛雨";
  if (code <= 67) return "雨天";
  if (code <= 77) return "雪";
  if (code <= 82) return "陣雨";
  if (code <= 86) return "雪陣";
  if (code >= 95) return "雷雨";
  return "多雲";
}

/**
 * 根據天氣狀況產生建議
 */
function getSuggestion(condition: string, rainProb: number, temp: number): string {
  const tips: string[] = [];
  if (rainProb >= 60) tips.push("降雨機率高，建議攜帶雨具");
  else if (rainProb >= 30) tips.push("有機會下雨，可帶把傘備用");
  if (temp >= 35) tips.push("高溫炎熱，注意防曬補水");
  else if (temp >= 30) tips.push("天氣偏熱，建議穿著輕便");
  else if (temp <= 10) tips.push("天氣寒冷，記得穿外套保暖");
  if (condition === "雷雨") tips.push("有雷雨，盡量避免戶外活動");
  if (tips.length === 0) tips.push("天氣適宜外出，祝你愉快");
  return tips.join("；");
}

/**
 * 查詢天氣資訊 — 使用 Open-Meteo API（免費、無需 API Key）
 */
export async function getWeather(input: GetWeatherInput): Promise<GetWeatherOutput> {
  const city = input.city.trim();
  const today = new Date().toISOString().split("T")[0];
  const date = input.date ?? today;

  // 查找城市座標
  const coords = CITY_COORDS[city];
  if (!coords) {
    // 找不到座標，回傳 fallback
    return {
      city,
      date,
      temperature: 0,
      condition: "未知",
      rainProbability: 0,
      suggestion: `抱歉，目前不支援「${city}」的天氣查詢。支援的城市：${Object.keys(CITY_COORDS).join("、")}`,
    };
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lon));
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code");
    url.searchParams.set("timezone", "Asia/Taipei");
    url.searchParams.set("start_date", date);
    url.searchParams.set("end_date", date);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Open-Meteo API 回傳 ${res.status}`);
    }

    const data = await res.json() as {
      daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
        weather_code: number[];
      };
    };

    const maxTemp = data.daily.temperature_2m_max[0];
    const minTemp = data.daily.temperature_2m_min[0];
    const avgTemp = Math.round((maxTemp + minTemp) / 2);
    const rainProb = data.daily.precipitation_probability_max[0] ?? 0;
    const weatherCode = data.daily.weather_code[0] ?? 0;
    const condition = weatherCodeToCondition(weatherCode);
    const suggestion = getSuggestion(condition, rainProb, maxTemp);

    return {
      city,
      date,
      temperature: avgTemp,
      condition,
      rainProbability: rainProb,
      suggestion,
    };
  } catch (err) {
    console.error("[getWeather] API 呼叫失敗:", err);
    // fallback mock
    return {
      city,
      date,
      temperature: 28,
      condition: "多雲",
      rainProbability: 50,
      suggestion: "天氣資料暫時無法取得，建議出門前確認一下天氣",
    };
  }
}
