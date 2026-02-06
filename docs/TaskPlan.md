# 血染钟楼分析工具 - 任务规划

## 里程碑概览

| # | 里程碑 | 描述 | 预计任务数 |
|---|--------|------|-----------|
| M1 | 项目初始化 | 搭建项目框架、数据库、基础UI | 6 |
| M2 | 准备阶段功能 | 剧本选择、游戏设置 | 4 |
| M3 | 游戏记录功能 | 每日事件录入、状态管理 | 6 |
| M4 | 推理引擎 | 双Agent推理、结果展示 | 5 |
| M5 | 用户系统 | 认证、API Key管理 | 3 |
| M6 | 优化与测试 | 性能优化、错误处理、测试 | 4 |

---

## 任务详情

### M1: 项目初始化

#### T1: 创建Next.js项目
- **里程碑**: M1
- **复杂度**: S
- **依赖**: 无
- **描述**: 使用create-next-app创建项目，配置TypeScript、Tailwind CSS
- **验收标准**:
  - [ ] Next.js 14 + App Router
  - [ ] TypeScript配置完成
  - [ ] Tailwind CSS配置完成
  - [ ] 项目能正常运行 `npm run dev`
- **文件**:
  - `package.json`
  - `tsconfig.json`
  - `tailwind.config.ts`
  - `app/layout.tsx`
  - `app/page.tsx`

#### T2: 安装shadcn/ui组件
- **里程碑**: M1
- **复杂度**: S
- **依赖**: T1
- **描述**: 初始化shadcn/ui，安装所需组件
- **验收标准**:
  - [ ] shadcn/ui初始化完成
  - [ ] 安装所有需要的组件（Button, Card, Select, Dialog, Tabs, Checkbox, Textarea, Badge, Progress, Table, Accordion, Slider, Tooltip, Skeleton, Sonner）
- **文件**:
  - `components.json`
  - `components/ui/*`

#### T3: 配置Supabase
- **里程碑**: M1
- **复杂度**: M
- **依赖**: T1
- **描述**: 创建Supabase项目，配置客户端连接
- **验收标准**:
  - [ ] Supabase项目创建完成
  - [ ] 环境变量配置（SUPABASE_URL, SUPABASE_ANON_KEY）
  - [ ] 客户端连接工具函数完成
  - [ ] 能成功连接数据库
- **文件**:
  - `.env.local`
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`

#### T4: 创建数据库表
- **里程碑**: M1
- **复杂度**: M
- **依赖**: T3
- **描述**: 在Supabase中创建scripts、roles、games、user_settings表
- **验收标准**:
  - [ ] 4张表创建完成
  - [ ] RLS策略配置完成
  - [ ] 表结构符合Architecture.md定义
- **文件**:
  - `supabase/migrations/001_init.sql`

#### T5: 初始化剧本和角色数据
- **里程碑**: M1
- **复杂度**: M
- **依赖**: T4
- **描述**: 将4个剧本和所有角色数据导入数据库
- **验收标准**:
  - [ ] 4个剧本数据导入完成
  - [ ] 所有角色数据导入完成
  - [ ] 数据可通过API查询
- **文件**:
  - `supabase/seed.sql`
  - `data/scripts.json`
  - `data/roles.json`

#### T6: 配置Zustand状态管理
- **里程碑**: M1
- **复杂度**: S
- **依赖**: T1
- **描述**: 创建游戏状态Store
- **验收标准**:
  - [ ] GameStore创建完成
  - [ ] 包含script、playerCount、mySeat、myRole、gameData等状态
  - [ ] 包含基本的action（setScript、setPlayerCount等）
- **文件**:
  - `lib/store/gameStore.ts`

---

### M2: 准备阶段功能

#### T7: 首页布局
- **里程碑**: M2
- **复杂度**: S
- **依赖**: T2
- **描述**: 创建首页，包含新游戏和继续游戏入口
- **验收标准**:
  - [ ] 首页布局完成
  - [ ] 新游戏按钮可跳转
  - [ ] 继续游戏列表展示（如有）
- **文件**:
  - `app/page.tsx`
  - `components/layout/Header.tsx`

#### T8: 剧本选择组件
- **里程碑**: M2
- **复杂度**: M
- **依赖**: T5, T6, T7
- **描述**: 创建剧本选择组件，从数据库加载剧本列表
- **验收标准**:
  - [ ] Select下拉显示剧本列表
  - [ ] 选择后显示剧本简介Card
  - [ ] 选择结果保存到Store
- **文件**:
  - `components/setup/ScriptSelector.tsx`

#### T9: 游戏设置组件
- **里程碑**: M2
- **复杂度**: M
- **依赖**: T8
- **描述**: 创建人数设置、座位选择、角色选择组件
- **验收标准**:
  - [ ] Slider选择人数（5-15）
  - [ ] 座位圆环RadioGroup选择座位
  - [ ] Combobox选择角色（按类型分组）
  - [ ] 所有选择保存到Store
- **文件**:
  - `components/setup/PlayerCountInput.tsx`
  - `components/setup/SeatSelector.tsx`
  - `components/setup/RoleSelector.tsx`

#### T10: 创建游戏并跳转
- **里程碑**: M2
- **复杂度**: M
- **依赖**: T9
- **描述**: 点击开始游戏，创建游戏记录并跳转到游戏页面
- **验收标准**:
  - [ ] 验证所有必填项
  - [ ] 创建games记录到数据库
  - [ ] 跳转到 `/game/[id]` 页面
- **文件**:
  - `app/game/new/page.tsx`
  - `lib/actions/createGame.ts`

---

### M3: 游戏记录功能

#### T11: 游戏页面布局
- **里程碑**: M3
- **复杂度**: M
- **依赖**: T10
- **描述**: 创建游戏页面基础布局，包含座位圆环和天数Tabs
- **验收标准**:
  - [ ] 加载游戏数据
  - [ ] 显示座位圆环组件
  - [ ] Tabs切换天数
  - [ ] 显示当前存活/死亡状态
- **文件**:
  - `app/game/[id]/page.tsx`
  - `components/game/SeatCircle.tsx`
  - `components/game/DayTabs.tsx`

#### T12: 昨夜死亡录入
- **里程碑**: M3
- **复杂度**: S
- **依赖**: T11
- **描述**: 录入昨夜死亡的玩家
- **验收标准**:
  - [ ] Checkbox多选死亡座位号
  - [ ] 支持平安夜（无人死亡）
  - [ ] 保存到game_data
  - [ ] 座位圆环状态更新
- **文件**:
  - `components/game/NightDeathInput.tsx`

#### T13: 声称录入Dialog
- **里程碑**: M3
- **复杂度**: M
- **依赖**: T11
- **描述**: 点击座位弹出Dialog，录入玩家声称
- **验收标准**:
  - [ ] 点击座位弹出Dialog
  - [ ] Combobox选择角色
  - [ ] Textarea输入信息
  - [ ] 保存到game_data.days[n].claims
- **文件**:
  - `components/game/ClaimDialog.tsx`

#### T14: 提名录入Dialog
- **里程碑**: M3
- **复杂度**: M
- **依赖**: T11
- **描述**: 录入提名和投票信息
- **验收标准**:
  - [ ] 添加提名按钮
  - [ ] Select选择提名者和被提名者
  - [ ] Checkbox多选投票者
  - [ ] 保存到game_data.days[n].nominations
- **文件**:
  - `components/game/NominationDialog.tsx`

#### T15: 处决和我的信息录入
- **里程碑**: M3
- **复杂度**: S
- **依赖**: T11
- **描述**: 录入处决结果和用户自己的信息
- **验收标准**:
  - [ ] Select选择被处决者（或无）
  - [ ] Textarea输入我的信息
  - [ ] 保存到game_data
- **文件**:
  - `components/game/ExecutionInput.tsx`
  - `components/game/MyInfoInput.tsx`

#### T16: 游戏数据持久化
- **里程碑**: M3
- **复杂度**: M
- **依赖**: T12, T13, T14, T15
- **描述**: 实现game_data的保存和加载
- **验收标准**:
  - [ ] 每次修改自动保存到Supabase
  - [ ] 页面刷新后数据不丢失
  - [ ] 推进到下一天功能
- **文件**:
  - `lib/actions/updateGame.ts`
  - `lib/hooks/useGameData.ts`

---

### M4: 推理引擎

#### T17: 配置Vercel AI SDK
- **里程碑**: M4
- **复杂度**: S
- **依赖**: T1
- **描述**: 安装和配置Vercel AI SDK
- **验收标准**:
  - [ ] 安装ai包
  - [ ] 配置Anthropic/OpenAI provider
  - [ ] 创建推理API路由
- **文件**:
  - `app/api/inference/route.ts`
  - `lib/ai/config.ts`

#### T18: 主推理Agent Prompt
- **里程碑**: M4
- **复杂度**: L
- **依赖**: T17
- **描述**: 设计主推理Agent的System Prompt
- **验收标准**:
  - [ ] 包含游戏规则
  - [ ] 包含剧本信息
  - [ ] 定义输出格式（JSON）
  - [ ] 包含推理示例
- **文件**:
  - `lib/agents/prompts/mainPrompt.ts`

#### T19: 验证Agent Prompt
- **里程碑**: M4
- **复杂度**: M
- **依赖**: T17
- **描述**: 设计验证Agent的System Prompt
- **验收标准**:
  - [ ] 定义验证规则
  - [ ] 检查逻辑一致性
  - [ ] 检查规则合规性
  - [ ] 定义输出格式
- **文件**:
  - `lib/agents/prompts/verifierPrompt.ts`

#### T20: 推理流程实现
- **里程碑**: M4
- **复杂度**: L
- **依赖**: T18, T19
- **描述**: 实现Generate-then-Verify推理流程
- **验收标准**:
  - [ ] 主Agent生成候选世界模型
  - [ ] 验证Agent检查并返回反馈
  - [ ] 主Agent修正后输出Top 3
  - [ ] 支持Streaming
- **文件**:
  - `lib/agents/mainAgent.ts`
  - `lib/agents/verifierAgent.ts`
  - `lib/agents/inferenceEngine.ts`

#### T21: 推理结果展示
- **里程碑**: M4
- **复杂度**: M
- **依赖**: T20
- **描述**: 创建推理结果展示组件
- **验收标准**:
  - [ ] WorldModelCard展示Top 3
  - [ ] Progress显示置信度
  - [ ] Table显示角色分配
  - [ ] Accordion展示推理节点
- **文件**:
  - `components/inference/WorldModelCard.tsx`
  - `components/inference/ReasoningNodes.tsx`
  - `app/game/[id]/inference/page.tsx`

---

### M5: 用户系统

#### T22: Supabase Auth集成
- **里程碑**: M5
- **复杂度**: M
- **依赖**: T3
- **描述**: 集成Supabase Auth，支持邮箱登录
- **验收标准**:
  - [ ] 登录/注册页面
  - [ ] Session管理
  - [ ] 保护需要认证的路由
- **文件**:
  - `app/login/page.tsx`
  - `lib/auth/authHelpers.ts`
  - `middleware.ts`

#### T23: API Key管理页面
- **里程碑**: M5
- **复杂度**: M
- **依赖**: T22
- **描述**: 用户设置页面，管理LLM API Key
- **验收标准**:
  - [ ] 输入API Key
  - [ ] 选择LLM Provider
  - [ ] 加密存储到user_settings
  - [ ] 支持更新和删除
- **文件**:
  - `app/settings/page.tsx`
  - `lib/crypto/encrypt.ts`
  - `lib/actions/saveApiKey.ts`

#### T24: API Key调用集成
- **里程碑**: M5
- **复杂度**: S
- **依赖**: T23, T20
- **描述**: 推理时使用用户的API Key
- **验收标准**:
  - [ ] 从user_settings读取API Key
  - [ ] 服务端解密
  - [ ] 传递给LLM Provider
- **文件**:
  - `lib/ai/getUserApiKey.ts`

---

### M6: 优化与测试

#### T25: 错误处理和加载状态
- **里程碑**: M6
- **复杂度**: M
- **依赖**: M1-M5
- **描述**: 完善错误处理和加载状态
- **验收标准**:
  - [ ] 所有API调用有loading状态
  - [ ] 错误Toast提示
  - [ ] 网络错误处理
  - [ ] 输入验证错误提示
- **文件**:
  - 各组件更新

#### T26: 推理结果缓存
- **里程碑**: M6
- **复杂度**: S
- **依赖**: T20
- **描述**: 缓存推理结果，避免重复调用
- **验收标准**:
  - [ ] 相同game_data不重复推理
  - [ ] 缓存存储到world_models字段
  - [ ] 数据变化时清除缓存
- **文件**:
  - `lib/agents/inferenceCache.ts`

#### T27: 移动端适配
- **里程碑**: M6
- **复杂度**: M
- **依赖**: M1-M5
- **描述**: 优化移动端显示
- **验收标准**:
  - [ ] 响应式布局
  - [ ] 座位圆环移动端适配
  - [ ] Dialog移动端适配
  - [ ] 触摸交互优化
- **文件**:
  - 各组件CSS更新

#### T28: 端到端测试
- **里程碑**: M6
- **复杂度**: L
- **依赖**: M1-M5
- **描述**: 编写关键流程的E2E测试
- **验收标准**:
  - [ ] 新建游戏流程测试
  - [ ] 记录事件流程测试
  - [ ] 推理流程测试
- **文件**:
  - `tests/e2e/*.spec.ts`

---

## 依赖关系图

```
T1 (Next.js)
├─→ T2 (shadcn) ─→ T7 (首页)
├─→ T3 (Supabase) ─→ T4 (数据库) ─→ T5 (数据导入)
├─→ T6 (Zustand)
└─→ T17 (AI SDK)

T5 + T6 + T7 ─→ T8 (剧本选择) ─→ T9 (游戏设置) ─→ T10 (创建游戏)

T10 ─→ T11 (游戏页面) ─→ T12, T13, T14, T15 ─→ T16 (持久化)

T17 ─→ T18 (主Prompt) ─→ T20 (推理流程) ─→ T21 (结果展示)
T17 ─→ T19 (验证Prompt) ─→ T20

T3 ─→ T22 (Auth) ─→ T23 (API Key管理) ─→ T24 (API Key调用)
T20 + T24 ─→ 完整推理

M1-M5 ─→ T25, T26, T27, T28
```

## 建议执行顺序

### Phase 1: 基础设施 (T1-T6)
并行执行T1，完成后并行执行T2、T3、T6，然后T4→T5

### Phase 2: 准备阶段 (T7-T10)
顺序执行：T7 → T8 → T9 → T10

### Phase 3: 游戏记录 (T11-T16)
T11先完成，然后T12、T13、T14、T15可并行，最后T16

### Phase 4: 推理引擎 (T17-T21)
T17先完成，T18、T19可并行，然后T20 → T21

### Phase 5: 用户系统 (T22-T24)
顺序执行：T22 → T23 → T24

### Phase 6: 优化测试 (T25-T28)
可并行执行

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2025-02-06 | 初始版本 |
