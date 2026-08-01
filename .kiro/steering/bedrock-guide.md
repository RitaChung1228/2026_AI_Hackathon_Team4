---
inclusion: fileMatch
fileMatchPattern: "backend/**"
---

# AWS Bedrock 串接指引

## 環境變數

必要的環境變數（定義於 .env）：

- `AWS_REGION` - AWS 區域（目前使用 us-west-2）
- `AWS_ACCESS_KEY_ID` - AWS Access Key
- `AWS_SECRET_ACCESS_KEY` - AWS Secret Key
- `AWS_SESSION_TOKEN` - Session Token（Workshop 環境需要）
- `BEDROCK_MODEL_ID` - 模型 ID（目前使用 us.anthropic.claude-sonnet-4-20250514-v1:0）

## 使用方式

```typescript
import { chat, invokeBedrockClaude } from "./bedrock.js";

// 簡易版
const reply = await chat("你好");

// 多輪對話版
const response = await invokeBedrockClaude(
  [{ role: "user", content: "你好" }],
  "你是一個助手",  // system prompt
  1024             // max tokens
);
```

## 注意事項

- Model ID 需使用 inference profile 格式（帶 `us.` 前綴）
- Workshop 環境的 credentials 有時效性，過期需重新取得
- Bedrock API payload 格式依照 Anthropic Messages API
