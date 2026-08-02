export interface Task {
  id: string;
  icon: string;
  title: string;
  status: "confirmed" | "in-progress" | "pending" | "warning";
  detail: string;
  action: string;
  color: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  image: string;
  aiSummary: string;
  tasks: Task[];
}

export interface AuthUser {
  name: string;
  email: string;
  avatar: string;
  isGuest: boolean;
}

/* 從情境包建立的行程，date 為 YYYY-MM-DD（本地日曆日） */
export interface ScheduledTrip {
  id: string;
  packId: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  date: string;
  /* 完成度 0~100，結帳完成後為 100 */
  progress: number;
}

export interface CartItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  qty: number;
  icon: string;
}

export interface Product {
  id: string;
  icon: string;
  name: string;
  detail: string;
  price: number;
  tag: string;
  reason: string;
  reasonTag: string;
  image: string;
}

export interface Recommendation {
  id: string;
  icon: string;
  label: string;
  desc: string;
  tag: string;
  tagColor: string;
  reason: string;
  items: string[];
  total: number;
  isDefault: boolean;
}

export type ContextView =
  | "idle"
  | "mission"
  | "birthday-mission"
  | "home-repair"
  | "pet-care"
  | "moving"
  | "fitness"
  | "shopping"
  | "home-repair-shop"
  | "pet-shop"
  | "cart"
  | "complete"
  | "birthday-complete"
  | "profile"
  | "missions"
  | "packs"
  | "agent-mission";

export type MessageType =
  | "text"
  | "planning"
  | "ai-analysis"
  | "mission-created"
  | "birthday-created"
  | "home-repair-created"
  | "pet-care-created"
  | "moving-created"
  | "fitness-created"
  | "agent-mission-created"
  | "recommendation"
  | "products"
  | "task-update"
  | "save-prompt"
  | "complete"
  | "service-grid";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  type: MessageType;
  text?: string;
  quickReplies?: string[];
  data?: any;
  ts: number;
}
