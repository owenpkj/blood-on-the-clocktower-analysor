# onboarding-bot 业务需求文档（BRD）

## 问题陈述

《血染钟楼》规则密度高——夜晚白天循环、善良 / 邪恶阵营分配、提名投票、醉酒中毒、死亡仍可发言等非常规机制——**新玩家最大的学习障碍不是某个角色或剧本，而是"这个游戏到底怎么玩"的基础规则本身**。

现状的问题：

1. **没有入门对话入口**：中文资料散落在贴吧、论坛、说书人 PDF，没有一个能针对"我完全不懂，帮我从头讲"这类诉求、多轮追问、对话驱动的渠道
2. **规则抽象**：文档式说明对零基础用户的反馈太弱，读者不知道自己哪里没懂，也不知道下一步该问什么

玩家只有在吃透基础规则之后，才会**自然地**产生"那占卜师是做什么的""暗流涌动和意气用事有什么区别"这类进阶问题。

本工具是一个**以教基础规则为首要目标**的对话式 AI 助手。当用户规则吃透后，同一个 Agent 可以继续回答他们涌现出来的角色、剧本相关问题。

## 目标

### 主要目标
1. **规则扫盲**：把血染钟楼的基础规则（阵营、胜负、流程、死亡机制、醉酒中毒、信息不对称等）讲透，用户能用自己的话复述
2. **渐进引导**：用户问什么答什么，但默认用"你是否已经知道 X"的方式 probe，不预设用户懂
3. **答疑延伸**：规则清楚后，能继续回答角色技能、剧本差异、玩法策略等进阶问题
4. **移动可达**：微信内置浏览器可直接点开使用

### 成功指标
- 新用户进入后能在 5-10 轮对话内理解：阵营划分、胜负条件、一轮基本流程、醉酒中毒的含义、"死亡不出局"的含义
- 回答首字延迟 ≤ 3 秒
- 用户第二天回来能看到完整历史对话
- 单会话平均轮次 ≥ 5（表明真正对话而非一次性查询）

## 目标用户

**主要用户**：从未或几乎没玩过血染钟楼的中文用户

**用户特征**：
- **零基础优先**：连基础规则都没见过的用户
- 中阶用户（会玩但规则有模糊点）也在目标范围，但不是主要优化对象
- 熟悉微信，不熟悉 Discord / 桌游论坛
- 通过邀请码由桌游圈朋友分享进入
- 主要在手机上使用

**使用场景**：
- 朋友拉我周末去玩血染钟楼，我完全不懂，先学一学
- 自己上桌玩过一次但规则没吃透，回来把基础补齐
- 规则懂了之后，想问某个角色或剧本怎么理解（进阶延伸）

## 范围

### In Scope (MVP)

**前端**
- 登录页：邀请码 + 昵称两个输入项
- 对话页：
  - AI 主动发首条消息，含昵称，明确"我主要帮你了解基础规则，规则清楚后也可以问角色和剧本"
  - 多轮对话
  - 消息气泡（用户红棕 / Bot 羊皮纸）
  - Typing indicator
  - **Bot 回复真·流式显示**（DeepSeek SSE → n8n → Next.js → 浏览器，按 token 到达显示）
  - **Bot 回复 Markdown 渲染**（加粗、列表、标题、表格、代码块）
  - **再次进入（未退出）时加载历史对话**
  - 退出按钮（清会话）
- 哥特血染钟楼视觉主题（已原型验证）
- 移动端优先 + 桌面自适应
- 微信内置浏览器兼容

**后端**
- n8n 2.x 工作流：Chat Trigger → AI Agent (DeepSeek) → Postgres Chat Memory
- DeepSeek API 接入（用户配置 API Key）
- system prompt 主体 = `knowledge/core_rules.md` + 引导性行为说明
- `knowledge/plays/` 下**官方三板**剧本文件作为补充材料塞入 system prompt（Trouble Brewing / Bad Moon Rising / Sects and Violets）
- 按 sessionId 持久化对话历史
- Next.js API route 作为反向代理

**Agent 行为要求（写入 system prompt）**
- 默认身份：血染钟楼规则导师
- 主线优先：遇到没见过的新用户，先搞清他对基础规则的理解水平，再决定从哪里切入
- 不强推进度：用户问角色 / 剧本可以直接答，但若 Agent 判断用户连基础流程都没掌握，应礼貌提醒"你已经知道 X 了吗"
- 用中文简体，语气亲切、不啰嗦
- 不编造规则：`knowledge/` 里没有的内容，要直说"我的资料里没有这个"

**邀请码**
- MVP：环境变量里维护有效邀请码白名单（后端校验）
- 一码多人可用，无过期

**部署**
- 香港 VPS
- docker-compose：Next.js 前端 + n8n + Postgres
- HTTPS（Let's Encrypt）+ 自备域名
- 微信可达的公网 URL

### Out of Scope（MVP 不做）

- RAG（知识放 system prompt 足够；等内容量大或更新频繁再考虑）
- 用户账号系统（仅邀请码 + 昵称）
- 开局中实时辅助模式（只覆盖 pre-game 学习）
- 多设备同步（session 绑 localStorage）
- 语音 / 图片
- 说书人视角 / 邪恶阵营视角
- 管理后台 / 邀请码发放 UI
- 小程序 / 公众号接入
- 多语言
- **结构化学习进度跟踪 / 测验 / 徽章**（MVP 纯对话，不做学习管理）
- **社区自制剧本**（初出茅庐 / 意气用事 / 杀手往事 等，已移入 `knowledge/later-scope/`，后续版本再纳入）
- **Supabase 结构化知识查询**（ADR-008 里的 Hybrid Tool 访问 Supabase 的设计推迟；v1 知识源仅 `knowledge/` markdown 文件）

## 功能需求

### FR1：访问与身份
- FR1.1：用户在登录页输入邀请码 + 昵称后进入
- FR1.2：邀请码由后端校验，不在白名单则拒绝
- FR1.3：昵称 1-20 字符，仅作展示用途，不唯一
- FR1.4：昵称与邀请码保存到 localStorage，再次访问自动跳过登录页
- FR1.5：对话页提供"退出"按钮，清除本地凭据并返回登录页

### FR2：对话交互
- FR2.1：**首次进入**对话页时，AI 主动发送首条消息（含昵称，说明主要教基础规则、也可以问角色和剧本）
- FR2.2：**再次进入**（sessionId 存在且有历史）时，从后端拉取历史消息渲染展示，不再重复开场白
- FR2.3：用户可发送文本消息（前端软限 2000 字）
- FR2.4：Enter 发送，Shift+Enter 换行
- FR2.5：Bot 回复以**真流式**逐 token 到达并渲染，到达前显示 typing indicator
- FR2.6：Bot 回复以 Markdown 渲染（支持加粗、斜体、列表、标题、表格、代码块、链接；禁用原始 HTML 防注入）
- FR2.7：Bot 回复失败或断流显示可读错误文案，可"重试"

### FR3：后端处理
- FR3.1：前端通过 Next.js API route 调 n8n webhook，不直接暴露 n8n URL
- FR3.2：前端调两个 API：
  - `GET /api/history?sessionId=X` 拉取历史消息列表
  - `POST /api/chat` 发送新消息并接收流式响应
- FR3.3：`/api/chat` 与 n8n 之间、n8n 与 DeepSeek 之间、Next.js 与浏览器之间均以 SSE（Server-Sent Events）流式传递 token
- FR3.4：n8n 工作流以 sessionId 为键读写 Postgres Chat Memory
- FR3.5：system prompt 结构：
  - 段一：Agent 角色定位与行为准则（规则优先、不编造等）
  - 段二：`knowledge/core_rules.md` 全文
  - 段三：`knowledge/plays/*.md` 全文（补充材料）
- FR3.6：n8n 调 DeepSeek Chat Completions API（`stream: true`），model 默认 `deepseek-chat`

### FR4：会话管理
- FR4.1：sessionId 由前端在 localStorage 生成并持久化
- FR4.2：同一 sessionId 在 Postgres 中保存全部历史消息
- FR4.3：消息历史对 LLM 以 Window Buffer 形式传递（默认保留最近 20 轮）
- FR4.4：用户点退出清除 sessionId，下次是新会话

## 非功能需求

### NFR1：性能
- NFR1.1：登录页首字节 ≤ 1s（香港 VPS，中国访问）
- NFR1.2：对话**首 token 到达**前端 ≤ 2s；整段回答陆续流出
- NFR1.3：对话页初次加载 ≤ 3s（含历史消息）

### NFR2：可用性 / 兼容
- NFR2.1：微信内置浏览器（iOS / Android）正常打开
- NFR2.2：Safari / Chrome / Edge 桌面正常
- NFR2.3：屏幕宽度 320px 起不破版
- NFR2.4：不依赖剪贴板、相机、通知等需授权的 API

### NFR3：可靠性
- NFR3.1：n8n 重启后历史对话不丢（Postgres 持久化）
- NFR3.2：DeepSeek 超时 / 限流下 UI 有降级提示
- NFR3.3：Next.js 挂了但 n8n 活着时，前端能展示"服务不可用"

### NFR4：安全
- NFR4.1：DeepSeek API Key 仅存于 n8n 环境变量 / Credentials
- NFR4.2：邀请码在后端校验，不在前端校验
- NFR4.3：n8n webhook URL 不暴露给浏览器
- NFR4.4：HTTPS 全链路，HSTS 开启

### NFR5：可维护
- NFR5.1：system prompt 内容变更仅需在 n8n 节点修改，不需要重新部署
- NFR5.2：邀请码白名单变更只需修改环境变量 + 重启
- NFR5.3：代码遵循 `CLAUDE.md` 工具结构约定

## 约束与假设

### 约束
- C1：LLM 固定使用 DeepSeek API（OpenAI 兼容格式），用户自带 key
- C2：编排层必须是 n8n 2.x 社区自托管版本
- C3：部署必须在中国能稳定访问，不用 Vercel / Cloudflare Pages / Railway / Render
- C4：记忆层用 n8n 内置的 Postgres Chat Memory 节点
- C5：知识来源仅为 `knowledge/` 目录，整体塞入 system prompt，MVP 不做 RAG
- C6：工具与 `game-analyzer` 完全独立

### 假设
- A1：**用户可能完全零基础**，工具需要能从"什么是血染钟楼"一路讲清楚
- A2：用户使用简体中文提问
- A3：VPS 有 ≥ 2C4G 资源跑 n8n + Postgres + Next.js
- A4：用户自备域名并能做 DNS 解析
- A5：DeepSeek API 对中国用户稳定可用

## 术语表

| 术语 | 定义 |
|------|------|
| session | 一次持续的对话，由 sessionId 标识 |
| 邀请码 | 进入工具的准入凭证，后端白名单校验 |
| 昵称 | 用户在工具内的展示名，AI 会引用 |
| 剧本 | 血染钟楼的一套预选角色组合（本项目覆盖 4 个） |
| Chat Trigger | n8n 的触发节点类型，接收 webhook 形式的聊天消息 |
| AI Agent | n8n 的 LangChain Agent 节点，组合 LLM / Memory / Tools |
| Postgres Chat Memory | n8n 内置的持久化对话记忆节点 |

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-20 | 初版 |
| 1.1 | 2026-04-20 | 定位调整：以**基础规则扫盲**为首要目标；翻转假设 A1（用户可能零基础）；角色 / 剧本作为延伸话题；新增 Agent 行为要求章节 |
| 1.2 | 2026-04-20 | 纳入 MVP：真流式（DeepSeek SSE 透传）、Markdown 渲染、再次进入加载历史 |
| 1.3 | 2026-04-20 | 范围收敛：v1 仅覆盖官方三板；3 个社区剧本移入 later-scope；Supabase 结构化查询推迟（知识源纯 markdown 文件） |
| 1.4 | 2026-04-22 | 记录已实施的主要增量：role/play 数据规范化（72 独立角色文件 + RAG Fuzzy 查询）、多角色对比支持、Agent 严格模式（不超越文档推理）、玩法通用原则（独立文档，用户提供内容）、用户 profile（localStorage + AI 指令自动更新，非手动）、session 30 分钟闲置自动重置、DB 30 天 TTL、哥特 UI（恶魔头像、昵称哥特字体 max 6、血月钟楼背景）、BGM（默认开、autoplay 兜底）、微信域名验证 |
