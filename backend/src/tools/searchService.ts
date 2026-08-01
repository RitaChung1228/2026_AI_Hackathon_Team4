import type { SearchServiceInput, SearchServiceOutput } from "./types.js";

/**
 * 搜尋服務項目
 * 後端 B 實作：接上 DynamoDB 查詢
 */
export async function searchService(input: SearchServiceInput): Promise<SearchServiceOutput> {
  // TODO: 後端 B 實作真正的 DynamoDB 查詢
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const mockServices = [
    { id: "s1", vendorId: "v1", vendorName: "速達清潔", name: "居家清潔", type: 1, description: "專業到府清潔服務" },
    { id: "s2", vendorId: "v1", vendorName: "速達清潔", name: "冷氣清洗", type: 2, description: "分離式/窗型冷氣清洗" },
    { id: "s3", vendorId: "v2", vendorName: "快行車隊", name: "機場接送", type: 3, description: "桃園機場接送服務" },
    { id: "s4", vendorId: "v2", vendorName: "快行車隊", name: "高鐵接駁", type: 3, description: "高鐵站點接駁" },
    { id: "s5", vendorId: "v3", vendorName: "好味外送", name: "餐廳外送", type: 9, description: "合作餐廳外送到府" },
    { id: "s6", vendorId: "v4", vendorName: "美食訂位", name: "餐廳訂位", type: 6, description: "熱門餐廳線上訂位" },
    { id: "s7", vendorId: "v5", vendorName: "便利購物", name: "門市購物", type: 11, description: "門市商品預訂取貨" },
  ];

  let results = mockServices;

  if (input.type !== undefined) {
    results = results.filter((s) => s.type === input.type);
  }

  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    results = results.filter(
      (s) => s.name.includes(kw) || s.description.includes(kw) || s.vendorName.includes(kw)
    );
  }

  return { services: results };
}
