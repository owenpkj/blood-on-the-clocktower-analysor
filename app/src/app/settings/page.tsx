'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Key, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type LLMProvider = 'anthropic' | 'openai'

interface Settings {
  provider: LLMProvider
  apiKey: string
}

const STORAGE_KEY = 'botc-llm-settings'

export default function SettingsPage() {
  const [provider, setProvider] = useState<LLMProvider>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 加载已保存的设置
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const settings: Settings = JSON.parse(saved)
        setProvider(settings.provider)
        setApiKey(settings.apiKey)
        setIsSaved(true)
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
    setIsLoading(false)
  }, [])

  // 保存设置
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    const settings: Settings = {
      provider,
      apiKey: apiKey.trim(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setIsSaved(true)
    toast.success('设置已保存')
  }

  // 清除设置
  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey('')
    setIsSaved(false)
    toast.success('设置已清除')
  }

  // 测试 API Key
  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('请先输入 API Key')
      return
    }

    toast.loading('测试连接中...')

    try {
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      })

      const data = await response.json()
      toast.dismiss()

      if (data.success) {
        toast.success('API Key 有效！')
      } else {
        toast.error(`测试失败: ${data.error}`)
      }
    } catch (error) {
      toast.dismiss()
      toast.error('测试失败，请检查网络连接')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
          <div className="flex-1 text-center">
            <span className="font-semibold">设置</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="max-w-xl mx-auto space-y-6">
          {/* API Key 配置 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    LLM API 配置
                  </CardTitle>
                  <CardDescription>
                    配置用于推理分析的大语言模型 API
                  </CardDescription>
                </div>
                {isSaved && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    已配置
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Provider 选择 */}
              <div className="space-y-2">
                <Label>模型提供商</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => setProvider(v as LLMProvider)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">
                      Anthropic (Claude)
                    </SelectItem>
                    <SelectItem value="openai">
                      OpenAI (GPT)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  推荐使用 Claude，推理能力更强
                </p>
              </div>

              {/* API Key 输入 */}
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder={
                    provider === 'anthropic'
                      ? 'sk-ant-api03-...'
                      : 'sk-...'
                  }
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setIsSaved(false)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {provider === 'anthropic' ? (
                    <>
                      从{' '}
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Anthropic Console
                      </a>{' '}
                      获取 API Key
                    </>
                  ) : (
                    <>
                      从{' '}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        OpenAI Platform
                      </a>{' '}
                      获取 API Key
                    </>
                  )}
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">
                  保存设置
                </Button>
                <Button variant="outline" onClick={handleTest}>
                  测试连接
                </Button>
                {isSaved && (
                  <Button variant="ghost" onClick={handleClear}>
                    清除
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                安全提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• API Key 仅保存在浏览器本地存储中</li>
                <li>• 不会上传到任何服务器</li>
                <li>• 清除浏览器数据会删除 API Key</li>
                <li>• 建议使用专门用于此工具的 API Key</li>
              </ul>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                配置 API Key 后，你可以在游戏第3天及以后使用「生成推理分析」功能。
              </p>
              <p>
                推理引擎会分析所有游戏信息，生成最可能的 3 个世界模型（可能的游戏局面）及置信度。
              </p>
              <p>
                每次推理大约消耗 0.01-0.05 美元的 API 费用（取决于游戏复杂度）。
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
