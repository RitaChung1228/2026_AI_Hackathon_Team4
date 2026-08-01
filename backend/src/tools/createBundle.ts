import type { CreateBundleInput, CreateBundleOutput } from "./types.js";

/**
 * 建立行程包草稿
 * 後端 B 實作：寫入 DynamoDB
 */
export async function createBundle(input: CreateBundleInput): Promise<CreateBundleOutput> {
  // TODO: 後端 B 實作真正的 DynamoDB 寫入
  // 目前回傳 mock data 供後端 A 測試 agent loop

  const bundle = {
    bundleId: `bnd-${Date.now()}`,
    userId: input.userId,
    title: input.title,
    steps: input.steps.map((step, i) => ({
      stepId: `step-${i + 1}`,
      description: step.description,
      serviceId: step.serviceId,
      productId: step.productId,
      completed: false,
    })),
    status: "draft" as const,
    createdAt: new Date().toISOString(),
  };

  return { bundle };
}
