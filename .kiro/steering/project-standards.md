# 專案開發規範

本專案使用 Kiro AI 輔助開發，以下為開發時應遵循的標準。

## 技術棧

- Runtime: Node.js + TypeScript (ESM)
- Backend: Express
- AI: AWS Bedrock (Claude Sonnet 4)
- Database: PostgreSQL
- Package Manager: npm
- Test: Vitest

## 程式碼規範

- 使用 TypeScript strict mode
- 所有檔案使用 ES Module (import/export)
- API 回傳格式統一為 JSON
- 錯誤回傳格式: `{ "error": "描述", "detail": "細節" }`
- 環境變數放 .env，不可 commit 進 git
- 敏感資料（PII）需加密處理

## 檔案結構

- `backend/src/` - 後端 API 服務
- `frontend/src/` - 前端應用
- `db/` - 資料庫 schema、migration、seed
- `src/` - 共用工具模組（如加密）

## Git 規範

- Branch 命名: feature/xxx, fix/xxx
- Commit message 使用中文或英文皆可，需簡短描述變更內容
