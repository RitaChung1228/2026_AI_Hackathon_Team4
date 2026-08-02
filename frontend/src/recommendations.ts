/**
 * 推薦目錄：依「使用者的行程包」與「購物車內容」挑選相關商品／服務。
 * 服務商皆為自創虛擬名稱（黑客松規則），不使用真實或競業品牌。
 */
import type { CartItem, ScheduledTrip } from "./types";

export interface RecoItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  vendor: string;
  kind: "product" | "service";
  icon: string;
  tag?: string;
  /** 關聯情境包 id */
  packIds: string[];
  /** 購物車出現這些商品時，這項會被當作搭配推薦 */
  pairsWith: string[];
  /** 沒有行程也沒有購物車內容時的預設精選 */
  featured?: boolean;
  /** 實拍圖；沒有圖片的服務改以品牌色磁磚呈現 */
  image?: string;
  /** 磁磚底色（無 image 時使用） */
  tint?: string;
}

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop&auto=format`;

export const recoCatalog: RecoItem[] = [
  /* ── 商務出差 ── */
  {
    id: "esim", name: "日本 eSIM 5GB", detail: "5 天 / 免換卡", price: 399,
    vendor: "悠選生活商城", kind: "product", icon: "📶", tag: "最快速",
    packIds: ["business-trip"], pairsWith: [], featured: true,
    image: IMG("1753385158278-387d4dda60c4"),
  },
  {
    id: "adapter", name: "萬國轉接頭", detail: "日本 / 全球適用", price: 299,
    vendor: "悠選生活商城", kind: "product", icon: "🔌", tag: "出差必備",
    packIds: ["business-trip"], pairsWith: ["esim"],
    image: IMG("1749498682646-45e7c11506ec"),
  },
  {
    id: "powerbank", name: "行動電源 20000mAh", detail: "PD 65W 快充", price: 799,
    vendor: "悠選生活商城", kind: "product", icon: "🔋", tag: "熱銷",
    packIds: ["business-trip"], pairsWith: ["esim", "adapter"],
    image: IMG("1502301197179-65228ab57f78"),
  },
  {
    id: "airport-ride", name: "機場接送（單程）", detail: "指定時間到府", price: 1280,
    vendor: "捷行接送", kind: "service", icon: "🚕", tag: "準時保證",
    packIds: ["business-trip"], pairsWith: ["esim", "biz-hotel"],
    image: IMG("1561380263-46623ae537fb"),
  },
  {
    id: "biz-hotel", name: "商務旅館 1 晚", detail: "標準雙人房 / 含早餐", price: 3800,
    vendor: "好味餐旅集團", kind: "service", icon: "🏨", tag: "步行 5 分",
    packIds: ["business-trip"], pairsWith: ["airport-ride"],
    image: IMG("1542051841857-5f90071e7989"),
  },
  {
    id: "travel-insure", name: "旅平險 2 天", detail: "最高 500 萬保障", price: 450,
    vendor: "安馨保障服務", kind: "service", icon: "🛡", tag: "推薦",
    packIds: ["business-trip"], pairsWith: ["esim", "airport-ride", "biz-hotel"],
    image: IMG("1582820795651-f358eebe4406"),
  },
  {
    id: "clicker", name: "藍牙簡報筆", detail: "2.4G / 附收納盒", price: 990,
    vendor: "悠選生活商城", kind: "product", icon: "🖊", tag: "商務常用",
    packIds: ["business-trip"], pairsWith: ["powerbank"],
    image: IMG("1758525588495-0fa7618da4a3"),
  },

  /* ── 生日準備 ── */
  {
    id: "cake", name: "生日蛋糕 6 吋", detail: "草莓奶油 / 今日可取", price: 780,
    vendor: "好味餐旅集團", kind: "product", icon: "🎂", tag: "今日可取",
    packIds: ["birthday"], pairsWith: [],
    image: IMG("1545696563-af8f6ec2295a"),
  },
  {
    id: "gift", name: "精品禮物組", detail: "保養品組合 / 附提袋", price: 680,
    vendor: "悠選生活商城", kind: "product", icon: "🎁", tag: "推薦",
    packIds: ["birthday"], pairsWith: ["cake"],
    image: IMG("1577998474517-7eeeed4e448a"),
  },
  {
    id: "flower-bouquet", name: "生日花束", detail: "季節花材 / 當日配送", price: 890,
    vendor: "花時光花藝", kind: "product", icon: "💐", tag: "當日配送",
    packIds: ["birthday"], pairsWith: ["cake", "gift"], tint: "#FCE7F3",
  },
  {
    id: "party-booking", name: "慶生訂位（4 人）", detail: "包廂 2 小時 / 可布置", price: 300,
    vendor: "好味餐旅集團", kind: "service", icon: "🍽", tag: "可布置",
    packIds: ["birthday"], pairsWith: ["cake"], tint: "#FFF7ED",
  },
  {
    id: "food-delivery", name: "派對外送拼盤", detail: "6-8 人份 / 指定時段", price: 1180,
    vendor: "好味餐旅集團", kind: "service", icon: "🍱", tag: "免運",
    packIds: ["birthday"], pairsWith: ["cake", "gift"], featured: true, tint: "#EDE9FF",
  },

  /* ── 居家修繕（核心情境） ── */
  {
    id: "plumber-visit", name: "水電師傅到府檢修", detail: "含基本工資 / 30 分鐘", price: 800,
    vendor: "職人水電工坊", kind: "service", icon: "🔧", tag: "最快今日",
    packIds: ["home-repair"], pairsWith: ["sealant", "plumber-tape", "caulk"], featured: true,
    image: IMG("1621905251189-08b45d6a269e"),
  },
  {
    id: "sealant", name: "止水帶", detail: "專業防水用", price: 120,
    vendor: "悠選生活商城", kind: "product", icon: "🧴", tag: "必備",
    packIds: ["home-repair"], pairsWith: [],
    image: IMG("1581783898377-1c85bf937427"),
  },
  {
    id: "plumber-tape", name: "生料帶 5m", detail: "加厚款 / 螺紋密封", price: 60,
    vendor: "悠選生活商城", kind: "product", icon: "🔩", tag: "常用",
    packIds: ["home-repair"], pairsWith: ["sealant"],
    image: IMG("1676210133055-eab6ef033ce3"),
  },
  {
    id: "caulk", name: "防霉矽利康", detail: "白色 / 浴室適用", price: 180,
    vendor: "悠選生活商城", kind: "product", icon: "🏠", tag: "推薦",
    packIds: ["home-repair"], pairsWith: ["sealant", "plumber-tape"],
    image: IMG("1645651964715-d200ce0939cc"),
  },
  {
    id: "deep-clean", name: "浴室深層清潔", detail: "除霉除垢 / 約 2 小時", price: 1600,
    vendor: "晴語家居服務", kind: "service", icon: "🧼", tag: "修繕後推薦",
    packIds: ["home-repair"], pairsWith: ["caulk", "plumber-visit"], tint: "#DCFCE7",
  },

  /* ── 寵物看診 ── */
  {
    id: "pet-checkup", name: "寵物健康檢查", detail: "基礎血檢 + 觸診", price: 1800,
    vendor: "毛日子寵物照護", kind: "service", icon: "🩺", tag: "可線上掛號",
    packIds: ["pet-care"], pairsWith: ["pet-food"], featured: true, tint: "#EDE9FF",
  },
  {
    id: "pet-food", name: "主食罐頭 6 入", detail: "雞肉口味 / 成貓用", price: 420,
    vendor: "悠選生活商城", kind: "product", icon: "🥣", tag: "熱銷",
    packIds: ["pet-care"], pairsWith: [],
    image: IMG("1450778869180-41d0601e046e"),
  },
  {
    id: "litter", name: "礦物砂 10L", detail: "快速結團除臭", price: 280,
    vendor: "悠選生活商城", kind: "product", icon: "🪣", tag: "定期補充",
    packIds: ["pet-care"], pairsWith: ["pet-food"],
    image: IMG("1623387641168-d9803ddd3f35"),
  },
  {
    id: "pet-toy", name: "逗貓棒", detail: "羽毛款 / 可替換", price: 160,
    vendor: "悠選生活商城", kind: "product", icon: "🎾", tag: "推薦",
    packIds: ["pet-care"], pairsWith: ["pet-food", "litter"],
    image: IMG("1563460716037-460a3ad24ba9"),
  },
  {
    id: "pet-taxi", name: "寵物友善接送", detail: "單程 / 含籠具固定", price: 350,
    vendor: "捷行接送", kind: "service", icon: "🚗", tag: "看診日適用",
    packIds: ["pet-care"], pairsWith: ["pet-checkup"], tint: "#FFF7ED",
  },

  /* ── 搬家準備 ── */
  {
    id: "moving-service", name: "小型搬家服務", detail: "1 車次 / 含 2 位師傅", price: 3200,
    vendor: "輕安搬家", kind: "service", icon: "🚚", tag: "可預約假日",
    packIds: ["moving"], pairsWith: ["moving-box"],
    image: IMG("1730154838368-c37b1fdebcf6"),
  },
  {
    id: "moving-box", name: "搬家紙箱 10 入", detail: "雙層瓦楞 / 附提把", price: 450,
    vendor: "悠選生活商城", kind: "product", icon: "📦", tag: "必備",
    packIds: ["moving"], pairsWith: [], tint: "#FFF7ED",
  },
  {
    id: "bubble-wrap", name: "氣泡布 20m", detail: "易碎品包裝用", price: 220,
    vendor: "悠選生活商城", kind: "product", icon: "🫧", tag: "搭配推薦",
    packIds: ["moving"], pairsWith: ["moving-box"], tint: "#EDE9FF",
  },
  {
    id: "new-home-clean", name: "新居入住清潔", detail: "3 房 / 約 4 小時", price: 2400,
    vendor: "晴語家居服務", kind: "service", icon: "🧹", tag: "入住前推薦",
    packIds: ["moving"], pairsWith: ["moving-service", "moving-box"], tint: "#DCFCE7",
  },
  {
    id: "parcel-send", name: "包裹寄送（5 件）", detail: "隔日到府取件", price: 380,
    vendor: "順遞快運", kind: "service", icon: "📮", tag: "免出門",
    packIds: ["moving"], pairsWith: ["moving-box"], featured: true, tint: "#EDE9FF",
  },

  /* ── 健身計畫 ── */
  {
    id: "pt-session", name: "一對一教練課 3 堂", detail: "含體態評估", price: 2700,
    vendor: "動能健身工作室", kind: "service", icon: "💪", tag: "新客優惠",
    packIds: ["fitness"], pairsWith: [],
    image: IMG("1526506118085-60ce8714f8c5"),
  },
  {
    id: "protein", name: "乳清蛋白 1kg", detail: "巧克力風味", price: 1290,
    vendor: "悠選生活商城", kind: "product", icon: "🥤", tag: "熱銷",
    packIds: ["fitness"], pairsWith: ["pt-session"], tint: "#EDE9FF",
  },
  {
    id: "yoga-mat", name: "加厚瑜珈墊", detail: "10mm / 附背帶", price: 690,
    vendor: "悠選生活商城", kind: "product", icon: "🧘", tag: "推薦",
    packIds: ["fitness"], pairsWith: ["pt-session"], tint: "#DCFCE7",
  },
  {
    id: "meal-plan", name: "健身餐外送 5 餐", detail: "高蛋白 / 低油", price: 1250,
    vendor: "好味餐旅集團", kind: "service", icon: "🥗", tag: "配合訓練",
    packIds: ["fitness"], pairsWith: ["protein", "pt-session"], tint: "#FFF7ED",
  },
];

const byId = new Map(recoCatalog.map((r) => [r.id, r]));

export function getRecoById(id: string): RecoItem | undefined {
  return byId.get(id);
}

/** 某個情境包的推薦（排除已在購物車的品項） */
export function recosForPack(packId: string, cartIds: string[], limit = 4): RecoItem[] {
  return recoCatalog.filter((r) => r.packIds.includes(packId) && !cartIds.includes(r.id)).slice(0, limit);
}

/** 依購物車內容找搭配推薦，並附上「因為你買了 X」的理由 */
export function recosForCart(cart: CartItem[], limit = 6): { item: RecoItem; because: string }[] {
  const cartIds = cart.map((i) => i.id);
  const nameOf = (id: string) => cart.find((i) => i.id === id)?.name ?? getRecoById(id)?.name ?? "";
  return recoCatalog
    .filter((r) => !cartIds.includes(r.id) && r.pairsWith.some((p) => cartIds.includes(p)))
    .map((r) => ({ item: r, because: nameOf(r.pairsWith.find((p) => cartIds.includes(p))!) }))
    .slice(0, limit);
}

/** 沒有行程也沒有購物車時的精選 */
export function featuredRecos(cartIds: string[], limit = 6): RecoItem[] {
  const featured = recoCatalog.filter((r) => r.featured && !cartIds.includes(r.id));
  const rest = recoCatalog.filter((r) => !r.featured && !cartIds.includes(r.id));
  return [...featured, ...rest].slice(0, limit);
}

/** 首頁區塊：每個行程一組，依日期由近到遠 */
export function tripSections(trips: ScheduledTrip[], cartIds: string[]) {
  return trips
    .map((trip) => ({ trip, items: recosForPack(trip.packId, cartIds) }))
    .filter((s) => s.items.length > 0);
}
