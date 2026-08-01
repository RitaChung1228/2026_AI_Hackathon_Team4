import type { SearchProductInput, SearchProductOutput } from "./types.js";

/**
 * 搜尋零售商品
 * 後端 B 實作：接上 DynamoDB 查詢
 */
export async function searchProduct(input: SearchProductInput): Promise<SearchProductOutput> {
  // TODO: 後端 B 實作真正的 DynamoDB 查詢
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const mockProducts = [
    { id: "p1", name: "濃萃美式咖啡", price: 55, description: "門市現煮美式", category: "飲品" },
    { id: "p2", name: "拿鐵咖啡", price: 65, description: "門市現煮拿鐵", category: "飲品" },
    { id: "p3", name: "能量補給B群", price: 89, description: "提神保健食品", category: "保健" },
    { id: "p4", name: "熱壓吐司(火腿起司)", price: 45, description: "門市熱食", category: "食品" },
    { id: "p5", name: "雨傘(折疊)", price: 199, description: "輕便折疊傘", category: "生活用品" },
  ];

  let results = mockProducts;

  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    results = results.filter(
      (p) => p.name.includes(kw) || p.description.includes(kw) || p.category.includes(kw)
    );
  }

  if (input.category) {
    results = results.filter((p) => p.category === input.category);
  }

  if (input.limit) {
    results = results.slice(0, input.limit);
  }

  return { products: results };
}
