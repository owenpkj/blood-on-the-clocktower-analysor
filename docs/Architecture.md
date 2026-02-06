# 血染钟楼分析工具 - 架构设计文档

## 概述

本文档描述血染钟楼分析工具的技术架构设计，基于业务需求文档(BRD)的功能需求。

## 技术选型

| 层级 | 方案 | 理由 |
|------|------|------|
| **前端框架** | Next.js 14 + TypeScript | AI应用主流选择，支持App Router，与Vercel无缝集成 |
| **UI组件库** | shadcn/ui + Tailwind CSS | 优雅、可定制、开发效率高 |
| **状态管理** | Zustand | 轻量，适合中等复杂度应用 |
| **AI集成** | Vercel AI SDK | 支持Streaming、多LLM提供商 |
| **数据库** | Supabase (PostgreSQL) | 实时订阅、内置Auth、Row Level Security |
| **部署** | Vercel | 与Next.js无缝集成，自动CI/CD |

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面层                                │
│                   (Next.js + shadcn/ui)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │  准备模块    │  │  记录模块    │  │  推理结果模块        │     │
│  │  - 选剧本   │  │  - 每日事件  │  │  - 世界模型展示      │     │
│  │  - 设置人数  │  │  - 声称记录  │  │  - 置信度显示       │     │
│  │  - 选角色   │  │  - 提名投票  │  │  - 推理节点         │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       状态管理层 (Zustand)                       │
│                                                                 │
│  GameStore: script | playerCount | mySeat | myRole | gameData  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ↓                               ↓
┌───────────────────────────┐    ┌───────────────────────────────┐
│      Supabase             │    │      推理引擎层                │
│  - 游戏数据持久化          │    │      (Vercel AI SDK)          │
│  - 用户认证               │    │                               │
│  - API Key加密存储        │    │  ┌───────────┐  ┌───────────┐ │
│                           │    │  │ 主推理    │→│ 验证      │ │
│                           │    │  │ Agent    │←│ Agent     │ │
│                           │    │  └───────────┘  └───────────┘ │
└───────────────────────────┘    └───────────────────────────────┘
                                                │
                                                ↓
                                 ┌───────────────────────────────┐
                                 │         LLM API               │
                                 │   Claude / GPT (用户配置)      │
                                 └───────────────────────────────┘
```

## 双Agent推理架构

采用 Generate-then-Verify 模式：

```
用户输入新信息
       ↓
┌──────────────────────────────────────┐
│           主推理Agent                 │
│  输入:                                │
│  - 游戏规则 (core_rules.md)          │
│  - 剧本信息 (scripts表)              │
│  - 所有游戏数据 (game_data)          │
│  - 用户自己的信息 (可信基准)          │
│                                      │
│  输出:                                │
│  - 候选世界模型 (草稿)                │
│  - 每个模型的推理过程                 │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│           验证Agent                   │
│  检查:                                │
│  - 逻辑一致性 (信息是否自洽)          │
│  - 规则合规性 (是否符合游戏机制)      │
│  - 约束满足 (邪恶数量、角色配置)      │
│                                      │
│  输出:                                │
│  - 验证结果 (通过/问题列表)           │
│  - 修正建议                          │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│           主推理Agent (修正)          │
│  根据验证反馈修正世界模型              │
│                                      │
│  输出:                                │
│  - 最终 Top 3 世界模型                │
│  - 置信度                            │
│  - 关键推理节点                       │
└──────────────────────────────────────┘
       ↓
展示给用户
```

## 数据库设计

### ER图

```
┌─────────────┐       ┌─────────────┐
│   scripts   │       │    roles    │
├─────────────┤       ├─────────────┤
│ id (PK)     │──────<│ id (PK)     │
│ name_zh     │ 引用   │ name_zh     │
│ name_en     │       │ name_en     │
│ description │       │ type        │
│ difficulty  │       │ ability     │
│ role_ids[]  │       │ affects_setup│
│ first_night │       │ setup_mod   │
│ other_night │       └─────────────┘
│ player_counts│
│ special_rules│
└─────────────┘
       │
       │ 引用
       ↓
┌─────────────┐       ┌───────────────┐
│    games    │       │ user_settings │
├─────────────┤       ├───────────────┤
│ id (PK)     │       │ id (PK)       │
│ user_id (FK)│───────│ user_id (FK)  │
│ script_id   │       │ llm_provider  │
│ player_count│       │ api_key_enc   │
│ my_seat     │       └───────────────┘
│ my_role     │
│ current_day │
│ status      │
│ game_data   │
│ world_models│
└─────────────┘
```

### 表结构

```sql
-- 剧本表
CREATE TABLE scripts (
  id text PRIMARY KEY,
  name_zh text NOT NULL,
  name_en text,
  description text,
  difficulty text,
  min_players int DEFAULT 5,
  max_players int DEFAULT 15,
  role_ids text[],
  first_night_order text[],
  other_night_order text[],
  player_counts jsonb,
  special_rules jsonb,
  created_at timestamp DEFAULT now()
);

-- 角色表
CREATE TABLE roles (
  id text PRIMARY KEY,
  name_zh text NOT NULL,
  name_en text,
  type text NOT NULL,
  ability text,
  affects_setup boolean DEFAULT false,
  setup_modification text,
  created_at timestamp DEFAULT now()
);

-- 游戏表
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  script_id text REFERENCES scripts,
  player_count int,
  my_seat int,
  my_role text,
  current_day int DEFAULT 1,
  status text DEFAULT 'active',
  game_data jsonb,
  world_models jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 用户设置表
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  llm_provider text DEFAULT 'anthropic',
  api_key_encrypted text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### game_data 结构

```typescript
interface GameData {
  days: DayRecord[];
}

interface DayRecord {
  day: number;
  night_deaths: number[];        // 昨夜死亡的座位号
  claims: Claim[];               // 玩家声称
  nominations: Nomination[];     // 提名记录
  execution: number | null;      // 被处决的座位号
  my_info: string;               // 用户自己获得的信息
}

interface Claim {
  seat: number;
  role: string;
  info: string;
}

interface Nomination {
  nominator: number;
  nominee: number;
  voters: number[];
}
```

### world_models 结构

```typescript
interface WorldModelsCache {
  day: number;
  generated_at: string;
  models: WorldModel[];
}

interface WorldModel {
  confidence: number;            // 0-1
  roles: Record<number, string>; // 座位号 -> 角色
  evil_players: number[];        // 邪恶玩家座位号
  drunk_poisoned: number[];      // 醉酒/中毒玩家
  reasoning: string[];           // 关键推理节点
}
```

## 目录结构

```
blood-on-clocktower-assistant/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 首页
│   ├── game/
│   │   ├── new/page.tsx            # 新游戏设置
│   │   └── [id]/page.tsx           # 游戏进行页
│   └── api/
│       └── inference/
│           └── route.ts            # 推理API
├── components/
│   ├── ui/                         # shadcn组件
│   ├── setup/                      # 准备阶段组件
│   │   ├── ScriptSelector.tsx
│   │   ├── PlayerCountInput.tsx
│   │   └── RoleSelector.tsx
│   ├── game/                       # 游戏阶段组件
│   │   ├── DayPanel.tsx
│   │   ├── ClaimForm.tsx
│   │   ├── NominationForm.tsx
│   │   └── MyInfoForm.tsx
│   └── inference/                  # 推理结果组件
│       ├── WorldModelCard.tsx
│       └── ReasoningNodes.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── store/
│   │   └── gameStore.ts            # Zustand store
│   ├── agents/
│   │   ├── mainAgent.ts            # 主推理Agent
│   │   ├── verifierAgent.ts        # 验证Agent
│   │   └── prompts/
│   │       ├── mainPrompt.ts
│   │       └── verifierPrompt.ts
│   └── utils/
│       └── gameLogic.ts            # 游戏逻辑工具函数
├── data/
│   ├── scripts/                    # 剧本数据 (用于初始化DB)
│   └── roles/                      # 角色数据 (用于初始化DB)
└── docs/
    ├── BRD.md
    └── Architecture.md
```

## 架构决策记录 (ADR)

### ADR-001: 使用JSONB存储游戏数据

- **状态**: 已采纳
- **背景**: 游戏数据结构复杂（每日事件、声称、提名等），需要灵活存储
- **决策**: 使用单个games表的game_data字段(JSONB)存储所有游戏数据
- **后果**:
  - 优点：简化表结构，减少JOIN，灵活扩展
  - 缺点：无法对嵌套字段建立索引，复杂查询性能可能下降
  - 可接受：MVP阶段数据量小，性能不是瓶颈

### ADR-002: 双Agent架构

- **状态**: 已采纳
- **背景**: 单Agent可能产生逻辑错误或违反游戏规则的推理
- **决策**: 采用Generate-then-Verify模式，主Agent生成 + 验证Agent检查
- **后果**:
  - 优点：提高推理质量，减少逻辑错误
  - 缺点：增加API调用次数和延迟
  - 可接受：推理质量比速度更重要

### ADR-003: API Key本地加密存储

- **状态**: 已采纳
- **背景**: 用户需要提供LLM API Key
- **决策**: 加密存储在Supabase user_settings表，使用Supabase Auth保护
- **后果**:
  - 优点：跨设备同步，用户体验好
  - 缺点：需要实现加密/解密逻辑
  - 可接受：使用成熟的加密方案

### ADR-004: 手动触发推理

- **状态**: 已采纳
- **背景**: 可选自动或手动触发推理
- **决策**: MVP阶段采用手动触发（用户点击按钮）
- **后果**:
  - 优点：避免不必要的API调用，用户可控
  - 缺点：需要额外操作
  - 可接受：符合用户预期，后续可加入自动触发选项

## 安全考虑

1. **Row Level Security (RLS)**:
   - games表：用户只能访问自己的游戏
   - user_settings表：用户只能访问自己的设置

2. **API Key安全**:
   - 使用AES-256加密存储
   - 解密在服务端进行
   - 永不在客户端暴露明文

3. **输入验证**:
   - 座位号范围验证
   - 角色ID有效性验证
   - 游戏数据结构验证

## 性能考虑

1. **推理缓存**:
   - world_models存储推理结果
   - 相同day且game_data未变化时直接返回缓存

2. **Streaming响应**:
   - 使用Vercel AI SDK的streaming能力
   - 推理过程实时展示

3. **懒加载**:
   - 剧本和角色数据按需加载
   - 大型game_data分页展示

## UI设计

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│  Header (固定顶部)                                           │
│  [Logo] [当前游戏状态] [设置按钮]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  主内容区 (根据阶段切换)                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  准备阶段 / 游戏阶段 / 推理结果                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 页面与组件设计

#### 1. 准备阶段页面

| 区域 | shadcn组件 | 说明 |
|------|-----------|------|
| 剧本选择 | `Select` + `Card` | 下拉选择，显示剧本简介 |
| 人数设置 | `Slider` 或 `Input` | 5-15人范围 |
| 座位选择 | `RadioGroup` | 可视化座位圆环 |
| 角色选择 | `Combobox` | 搜索+下拉，按类型分组 |
| 开始按钮 | `Button` | 主操作 |

#### 2. 游戏阶段页面

| 区域 | shadcn组件 | 说明 |
|------|-----------|------|
| 天数导航 | `Tabs` | 第1天、第2天... |
| 座位状态 | `Badge` + 自定义圆环 | 存活/死亡/处决 |
| 昨夜死亡 | `Checkbox` 多选 | 选择死亡座位号 |
| 声称记录 | `Card` + `Dialog` | 点击座位弹出录入表单 |
| 提名记录 | `Card` + `Dialog` | 提名者→被提名者，勾选投票者 |
| 处决结果 | `Select` | 选择被处决者或无 |
| 我的信息 | `Textarea` | 自由文本输入 |
| 推理按钮 | `Button` | 触发推理（第3天起可用） |

#### 3. 推理结果页面

| 区域 | shadcn组件 | 说明 |
|------|-----------|------|
| 世界模型卡片 | `Card` | Top 3，按置信度排序 |
| 置信度 | `Progress` + `Badge` | 可视化百分比 |
| 角色分配 | `Table` | 座位号→推测角色 |
| 推理节点 | `Accordion` | 展开查看关键推理步骤 |
| 返回按钮 | `Button` | 返回游戏记录继续输入 |

### 核心交互流程

```
首页
  │
  ├─→ [新游戏] → 准备阶段页面
  │                  │
  │                  ↓ 完成设置
  │              游戏阶段页面 ←──────────────┐
  │                  │                      │
  │                  ├─→ 记录每日事件        │
  │                  │                      │
  │                  ├─→ [推理] (第3天起)    │
  │                  │      ↓               │
  │                  │   推理结果页面 ──────→┘
  │                  │      (查看后返回)
  │                  │
  │                  └─→ [结束游戏]
  │
  └─→ [继续游戏] → 游戏阶段页面 (加载已有数据)
```

### 关键自定义组件

#### 座位圆环组件 (SeatCircle)

```
        1
    12     2
  11         3
  10         4
    9      5
      8  6
        7
```

- **交互**: 点击座位弹出 `Dialog`，录入该玩家声称
- **状态颜色**:
  - 绿色: 存活
  - 灰色: 死亡
  - 红色: 被处决
  - 蓝色边框: 用户自己
- **标签**: 座位号 + 声称角色（如有）

#### 声称录入Dialog (ClaimDialog)

```
┌─────────────────────────────────┐
│  3号玩家声称                 [X] │
├─────────────────────────────────┤
│  角色: [Combobox 选择角色]       │
│                                 │
│  信息: [Textarea 输入声称信息]   │
│                                 │
│  [取消]              [保存]     │
└─────────────────────────────────┘
```

#### 提名录入Dialog (NominationDialog)

```
┌─────────────────────────────────┐
│  记录提名                    [X] │
├─────────────────────────────────┤
│  提名者: [Select 选择座位号]     │
│                                 │
│  被提名者: [Select 选择座位号]   │
│                                 │
│  投票者: [Checkbox 多选座位号]   │
│  □ 1  □ 2  ☑ 3  ☑ 4  □ 5 ...   │
│                                 │
│  [取消]              [保存]     │
└─────────────────────────────────┘
```

#### 世界模型卡片 (WorldModelCard)

```
┌─────────────────────────────────────────┐
│  世界模型 #1                 置信度: 72% │
│  ████████████████████░░░░░░░░          │
├─────────────────────────────────────────┤
│  角色分配:                               │
│  ┌──────┬──────────┬─────────┐         │
│  │ 座位 │ 推测角色  │ 阵营    │         │
│  ├──────┼──────────┼─────────┤         │
│  │  1   │ 洗衣妇   │ 善良    │         │
│  │  2   │ 投毒者   │ 邪恶 ⚠️ │         │
│  │  3   │ 占卜师   │ 善良    │         │
│  │ ...  │ ...      │ ...     │         │
│  └──────┴──────────┴─────────┘         │
├─────────────────────────────────────────┤
│  ▶ 关键推理节点 (点击展开)               │
│  ┌─────────────────────────────────────┐│
│  │ 1. 3号声称占卜师，查验2号和5号有恶魔 ││
│  │ 2. 5号声称僧侣，与洗衣妇信息吻合     ││
│  │ 3. 因此2号更可能是恶魔              ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 使用的shadcn/ui组件清单

| 组件 | 用途 |
|------|------|
| `Button` | 所有按钮操作 |
| `Card` | 剧本卡片、世界模型卡片 |
| `Select` | 剧本选择、座位选择、处决选择 |
| `Combobox` | 角色选择（支持搜索） |
| `Dialog` | 声称录入、提名录入弹窗 |
| `Tabs` | 天数切换 |
| `Checkbox` | 死亡玩家多选、投票者多选 |
| `Textarea` | 信息输入 |
| `Badge` | 状态标签（存活/死亡/阵营） |
| `Progress` | 置信度可视化 |
| `Table` | 角色分配表格 |
| `Accordion` | 推理节点展开/收起 |
| `Slider` | 人数选择 |
| `Tooltip` | 角色技能提示 |
| `Skeleton` | 加载状态 |
| `Toast` (Sonner) | 操作反馈提示 |

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2025-02-06 | 初始版本 |
| 1.1 | 2025-02-06 | 新增UI设计章节 |
