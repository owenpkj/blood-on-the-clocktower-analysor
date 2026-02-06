import OpenAI from 'openai'

export interface AzureOpenAIConfig {
  apiKey: string
  endpoint: string
  deploymentName: string
  apiVersion: string
  maxTokens: number
}

export interface AzureOpenAIParams {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_completion_tokens: number
}

/**
 * Azure OpenAI Service for Blood on the Clocktower analysis
 * Based on DevOps-Dashboard implementation pattern
 */
export class AzureOpenAIService {
  private client: OpenAI | null = null
  private config: AzureOpenAIConfig | null = null
  private configError: string | null = null
  private retryAttempts = 3
  private baseDelay = 1000

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    try {
      this.config = this.loadConfig()
      this.client = this.createClient()
      this.configError = null
      console.log('✅ Azure OpenAI service initialized successfully')
    } catch (error) {
      this.config = null
      this.client = null
      this.configError = error instanceof Error ? error.message : 'Unknown configuration error'
      console.warn('Azure OpenAI Service initialization failed:', this.configError)
    }
  }

  private loadConfig(): AzureOpenAIConfig {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION

    if (!apiKey || !endpoint || !deploymentName || !apiVersion) {
      const missing = []
      if (!apiKey) missing.push('AZURE_OPENAI_API_KEY')
      if (!endpoint) missing.push('AZURE_OPENAI_ENDPOINT')
      if (!deploymentName) missing.push('AZURE_OPENAI_DEPLOYMENT_NAME')
      if (!apiVersion) missing.push('AZURE_OPENAI_API_VERSION')
      throw new Error(`Azure OpenAI 配置不完整，缺少: ${missing.join(', ')}`)
    }

    return {
      apiKey,
      endpoint,
      deploymentName,
      apiVersion,
      maxTokens: 8000, // 单 Agent 模式，降低 token 加快响应
    }
  }

  private createClient(): OpenAI {
    if (!this.config) {
      throw new Error('Cannot create client without valid configuration')
    }

    const endpoint = this.config.endpoint.replace(/\/$/, '')

    return new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: `${endpoint}/openai/deployments/${this.config.deploymentName}`,
      defaultQuery: { 'api-version': this.config.apiVersion },
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout per request
    })
  }

  /**
   * Generate text completion
   */
  async generateCompletion(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (this.configError || !this.client || !this.config) {
      throw new Error(this.configError || 'Azure OpenAI service is not configured')
    }

    const params: AzureOpenAIParams = {
      model: this.config.deploymentName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: this.config.maxTokens,
    }

    return this.callWithRetry(params)
  }

  private async callWithRetry(params: AzureOpenAIParams): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 API call attempt ${attempt}/${this.retryAttempts}`)

        const completion = await this.client!.chat.completions.create(params)
        const response = completion.choices[0]?.message?.content

        if (!response || response.trim() === '') {
          if (completion.choices[0]?.finish_reason === 'length') {
            throw new Error('Response was truncated due to token limit')
          }
          throw new Error('Empty response from AI service')
        }

        console.log('✅ API call successful', {
          tokensUsed: completion.usage?.total_tokens,
          model: completion.model
        })

        return response

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`⚠️ API call attempt ${attempt} failed:`, error)

        if (attempt === this.retryAttempts) {
          break
        }

        if (this.isRetryableError(error)) {
          const delay = this.calculateBackoffDelay(attempt)
          console.log(`⏱️ Waiting ${delay}ms before retry...`)
          await this.sleep(delay)
        } else {
          throw lastError
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  private isRetryableError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const err = error as { status?: number; code?: string; message?: string }
      return (
        err.status === 429 ||
        err.status === 503 ||
        (err.status !== undefined && err.status >= 500) ||
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        (err.message?.includes('network') ?? false) ||
        (err.message?.includes('timeout') ?? false)
      )
    }
    return false
  }

  private calculateBackoffDelay(attempt: number): number {
    return this.baseDelay * Math.pow(2, attempt - 1)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
let _instance: AzureOpenAIService | null = null

export function getAzureOpenAIService(): AzureOpenAIService {
  if (!_instance) {
    _instance = new AzureOpenAIService()
  }
  return _instance
}
