import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export interface ContentBlock {
  type: string; // "text" | "tool_use" | "tool_result"
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface BedrockResponse {
  id: string;
  content: ContentBlock[];
  model: string;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

/**
 * 呼叫 AWS Bedrock Claude 模型
 * @param messages - 對話訊息陣列
 * @param systemPrompt - 系統提示詞（選填）
 * @param maxTokens - 最大 token 數（預設 1024）
 * @param tools - 開放給模型呼叫的工具定義（選填，帶了才會啟用 tool-use）
 */
export async function invokeBedrockClaude(
  messages: ChatMessage[],
  systemPrompt?: string,
  maxTokens: number = 1024,
  tools?: ToolDefinition[]
): Promise<BedrockResponse> {
  const modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";

  const payload: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    messages,
  };

  if (systemPrompt) {
    payload.system = systemPrompt;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const result: BedrockResponse = JSON.parse(
    new TextDecoder().decode(response.body)
  );

  return result;
}

/**
 * 簡易版：送一段文字，取得回覆字串
 */
export async function chat(
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  const response = await invokeBedrockClaude(
    [{ role: "user", content: userMessage }],
    systemPrompt
  );

  return response.content[0]?.text ?? "";
}
