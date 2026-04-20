# onboarding-bot 实施计划

基于 BRD v1.2 + Architecture v1.1。

## 里程碑概览

| # | 里程碑 | 说明 | 任务 |
|---|--------|------|------|
| M1 | 后端 MVP（本地可用） | n8n 工作流 + 3 个 tool + Postgres 记忆 + DeepSeek 接入 | T1-T7 |
| M2 | 前端完成接入 | 登录页、真流式、Markdown、历史加载、错误处理 | T8-T13 |
| M3 | 知识补齐 | 补瓦釜雷鸣.md、Agent prompt 调优、tool 行为验证 | T14-T16 |
| M4 | 容器化与部署 | standalone Dockerfile、docker-compose、Caddy | T17-T21 |
| M5 | 上线打磨 | 真机微信测试、监控 / 日志 / 备份 | T22-T26 |

---

## M1：后端 MVP（本地可用）

### T1：n8n 本地环境准备（已部分完成）
- **复杂度**：S
- **依赖**：无
- **描述**：本地 n8n 2.17.2 + Postgres 容器拉起；预览 workflow 已删，开始新 workflow
- **验收**：
  - [ ] 替换预览 compose → 本地 dev 版 compose（n8n + postgres + knowledge 挂载）
  - [ ] 访问 localhost:5678 可进画布
  - [ ] Postgres 健康，`n8n_chat_histories` 尚未建（首次 chat 后由 Memory 节点创建）
- **文件**：
  - `tools/onboarding-bot/deploy/docker-compose.dev.yml`

### T2：DeepSeek Credentials 配置
- **复杂度**：S
- **依赖**：T1
- **描述**：在 n8n 添加 OpenAI Credentials，Base URL 设 `https://api.deepseek.com`，填入用户的 API Key
- **验收**：
  - [ ] Credentials 命名 `DeepSeek`
  - [ ] 测试节点能返回 deepseek-chat 的 hello world

### T3：Postgres Chat Memory 接入
- **复杂度**：S
- **依赖**：T1
- **描述**：n8n 中配置 Postgres Credentials（指向本地容器），添加 Postgres Chat Memory 节点
- **验收**：
  - [ ] Credentials 测试连接成功
  - [ ] Memory 节点能以 sessionId 为 key 读写

### T4：Tool 1 - `get_role_info` sub-workflow
- **复杂度**：M
- **依赖**：T1
- **描述**：独立 workflow，入参 `role_name`，出参合并 Supabase 查询 + `knowledge/plays/*.md` 章节
- **验收**：
  - [ ] Supabase HTTP Request 或 Postgres 节点，`SELECT * FROM roles WHERE name_zh=$1 OR name_en=$1 OR id=$1`
  - [ ] Read Binary File 批量读取挂载目录 `/knowledge/plays/*.md`
  - [ ] Code 节点提取 `#### <role_name>` 到下一个 `####` 之间的章节
  - [ ] 返回合并 JSON（见 Architecture.md Tool 1 示例）
  - [ ] 手工测试占卜师 / 投毒者 / 诺达鲺 返回正确
- **文件**：
  - n8n workflow 导出 `tools/onboarding-bot/n8n/tool_get_role_info.json`

### T5：Tool 2 - `get_script_info` sub-workflow
- **复杂度**：M
- **依赖**：T4
- **描述**：类似 T4，针对 scripts 表 + 剧本 md
- **验收**：
  - [ ] Supabase 查 `scripts` 表
  - [ ] 读 `knowledge/plays/<中文名>.md` 提取"核心特殊规则""说书人注意事项"
  - [ ] 手工测试 4 个剧本返回正确
- **文件**：
  - `tools/onboarding-bot/n8n/tool_get_script_info.json`

### T6：Tool 3 - `list_roles` sub-workflow
- **复杂度**：S
- **依赖**：T4
- **描述**：纯 Supabase 查询，按 script + type 过滤
- **验收**：
  - [ ] 支持 `{ script_name, type? }` 入参
  - [ ] 返回 `[{id, name_zh, type}]` 列表
- **文件**：
  - `tools/onboarding-bot/n8n/tool_list_roles.json`

### T7：主工作流 `Onboarding Chat Agent`
- **复杂度**：L
- **依赖**：T2, T3, T4, T5, T6
- **描述**：Chat Trigger → AI Agent（挂 DeepSeek + Memory + 3 个 Tool） → Respond to Webhook
- **验收**：
  - [ ] Chat Trigger 为 webhook 模式，非 hostedChat（我们用自己的前端）
  - [ ] AI Agent system prompt 结构：行为准则 + core_rules 全文 + tool 使用准则
  - [ ] 启动时静态载入 knowledge/core_rules.md（用 Read File 节点 init 或粘贴）
  - [ ] Streaming 开启（response mode = streaming）
  - [ ] curl POST webhook 测试：基础规则问题（不 call tool）回答正确
  - [ ] curl POST webhook 测试："占卜师怎么玩" 触发 `get_role_info` tool，回答包含精确 ability
  - [ ] Memory 跨轮生效（第二轮问"刚才说的那个什么技能"能 reference 上下文）
- **文件**：
  - `tools/onboarding-bot/n8n/workflow_onboarding_chat.json`
  - `tools/onboarding-bot/n8n/system_prompt.md`（导出文本，便于 code review）

---

## M2：前端完成接入

### T8：Next.js 项目收尾
- **复杂度**：S
- **依赖**：无（原型已在）
- **描述**：原型重构，对齐 Architecture：删无关 SUGGESTIONS、完善路由保护
- **验收**：
  - [ ] `/` 登录页（已有）
  - [ ] `/chat` 对话页（已有；去掉硬编码开场白，改为来自历史 / Agent）
  - [ ] 已添加 dev + prod 的 `.env.example`

### T9：`/api/login` 邀请码校验
- **复杂度**：S
- **依赖**：T8
- **描述**：后端校验，写 HttpOnly cookie
- **验收**：
  - [ ] 读 `process.env.VALID_INVITE_CODES`，split(',')
  - [ ] 登录页 form 提交 `/api/login`
  - [ ] 通过 → set-cookie + 200；失败 → 403
  - [ ] `/chat` 用 server-side cookies() 校验，未通过 redirect `/`
- **文件**：
  - `web/src/app/api/login/route.ts`
  - `web/src/app/chat/page.tsx`（加 server component 校验）

### T10：`/api/history` 直连本地 Postgres
- **复杂度**：M
- **依赖**：T3（n8n_chat_histories 表需存在）
- **描述**：用 `pg` 查 chat memory 表，转消息数组
- **验收**：
  - [ ] `npm i pg`
  - [ ] 从 env 读 PG_* 配置
  - [ ] Query `SELECT id, message, created_at FROM n8n_chat_histories WHERE session_id=$1 ORDER BY id ASC`
  - [ ] message.jsonb 解析为 `{role, content}`
  - [ ] 空 history 返回 `{messages: []}`
- **文件**：
  - `web/src/app/api/history/route.ts`
  - `web/src/lib/db.ts`（pg 单例）

### T11：`/api/chat` SSE 代理
- **复杂度**：M
- **依赖**：T7
- **描述**：Next.js Route Handler 把 n8n webhook 的 streaming body 透传给浏览器
- **验收**：
  - [ ] POST 请求体 `{sessionId, chatInput, nickname}`
  - [ ] Fetch n8n webhook 打开 streaming body
  - [ ] `return new Response(upstream.body, { headers: {...SSE headers} })`
  - [ ] n8n 挂了时前端收到明确错误 JSON
- **文件**：
  - `web/src/app/api/chat/route.ts`（改写现有 echo 版本）

### T12：前端 SSE 消费 + Markdown 渲染
- **复杂度**：L
- **依赖**：T11
- **描述**：浏览器端 ReadableStream 读取 SSE，逐 token append，react-markdown 实时渲染
- **验收**：
  - [ ] `npm i react-markdown remark-gfm`
  - [ ] 发送消息后开启 stream，append 到当前 bot 消息 state
  - [ ] react-markdown 在半完成 Markdown 下无报错
  - [ ] 断流 / 网络错误 UI 明确（"连接断开，点重试"）
  - [ ] typing indicator 在首 token 到达前显示，到达后消失
- **文件**：
  - `web/src/app/chat/page.tsx`
  - `web/src/components/chat/MessageBubble.tsx`（改用 Markdown 渲染 bot 消息）

### T13：历史加载流程
- **复杂度**：M
- **依赖**：T10, T12
- **描述**：对话页挂载时调 `/api/history`；有历史则展示，无历史则显示 AI 开场白（从 Agent 触发，不硬编码）
- **验收**：
  - [ ] 挂载时 GET /api/history?sessionId=X
  - [ ] 有消息 → 渲染历史
  - [ ] 空历史 → 触发一次 "init" chat（给 Agent 发特殊的首次招呼 prompt，让 Agent 生成欢迎语）
  - [ ] 避免重复开场白（session 有历史则不再触发 init）

---

## M3：知识补齐

### T14：补写 `knowledge/plays/瓦釜雷鸣.md`
- **复杂度**：M
- **依赖**：无
- **描述**：参考 `tools/game-analyzer/app/scripts/seed.ts` 中 `catfishing` + 相关角色，补写该剧本 md 文件
- **验收**：
  - [ ] 文件结构与其他 4 剧本一致
  - [ ] 包含基本信息、特殊规则、分配表、角色详解（至少技能原文）、夜晚顺序
  - [ ] 用户 review 通过
- **文件**：
  - `knowledge/plays/瓦釜雷鸣.md`

### T15：System prompt 打磨
- **复杂度**：M
- **依赖**：T7
- **描述**：基于真实对话测试，迭代 Agent 行为准则 + tool 使用指引的措辞
- **验收**：
  - [ ] 零基础问"什么是血染钟楼" → 语气亲切不啰嗦
  - [ ] 问"占卜师" → 正确调用 `get_role_info`
  - [ ] 问"暗流涌动有哪些爪牙" → 正确调用 `list_roles`
  - [ ] 问超出 knowledge 范围（比如"隐士强吗"主观评价） → 明确说不知道

### T16：Tool 回归测试
- **复杂度**：S
- **依赖**：T15
- **描述**：写一份测试用例清单，手工跑一遍
- **验收**：
  - [ ] 覆盖每个剧本的 1 个代表角色、1 个 setup-modifier（教父 / 男爵 / 方古）、1 个交互复杂角色（诺达鲺 / 洗脑师）
  - [ ] 每个案例 Agent 输出含精确 ability、相关规则澄清
- **文件**：
  - `tools/onboarding-bot/tests/agent_qa_cases.md`

---

## M4：容器化与部署

### T17：Next.js Dockerfile（multi-stage + standalone）
- **复杂度**：M
- **依赖**：T8-T13
- **描述**：三段式 Dockerfile，基于 Vercel 官方模板
- **验收**：
  - [ ] `next.config.ts` 设 `output: 'standalone'`
  - [ ] deps 阶段只装依赖
  - [ ] builder 阶段 `next build`
  - [ ] runner 阶段 copy standalone 输出 + public + .next/static
  - [ ] 镜像 size ≤ 200MB
  - [ ] `docker run` 本地起 → 访问 3000 正常
- **文件**：
  - `tools/onboarding-bot/web/Dockerfile`
  - `tools/onboarding-bot/web/.dockerignore`

### T18：生产 docker-compose
- **复杂度**：M
- **依赖**：T17
- **描述**：匹配 Architecture 的 4 容器
- **验收**：
  - [ ] 4 服务：caddy / web / n8n / postgres
  - [ ] `.env.example` 含 `PG_PASSWORD`、`N8N_ENCRYPTION_KEY`、`VALID_INVITE_CODES`
  - [ ] 本地拉起全套，流程跑通
- **文件**：
  - `tools/onboarding-bot/deploy/docker-compose.yml`
  - `tools/onboarding-bot/deploy/.env.example`

### T19：Caddyfile
- **复杂度**：S
- **依赖**：T18
- **描述**：最小配置反代 web
- **验收**：
  - [ ] 本地用 `caddy.localhost` 跑通 HTTP；VPS 会切 HTTPS
- **文件**：
  - `tools/onboarding-bot/deploy/Caddyfile`

### T20：香港 VPS 初始化脚本
- **复杂度**：M
- **依赖**：T18
- **描述**：一键装 docker + compose + ufw + swap
- **验收**：
  - [ ] `install.sh` 在干净 Ubuntu 24.04 跑完，docker / compose 可用
  - [ ] 开启 80/443 防火墙
  - [ ] 2G 以下内存机器加 swap
- **文件**：
  - `tools/onboarding-bot/deploy/install.sh`
  - `tools/onboarding-bot/deploy/README.md`（部署手册）

### T21：首次部署与域名打通
- **复杂度**：M
- **依赖**：T20
- **描述**：实际购买 VPS，域名 A 记录，首次部署
- **验收**：
  - [ ] 域名 HTTPS 正常打开登录页
  - [ ] 完整流程跑通（登录、发消息、流式返回）
  - [ ] n8n 端口不对公网暴露

---

## M5：上线打磨

### T22：真机微信测试
- **复杂度**：M
- **依赖**：T21
- **描述**：iOS + Android 微信内置浏览器打开，完整走一遍
- **验收**：
  - [ ] iOS WeChat：登录 / 对话 / 流式正常
  - [ ] Android WeChat：同上
  - [ ] 320px 宽度不破版
  - [ ] SSE 不被 WeChat 内核断流（若断流则退化为长轮询）

### T23：错误态完善
- **复杂度**：M
- **依赖**：T21
- **描述**：n8n 挂 / DeepSeek 限流 / 断网 → UI 明确
- **验收**：
  - [ ] 各类错误都有中文友好 toast / 气泡
  - [ ] 提供"重试"按钮
  - [ ] 不白屏

### T24：Postgres 冷备
- **复杂度**：S
- **依赖**：T21
- **描述**：cron + pg_dump + 对象存储（OSS / COS）
- **验收**：
  - [ ] 每日一次 dump
  - [ ] 加密上传到你的 OSS
  - [ ] 脚本可验证还原
- **文件**：
  - `tools/onboarding-bot/deploy/backup.sh`

### T25：轻量监控与日志
- **复杂度**：S
- **依赖**：T21
- **描述**：不上 ELK；用 `docker logs` 导出 + 简单的错误 webhook（钉钉 / 飞书 / 企微机器人）
- **验收**：
  - [ ] n8n workflow 失败触发通知
  - [ ] 每日 5xx 数量统计

### T26：工具 README 和代码审查
- **复杂度**：S
- **依赖**：M1-M4 全部
- **描述**：写 `tools/onboarding-bot/README.md`；运行 `code-review` skill 自审
- **验收**：
  - [ ] README 包含本地开发、部署、故障处理
  - [ ] 代码无 TODO 遗留、env 明确声明
- **文件**：
  - `tools/onboarding-bot/README.md`

---

## 依赖关系图

```
M1 后端:
  T1 ─┬─ T2
      ├─ T3
      └─ T4 ─┬─ T5 ─┐
             └─ T6 ─┤
                    └─ T7 (主工作流)

M2 前端:
  T8 ─┬─ T9
      └─ T11 ──┐
  T3 ──► T10 ──┤
               └─ T12 ──► T13

M3 知识:
  T14（独立）
  T7 ──► T15 ──► T16

M4 部署:
  T8-T13 ──► T17 ──► T18 ──► T19 ──► T20 ──► T21

M5 上线:
  T21 ──► T22, T23, T24, T25, T26
```

## 建议执行顺序

1. **Week 1**：M1 后端（T1-T7）；前端 T8、T9 可并行启动
2. **Week 2**：M2 前端接入（T10-T13）；同时 T14 补知识
3. **Week 3**：M3 打磨（T15-T16）；开工 M4 容器化（T17-T20）
4. **Week 4**：T21 首次部署；M5 全部

**关键路径**：T1 → T4 → T7 → T11 → T12 → T17 → T21 → T22

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-20 | 初版匹配 BRD v1.2 + Architecture v1.1 |
