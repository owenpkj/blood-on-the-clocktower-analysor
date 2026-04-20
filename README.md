# 血染钟楼 Agent

面向《血染钟楼》(Blood on the Clocktower) 社交推理桌游的知识库与 AI 辅助工具集合。

## 项目结构

```
血染钟楼Agent/
├── knowledge/              # 基础知识（规则与剧本）
│   ├── core_rules.md       # 游戏核心规则
│   └── plays/              # 剧本
│       ├── 初出茅庐.md
│       ├── 意气用事.md
│       ├── 暗流涌动.md
│       └── 杀手往事.md
│
├── tools/                  # 工具集合
│   └── game-analyzer/      # 对局分析 Web 工具（Next.js + 双 Agent 推理）
│       ├── app/            # 应用代码
│       └── docs/           # BRD / Architecture / TaskPlan
│
└── .claude/                # Claude Code 工作空间
    └── skills/             # 通用研发 skill（架构/需求/任务/代码评审/测试）
```

## 两大板块

### 1. 基础知识 (`knowledge/`)
沉淀游戏规则与剧本，供所有工具共享引用。修改规则或新增剧本只改这里一处。

### 2. 工具 (`tools/`)
每个子目录是一个独立工具。现有：

| 工具 | 形态 | 说明 |
|------|------|------|
| `game-analyzer/` | Next.js Web App | 录入对局信息，双 Agent 生成 Top 3 世界模型 |
| `onboarding-bot/` | Next.js + n8n 对话工具 | 新手助手"波特克"，教规则、讲角色 |

## 新增工具约定

在 `tools/` 下新建目录，遵循以下约定：
- 目录名使用 kebab-case 英文名（如 `storyteller-helper`、`script-generator`）
- 每个工具自带 `README.md` 说明用途、依赖、运行方式
- 工具专属文档放在工具内部 `docs/`
- 如需引用规则/剧本，从 `knowledge/` 读取，不要复制

## 开发

见各工具自身的 README（如 `tools/game-analyzer/README.md`），以及根目录 `CLAUDE.md` 中的 Skills 工作流约定。
