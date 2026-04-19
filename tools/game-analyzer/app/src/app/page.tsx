'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, PlayCircle, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">🩸 血染钟楼分析助手</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight">
              血染钟楼分析助手
            </h1>
            <p className="text-xl text-muted-foreground">
              帮助善良阵营玩家分析游戏局势，揪出邪恶势力
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl w-full">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <Link href="/game/new">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <PlusCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>新游戏</CardTitle>
                      <CardDescription>开始一局新的游戏分析</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    选择剧本、设置人数、选择你的角色，开始记录游戏信息
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:border-primary transition-colors cursor-pointer opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PlayCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>继续游戏</CardTitle>
                    <CardDescription>继续之前的游戏（即将推出）</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  加载之前保存的游戏数据，继续分析
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="max-w-2xl w-full mt-8">
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">🎮 准备阶段</h3>
                  <p className="text-sm text-muted-foreground">
                    选择游戏剧本、玩家人数、你的座位号和角色
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">📝 记录阶段</h3>
                  <p className="text-sm text-muted-foreground">
                    记录每日死亡、玩家声称、提名投票、处决结果以及你获得的信息
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">🤔 推理阶段</h3>
                  <p className="text-sm text-muted-foreground">
                    从第3天开始，AI将分析所有信息，给出最可能的3个世界模型及置信度
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            血染钟楼分析助手 - 善良阵营的最佳搭档
          </p>
        </div>
      </footer>
    </div>
  )
}
