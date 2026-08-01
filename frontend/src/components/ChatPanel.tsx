import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, ContextView, CartItem, MessageType } from "../types";
import {
  tokyoMission, birthdayMission, homeRepairMission, petCareMission, movingMission, fitnessMission,
  planningSteps, birthdayPlanningSteps, homeRepairPlanningSteps, petCarePlanningSteps, movingPlanningSteps, fitnessPlanningSteps,
  recommendations, UNSPLASH,
} from "../data";

interface ChatPanelProps {
  onContextChange: (view: ContextView) => void;
  onTransportUpdate: (time: string) => void;
  onProductAdd: (item: CartItem) => void;
  onPanelToggle: () => void;
  onMenuOpen: () => void;
  cartItems: CartItem[];
  contextView: ContextView;
  panelOpen: boolean;
  isMobile: boolean;
}

let msgCounter = 1;
const mkId = () => `msg-${++msgCounter}-${Date.now()}`;

/* Service tray item config */
interface ServiceTrayItem {
  id: string;
  icon: string;
  label: string;
  view: ContextView;
  progress?: number;
  badge?: string;
  color: string;
}

const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "w1",
    role: "ai",
    type: "text",
    text: "Hi Jamie 👋 我是 UNI AI，你的一站式智慧管家。\n\n告訴我你想做什麼，我來搞定。",
    ts: Date.now(),
  },
  {
    id: "w2",
    role: "ai",
    type: "service-grid",
    ts: Date.now() + 1,
  },
];

export default function ChatPanel({
  onContextChange, onTransportUpdate, onProductAdd,
  onPanelToggle, onMenuOpen,
  cartItems, contextView, panelOpen, isMobile,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [planningActive, setPlanningActive] = useState(false);
  const [planningProgress, setPlanningProgress] = useState(0);
  const [planningStepsVisible, setPlanningStepsVisible] = useState<number[]>([]);
  const [currentPlanningSteps, setCurrentPlanningSteps] = useState(planningSteps);
  const [currentPlanningTitle, setCurrentPlanningTitle] = useState("");
  const [awaitingFollowup, setAwaitingFollowup] = useState<string | null>(null);
  const tripMeta = useRef<{ country?: string; days?: string }>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, planningActive]);

  /* Derive tray items from current state */
  const trayItems: ServiceTrayItem[] = [];
  if (contextView === "mission" || contextView === "complete") {
    trayItems.push({ id: "mission", icon: "💼", label: "東京出差", view: "mission", progress: 65, color: "#6246EA" });
  }
  if (contextView === "birthday-mission" || contextView === "birthday-complete") {
    trayItems.push({ id: "birthday", icon: "🎂", label: "生日準備", view: "birthday-mission", progress: 40, color: "#EC4899" });
  }
  if (contextView === "home-repair") {
    trayItems.push({ id: "home-repair", icon: "🔧", label: "居家修繕", view: "home-repair", progress: 40, color: "#EA580C" });
  }
  if (contextView === "pet-care") {
    trayItems.push({ id: "pet-care", icon: "🐾", label: "寵物看診", view: "pet-care", progress: 30, color: "#16A34A" });
  }
  if (contextView === "moving") {
    trayItems.push({ id: "moving", icon: "📦", label: "搬家準備", view: "moving", progress: 20, color: "#0EA5E9" });
  }
  if (contextView === "fitness") {
    trayItems.push({ id: "fitness", icon: "💪", label: "健身計畫", view: "fitness", progress: 35, color: "#7C3AED" });
  }
  if (cartItems.length > 0) {
    trayItems.push({ id: "cart", icon: "🛒", label: "購物車", view: "cart", badge: String(cartItems.length), color: "#EA580C" });
  }
  if (contextView === "shopping" || contextView === "home-repair-shop" || contextView === "pet-shop") {
    trayItems.push({ id: "shopping", icon: "🛍", label: "推薦商品", view: contextView, color: "#0EA5E9" });
  }

  const appendMessage = (msg: Omit<ChatMessage, "id" | "ts">) => {
    setMessages((prev) => [...prev, { ...msg, id: mkId(), ts: Date.now() }]);
  };

  const runPlanning = useCallback((steps: typeof planningSteps, title: string, onDone: () => void) => {
    setPlanningActive(true);
    setCurrentPlanningSteps(steps);
    setCurrentPlanningTitle(title);
    setPlanningStepsVisible([]);
    setPlanningProgress(0);
    steps.forEach((s, i) => {
      setTimeout(() => {
        setPlanningStepsVisible((prev) => [...prev, i]);
        setPlanningProgress(Math.min(((i + 1) / steps.length) * 100, 92));
      }, s.delay);
    });
    const totalTime = steps[steps.length - 1].delay + 1200;
    setTimeout(() => {
      setPlanningProgress(100);
      setPlanningActive(false);
      onDone();
    }, totalTime);
  }, []);

  /* Scenario card clicked → guided flow */
  const handleScenarioStart = useCallback((scenarioId: string) => {
    const SCENARIOS: Record<string, { userMsg: string; analysisSteps: string[]; question: string; replies: string[]; followupKey: string }> = {
      "business-trip": {
        userMsg: "✈️ 我想規劃商務出差",
        analysisSteps: ["理解你的需求", "套用動態標籤 #Traveler", "分析出差偏好", "搜尋最佳方案"],
        question: "好的！先問你幾個問題～\n\n你要去哪個國家/城市？",
        replies: [],
        followupKey: "business-country",
      },
      "home-repair": {
        userMsg: "🔧 我家需要修繕",
        analysisSteps: ["理解修繕需求", "定位你的位置", "搜尋附近師傅", "比對評價與報價"],
        question: "哪裡出問題了？",
        replies: ["浴室水管漏水", "廁所馬桶不通", "電氣插座故障", "其他問題"],
        followupKey: "scenario-repair",
      },
      "birthday": {
        userMsg: "🎂 準備朋友生日",
        analysisSteps: ["理解生日需求", "查詢附近服務", "確認時間與預算", "準備個人化建議"],
        question: "生日是什麼時候？",
        replies: ["就是今天！", "明天", "這週末", "下週"],
        followupKey: "scenario-birthday",
      },
      "pet-care": {
        userMsg: "🐾 寵物需要照護",
        analysisSteps: ["理解寵物需求", "搜尋附近動物醫院", "確認評價與距離", "查詢空檔時間"],
        question: "你的寵物是什麼動物？",
        replies: [],
        followupKey: "pet-animal",
      },
      "moving": {
        userMsg: "📦 我要搬家",
        analysisSteps: ["理解搬家需求", "搜尋搬家公司", "取得即時報價", "規劃搬家清單"],
        question: "大概什麼時候要搬？",
        replies: ["這週", "下週", "這個月內", "一個月後"],
        followupKey: "scenario-moving",
      },
      "fitness": {
        userMsg: "💪 我想開始健身",
        analysisSteps: ["理解健身目標", "分析你的習慣", "搜尋附近場館", "規劃個人化課表"],
        question: "你的主要目標是？",
        replies: ["增肌減脂", "提升體能", "維持健康", "備賽 / 馬拉松"],
        followupKey: "scenario-fitness",
      },
    };

    const s = SCENARIOS[scenarioId];
    if (!s) return;

    appendMessage({ role: "user", type: "text", text: s.userMsg });

    // 1. AI analysis card after short delay
    setTimeout(() => {
      appendMessage({ role: "ai", type: "ai-analysis", data: { steps: s.analysisSteps } });
    }, 400);

    // 2. Ask question after analysis animation completes
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: s.question, quickReplies: s.replies.length > 0 ? s.replies : undefined });
        setAwaitingFollowup(s.followupKey);
      }, 800);
    }, 2800);
  }, []);

  const processInput = useCallback((text: string) => {
    const lower = text.toLowerCase();

    // Business trip fill-in questions
    if (awaitingFollowup === "business-country") {
      setAwaitingFollowup(null);
      tripMeta.current.country = text;
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: `${text}！預計去幾天？` });
        setAwaitingFollowup("business-days");
      }, 900);
      return;
    }
    if (awaitingFollowup === "business-days") {
      setAwaitingFollowup(null);
      tripMeta.current.days = text;
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: `了解，${tripMeta.current.country} ${text} 天。\n\n機票和住宿安排好了嗎？`, quickReplies: ["都安排好了", "只有機票", "只有住宿", "都還沒有"] });
        setAwaitingFollowup("scenario-business");
      }, 900);
      return;
    }

    // Scenario quick-start followups → jump straight to planning
    if (awaitingFollowup === "scenario-business") {
      setAwaitingFollowup(null);
      const country = tripMeta.current.country || "東京";
      const days = tripMeta.current.days || "2";
      runPlanning(planningSteps, `正在建立${country}出差任務...`, () => {
        appendMessage({ role: "ai", type: "mission-created", text: `已幫你建立「${country}商務出差」任務 🗂`, data: { ...tokyoMission, title: `${country}商務出差`, subtitle: `${country} · ${days} 天` } });
        onContextChange("mission");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "機票與住宿已同步確認 ✓\n\n根據你的 #Traveler 標籤，已為你推薦以下方案：", quickReplies: ["看推薦方案", "直接查看任務"] });
            setAwaitingFollowup("flight-status");
          }, 1200);
        }, 600);
      });
      return;
    }
    if (awaitingFollowup === "scenario-repair") {
      if (text === "其他問題") {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          appendMessage({ role: "ai", type: "text", text: "請描述一下是什麼問題？（例如：天花板漏水、冷氣不冷、窗戶損壞…）" });
          setAwaitingFollowup("scenario-repair");
        }, 700);
        return;
      }
      setAwaitingFollowup(null);
      runPlanning(homeRepairPlanningSteps, "搜尋附近合格師傅中...", () => {
        appendMessage({ role: "ai", type: "home-repair-created", text: "已幫你建立「居家修繕」任務 🔧", data: homeRepairMission });
        onContextChange("home-repair");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「鑫盛水電」今天下午 14:00 有空檔，評分 4.9 ⭐，含零件費 NT$1,200。要直接確認預約嗎？", quickReplies: ["確認預約", "看其他師傅", "先自己嘗試"] });
          }, 1200);
        }, 600);
      });
      return;
    }
    if (awaitingFollowup === "scenario-birthday") {
      setAwaitingFollowup(null);
      runPlanning(birthdayPlanningSteps, "正在建立生日準備任務...", () => {
        appendMessage({ role: "ai", type: "birthday-created", text: "已幫你建立「朋友生日準備」任務 🎂", data: birthdayMission });
        onContextChange("birthday-mission");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "附近 7-ELEVEN 松仁門市今天 18:30 後可取蛋糕與禮物。要直接加入購物車嗎？", quickReplies: ["加入購物車", "先看其他選擇"] });
          }, 1200);
        }, 600);
      });
      return;
    }
    if (awaitingFollowup === "pet-animal") {
      setAwaitingFollowup(null);
      tripMeta.current = { ...tripMeta.current, country: text };
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: `${text}！牠幾歲了？` });
        setAwaitingFollowup("pet-age");
      }, 800);
      return;
    }
    if (awaitingFollowup === "pet-age") {
      setAwaitingFollowup(null);
      const animal = tripMeta.current.country ?? "寵物";
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: `${animal} ${text}歲，了解！需要什麼服務？`, quickReplies: ["定期健檢", "緊急看診", "疫苗接種", "美容洗澡"] });
        setAwaitingFollowup("scenario-pet");
      }, 800);
      return;
    }

    if (awaitingFollowup === "scenario-pet") {
      setAwaitingFollowup(null);
      runPlanning(petCarePlanningSteps, "搜尋附近動物醫院中...", () => {
        appendMessage({ role: "ai", type: "pet-care-created", text: "已幫你建立「寵物看診」任務 🐾", data: petCareMission });
        onContextChange("pet-care");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「台北動物醫院」本週六早診有名額，距你家步行 8 分鐘 🐾。要同時幫你採購寵物用品嗎？", quickReplies: ["確認預約", "一起採購用品", "只預約就好"] });
          }, 1200);
        }, 600);
      });
      return;
    }
    if (awaitingFollowup === "scenario-moving") {
      setAwaitingFollowup(null);
      runPlanning(movingPlanningSteps, "正在取得搬家報價中...", () => {
        appendMessage({ role: "ai", type: "moving-created", text: "已幫你建立「搬家準備」任務 📦", data: movingMission });
        onContextChange("moving");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "已取得 3 家搬家公司報價，最低 NT$6,800 起。同時需要打包紙箱嗎？可以幫你一次採購。", quickReplies: ["確認最低報價", "採購打包用品", "先看比較表"] });
          }, 1200);
        }, 600);
      });
      return;
    }
    if (awaitingFollowup === "scenario-fitness") {
      setAwaitingFollowup(null);
      runPlanning(fitnessPlanningSteps, "正在規劃你的健身計畫...", () => {
        appendMessage({ role: "ai", type: "fitness-created", text: "已幫你建立「健身計畫」任務 💪", data: fitnessMission });
        onContextChange("fitness");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「FitLife 信義店」評分 4.9 ⭐，月費 NT$1,200，距你最近。課表已規劃好，乳清蛋白庫存不足，要一起採購嗎？", quickReplies: ["加入健身房", "採購補給品", "先看課表"] });
          }, 1200);
        }, 600);
      });
      return;
    }

    if (awaitingFollowup === "transport-time") {
      setAwaitingFollowup(null);
      onTransportUpdate("06:00");
      appendMessage({ role: "ai", type: "task-update", text: "已更新機場接送時間為 06:00 ✓", data: { icon: "🚕", change: "yoxi 接送時間 → 06:00" } });
      return;
    }
    if (awaitingFollowup === "esim-choice") {
      setAwaitingFollowup(null);
      const cheap = text.includes("3GB") || text.includes("299");
      appendMessage({ role: "ai", type: "task-update", text: cheap ? "已更換為 3GB 方案，節省 NT$100 ✓" : "已更換 eSIM 方案 ✓", data: { icon: "📶", change: cheap ? "eSIM → 3GB / NT$299" : "eSIM 方案已更換" } });
      return;
    }
    if (awaitingFollowup === "flight-status") {
      setAwaitingFollowup(null);
      const hasFlight = lower.includes("安排") || lower.includes("好") || lower.includes("已");
      setTimeout(() => {
        appendMessage({ role: "ai", type: "text", text: hasFlight ? "好的！根據你的 #TimeSaver，已自動安排以下方案：" : "需要我幫你搜尋合適的航班嗎？", quickReplies: hasFlight ? ["看推薦方案", "看任務清單"] : ["幫我搜尋航班", "先跳過"] });
        if (hasFlight) {
          setTimeout(() => appendMessage({ role: "ai", type: "recommendation", data: recommendations }), 600);
        }
      }, 800);
      return;
    }

    if (lower.includes("東京") && (lower.includes("出差") || lower.includes("商務"))) {
      runPlanning(planningSteps, "正在建立你的東京出差任務...", () => {
        appendMessage({ role: "ai", type: "mission-created", text: "已幫你建立「東京商務出差」任務 🗂", data: tokyoMission });
        onContextChange("mission");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "機票與住宿目前安排好了嗎？", quickReplies: ["都安排好了", "只有機票", "只有住宿", "都還沒有"] });
            setAwaitingFollowup("flight-status");
          }, 1500);
        }, 800);
      });
      return;
    }

    if (lower.includes("生日") || lower.includes("蛋糕")) {
      runPlanning(birthdayPlanningSteps, "正在建立你的生日準備任務...", () => {
        appendMessage({ role: "ai", type: "birthday-created", text: "已幫你建立「朋友生日準備」臨時任務 🎂", data: birthdayMission });
        onContextChange("birthday-mission");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "附近 7-ELEVEN 松仁門市今天 18:30 後可取蛋糕與禮物。要直接加入購物車嗎？", quickReplies: ["加入購物車", "先看其他選擇"] });
          }, 1400);
        }, 700);
      });
      return;
    }

    if ((lower.includes("接送") || lower.includes("接機")) && (lower.includes("六點") || lower.includes("6點") || lower.includes("06:00") || lower.includes("早上"))) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onTransportUpdate("06:00");
        appendMessage({ role: "ai", type: "task-update", text: "已更新機場接送時間為 06:00，yoxi 已重新確認 ✓", data: { icon: "🚕", change: "接送時間 → 06:00" } });
      }, 1000);
      return;
    }

    if (lower.includes("esim") && (lower.includes("便宜") || lower.includes("換") || lower.includes("便"))) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: "找到以下替代方案，哪個更適合你？", quickReplies: ["📶 3GB / NT$299 省100元", "📶 10GB / NT$599 更大流量", "📶 無限流量 / NT$899"] });
        setAwaitingFollowup("esim-choice");
      }, 1100);
      return;
    }

    if ((lower.includes("旅平險") || lower.includes("保險")) && (lower.includes("不要") || lower.includes("移除") || lower.includes("先不"))) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "task-update", text: "已從這次任務移除旅平險。需要時隨時可以重新加入 ✓", data: { icon: "🛡", change: "旅平險 → 已移除" } });
      }, 900);
      return;
    }

    if (lower.includes("看推薦") || lower.includes("推薦方案") || lower.includes("方案")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendMessage({ role: "ai", type: "text", text: "根據你的 #TimeSaver 偏好，為你推薦以下三種出差方案：" });
        setTimeout(() => appendMessage({ role: "ai", type: "recommendation", data: recommendations }), 400);
      }, 1000);
      return;
    }

    if (lower.includes("加入購物車") || lower.includes("購物車")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onProductAdd({ id: "cake", name: "生日蛋糕", detail: "6吋 草莓奶油", price: 780, qty: 1, icon: "🎂" });
        onProductAdd({ id: "gift", name: "精品禮物組", detail: "保養品組合", price: 680, qty: 1, icon: "🎁" });
        onContextChange("cart");
        appendMessage({ role: "ai", type: "task-update", text: "已加入購物車：生日蛋糕 + 精品禮物組，可以直接結帳 ✓", data: { icon: "🛒", change: "2 件商品已加入購物車" } });
      }, 900);
      return;
    }

    if (lower.includes("商品") || (lower.includes("買") && !lower.includes("購物車")) || lower.includes("採購")) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onContextChange("shopping");
        appendMessage({ role: "ai", type: "products", text: "根據你的出差任務，推薦以下商品：", data: { reason: "符合 #TimeSaver 與 #FrequentPickup 偏好" } });
      }, 900);
      return;
    }

    // Home repair flow
    if (lower.includes("修繕") || lower.includes("修理") || lower.includes("漏水") || lower.includes("水電") || lower.includes("師傅") || lower.includes("裝修") || lower.includes("壞掉") || lower.includes("馬桶") || lower.includes("水管")) {
      runPlanning(homeRepairPlanningSteps, "正在搜尋附近合格師傅...", () => {
        appendMessage({ role: "ai", type: "home-repair-created", text: "已幫你建立「居家修繕」任務 🔧", data: homeRepairMission });
        onContextChange("home-repair");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「鑫盛水電」今天下午 14:00 有空檔，評分 4.9，含零件費 NT$1,200。要直接確認預約嗎？", quickReplies: ["確認預約", "看其他師傅", "先買零件自己試"] });
          }, 1400);
        }, 600);
      });
      return;
    }

    // Pet care flow
    if (lower.includes("寵物") || lower.includes("貓") || lower.includes("狗") || lower.includes("獸醫") || lower.includes("看診") || (lower.includes("預約") && lower.includes("醫院"))) {
      runPlanning(petCarePlanningSteps, "正在搜尋附近動物醫院...", () => {
        appendMessage({ role: "ai", type: "pet-care-created", text: "已幫你建立「寵物看診」任務 🐾", data: petCareMission });
        onContextChange("pet-care");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「台北動物醫院」本週六早診有名額，距你家步行 8 分鐘。要同時幫你採購寵物用品嗎？", quickReplies: ["確認預約", "一起採購用品", "只預約就好"] });
          }, 1300);
        }, 600);
      });
      return;
    }

    // Moving flow
    if (lower.includes("搬家") || lower.includes("搬遷") || lower.includes("新家") || lower.includes("搬") && lower.includes("家")) {
      runPlanning(movingPlanningSteps, "正在搜尋搬家公司報價...", () => {
        appendMessage({ role: "ai", type: "moving-created", text: "已幫你建立「搬家準備」任務 📦", data: movingMission });
        onContextChange("moving");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "已取得 3 家搬家公司報價：最低 NT$6,800。同時需要打包紙箱嗎？可以幫你一次採購。", quickReplies: ["確認最低報價", "採購打包用品", "先看比較表"] });
          }, 1400);
        }, 600);
      });
      return;
    }

    // Fitness flow
    if (lower.includes("健身") || lower.includes("運動") || lower.includes("健身房") || lower.includes("訓練") || lower.includes("增肌") || lower.includes("減脂")) {
      runPlanning(fitnessPlanningSteps, "正在規劃你的健身計畫...", () => {
        appendMessage({ role: "ai", type: "fitness-created", text: "已幫你建立「健身計畫」任務 💪", data: fitnessMission });
        onContextChange("fitness");
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            appendMessage({ role: "ai", type: "text", text: "「FitLife 信義店」評分 4.9，月費 NT$1,200。課表已規劃好，乳清蛋白庫存不足，要一起採購嗎？", quickReplies: ["加入健身房", "採購補給品", "先看課表"] });
          }, 1300);
        }, 600);
      });
      return;
    }

    // === Fallback: 呼叫後端 Agent API（真正的 Bedrock + Tool Use）===
    setIsTyping(true);
    fetch("http://localhost:3000/api/chat/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u1", message: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsTyping(false);
        if (data.reply) {
          appendMessage({ role: "ai", type: "text", text: data.reply });
        } else {
          appendMessage({ role: "ai", type: "text", text: data.error || "抱歉，發生錯誤" });
        }
      })
      .catch((err) => {
        setIsTyping(false);
        console.error("Agent API 錯誤:", err);
        appendMessage({ role: "ai", type: "text", text: "連線失敗，請確認後端是否已啟動。" });
      });
  }, [awaitingFollowup, onContextChange, onTransportUpdate, onProductAdd, runPlanning]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    appendMessage({ role: "user", type: "text", text: msg });
    setTimeout(() => processInput(msg), 300);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>

      {/* Top bar */}
      <div style={{ height: 56, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button onClick={onMenuOpen} style={{ width: 34, height: 34, borderRadius: 9, background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#0F0A2E" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          )}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>UNI AI</span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>· 一站式智慧管家</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["#TimeSaver", "#Traveler"].map((tag) => (
            <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: "#6246EA", background: "#EDE9FF", padding: "3px 9px", borderRadius: 20, fontFamily: "var(--font-display)" }}>{tag}</span>
          ))}
          {/* Panel toggle button */}
          {contextView !== "idle" && (
            <button
              onClick={onPanelToggle}
              style={{ marginLeft: 4, width: 34, height: 34, borderRadius: 9, border: "none", background: panelOpen ? "#EDE9FF" : "#F3F4F6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: panelOpen ? "#6246EA" : "#9CA3AF", transition: "all 0.15s", flexShrink: 0 }}
              title="開啟服務面板"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M15 3v18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 8px" }} className="scrollbar-hide">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onReply={handleSend}
            onScenarioStart={handleScenarioStart}
            onContextChange={onContextChange}
            onPanelToggle={onPanelToggle}
            isLast={idx === messages.length - 1}
          />
        ))}

        {/* Planning animation */}
        {planningActive && (
          <div className="msg-ai" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <AIAvatar />
              <div style={{ flex: 1, maxWidth: 520 }}>
                <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "16px 18px", border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div className="spin-slow" style={{ width: 20, height: 20, borderRadius: "50%", border: "2.5px solid #6246EA", borderTopColor: "transparent" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#6246EA" }}>{currentPlanningTitle}</span>
                  </div>
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ height: "100%", width: `${planningProgress}%`, background: "linear-gradient(90deg, #6246EA, #8B5CF6)", transition: "width 0.5s ease", borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentPlanningSteps.map((step, i) => {
                      const visible = planningStepsVisible.includes(i);
                      const isPending = step.pending && visible;
                      const isDone = visible && !step.pending;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: visible ? 1 : 0.2, transition: "opacity 0.4s ease" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: isDone ? "#6246EA" : "transparent", border: isPending ? "2px solid #6246EA" : isDone ? "none" : "2px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                            {isDone && <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: isDone ? 600 : 500, color: isPending ? "#6246EA" : isDone ? "#0F0A2E" : "#6B7280" }}>{step.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="msg-ai" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <AIAvatar />
              <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", gap: 4, alignItems: "center", border: "1px solid #E5E7EB" }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6246EA", animation: `typing 1.2s ease ${d * 0.18}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, alignItems: "center", flexShrink: 0, background: "white" }}>
        <div className="input-ring" style={{ flex: 1, display: "flex", alignItems: "center", background: "#F8F9FC", borderRadius: 24, border: "1.5px solid #E5E7EB", padding: "0 16px", transition: "all 0.15s" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="輸入你的需求或直接說話..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 14, fontFamily: "var(--font-body)", color: "#0F0A2E" }}
          />
        </div>
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: input.trim() ? "linear-gradient(135deg, #6246EA, #8B5CF6)" : "#E5E7EB", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Active services tray */}
      {trayItems.length > 0 && (
        <div style={{ padding: "8px 16px", borderTop: "1px solid #F8F9FC", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }} className="scrollbar-hide">
          <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, flexShrink: 0, alignSelf: "center", fontFamily: "var(--font-display)" }}>進行中</span>
          {trayItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onContextChange(item.view); onPanelToggle(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 8px", borderRadius: 20, background: `${item.color}12`, border: `1.5px solid ${item.color}30`, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: item.color, fontFamily: "var(--font-display)" }}>{item.label}</span>
              {item.badge && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: item.color, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{item.badge}</span>
              )}
              {item.progress !== undefined && (
                <div style={{ width: 32, height: 3, background: `${item.color}25`, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.progress}%`, background: item.color, borderRadius: 2 }} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

function AIAvatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6246EA, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "white", marginTop: 2 }}>✦</div>
  );
}

/* Service category grid — shown as welcome AI message */
function ServiceGrid({ onScenarioStart }: { onScenarioStart: (id: string) => void }) {
  const services = [
    { id: "business-trip", icon: "💼", label: "商務出差", img: UNSPLASH.tokyo, color: "#6246EA" },
    { id: "home-repair",   icon: "🔧", label: "居家修繕", img: UNSPLASH.homeRepair, color: "#EA580C" },
    { id: "birthday",      icon: "🎂", label: "朋友生日", img: UNSPLASH.birthdayCake, color: "#DB2777" },
    { id: "pet-care",      icon: "🐾", label: "寵物照護", img: UNSPLASH.petCare, color: "#16A34A" },
    { id: "moving",        icon: "📦", label: "搬家準備", img: UNSPLASH.moving, color: "#0EA5E9" },
    { id: "fitness",       icon: "💪", label: "健身計畫", img: UNSPLASH.fitness, color: "#7C3AED" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
      {services.map((s) => (
        <button
          key={s.id}
          onClick={() => onScenarioStart(s.id)}
          style={{ borderRadius: 12, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", position: "relative", height: 76, background: "#F3F4F6" }}
        >
          <img src={s.img} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${s.color}D0 0%, ${s.color}80 100%)`, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", padding: "8px 12px", gap: 1 }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "white" }}>{s.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* AI analysis card — Step 5 from user flow */
function AnalysisCard({ steps }: { steps: string[] }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setVisibleCount(i);
      if (i < steps.length) setTimeout(tick, 480);
      else setTimeout(() => setDone(true), 300);
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.06), rgba(139,92,246,0.04))", border: "1px solid rgba(98,70,234,0.2)", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div className="spin-slow" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #6246EA", borderTopColor: "transparent", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#6246EA" }}>AI 正在分析你的需求...</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {steps.map((step, i) => {
          const visible = i < visibleCount;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: visible ? 1 : 0.15, transition: "opacity 0.4s ease" }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0, transition: "all 0.3s",
                background: visible ? "#6246EA" : "transparent",
                border: visible ? "none" : "1.5px solid #D1D5DB",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {visible && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: 12, fontFamily: "var(--font-display)", fontWeight: visible ? 600 : 400, color: visible ? "#0F0A2E" : "#9CA3AF" }}>{step}</span>
            </div>
          );
        })}
      </div>
      {done && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(98,70,234,0.12)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11 }}>✦</span>
          <span style={{ fontSize: 11, color: "#6246EA", fontWeight: 600, fontFamily: "var(--font-display)" }}>分析完成，正在提問...</span>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, onReply, onScenarioStart, onContextChange, onPanelToggle, isLast }: {
  msg: ChatMessage;
  onReply: (text: string) => void;
  onScenarioStart: (id: string) => void;
  onContextChange: (view: ContextView) => void;
  onPanelToggle: () => void;
  isLast: boolean;
}) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="msg-enter" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <div style={{ maxWidth: "72%", background: "linear-gradient(135deg, #6246EA, #7C3AED)", color: "white", padding: "11px 16px", borderRadius: "18px 18px 4px 18px", fontSize: 14, lineHeight: 1.5, fontFamily: "var(--font-body)", boxShadow: "0 4px 16px rgba(98,70,234,0.25)" }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-ai" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <AIAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Service grid (welcome) */}
        {(msg.type as string) === "service-grid" && (
          <ServiceGrid onScenarioStart={onScenarioStart} />
        )}

        {/* AI analysis card */}
        {msg.type === "ai-analysis" && (
          <AnalysisCard steps={msg.data?.steps ?? []} />
        )}

        {/* Text message */}
        {msg.type === "text" && msg.text && (
          <div style={{ background: "#F8F9FC", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", fontSize: 14, lineHeight: 1.6, color: "#0F0A2E", border: "1px solid #E5E7EB", marginBottom: msg.quickReplies ? 8 : 0, whiteSpace: "pre-line" }}>
            {msg.text}
          </div>
        )}

        {/* Mission created card — all mission types */}
        {(msg.type === "mission-created" || msg.type === "birthday-created" || msg.type === "home-repair-created" || msg.type === "pet-care-created" || msg.type === "moving-created" || msg.type === "fitness-created") && (() => {
          const heroImgMap: Partial<Record<string, string>> = {
            "mission-created": UNSPLASH.tokyo,
            "birthday-created": UNSPLASH.birthdayCake,
            "home-repair-created": UNSPLASH.homeRepair,
            "pet-care-created": UNSPLASH.petCare,
            "moving-created": UNSPLASH.moving,
            "fitness-created": UNSPLASH.fitness,
          };
          const viewMap: Partial<Record<string, ContextView>> = {
            "mission-created": "mission",
            "birthday-created": "birthday-mission",
            "home-repair-created": "home-repair",
            "pet-care-created": "pet-care",
            "moving-created": "moving",
            "fitness-created": "fitness",
          };
          const heroImg = heroImgMap[msg.type] ?? UNSPLASH.tokyo;
          const targetView: ContextView = viewMap[msg.type] ?? "mission";
          const isBirthday = msg.type === "birthday-created";
          return (
            <div>
              {msg.text && <div style={{ fontSize: 14, color: "#0F0A2E", marginBottom: 10, lineHeight: 1.5 }}>{msg.text}</div>}
              <div
                onClick={() => { onContextChange(targetView); onPanelToggle(); }}
                style={{ background: "white", borderRadius: 16, border: "1.5px solid #6246EA", cursor: "pointer", overflow: "hidden", marginBottom: 8, transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(98,70,234,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ position: "relative", height: 96, overflow: "hidden" }}>
                  <img src={heroImg} alt={msg.data?.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(15,10,46,0.7) 100%)", display: "flex", alignItems: "flex-end", padding: "10px 14px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "white", flex: 1 }}>{msg.data?.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>查看詳情 →</div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px 12px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>{msg.data?.subtitle}</div>
                  <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${msg.data?.progress ?? 0}%`, background: "linear-gradient(90deg, #6246EA, #8B5CF6)", borderRadius: 2 }} />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(msg.data?.tasks ?? []).slice(0, 4).map((t: any) => (
                      <span key={t.id} style={{ fontSize: 11, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 }}>{t.icon} {t.title}</span>
                    ))}
                    {(msg.data?.tasks?.length ?? 0) > 4 && <span style={{ fontSize: 11, color: "#9CA3AF", padding: "2px 6px" }}>+{msg.data.tasks.length - 4}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Recommendation cards */}
        {msg.type === "recommendation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            {(msg.data as typeof recommendations).map((rec) => (
              <div
                key={rec.id}
                onClick={() => { onReply(`選擇${rec.label}方案`); onContextChange("shopping"); onPanelToggle(); }}
                style={{ background: "white", borderRadius: 14, padding: "12px 14px", border: rec.isDefault ? `2px solid ${rec.tagColor}` : "1px solid #E5E7EB", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(98,70,234,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {rec.isDefault && <div style={{ position: "absolute", top: 0, right: 0, background: rec.tagColor, fontSize: 10, fontWeight: 700, color: "white", padding: "3px 10px", borderRadius: "0 12px 0 10px", fontFamily: "var(--font-display)" }}>推薦</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{rec.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0F0A2E" }}>{rec.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{rec.desc}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#0F0A2E" }}>NT${rec.total.toLocaleString()}</div>
                    <span style={{ fontSize: 10, color: rec.tagColor, fontWeight: 600 }}>{rec.tag}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: rec.tagColor, display: "flex", alignItems: "center", gap: 4 }}><span>✦</span> {rec.reason}</div>
              </div>
            ))}
          </div>
        )}

        {/* Task update */}
        {msg.type === "task-update" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 12, padding: "10px 14px", marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{msg.data?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", fontFamily: "var(--font-display)" }}>✓ {msg.data?.change}</div>
              {msg.text && <div style={{ fontSize: 12, color: "#15803D", marginTop: 2 }}>{msg.text}</div>}
            </div>
          </div>
        )}

        {/* Products */}
        {msg.type === "products" && (
          <div style={{ background: "#F8F9FC", borderRadius: 14, padding: "12px 14px", border: "1px solid #E5E7EB", marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#0F0A2E", marginBottom: 8, lineHeight: 1.5 }}>{msg.text}</div>
            <div style={{ fontSize: 12, color: "#6246EA", display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}><span>✦</span> {msg.data?.reason}</div>
            <button onClick={() => { onContextChange("shopping"); onPanelToggle(); }} style={{ padding: "7px 16px", borderRadius: 20, border: "none", background: "#6246EA", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-display)" }}>
              查看推薦商品 →
            </button>
          </div>
        )}

        {/* Quick replies */}
        {msg.quickReplies && isLast && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {msg.quickReplies.map((r) => (
              <button
                key={r}
                onClick={() => onReply(r)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid #E5E7EB", background: "white", fontSize: 13, color: "#0F0A2E", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 500, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6246EA"; e.currentTarget.style.color = "#6246EA"; e.currentTarget.style.background = "#EDE9FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#0F0A2E"; e.currentTarget.style.background = "white"; }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
