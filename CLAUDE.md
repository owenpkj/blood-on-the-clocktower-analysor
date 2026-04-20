# 血染钟楼 Agent - Claude 协作指南

## 项目定位

本项目是一个**知识库 + 多工具集合**，聚焦《血染钟楼》桌游：
- `knowledge/` 沉淀规则与剧本，所有工具的事实来源
- `tools/` 存放各类辅助工具（Web App、脚本、slash command 等），各自独立、共享知识库

当前工具清单见根目录 `README.md`。

## 核心原则

1. **知识单源**：规则与剧本只存在于 `knowledge/`。工具需要时引用，**不要复制**。发现不一致以 `knowledge/` 为准。
2. **工具隔离**：每个 `tools/<name>/` 自包含，拥有自己的 README、依赖、文档。跨工具复用的逻辑才抽到共享位置（暂未需要）。
3. **Skills 工作流强制执行**：下文"基于任务类型的 Skills 工作流"必须按流程走。
4. **禁止未确认的硬编码与 Mock**：配置、URL、密钥、假数据等必须先与用户确认再落地。
5. **中文优先**：面向玩家的文档、规则、剧本用中文；代码标识符、目录名、命令用英文。

## 🔄 基于任务类型的 Skills 工作流

### A. 新工具开发（完整流程）
按顺序完成：
1. **requirements-analysis** → 工具 README + 需求说明（放入 `tools/<name>/docs/BRD.md`）
2. **architecture-design** → 架构设计（放入 `tools/<name>/docs/Architecture.md`）
3. **task-planning** → 实施计划（放入 `tools/<name>/docs/TaskPlan.md`）
4. **开发实施** + `code-review`（PR/提交前自审）
5. **testing** → 测试代码与说明

### B. 现有工具功能增强
必须完成：
1. **requirements-analysis** → 需求补充（追加至该工具的 BRD）
2. **task-planning** → 轻量任务清单
3. **testing** → 基础测试验证

### C. Bug 修复
按影响范围：
- 核心逻辑变更：**code-review** + 补充测试
- 简单修复：提交前自审 + 基本验证

### D. 知识更新（规则/剧本）
不走 Skills 流程，但必须：
- 改动 `knowledge/core_rules.md` 或 `knowledge/plays/*.md`
- 影响已有工具逻辑/Prompt 时，同步排查 `tools/` 下所有工具并在工具 docs 中记录影响
- 剧本新增：文件名中文、与现有命名风格一致

## 📋 文档输出标准

### 所有工具必需
```
tools/<tool-name>/
├── README.md                  # 用途、依赖、运行方式
└── docs/
    ├── BRD.md                 # requirements-analysis 产物
    ├── Architecture.md        # architecture-design 产物（Web 类工具必需）
    └── TaskPlan.md            # task-planning 产物
```

### 测试文档位置
```
tools/<tool-name>/
└── tests/
    ├── README.md              # 测试策略
    ├── unit/
    ├── integration/
    └── e2e/
```

### 知识更新记录
规则/剧本重大变更，在 commit message 明确标注「knowledge: ...」，便于追踪哪些工具需同步。

## ✅ Skills 完成检查

### 开发前必检
- [ ] 任务类型已确定（新工具 / 功能增强 / Bug 修复 / 知识更新）？
- [ ] 对应 Skills 已执行？
- [ ] 必需文档已生成？

### 开发后必检
- [ ] 所有验收标准通过？
- [ ] 工具 README 已更新（若新增命令/依赖/入口）？
- [ ] `knowledge/` 与工具内的规则描述仍然一致？

## Quick Reference

| 路径 | 用途 |
|------|------|
| `knowledge/core_rules.md` | 游戏核心规则（事实来源） |
| `knowledge/plays/` | 剧本集合 |
| `tools/game-analyzer/` | 对局分析 Web 工具 |
| `.claude/skills/` | 通用研发 Skills |
| `README.md` | 项目总览与工具清单 |

## 可用 Skills 一览

| Skill | 定位 | 触发时机 |
|-------|------|----------|
| `requirements-analysis` | 需求梳理与 BRD 产出 | 新工具 / 功能增强启动 |
| `architecture-design` | 架构与选型 | 新工具启动、重大重构 |
| `task-planning` | 任务拆解与里程碑 | 架构敲定后、复杂功能启动 |
| `code-review` | 代码评审清单 | 提交 / PR 前 |
| `testing` | 测试策略与用例 | 功能完成后 |

详见 `.claude/skills/<name>/SKILL.md`。
