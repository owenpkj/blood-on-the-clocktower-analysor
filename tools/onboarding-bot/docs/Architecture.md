# onboarding-bot 架构设计

## 概述

本工具是一个面向中文玩家、以教基础规则为主的血染钟楼 AI 对话助手。

**架构驱动力：**
1. **中国可达 + 微信内可开**：部署在香港 VPS，Let's Encrypt HTTPS，无 CDN 类不稳依赖
2. **真流式**：DeepSeek SSE → n8n → Next.js → 浏览器，全链路透传
3. **精确答疑**：system prompt 只塞核心规则；具体角色 / 剧本查询走 **Agent tool-calling**（查 Supabase + 读 knowledge/）
4. **单源**：`knowledge/` 为 SSOT；Supabase 作为 game-analyzer 维护的结构化派生数据，onboarding-bot 与它只读共用

**4 个容器**：`web`（Next.js 前端+代理）、`n8n`（AI Agent 编排）、`postgres`（会话记忆）、`caddy`（反代）。
**2 个外部服务**：Supabase（云端，存 roles/scripts 结构化数据）、DeepSeek API（LLM）。

## 技术选型

| 层 | 选择 | 理由 |
|----|------|------|
| 前端框架 | Next.js 16 + App Router | 已搭建并通过视觉评审；Route Handler 支持 Streaming Response |
| Next.js 构建 | `output: 'standalone'` + 多阶段 Dockerfile | 官方推荐；镜像 1.5GB → ~150MB |
| UI 组件 | shadcn/ui + Tailwind CSS 4 | 组件齐全、打包体积可控、已验证风格 |
| Markdown 渲染 | `react-markdown` + `remark-gfm` | 业界标准；禁 `rehypeRaw` 防 XSS |
| 字体 | Cinzel (heading) + Libre Baskerville (body) via `next/font/google` | 哥特衬线；自托管无 FOUT |
| 状态管理 | React useState + localStorage | 无需全局 store；会话数据由后端主导 |
| 编排 | n8n 2.17.2 社区自托管 | 用户约束；Chat Trigger 原生 streaming；AI Agent 原生 tools |
| LLM | DeepSeek Chat Completions（OpenAI 兼容） | 用户指定；中国访问稳定；支持 `stream: true` 与 prompt caching |
| 会话记忆 | n8n Postgres Chat Memory | 持久化；复用本地 Postgres 容器 |
| 结构化知识 | Supabase（云端，game-analyzer 共用） | 结构化 roles/scripts 表；仅读访问 |
| 叙事知识 | `knowledge/*.md` 只读卷挂载到 n8n | 含核心规则 + 剧本规则澄清；作为 SSOT |
| DB | Postgres 16（本地）| n8n 推荐；仅存聊天记忆；不公网暴露 |
| 反代 + HTTPS | Caddy 2 | Caddyfile 极简；自动 ACME |
| 部署编排 | docker-compose v2 | 单机足够 |

## 系统架构图

```
                     [ 用户浏览器 / 微信 WebView ]
                                   │ HTTPS
                                   ▼
                      ┌──────────────────────────┐
                      │       Caddy (反代)        │  ── 自动 HTTPS (Let's Encrypt)
                      │   yourdomain.com  →      │
                      └──────────┬───────────────┘
                                 │
                                 ▼
                         ┌────────────────┐
                         │   web          │  Next.js 16 (standalone)
                         │   :3000        │  Routes: / /chat /api/login /api/chat /api/history
                         └───┬────────┬───┘
                             │        │
                  /api/chat  │        │ /api/history (直查本地 pg)
                             │        │
                             ▼        ▼
                   ┌──────────────┐  ┌─────────────────┐
                   │  n8n         │  │  postgres       │
                   │  :5678       │  │  :5432 (内网)    │
                   │  (内网)       │  │                 │
                   │              │  │ n8n_chat_histories
                   │  workflow:   │  │ (chat memory)   │
                   │  Onboarding  │◀─┤                 │
                   │  Chat Agent  │  └─────────────────┘
                   │  + tools     │
                   └──┬────────┬──┘
                      │        │
                 LLM  │        │ tools (SQL + 文件)
                      │        │
                      ▼        ▼
               DeepSeek      Supabase (cloud)
               api.deepseek  roles / scripts 表
                             + /knowledge/*.md (挂载卷)
```

**网络与信任边界：**
- Caddy 是唯一对外暴露的服务
- `n8n` / `postgres` 仅容器内网可见
- `web` 与 `n8n`、`postgres` 之间通过 docker-compose 网络 DNS 通信
- Supabase、DeepSeek 是外部公网 HTTPS 服务

## 组件职责

### 1. `web`（Next.js 前端 + 反向代理）

**路由**
- `GET /` — 登录页（邀请码 + 昵称）
- `GET /chat` — 对话页（server component 校验 cookie）
- `POST /api/login` — 校验邀请码，通过后写 HttpOnly cookie
- `GET /api/history?sessionId=X` — 从本地 Postgres 直接查历史消息
- `POST /api/chat` — SSE 代理到 n8n，逐 token 透传

**关键设计**
- **邀请码校验**：`/api/login` 比对环境变量 `VALID_INVITE_CODES`（逗号分隔）→ 通过则 `set-cookie invite_ok=1` (HttpOnly, Secure, SameSite=Lax, 30 天)
- **路由保护**：`/chat` 的 server component 读 cookie，未通过 redirect `/`
- **SSE 代理**：`/api/chat` Route Handler 返回 `new Response(upstreamN8nRes.body)`，stream 透传
- **历史查询**：`/api/history` 用 `pg` 客户端直连本地 Postgres，`SELECT ... FROM n8n_chat_histories WHERE session_id=$1 ORDER BY id ASC`，转成消息数组
- **Markdown 渲染**：Bot 消息 `<ReactMarkdown remarkPlugins={[remarkGfm]} />`，禁用 rehypeRaw

### 2. `n8n`（AI Agent 编排）

**单一工作流：`Onboarding Chat Agent`**

```
Chat Trigger
  (POST /webhook/onboarding/chat, streaming 开启)
      │
      ▼
AI Agent（LangChain）
  ├─ Chat Model:  OpenAI Chat Model
  │                 - Base URL: https://api.deepseek.com
  │                 - Model:    deepseek-chat
  │                 - stream:   true
  ├─ Memory:      Postgres Chat Memory
  │                 - Connection: 本地 postgres
  │                 - Session Key: sessionId
  │                 - Window: 最近 20 轮
  ├─ System Prompt:
  │     段一: Agent 行为准则（规则导师身份、不编造、中文）
  │     段二: {{ knowledge/core_rules.md 全文 }}  (启动时静态载入)
  └─ Tools:       [见下节 "AI Agent Tools Design"]
      │
      ▼
Respond to Webhook (streaming passthrough)
```

### 3. `postgres`（本地 · 聊天记忆）

- 单数据库 `n8n`，仅一张运行时关注的表：`n8n_chat_histories`（n8n Pg Chat Memory 节点自动建）
- 同时 n8n 也把自身 workflow / credentials 存这里
- 挂载卷 `/var/lib/postgresql/data`
- 不公网暴露

### 4. `caddy`（HTTPS + 反代）

```
yourdomain.com {
  reverse_proxy web:3000
}
```
自动申请 Let's Encrypt 证书、自动续期。

### 外部：Supabase（结构化知识）

- 复用 game-analyzer 的 `roles` / `scripts` 表（已 seed）
- onboarding-bot 仅以 **anon key + 只读** 访问
- 将来 SSOT 治理：由 `knowledge/` 派生（待单独立项）

### 外部：DeepSeek API

- 通过 n8n OpenAI Chat Model 节点调用
- API Key 存 n8n Credentials（AES 加密）

## 知识注入（v1）

System prompt 结构：
```
段一：Agent 行为准则（规则导师身份、不编造、中文、简洁）
段二：knowledge/core_rules.md 全文
段三：knowledge/plays/<官方三板>.md 全文拼接
```

通过 n8n 的 Code 节点在 workflow 执行时读取挂载 volume `/knowledge/` 下的 markdown 文件（`fs.readFileSync`）。Agent 完全依赖 system prompt 里的知识作答；不调外部工具、不查 DB。

### Agent 意图分类（single-pass classify + branch）

仍保留「意图分类 → 分支执行」主干流程（workflow-v0.3.json）：

1. Chat Trigger 接收消息
2. 若 `chatInput == "__INIT__"` → AI Agent - Opening（个性化开场白）
3. 否则 → Classify Intent（非流式，返回 JSON `{intent, role_name?, role_confidence}`）
4. Switch 按 intent 路由：
   - 了解基本规则 → AI Agent - Basic Rules（system 含 core_rules）
   - 了解角色（role_confidence ≥ 0.7） → AI Agent - Role Info（system 含 plays）
   - 了解角色（role_confidence < 0.7） → AI Agent - Ask Confirm（让用户澄清角色名）
   - 其他 → AI Agent - Other（LLM 复述固定歉意文案以保持流式一致）
   - 结束对话 → AI Agent - End（告别）

所有终端 AI Agent 共享 `n8n_chat_histories` 表的 Postgres Chat Memory（按 sessionId 分会话）。

### 将来扩展触发

以下任一发生，回到 ADR-008 的 Hybrid Tool-calling 设计：
- 剧本总量 > 10 个
- knowledge/ 全文拼接 > 20k token
- 需要结构化查询能力（如「列出暗流涌动所有爪牙」）

## 数据模型

### Session（浏览器本地）
```ts
// localStorage
'botc-onboarding-session' : string  // 客户端生成: s_<base36 time>_<6 rand>
'botc-nickname'           : string
'botc-invite'             : string  // 仅用于回填登录页
```

### Cookie（Next.js 服务端签发）
```
invite_ok=1  (HttpOnly, Secure, SameSite=Lax, Max-Age=30d)
```

### 本地 Postgres 表（n8n 管理）
```sql
CREATE TABLE n8n_chat_histories (
  id         bigserial PRIMARY KEY,
  session_id varchar(255) NOT NULL,
  message    jsonb NOT NULL,   -- {type: 'human'|'ai', data: {content: string, ...}}
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON n8n_chat_histories(session_id);
```

### Wire 格式

**`POST /api/login` 请求**
```json
{ "inviteCode": "ABC123", "nickname": "阿明" }
```
**响应 200**：`set-cookie invite_ok=1`，body `{ "ok": true }`
**响应 403**：`{ "ok": false, "error": "invalid_invite" }`

**`POST /api/chat` 请求**
```json
{ "sessionId": "s_...", "chatInput": "什么是爪牙？", "nickname": "阿明" }
```
**响应**：SSE 流
```
data: {"type":"token","content":"爪牙"}
data: {"type":"token","content":"是邪恶阵营..."}
data: {"type":"done"}
```

**`GET /api/history?sessionId=X` 响应**
```json
{
  "sessionId": "s_...",
  "messages": [
    { "role": "assistant", "content": "阿明，欢迎...", "createdAt": "2026-04-20T08:00:00Z" },
    { "role": "user",      "content": "什么是爪牙？", "createdAt": "2026-04-20T08:00:10Z" }
  ]
}
```

## 流式 + Tool-calling 端到端链路

```
用户按 Enter
  → Browser fetch('/api/chat', stream)
     → Next.js Route Handler POST n8n webhook
        → n8n Chat Trigger 接收
           → AI Agent 决策：需要 tool 吗？
              [分支 A：问的是基础规则 → 直接 call LLM]
                 → DeepSeek stream=true
                    ← SSE tokens
                 ← n8n Agent 逐 token forward
              ← n8n Respond streaming
           [分支 B：问的是具体角色 → 先 call tool]
                 → get_role_info("占卜师")
                    → Supabase query + knowledge file read
                 ← merged JSON
              → DeepSeek with tool result in context
                 ← SSE tokens
              ← n8n forward stream
           ← n8n Respond streaming
     ← Next.js pipe response.body
  ← Browser ReadableStream reader，append state
  → react-markdown 每次 state 变化 re-render
```

**关键点**：
- 分支 B 首 token 延迟会比分支 A 多 1-2 秒（tool 往返）；tool 执行本地非常快（DB + 文件都在同 VPS）
- 流式体验从 "首 token 到达"即开始，用户感知平滑
- `output: 'standalone'` Next.js 容器内存占用约 150-300MB

## 部署拓扑

### docker-compose.yml（示意，放 `tools/onboarding-bot/deploy/`）

```yaml
services:
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on: [web]

  web:
    build:
      context: ../web
      dockerfile: Dockerfile   # 多阶段 + output: 'standalone'
    environment:
      N8N_CHAT_WEBHOOK_URL: http://n8n:5678/webhook/onboarding/chat
      POSTGRES_HOST: postgres
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: "${PG_PASSWORD}"
      VALID_INVITE_CODES: "${VALID_INVITE_CODES}"
      NODE_ENV: production
    depends_on: [n8n, postgres]

  n8n:
    image: n8nio/n8n:2.17.2
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: "${PG_PASSWORD}"
      N8N_ENCRYPTION_KEY: "${N8N_ENCRYPTION_KEY}"
      N8N_RUNNERS_ENABLED: "true"
    volumes:
      - n8n_data:/home/node/.n8n
      - ../../../knowledge:/knowledge:ro   # SSOT 叙事知识只读挂载
    depends_on: [postgres]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: "${PG_PASSWORD}"
      POSTGRES_DB: n8n
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  caddy_data:
  caddy_config:
  n8n_data:
  pg_data:
```

### .env（示意）
```
PG_PASSWORD=...
N8N_ENCRYPTION_KEY=<openssl rand -hex 32>
VALID_INVITE_CODES=BOTC2026,EARLY,FRIENDS
# Supabase 和 DeepSeek 在 n8n Credentials 界面配置，不放 env
```

### 机器规格
- 香港轻量服务器 2C4G / 40G SSD（阿里云 / 腾讯云），约 60 元/月
- 30Mbps 带宽（流式场景够）

## 架构决策记录（ADR）

### ADR-001：反代用 Caddy
- **状态**：采纳
- **背景**：需 HTTPS + 反代
- **决策**：Caddy 2；Caddyfile 3 行
- **取舍**：Let's Encrypt 自动化、配置极简
- **触发替换条件**：引入 WAF、多服务复杂路由、需要 HTTP 层级 QPS 打点时换 Nginx

### ADR-002：真流式全链路（SSE 透传）
- **状态**：采纳
- **背景**：用户明确拒绝"假流式"
- **决策**：DeepSeek SSE → n8n → Next.js `new Response(upstream.body)` → Browser SSE
- **后果**：首 token 延迟可低于 1s；中间任一段挂了需要定位，通过 n8n 日志 + Next.js route 日志排查

### ADR-003：邀请码校验放 Next.js
- **状态**：采纳
- **决策**：`/api/login` 校验环境变量白名单；n8n 不关心
- **后果**：n8n 单一职责；信任边界在 web 层；n8n 只在内部网络暴露

### ADR-004：客户端生成 sessionId，不做服务端会话
- **状态**：采纳
- **决策**：sessionId 在浏览器 localStorage 生成；后端仅以此为键
- **后果**：清浏览器数据 = 丢历史；多设备不同步（与 BRD 一致）

### ADR-005：Markdown 渲染禁用原始 HTML
- **状态**：采纳
- **决策**：`react-markdown` + `remark-gfm`；**不加 `rehypeRaw`**
- **后果**：XSS 安全；AI 若输出 `<br>` 等 HTML 会被当文本；在 system prompt 里提示 AI 用纯 Markdown

### ADR-006：聊天记忆使用本地 Postgres Chat Memory
- **状态**：采纳（延续 BRD 约束 C4）
- **决策**：n8n 内置 Postgres Chat Memory 节点，复用本地 Postgres 实例

### ADR-007：Next.js 用 `output: 'standalone'` 多阶段 Dockerfile
- **状态**：采纳
- **背景**：Docker 部署 Next.js 的官方最佳实践
- **决策**：`next.config.ts` 设 `output: 'standalone'`；Dockerfile 三段（deps → builder → runner），运行态只装运行依赖
- **后果**：镜像从 ~1.5GB → ~150MB；冷启动快；无容器内 `npm`
- **代价**：写约 30 行 Dockerfile（Vercel 官方 examples 有模板）

### ADR-008：知识注入（v1：纯 markdown 挂载）
- **状态**：采纳（v1 简化版，不依赖 Supabase）
- **背景**：v1 scope 仅官方三板，内容量小（约 5-10k tokens），可以全文塞 system prompt 而不引发 attention dilution
- **决策**：
  - **System prompt**：`knowledge/core_rules.md` + `knowledge/plays/` 下全部剧本 md 全文拼接 + Agent 行为准则
  - 通过 n8n Code 节点在 workflow 运行时 `fs.readFileSync` 读取拼接
  - Agent 在对话中根据 system prompt 内容回答
- **原考虑（已推迟）**：Hybrid Tool-calling + Supabase 结构化数据合并。考虑到：
  - v1 scope 内容量小，全塞 system prompt 足够
  - Supabase 对中国访问不稳定（HK VPS 尚可但仍是跨境依赖）
  - 减少架构复杂度与外部失败点
- **后果**：
  - 优：零外部服务依赖（知识 100% 本地）；没有 tool 调用延迟；部署简单
  - 劣：token 成本稍高（DeepSeek prompt caching 缓解）；若将来扩展到 10+ 剧本需要回归 Hybrid 设计
  - 后续触发：知识总量 >20k token 或需要结构化查询（"列出暗流涌动所有爪牙"）时，重新评估引入 Hybrid Tool
- **关联**：BRD v1.3 的 out-of-scope "Supabase 结构化知识查询"

### ADR-009：history 由 Next.js 直查本地 Postgres，不经 n8n
- **状态**：采纳
- **背景**：读历史是纯 SQL，无 AI 逻辑
- **决策**：Next.js `/api/history` 用 `pg` 客户端直连本地 Postgres，查 `n8n_chat_histories`
- **后果**：
  - 优：少一个 n8n workflow，少一跳，延迟更低
  - 劣：schema 耦合 `n8n_chat_histories` 表（langchain-node 维护，多年稳定）
  - 可接受

### ADR-010：knowledge/ 以只读 volume 挂载到 n8n（SSOT）
- **状态**：采纳
- **背景**：叙事知识需要被 Agent tools 读取
- **决策**：docker-compose 把 `../../knowledge/` 挂载到 n8n 容器 `/knowledge:ro`，tools 运行时读文件
- **后果**：`knowledge/` 仍是 SSOT；改 markdown 重启容器生效；与 Supabase 结构化数据解耦
- **后续**：SSOT 治理（从 knowledge/ 派生 Supabase seed）单独立项，本工具暂接受两者并行

## 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| DeepSeek 限流 / 崩溃 | 用户聊不了 | 前端失败态 + 重试按钮 |
| LLM tool 误调 / 漏调 | 角色问答精度退化 | System prompt 里强调 tool 使用准则；测试集覆盖"占卜师 / 投毒者 / 诺达鲺"三类代表 |
| Supabase 云端访问中断 | 角色 / 剧本 tool 失败 | tool 实现加超时 + 降级：fallback 只用 knowledge 文件返回；monitoring 告警 |
| Supabase 与 knowledge 数据偏差 | Tool 返回矛盾信息 | 治理：待 SSOT 脚本上线前，在 tool 合并逻辑里以文件为准、DB 为辅 |
| n8n 2.x breaking change | 升级后 workflow 挂 | 锁定镜像 tag `2.17.2`；升级前先 staging 跑 |
| 微信 WebView SSE 被断 | 流式失效 | 真机测试 iOS/Android WeChat；必要时退化为非流式 + 服务端缓冲 |
| 邀请码泄漏扩散 | 非目标用户涌入 | 成本低（DeepSeek 账单受限流保护）；出问题旋转 `VALID_INVITE_CODES` |
| 历史消息过长塞爆 context | Token 超限 / 贵 | Memory 用 Window Buffer 20 轮；system prompt 约 2-3k token |
| VPS 单点故障 | 全站挂 | MVP 接受；Postgres 定时 `pg_dump` 到异地对象存储（阿里云 OSS / 腾讯云 COS） |
| docker volume 丢失 | 所有历史丢 | 同上 pg_dump 冷备 |
| Next.js 16 未知 bug | 构建或运行失败 | AGENTS.md 要求读最新 docs；必要时 pin 次稳定版 |

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-20 | 初版匹配 BRD v1.2 |
| 1.1 | 2026-04-20 | 纳入 Caddy 保留说明、history 直连本地 pg（ADR-009）、Next.js standalone（ADR-007）、Hybrid tool-calling（ADR-008）、knowledge 挂载（ADR-010）、AI Agent Tools Design 章节 |
| 1.2 | 2026-04-20 | v1 scope 收敛：ADR-008 简化为纯 markdown 注入（Supabase 依赖推迟）；Tools Design 章节改写为"知识注入（v1）" |
