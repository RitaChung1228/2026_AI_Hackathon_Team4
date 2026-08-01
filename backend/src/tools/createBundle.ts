import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/dynamo.js";
import type { CreateBundleInput, CreateBundleOutput } from "./types.js";

const TABLE_NAME = process.env.DYNAMO_USER_LISTS_TABLE ?? "UserLists";

/**
 * 建立行程包草稿
 * 寫入 DynamoDB UserLists table
 */
export async function createBundle(input: CreateBundleInput): Promise<CreateBundleOutput> {
  const bundleId = `bnd-${Date.now()}`;
  const now = new Date().toISOString();

  const bundle = {
    bundleId,
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
    createdAt: now,
  };

  // 寫入 DynamoDB
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        user_id: input.userId,
        list_type_id: `TASK#${bundleId}`,
        type: "scenario_package",
        title: input.title,
        status: "draft",
        progress_percent: 0,
        is_saved_as_template: false,
        modules: input.steps.map((step, i) => ({
          module_name: step.description,
          status: "pending",
          detail: step.serviceId ?? step.productId ?? "",
          step_id: `step-${i + 1}`,
        })),
        created_at: now,
        updated_at: now,
      },
    })
  );

  return { bundle };
}
