import { describe, expect, it, vi } from "vitest";

const mockSend = vi.fn();
vi.mock("../lib/dynamo.js", () => ({
  ddb: { send: (...args: unknown[]) => mockSend(...args) },
}));

import { searchService } from "./searchService.js";

const FIXTURE = [
  { service_id: "srv_move_aplus", service_name: "全屋搬家服務", vendor_name: "A+ 搬家", type: "20", category: "home_service", price: 6800, description: "", img_url: "" },
  { service_id: "srv_home_clean", service_name: "一般居家清潔服務", vendor_name: "統一社區清潔夥伴", type: "1", category: "home_service", price: 1500, description: "", img_url: "" },
];

describe("searchService", () => {
  it("關鍵字對得上但 type 猜錯時，退回只用關鍵字比對（不能被錯的 type 濾光）", async () => {
    mockSend.mockResolvedValueOnce({ Items: FIXTURE });
    const { services } = await searchService({ type: 3, keyword: "搬家" });
    expect(services.map((s) => s.service_id)).toEqual(["srv_move_aplus"]);
  });

  it("type 猜對時正常用 type + 關鍵字一起篩", async () => {
    mockSend.mockResolvedValueOnce({ Items: FIXTURE });
    const { services } = await searchService({ type: 1, keyword: "清潔" });
    expect(services.map((s) => s.service_id)).toEqual(["srv_home_clean"]);
  });

  it("type 對但關鍵字真的沒有對應資料時，維持空結果（不誤觸退回邏輯）", async () => {
    mockSend.mockResolvedValueOnce({ Items: FIXTURE });
    const { services } = await searchService({ type: 1, keyword: "不存在的服務" });
    expect(services).toEqual([]);
  });
});
