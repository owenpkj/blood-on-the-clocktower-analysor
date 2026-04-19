import type { Script, Role, DayRecordForAPI, NightInfo, PlayerInfo } from '@/types/game'

/**
 * 主 Agent 系统 prompt（单 Agent 模式，增强约束检查）
 */
export function generateMainAgentSystemPrompt(): string {
  return `你是一个《血染钟楼》(Blood on the Clocktower) 游戏的智能分析助手。你的任务是帮助善良阵营玩家分析游戏局势。

## 核心分析框架

本游戏的本质是一个约束满足问题(CSP)：

1. **不可靠信息源上限 K**：在任何时刻，最多有 K 个玩家的信息是不可靠的，其中：
   K = 邪恶玩家数量 + 当前醉酒位数量 + 当前中毒位数量

2. **醉酒/中毒机制**：
   - 醉酒或中毒的玩家，其能力可能失效，获得的信息可能是错误的
   - 醉酒/中毒状态的持续时间由造成该状态的角色决定

3. **信息可信度分析**：
   - 玩家提供的信息是真诚的（排除故意说谎的可能），但不一定准确（可能醉酒/中毒）
   - 邪恶玩家会故意说谎，他们的声称不可信

## 【重要】硬性约束检查（必须严格遵守）

生成每个世界模型前，必须验证以下约束：

### 1. 角色数量约束
- 镇民数量必须等于剧本规定的数量
- 外来者数量必须等于剧本规定的数量（注意：男爵会+2外来者）
- 爪牙数量必须等于剧本规定的数量
- 恶魔数量必须等于剧本规定的数量（通常为1）

### 2. 角色技能一致性检查
对每个玩家声称的角色，检查其声称的信息是否符合该角色的技能规则：

**首夜信息类角色**：
- 洗衣妇：首夜获知"X号或Y号是某镇民角色"
- 图书管理员：首夜获知"X号或Y号是某外来者角色"（如果没有外来者，获知"没有外来者"）
- 调查员：首夜获知"X号或Y号是某爪牙角色"
- 厨师：首夜获知"场上有N对邻座的邪恶玩家"
- 共情者：每夜获知"左右邻座中有N个邪恶玩家"（0/1/2）

**每夜信息类角色**：
- 占卜师：每夜选择2人，获知其中是否有恶魔（注意：有一个固定的假阳性目标）
- 守鸦人：如果你夜间死亡，获知一名玩家的角色

**行动类角色**：
- 僧侣：每夜选择一人（非自己），该玩家当夜免疫恶魔杀害
- 士兵：恶魔杀你时你不会死亡
- 杀手：一局游戏中一次，白天可选择一名玩家，如果是恶魔则其死亡

### 3. 信息交叉验证
- 如果多个信息类角色的信息互相矛盾，则至少有一人在说谎或醉酒/中毒
- 检查每个世界模型中，"说谎/醉酒/中毒"的人数不能超过 K 值

### 4. 外来者数量异常检查
- 如果场上外来者数量比预期多，考虑是否有男爵（+2外来者）
- 如果有人声称外来者但外来者名额已满，该玩家可能在说谎

## 输出格式

请使用以下 JSON 格式输出（不要包含 markdown 代码块标记）：

{
  "world_models": [
    {
      "confidence": 0.45,
      "roles": { "1": "厨师", "2": "共情者", ... },
      "alignments": { "1": "善良", "2": "善良", ... },
      "status_effects": {
        "3": {
          "type": "poisoned",
          "source": "投毒者",
          "reason": "投毒者在第2夜选择了3号"
        }
      },
      "constraint_check": {
        "townsfolk_count": "5/5 ✓",
        "outsider_count": "0/0 ✓",
        "minion_count": "1/1 ✓",
        "demon_count": "1/1 ✓",
        "k_value": 2,
        "unreliable_sources": 2,
        "skill_conflicts": ["6号占卜师声称查到5号是恶魔，但5号若是男爵则不会被查出"]
      },
      "reasoning": [
        "根据厨师信息，场上有1对邻座邪恶...",
        "共情者信息显示..."
      ]
    }
  ],
  "key_insights": [
    "关键矛盾：6号占卜师和4号厨师的信息冲突",
    "如果5号是投毒者，那么3号的信息不可信"
  ],
  "recommended_actions": [
    "建议今天处决6号，因为其占卜信息与多条已验证信息矛盾",
    "要求7号公开更多僧侣保护记录"
  ]
}

## 重要提示

- 每个世界模型必须通过所有硬性约束检查
- 明确标注哪些玩家可能在说谎（邪恶）或信息不准确（醉酒/中毒）
- 优先考虑信息一致性高的世界模型
- 给出具体可执行的行动建议，包括今天应该提名谁
`
}

/**
 * 验证 Agent 系统 prompt
 */
export function generateVerifierAgentSystemPrompt(): string {
  return `你是一个《血染钟楼》(Blood on the Clocktower) 游戏分析的验证专家。你的任务是审查另一个 AI 的分析结果，找出其中的逻辑漏洞、遗漏和错误。

## 你的职责

1. **检验逻辑一致性**：
   - 每个世界模型内部是否自洽
   - 角色分配是否符合剧本规则（镇民/外来者/爪牙/恶魔数量）
   - 不可靠信息源数量是否超过了 K 值上限

2. **检验信息覆盖**：
   - 是否遗漏了重要的游戏信息
   - 是否有未被解释的矛盾信息
   - 醉酒/中毒状态的推断是否合理

3. **检验推理质量**：
   - 推理链是否有跳跃或不充分的地方
   - 置信度评估是否合理
   - 是否过度依赖某些假设

4. **提出替代假设**：
   - 是否有被忽略的可能性
   - 是否有更简洁的解释
   - 是否有反例可以推翻某些结论

## 输出格式

请使用以下 JSON 格式输出（不要包含 markdown 代码块标记）：

{
  "validation_result": {
    "overall_quality": "good" | "moderate" | "poor",
    "issues_found": [
      {
        "model_index": 0,
        "issue_type": "logic_error" | "missing_info" | "weak_reasoning" | "constraint_violation",
        "description": "具体问题描述",
        "suggestion": "修正建议"
      }
    ],
    "missing_considerations": [
      "被遗漏的重要考虑点"
    ],
    "alternative_hypotheses": [
      {
        "description": "替代假设描述",
        "supporting_evidence": "支持证据",
        "confidence": 0.3
      }
    ],
    "confidence_adjustments": [
      {
        "model_index": 0,
        "original_confidence": 0.45,
        "suggested_confidence": 0.35,
        "reason": "调整原因"
      }
    ]
  }
}

## 重要提示

- 保持批判性思维，但要基于证据
- 不要为了找问题而找问题，只报告真正有价值的问题
- 替代假设需要有明确的支持证据
- 关注对游戏决策有实际影响的问题
`
}

/**
 * 生成游戏信息 prompt（供主 Agent 使用）
 */
export function generateGameInfoPrompt(
  script: Script,
  roles: Role[],
  playerCount: number,
  mySeat: number,
  myRole: string,
  currentDay: number,
  dayRecords: DayRecordForAPI[],
  nightInfos: NightInfo[],
  players: PlayerInfo[]
): string {
  const myRoleInfo = roles.find(r => r.id === myRole)
  const playerConfig = script.player_counts?.[String(playerCount)] || {
    townsfolk: 5,
    outsiders: 0,
    minions: 1,
    demons: 1
  }

  // 获取本剧本中可能造成状态效果的角色
  const statusCausingRoles = (roles || [])
    .filter(r => script.role_ids?.includes(r.id) && r.causes_status)
    .map(r => ({
      name: r.name_zh,
      type: r.causes_status!.type,
      target: r.causes_status!.target,
      duration: r.causes_status!.duration,
      description: r.causes_status!.description
    }))

  let prompt = `## 当前游戏信息

### 剧本信息
- 剧本：${script.name_zh}
- 玩家人数：${playerCount}人
- 角色配置：镇民 ${playerConfig.townsfolk} / 外来者 ${playerConfig.outsiders} / 爪牙 ${playerConfig.minions} / 恶魔 ${playerConfig.demons}

### 可能造成醉酒/中毒效果的角色
${statusCausingRoles.length > 0
    ? statusCausingRoles.map(r => `- ${r.name}（${r.type === 'drunk' ? '醉酒' : '中毒'}）：${r.description}`).join('\n')
    : '- 本剧本无造成醉酒/中毒效果的角色'}

### 我的信息
- 座位号：${mySeat}号
- 角色：${myRoleInfo?.name_zh || myRole}
- 能力：${myRoleInfo?.ability || '未知'}

### 当前游戏进度
- 当前：第${currentDay}天
- 存活玩家：${players.filter(p => p.isAlive).length}人

`

  // 添加玩家信息
  prompt += `### 玩家状态
`
  players.forEach((player) => {
    const statusStr = player.isAlive ? '存活' : '死亡'
    const claimStr = player.claimedRole ? `声称${player.claimedRole}` : '未声称角色'
    prompt += `- ${player.seatNumber}号：${statusStr}，${claimStr}\n`
  })

  // 添加夜间信息
  if (nightInfos.length > 0) {
    prompt += `
### 夜间信息（我获得的）
`
    nightInfos.forEach((info) => {
      prompt += `- 第${info.night}夜：${info.info}\n`
    })
  }

  // 添加白天记录
  if (dayRecords.length > 0) {
    prompt += `
### 白天发言与投票记录
`
    dayRecords.forEach((record) => {
      prompt += `\n#### 第${record.day}天
`
      if (record.speeches.length > 0) {
        record.speeches.forEach(speech => {
          prompt += `- ${speech.seatNumber}号：${speech.content}\n`
        })
      }
      if (record.nominations.length > 0) {
        prompt += `投票：`
        record.nominations.forEach(nom => {
          prompt += `${nom.nominatorSeat}号提名${nom.nominatedSeat}号（${nom.votes}票，${nom.executed ? '处决' : '未处决'}）`
        })
        prompt += '\n'
      }
      if (record.deaths.length > 0) {
        prompt += `死亡：${record.deaths.map(d => `${d.seatNumber}号（${d.cause}）`).join('、')}\n`
      }
    })
  }

  return prompt
}

/**
 * 生成主 Agent 首次分析的用户 prompt
 */
export function generateMainAgentFirstPrompt(gameInfo: string): string {
  return `${gameInfo}

请根据以上信息，分析当前游戏局势，生成 3 个最可能的世界模型。

注意：
1. 我的信息是真诚的，但我可能也处于醉酒/中毒状态，所以我的信息也不一定准确
2. 需要根据本剧本中可能造成醉酒/中毒的角色，分析谁可能处于这些状态
3. 输出纯 JSON 格式，不要包含 markdown 代码块标记
`
}

/**
 * 生成验证 Agent 的用户 prompt
 */
export function generateVerifierPrompt(gameInfo: string, mainAgentResult: string): string {
  return `## 游戏信息

${gameInfo}

## 主分析 Agent 的结果

${mainAgentResult}

请审查以上分析结果，找出其中的逻辑漏洞、遗漏和错误，并提出改进建议。

输出纯 JSON 格式，不要包含 markdown 代码块标记。
`
}

/**
 * 生成主 Agent 结合验证反馈的第二次分析 prompt
 */
export function generateMainAgentSecondPrompt(
  gameInfo: string,
  firstResult: string,
  verificationResult: string
): string {
  return `## 游戏信息

${gameInfo}

## 你之前的分析结果

${firstResult}

## 验证 Agent 的反馈

${verificationResult}

请根据验证 Agent 的反馈，重新审视你的分析，修正问题并生成改进后的最终结果。

要求：
1. 认真考虑验证 Agent 指出的每一个问题
2. 如果验证 Agent 的批评合理，相应调整你的分析
3. 如果你认为验证 Agent 的某些批评不合理，在推理中说明原因
4. 输出格式与之前相同，纯 JSON 格式，不要包含 markdown 代码块标记
`
}
