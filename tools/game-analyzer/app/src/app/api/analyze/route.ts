import { NextResponse } from 'next/server'
import { getAzureOpenAIService } from '@/lib/llm/azure-openai'
import {
  generateMainAgentSystemPrompt,
  generateGameInfoPrompt,
  generateMainAgentFirstPrompt,
} from '@/lib/llm/prompts'
import type { Script, Role, DayRecordForAPI, NightInfo, PlayerInfo, WorldModel } from '@/types/game'

interface AnalyzeRequest {
  script: Script
  roles: Role[]
  playerCount: number
  mySeat: number
  myRole: string
  currentDay: number
  dayRecords: DayRecordForAPI[]
  nightInfos: NightInfo[]
  players: PlayerInfo[]
}

// 解析 Agent 响应
function parseAgentResponse(text: string): {
  world_models: WorldModel[]
  key_insights: string[]
  recommended_actions: string[]
} | null {
  try {
    let jsonStr = text.trim()

    // 移除可能的 markdown 代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    if (!parsed.world_models || !Array.isArray(parsed.world_models)) {
      return null
    }

    return {
      world_models: parsed.world_models.map((wm: WorldModel & { confidence?: number; constraint_check?: Record<string, unknown> }) => ({
        confidence: wm.confidence || 0,
        roles: wm.roles || {},
        alignments: wm.alignments || {},
        status_effects: wm.status_effects || {},
        constraint_check: wm.constraint_check || {},
        reasoning: wm.reasoning || []
      })),
      key_insights: parsed.key_insights || [],
      recommended_actions: parsed.recommended_actions || []
    }
  } catch (e) {
    console.error('Failed to parse agent response:', e)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json()

    const {
      script,
      roles,
      playerCount,
      mySeat,
      myRole,
      currentDay,
      dayRecords,
      nightInfos,
      players
    } = body

    // 验证必要参数
    if (!script || !myRole) {
      return NextResponse.json(
        { success: false, error: '缺少游戏信息' },
        { status: 400 }
      )
    }

    // 检查游戏进度
    if (currentDay < 3) {
      return NextResponse.json(
        { success: false, error: '需要至少进行到第3天才能进行有效分析' },
        { status: 400 }
      )
    }

    // 获取 Azure OpenAI 服务实例
    const azureService = getAzureOpenAIService()

    // 生成游戏信息 prompt
    const gameInfo = generateGameInfoPrompt(
      script,
      roles,
      playerCount,
      mySeat,
      myRole,
      currentDay,
      dayRecords,
      nightInfos,
      players
    )

    console.log('=== 单 Agent 推理分析开始 ===')
    console.log('Game info length:', gameInfo.length)

    // 单次调用，增强约束检查的 prompt
    const systemPrompt = generateMainAgentSystemPrompt()
    const userPrompt = generateMainAgentFirstPrompt(gameInfo)

    console.log('Calling Azure OpenAI...')
    const startTime = Date.now()

    const analysisText = await azureService.generateCompletion(
      systemPrompt,
      userPrompt
    )

    const elapsed = (Date.now() - startTime) / 1000
    console.log(`Analysis completed in ${elapsed.toFixed(1)}s, length: ${analysisText.length}`)

    // 解析结果
    const parsed = parseAgentResponse(analysisText)

    if (!parsed) {
      return NextResponse.json({
        success: false,
        error: '分析结果解析失败',
        debug: { rawResponse: analysisText.slice(0, 1000) }
      })
    }

    console.log('=== 单 Agent 推理分析完成 ===')

    return NextResponse.json({
      success: true,
      result: parsed
    })
  } catch (error) {
    console.error('Analyze API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // 处理常见错误
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'API Key 无效或已过期，请检查环境变量配置'
      })
    }

    if (errorMessage.includes('429')) {
      return NextResponse.json({
        success: false,
        error: 'API 请求过于频繁，请稍后再试'
      })
    }

    if (errorMessage.includes('Azure OpenAI 配置不完整')) {
      return NextResponse.json({
        success: false,
        error: errorMessage
      })
    }

    if (errorMessage.includes('timeout')) {
      return NextResponse.json({
        success: false,
        error: '请求超时，请稍后再试'
      })
    }

    if (errorMessage.includes('context length') || errorMessage.includes('token')) {
      return NextResponse.json({
        success: false,
        error: '游戏信息过长，请精简发言记录后重试'
      })
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    })
  }
}
