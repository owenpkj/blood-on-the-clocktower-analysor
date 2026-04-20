# onboarding-bot · 波特克 POTCC

血染钟楼新手对话式学习助手。教规则、讲角色、给玩法建议——在浏览器打开即用，支持微信内 WebView 访问。

## 架构一览

```
用户浏览器
    │ HTTPS
    ▼
Caddy (reverse proxy, auto Let's Encrypt)
    │
    ▼
Next.js 16 前端 (standalone build) ──► 读本地 Postgres 查历史
    │ NDJSON streaming
    ▼
n8n 2.17.2 (Chat Trigger + AI Agent + Postgres Chat Memory)
    │
    ├── DeepSeek API (stream=true)
    └── /knowledge/*.md (volume 挂载)
```

- **前端**：Next.js 16 + shadcn/ui + react-markdown，哥特 BOTC 主题（登录页 + 聊天页）
- **后端**：n8n 2.17.2 工作流 — 单 pass 意图分类 + 多分支 AI Agent（详见 `docs/Architecture.md`）
- **LLM**：DeepSeek 流式
- **记忆**：Postgres Chat Memory 按 sessionId 持久化
- **知识**：`knowledge/core_rules.md` + 官方三板 md（仓库根 `knowledge/plays/`，挂载到 n8n 容器 `/knowledge:ro`）

## 文档

- `docs/BRD.md` — 业务需求
- `docs/Architecture.md` — 架构 + ADRs
- `docs/TaskPlan.md` — 实施计划
- `docs/Reasoning.md` — 推理方法论（留档）

## 本地开发

### 起依赖（n8n + postgres）

```bash
cd deploy
docker compose -f docker-compose.preview.yml up -d
```

n8n 编辑器在 http://localhost:5678。首次需要：
1. 注册 owner 账号（本地而已）
2. 配置 2 个 Credentials：DeepSeek（OpenAI 兼容）+ Postgres
3. 导入 `n8n/workflow-v0.3.json` 并激活

### 起前端 dev server

```bash
cd web
npm install
npm run dev
```

前端 http://localhost:3000。邀请码默认 `potcc2026`（`.env.local` 里配）。

## 部署（香港 VPS）

详细步骤见 `deploy/README.md`。简版：

```bash
# 1. VPS 首次初始化（root）
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/master/tools/onboarding-bot/deploy/install.sh | bash

# 2. 拉代码
git clone <repo-url>
cd <repo>/tools/onboarding-bot/deploy

# 3. 配置 .env
cp .env.example .env
# 编辑：DOMAIN / PG_PASSWORD / N8N_ENCRYPTION_KEY / VALID_INVITE_CODES

# 4. 起
docker compose up -d --build

# 5. 在 n8n UI 配置 Credentials + 导入 workflow
```
