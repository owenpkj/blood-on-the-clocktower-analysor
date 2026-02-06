import { NextResponse } from 'next/server'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 创建对应的客户端
    let model
    if (provider === 'anthropic') {
      const anthropic = createAnthropic({ apiKey })
      model = anthropic('claude-3-5-haiku-latest')
    } else if (provider === 'openai') {
      const openai = createOpenAI({ apiKey })
      model = openai('gpt-4o-mini')
    } else {
      return NextResponse.json(
        { success: false, error: '不支持的提供商' },
        { status: 400 }
      )
    }

    // 发送简单测试请求
    const result = await generateText({
      model,
      prompt: 'Say "API key is valid" in exactly 4 words.',
      maxOutputTokens: 20,
    })

    return NextResponse.json({
      success: true,
      message: result.text,
    })
  } catch (error) {
    console.error('API Key test error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // 处理常见错误
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'API Key 无效或已过期',
      })
    }

    if (errorMessage.includes('429')) {
      return NextResponse.json({
        success: false,
        error: 'API 请求过于频繁，请稍后再试',
      })
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
    })
  }
}
