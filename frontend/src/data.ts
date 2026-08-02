export const mockUser = {
  name: "Jamie",
  profile: "Busy Professional",
  avatar: "JL",
  tags: ["#TimeSaver", "#FrequentPickup", "#Traveler", "#CoffeeLover"],
};

/** 常用取貨門市選項，訂單到貨提醒會用選定的門市 */
export const pickupStores = [
  { id: "songren", name: "7-ELEVEN 松仁門市", address: "台北市信義區松仁路 100 號", note: "距離 240m · 24 小時" },
  { id: "xinyi", name: "7-ELEVEN 信義門市", address: "台北市信義區信義路五段 7 號", note: "距離 600m · 24 小時" },
  { id: "family-taipei101", name: "全家 台北 101 店", address: "台北市信義區市府路 45 號", note: "距離 850m · 07:00–23:00" },
  { id: "hilife-zhongxiao", name: "萊爾富 忠孝門市", address: "台北市大安區忠孝東路四段 45 號", note: "距離 1.2km · 24 小時" },
];

/** 頭像可選的樣式（英文縮寫或表情） */
export const avatarOptions = ["JL", "🙂", "😎", "🐱", "🐶", "🌿", "⚡", "🎧"];

export const UNSPLASH = {
  tokyo: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=400&fit=crop&auto=format",
  tokyoStreet: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=400&fit=crop&auto=format",
  tokyoAerial: "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800&h=400&fit=crop&auto=format",
  birthdayCake: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=800&h=400&fit=crop&auto=format",
  convenienceStore: "https://images.unsplash.com/photo-1749498682646-45e7c11506ec?w=800&h=400&fit=crop&auto=format",
  simCard: "https://images.unsplash.com/photo-1753385158278-387d4dda60c4?w=400&h=300&fit=crop&auto=format",
  taxi: "https://images.unsplash.com/photo-1561380263-46623ae537fb?w=400&h=300&fit=crop&auto=format",
  suitcase: "https://images.unsplash.com/photo-1502301197179-65228ab57f78?w=400&h=300&fit=crop&auto=format",
  professional: "https://images.unsplash.com/photo-1758525588495-0fa7618da4a3?w=400&h=300&fit=crop&auto=format",
  homeRepair: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop&auto=format",
  homeTools: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=400&fit=crop&auto=format",
  plumber: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?w=800&h=400&fit=crop&auto=format",
  petCare: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800&h=400&fit=crop&auto=format",
  moving: "https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6?w=800&h=400&fit=crop&auto=format",
  fitness: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=400&fit=crop&auto=format",
};

export const scenarioPacks = [
  {
    id: "business-trip",
    icon: "💼",
    name: "商務出差",
    color: "#4C6E91",
    bgColor: "#E7EEF5",
    image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=600&h=280&fit=crop&auto=format",
    description: "快速完成出差前的必要準備",
    modules: [
      { id: "flight", icon: "✈️", name: "交通安排", enabled: true },
      { id: "hotel", icon: "🏨", name: "住宿", enabled: true },
      { id: "checklist", icon: "📋", name: "Checklist", enabled: true },
      { id: "esim", icon: "📶", name: "eSIM", enabled: true },
      { id: "insurance", icon: "🛡", name: "旅平險", enabled: true },
      { id: "goods", icon: "🛒", name: "必備用品", enabled: true },
      { id: "transfer", icon: "🚕", name: "機場接送", enabled: true },
      { id: "pickup", icon: "📦", name: "門市取貨", enabled: true },
      { id: "reminder", icon: "⏰", name: "Reminder", enabled: true },
    ],
  },
  {
    id: "home-repair",
    icon: "🔧",
    name: "居家修繕",
    color: "#EA580C",
    bgColor: "#FFF7ED",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=280&fit=crop&auto=format",
    description: "快速找師傅、比報價、追進度",
    modules: [
      { id: "diagnose", icon: "🔍", name: "問題診斷", enabled: true },
      { id: "technician", icon: "👷", name: "師傅媒合", enabled: true },
      { id: "quote", icon: "💰", name: "報價比較", enabled: true },
      { id: "parts", icon: "🔧", name: "零件採購", enabled: true },
      { id: "schedule", icon: "📅", name: "時段安排", enabled: true },
      { id: "reminder", icon: "⏰", name: "到場提醒", enabled: true },
    ],
  },
  {
    id: "pet-care",
    icon: "🐾",
    name: "寵物照護",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=600&h=280&fit=crop&auto=format",
    description: "預約看診、採購用品一手包辦",
    modules: [
      { id: "clinic", icon: "🏥", name: "動物醫院", enabled: true },
      { id: "appointment", icon: "📅", name: "預約看診", enabled: true },
      { id: "supplies", icon: "🛒", name: "寵物用品", enabled: true },
      { id: "reminder", icon: "⏰", name: "Reminder", enabled: true },
    ],
  },
  {
    id: "moving",
    icon: "📦",
    name: "搬家準備",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
    image: "https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6?w=600&h=280&fit=crop&auto=format",
    description: "搬家公司比價、打包清單、地址通知",
    modules: [
      { id: "company", icon: "🚚", name: "搬家公司", enabled: true },
      { id: "packing", icon: "📦", name: "打包清單", enabled: true },
      { id: "utilities", icon: "💡", name: "水電申請", enabled: true },
      { id: "notify", icon: "📮", name: "地址通知", enabled: true },
      { id: "checklist", icon: "📋", name: "Checklist", enabled: true },
    ],
  },
  {
    id: "fitness",
    icon: "💪",
    name: "健身計畫",
    color: "#3B5876",
    bgColor: "#E7EEF5",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=280&fit=crop&auto=format",
    description: "課表規劃、補給品採購、追蹤進度",
    modules: [
      { id: "gym", icon: "🏋️", name: "健身房", enabled: true },
      { id: "schedule", icon: "📅", name: "訓練課表", enabled: true },
      { id: "nutrition", icon: "🥗", name: "飲食計畫", enabled: true },
      { id: "supplements", icon: "💊", name: "補給品", enabled: true },
    ],
  },
  {
    id: "birthday",
    icon: "🎂",
    name: "生日慶祝",
    color: "#DB2777",
    bgColor: "#FCE7F3",
    image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=600&h=280&fit=crop&auto=format",
    description: "讓朋友的生日更難忘",
    modules: [
      { id: "cake", icon: "🎂", name: "蛋糕", enabled: true },
      { id: "gift", icon: "🎁", name: "禮物", enabled: true },
      { id: "transport", icon: "🚌", name: "交通", enabled: true },
      { id: "reminder", icon: "⏰", name: "Reminder", enabled: true },
    ],
  },
];

export const products = [
  { id: "esim", icon: "📶", name: "日本 eSIM", detail: "5GB / 5 Days", price: 399, tag: "最快速", reason: "符合你的 #TimeSaver 偏好", reasonTag: "timesaver", image: "https://images.unsplash.com/photo-1753385158278-387d4dda60c4?w=120&h=90&fit=crop&auto=format" },
  { id: "adapter", icon: "🔌", name: "萬國轉接頭", detail: "日本 / 全球適用", price: 299, tag: "必備", reason: "出差必備，可門市取貨", reasonTag: "pickup", image: "/images/adapter.jpg" },
  { id: "clicker", icon: "🖊", name: "簡報筆", detail: "藍牙 / 2.4G", price: 990, tag: "推薦", reason: "商務出差常用工具", reasonTag: "business", image: "https://images.unsplash.com/photo-1758525588495-0fa7618da4a3?w=120&h=90&fit=crop&auto=format" },
  { id: "powerbank", icon: "🔋", name: "行動電源", detail: "20000mAh / PD65W", price: 799, tag: "熱銷", reason: "符合你的長途旅行需求", reasonTag: "traveler", image: "https://images.unsplash.com/photo-1502301197179-65228ab57f78?w=120&h=90&fit=crop&auto=format" },
  { id: "cake", icon: "🎂", name: "生日蛋糕", detail: "6吋 草莓奶油", price: 780, tag: "今日可取", reason: "附近門市今日 18:30 後可取", reasonTag: "pickup", image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=120&h=90&fit=crop&auto=format" },
  { id: "gift", icon: "🎁", name: "精品禮物組", detail: "保養品組合", price: 680, tag: "推薦", reason: "符合生日場合", reasonTag: "birthday", image: "https://images.unsplash.com/photo-1577998474517-7eeeed4e448a?w=120&h=90&fit=crop&auto=format" },
];

export const homeRepairProducts = [
  { id: "sealant", icon: "🧴", name: "止水帶", detail: "專業防水用", price: 120, tag: "必備", reason: "水管漏水必備", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=120&h=90&fit=crop&auto=format" },
  { id: "plumber-tape", icon: "🔧", name: "生料帶", detail: "5m 加厚款", price: 60, tag: "常用", reason: "螺紋接頭密封", image: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?w=120&h=90&fit=crop&auto=format" },
  { id: "caulk", icon: "🏠", name: "矽利康", detail: "防霉白色款", price: 180, tag: "推薦", reason: "浴室縫隙填補", image: "https://images.unsplash.com/photo-1645651964715-d200ce0939cc?w=120&h=90&fit=crop&auto=format" },
];

export const petProducts = [
  { id: "pet-food", icon: "🥣", name: "主食罐頭 6入", detail: "雞肉口味 成貓用", price: 420, tag: "熱銷", reason: "你的寵物年齡適用", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=120&h=90&fit=crop&auto=format" },
  { id: "litter", icon: "🪣", name: "礦物砂 10L", detail: "快速結團除臭", price: 280, tag: "補充", reason: "定期補充品", image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=120&h=90&fit=crop&auto=format" },
  { id: "pet-toy", icon: "🎾", name: "逗貓棒", detail: "羽毛款 可替換", price: 160, tag: "推薦", reason: "增進互動運動", image: "https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?w=120&h=90&fit=crop&auto=format" },
];

export const services = [
  { id: "yoxi", icon: "🚕", name: "yoxi 機場接送", detail: "06:00 出發", price: 1280, tag: "已預約", reason: "符合你的 #TimeSaver 偏好", reasonTag: "timesaver", image: "https://images.unsplash.com/photo-1561380263-46623ae537fb?w=120&h=90&fit=crop&auto=format" },
  { id: "insurance", icon: "🛡", name: "旅平險", detail: "2天 / 最高500萬", price: 450, tag: "推薦", reason: "出差必備保障", reasonTag: "business", image: "https://images.unsplash.com/photo-1582820795651-f358eebe4406?w=120&h=90&fit=crop&auto=format" },
  { id: "hotel", icon: "🏨", name: "東京商旅", detail: "標準雙人房 / 1晚", price: 3800, tag: "附早餐", reason: "距離出差地點步行5分鐘", reasonTag: "business", image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=120&h=90&fit=crop&auto=format" },
];

export const tokyoMission = {
  id: "tokyo-trip",
  title: "東京商務出差",
  subtitle: "Tokyo · 2 Days 1 Night · 1 Person",
  progress: 65,
  image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=720&h=200&fit=crop&auto=format",
  aiSummary: "",
  tasks: [
    { id: "checklist", icon: "📋", title: "出差 Checklist", status: "in-progress", detail: "6 / 8 完成", action: "查看", color: "#4C6E91" },
    { id: "transport", icon: "🚕", title: "機場交通", status: "confirmed", detail: "yoxi 06:00 Pickup", action: "修改", color: "#0EA5E9" },
    { id: "esim", icon: "📶", title: "日本 eSIM", status: "confirmed", detail: "5GB / 5 Days · NT$399", action: "更換", color: "#16A34A" },
    { id: "goods", icon: "🛒", title: "必備用品", status: "pending", detail: "3 Items", action: "查看", color: "#EA580C" },
    { id: "insurance", icon: "🛡", title: "旅平險", status: "warning", detail: "尚未確認", action: "查看方案", color: "#DB2777" },
    { id: "reminder", icon: "⏰", title: "Reminder", status: "confirmed", detail: "出發前一天 21:00", action: "修改", color: "#6E92B4" },
  ],
};

export const birthdayMission = {
  id: "birthday-friend",
  title: "朋友生日準備",
  subtitle: "今晚 · 臨時任務",
  progress: 40,
  image: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=720&h=200&fit=crop&auto=format",
  aiSummary: "我已幫你建立生日任務，附近門市今日 18:30 後可取蛋糕與禮物。",
  tasks: [
    { id: "cake", icon: "🎂", title: "生日蛋糕", status: "pending", detail: "7-ELEVEN 松仁門市 · NT$780", action: "確認", color: "#DB2777" },
    { id: "gift", icon: "🎁", title: "禮物", status: "pending", detail: "精品禮物組 · NT$680", action: "確認", color: "#EA580C" },
    { id: "venue", icon: "🏠", title: "場地", status: "pending", detail: "尚未選擇場地", action: "查看", color: "#4C6E91" },
    { id: "transport", icon: "🚌", title: "交通", status: "confirmed", detail: "捷運 → 信義安和站", action: "查看", color: "#0EA5E9" },
    { id: "reminder", icon: "⏰", title: "Reminder", status: "confirmed", detail: "今天 17:30 出發提醒", action: "修改", color: "#6E92B4" },
  ],
};

export const homeRepairMission = {
  id: "home-repair",
  title: "居家修繕",
  subtitle: "浴室水管漏水 · 今天 14:00 師傅到場",
  progress: 40,
  image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=720&h=200&fit=crop&auto=format",
  aiSummary: "已找到 3 位評分 4.8+ 的師傅，「鑫盛水電」今天下午 14:00 有空檔，報價 NT$1,200。",
  tasks: [
    { id: "diagnose", icon: "🔍", title: "問題確認", status: "confirmed", detail: "浴室水管漏水 · 已拍照", action: "查看", color: "#4C6E91" },
    { id: "technician", icon: "👷", title: "師傅預約", status: "in-progress", detail: "鑫盛水電 · 今天 14:00", action: "確認", color: "#0EA5E9" },
    { id: "quote", icon: "💰", title: "報價比較", status: "confirmed", detail: "NT$1,200 · 含零件費", action: "查看", color: "#16A34A" },
    { id: "parts", icon: "🔧", title: "零件採購", status: "pending", detail: "止水帶、生料帶 · NT$180", action: "預購", color: "#EA580C" },
    { id: "verify", icon: "✅", title: "完工驗收", status: "pending", detail: "完工後確認 · 付款", action: "等待", color: "#6E92B4" },
  ],
};

export const petCareMission = {
  id: "pet-care",
  title: "寵物看診",
  subtitle: "Taro（米克斯）· 預防針 + 健康檢查",
  progress: 30,
  image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=720&h=200&fit=crop&auto=format",
  aiSummary: "「台北動物醫院」本週六早診有名額，距你家步行 8 分鐘，評分 4.9。",
  tasks: [
    { id: "clinic", icon: "🏥", title: "選擇診所", status: "confirmed", detail: "台北動物醫院 · 信義區", action: "查看", color: "#4C6E91" },
    { id: "appt", icon: "📅", title: "預約看診", status: "in-progress", detail: "週六 10:00 · 預防針", action: "確認", color: "#0EA5E9" },
    { id: "supplies", icon: "🛒", title: "寵物用品", status: "pending", detail: "飼料、玩具補充", action: "採購", color: "#EA580C" },
    { id: "reminder", icon: "⏰", title: "出發提醒", status: "pending", detail: "週六 09:30 提醒", action: "設定", color: "#6E92B4" },
  ],
};

export const movingMission = {
  id: "moving",
  title: "搬家準備",
  subtitle: "下週三 → 信義區新家",
  progress: 20,
  image: "https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6?w=720&h=200&fit=crop&auto=format",
  aiSummary: "已取得 3 家搬家公司報價，「台灣搬家達人」評分最高（4.8），建議今天確認。",
  tasks: [
    { id: "company", icon: "🚚", title: "搬家公司", status: "in-progress", detail: "選取公司", action: "確認", color: "#0EA5E9" },
    { id: "packing", icon: "📦", title: "打包用品", status: "pending", detail: "選擇欲採購項目", action: "採購", color: "#EA580C" },
    { id: "notify", icon: "📮", title: "地址", status: "pending", detail: "點選輸入詳細地址", action: "寄送", color: "#16A34A" },
    { id: "checklist", icon: "📋", title: "搬家項目清單", status: "pending", detail: "輸入項目名稱", action: "查看", color: "#6E92B4" },
  ],
};

export const fitnessMission = {
  id: "fitness",
  title: "健身計畫",
  subtitle: "12 週增肌計畫 · 每週 4 天",
  progress: 35,
  image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=720&h=200&fit=crop&auto=format",
  aiSummary: "週一/三/五/六訓練日，明天是胸肌日。補給品庫存不足，建議今天採購乳清蛋白。",
  tasks: [
    { id: "gym", icon: "🏋️", title: "健身房", status: "confirmed", detail: "FitLife 信義店 · 月費 NT$1,200", action: "查看", color: "#4C6E91" },
    { id: "schedule", icon: "📅", title: "訓練課表", status: "confirmed", detail: "本週：胸 / 背 / 腿 / 肩", action: "查看", color: "#16A34A" },
    { id: "nutrition", icon: "🥗", title: "飲食計畫", status: "in-progress", detail: "高蛋白 · 2,400 kcal / 天", action: "查看", color: "#0EA5E9" },
    { id: "supplements", icon: "💊", title: "補給品", status: "pending", detail: "乳清蛋白庫存不足", action: "採購", color: "#EA580C" },
  ],
};

export const planningSteps = [
  { text: "理解需求", delay: 0 },
  { text: "讀取你的偏好", delay: 600 },
  { text: "套用 #TimeSaver", delay: 1200 },
  { text: "建立出差 Checklist", delay: 1800 },
  { text: "搜尋適合服務", delay: 2400 },
  { text: "組合你的出差方案...", delay: 3000, pending: true },
];

export const birthdayPlanningSteps = [
  { text: "理解需求", delay: 0 },
  { text: "確認附近門市庫存", delay: 500 },
  { text: "搜尋蛋糕與禮物選項", delay: 1000 },
  { text: "建立生日任務清單", delay: 1500 },
  { text: "組合你的生日準備方案...", delay: 2000, pending: true },
];

export const homeRepairPlanningSteps = [
  { text: "分析問題類型", delay: 0 },
  { text: "搜尋附近認證師傅", delay: 600 },
  { text: "比較報價與評價", delay: 1200 },
  { text: "確認可預約時段", delay: 1800 },
  { text: "建立修繕任務...", delay: 2200, pending: true },
];

export const petCarePlanningSteps = [
  { text: "確認寵物資料", delay: 0 },
  { text: "搜尋附近動物醫院", delay: 500 },
  { text: "確認可預約時段", delay: 1000 },
  { text: "建立寵物照護清單", delay: 1500 },
  { text: "組合照護方案...", delay: 1900, pending: true },
];

export const movingPlanningSteps = [
  { text: "確認搬家資訊", delay: 0 },
  { text: "搜尋搬家公司報價", delay: 600 },
  { text: "建立打包清單", delay: 1200 },
  { text: "確認水電申請流程", delay: 1700 },
  { text: "組合你的搬家計畫...", delay: 2100, pending: true },
];

export const fitnessPlanningSteps = [
  { text: "確認你的健身目標", delay: 0 },
  { text: "搜尋附近健身房", delay: 500 },
  { text: "規劃訓練課表", delay: 1000 },
  { text: "計算飲食與補給需求", delay: 1500 },
  { text: "建立你的健身計畫...", delay: 1900, pending: true },
];

export const recommendations = [
  { id: "fastest", icon: "⚡", label: "最省時間", desc: "最快完成所有準備", tag: "Recommended", tagColor: "#4C6E91", reason: "符合你的 #TimeSaver 偏好", items: ["yoxi 接送", "eSIM 5GB", "轉接頭 + 行動電源", "7-ELEVEN 門市取貨"], total: 2777, isDefault: true },
  { id: "budget", icon: "💰", label: "最划算", desc: "優先使用優惠與 OPENPOINT", tag: "省 NT$240", tagColor: "#16A34A", reason: "可使用即將到期的 OPENPOINT 點數", items: ["捷運 + 巴士", "eSIM 3GB", "轉接頭", "OPENPOINT 折抵 120"], total: 2198, isDefault: false },
  { id: "complete", icon: "✨", label: "最完整", desc: "包含完整旅行服務", tag: "完整保障", tagColor: "#6E92B4", reason: "包含旅平險與所有出行服務", items: ["yoxi 接送", "eSIM 5GB", "旅平險", "轉接頭 + 行動電源", "簡報筆"], total: 3917, isDefault: false },
];

export const cartItems = [
  { id: "esim", name: "日本 eSIM 5GB", detail: "5 Days", price: 399, qty: 1, icon: "📶" },
  { id: "adapter", name: "萬國轉接頭", detail: "日本適用", price: 299, qty: 1, icon: "🔌" },
  { id: "powerbank", name: "行動電源", detail: "20000mAh", price: 799, qty: 1, icon: "🔋" },
];

export const todayCards = [
  { icon: "📦", text: "1 筆包裹待取", sub: "7-ELEVEN 松仁門市", type: "info" },
  { icon: "🎟", text: "2 張優惠即將到期", sub: "明天到期", type: "warning" },
  { icon: "🌧", text: "明天台北有雨", sub: "降雨機率 80%", type: "weather" },
  { icon: "🎂", text: "朋友生日提醒", sub: "今天 · Mia 的生日", type: "birthday" },
];

export const aiSuggestions = [
  { icon: "🌧", text: "明天台北降雨機率高，要加入雨傘提醒嗎？", actions: ["加入提醒", "不用"] },
  { icon: "⭐", text: "你有 240 點 OPENPOINT 即將到期，要套用到下次購物嗎？", actions: ["套用", "不用"] },
];
