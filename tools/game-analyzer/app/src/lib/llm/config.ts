import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

export interface AzureOpenAIConfig {
  apiKey: string
  endpoint: string
  deploymentName: string
  apiVersion: string
}

/**
 * 获取 Azure OpenAI 配置（从环境变量）
 */
export function getAzureConfig(): AzureOpenAIConfig {
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

  return { apiKey, endpoint, deploymentName, apiVersion }
}

/**
 * 创建 Azure OpenAI 模型实例
 */
function createAzureModel(): LanguageModel {
  const config = getAzureConfig()

  // 移除 endpoint 末尾的斜杠
  const endpoint = config.endpoint.replace(/\/$/, '')

  // 使用 @ai-sdk/openai 创建 Azure 兼容客户端
  const azure = createOpenAI({
    apiKey: config.apiKey,
    baseURL: `${endpoint}/openai/deployments/${config.deploymentName}`,
    headers: {
      'api-key': config.apiKey,
    },
    fetch: (url, options) => {
      // 添加 api-version 查询参数
      const urlWithVersion = new URL(url as string)
      urlWithVersion.searchParams.set('api-version', config.apiVersion)
      return fetch(urlWithVersion.toString(), options)
    }
  })

  return azure(config.deploymentName)
}

/**
 * 创建主推理 Agent 模型实例
 */
export function createMainAgentModel(): LanguageModel {
  return createAzureModel()
}

/**
 * 创建验证 Agent 模型实例
 */
export function createVerifierAgentModel(): LanguageModel {
  return createAzureModel()
}

/**
 * 获取模型的最大输出 token 数
 */
export function getMaxOutputTokens(): number {
  return 4000 // gpt-5-mini 的限制
}
