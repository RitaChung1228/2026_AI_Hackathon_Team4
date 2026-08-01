/**
 * Tool Input/Output 型別定義
 * 後端 A 和 B 共同約定的合約，兩邊都照這個做。
 */

// ============================
// search_product
// ============================
export interface SearchProductInput {
  keyword: string;
  category?: string;
  limit?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface SearchProductOutput {
  products: Product[];
}

// ============================
// search_service
// ============================
export interface SearchServiceInput {
  type?: number; // 1清潔/2家電清洗/3寄件/6訂位/9外送/10水電修繕/11購物
  keyword?: string;
}

export interface Service {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  type: number;
  description: string;
}

export interface SearchServiceOutput {
  services: Service[];
}

// ============================
// get_user_profile
// ============================
export interface GetUserProfileInput {
  userId: string;
}

export interface UserProfile {
  userId: string;
  hashtags: string[];
  preferences: {
    decisionStyle: string;
    lifestyle: string;
    habits: string[];
  };
}

export interface GetUserProfileOutput {
  profile: UserProfile;
}

// ============================
// create_bundle
// ============================
export interface CreateBundleInput {
  userId: string;
  title: string;
  steps: Array<{
    description: string;
    serviceId?: string;
    productId?: string;
  }>;
}

export interface Bundle {
  bundleId: string;
  userId: string;
  title: string;
  steps: Array<{
    stepId: string;
    description: string;
    serviceId?: string;
    productId?: string;
    completed: boolean;
  }>;
  status: "draft" | "active" | "completed";
  createdAt: string;
}

export interface CreateBundleOutput {
  bundle: Bundle;
}

// ============================
// create_order
// ============================
export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId?: string;
    serviceId?: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  remark?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: CreateOrderInput["items"];
  totalPrice: number;
  status: "draft" | "confirmed" | "completed";
  remark?: string;
  createdAt: string;
}

export interface CreateOrderOutput {
  order: Order;
}

// ============================
// get_weather
// ============================
export interface GetWeatherInput {
  city: string;
  date?: string; // YYYY-MM-DD，省略則為今天
}

export interface GetWeatherOutput {
  city: string;
  date: string;
  temperature: number;
  condition: string; // 晴天/多雲/雨天
  rainProbability: number; // 0-100
  suggestion: string;
}

// ============================
// Tool 名稱常數
// ============================
export type ToolName =
  | "search_product"
  | "search_service"
  | "get_user_profile"
  | "create_bundle"
  | "create_order"
  | "get_weather";
