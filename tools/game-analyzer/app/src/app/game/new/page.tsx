'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, Users, User, Scroll, Info } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { scripts } from '@/data/scripts'
import { roles } from '@/data/roles'
import type { Script, Role } from '@/types/game'
import { ScriptSelector } from '@/components/setup/ScriptSelector'
import { RoleSelector } from '@/components/setup/RoleSelector'
import { SeatSelector } from '@/components/setup/SeatSelector'

export default function NewGamePage() {
  const router = useRouter()
  const {
    script,
    playerCount,
    mySeat,
    myRole,
    setScript,
    setPlayerCount,
    setMySeat,
    setMyRole,
    setScripts,
    setRoles,
    initGame,
    reset,
  } = useGameStore()

  const [step, setStep] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)

  // 进入新游戏页面时重置状态
  useEffect(() => {
    reset()
    setIsInitialized(true)
  }, [reset])

  // 初始化剧本和角色数据到 store
  useEffect(() => {
    // 将静态数据转换为 Script 和 Role 类型
    const scriptsData: Script[] = scripts.map(s => ({
      id: s.id,
      name_zh: s.name_zh,
      name_en: s.name_en,
      description: s.description,
      difficulty: s.difficulty,
      min_players: s.min_players,
      max_players: s.max_players,
      role_ids: [...s.role_ids],
      first_night_order: [...s.first_night_order],
      other_night_order: [...s.other_night_order],
      player_counts: { ...s.player_counts },
      special_rules: s.special_rules ? { ...s.special_rules } : null,
    }))

    const rolesData: Role[] = roles.map(r => ({
      id: r.id,
      name_zh: r.name_zh,
      name_en: r.name_en,
      type: r.type as Role['type'],
      ability: r.ability,
      affects_setup: r.affects_setup,
      setup_modification: r.setup_modification,
      causes_status: r.causes_status,
    }))

    setScripts(scriptsData)
    setRoles(rolesData)
  }, [setScripts, setRoles])

  // 获取当前剧本可用的角色
  const availableRoles = script
    ? roles.filter(r => script.role_ids.includes(r.id))
    : []

  // 获取当前人数的角色配置
  const playerConfig = script?.player_counts[String(playerCount)]

  // 验证是否可以进入下一步
  const canProceed = () => {
    switch (step) {
      case 1:
        return script !== null
      case 2:
        return playerCount >= (script?.min_players || 5) &&
               playerCount <= (script?.max_players || 15)
      case 3:
        return mySeat >= 1 && mySeat <= playerCount
      case 4:
        return myRole !== null
      default:
        return false
    }
  }

  // 开始游戏
  const handleStartGame = () => {
    const gameId = crypto.randomUUID()
    initGame(gameId)
    router.push(`/game/${gameId}`)
  }

  // 等待初始化完成
  if (!isInitialized) {
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
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
          <div className="flex-1 text-center">
            <span className="font-semibold">新游戏设置</span>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: '选择剧本', icon: Scroll },
              { num: 2, label: '设置人数', icon: Users },
              { num: 3, label: '选择座位', icon: User },
              { num: 4, label: '确认角色', icon: Info },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step > s.num
                      ? 'bg-primary text-primary-foreground'
                      : step === s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`hidden sm:inline text-sm ${step === s.num ? 'font-medium' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {i < 3 && (
                  <div className={`w-8 h-0.5 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Select Script */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  选择剧本
                </CardTitle>
                <CardDescription>
                  选择本局游戏使用的剧本
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScriptSelector
                  scripts={scripts.map(s => ({
                    id: s.id,
                    name_zh: s.name_zh,
                    name_en: s.name_en,
                    description: s.description,
                    difficulty: s.difficulty,
                    min_players: s.min_players,
                    max_players: s.max_players,
                    role_ids: [...s.role_ids],
                    first_night_order: [...s.first_night_order],
                    other_night_order: [...s.other_night_order],
                    player_counts: { ...s.player_counts },
                    special_rules: s.special_rules ? { ...s.special_rules } : null,
                  }))}
                  selectedId={script?.id || null}
                  onSelect={(s) => {
                    setScript(s)
                    // 重置人数到剧本允许的范围
                    const newPlayerCount = Math.max(s.min_players, Math.min(s.max_players, playerCount))
                    setPlayerCount(newPlayerCount)
                    // 确保座位号在有效范围内
                    if (mySeat > newPlayerCount) setMySeat(1)
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Player Count */}
          {step === 2 && script && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  设置玩家人数
                </CardTitle>
                <CardDescription>
                  {script.name_zh} 支持 {script.min_players}-{script.max_players} 人游戏
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>玩家人数</Label>
                    <span className="text-2xl font-bold">{playerCount}</span>
                  </div>
                  <Slider
                    value={[playerCount]}
                    onValueChange={([value]) => {
                      setPlayerCount(value)
                      // 确保座位号在有效范围内
                      if (mySeat > value) setMySeat(1)
                    }}
                    min={script.min_players}
                    max={script.max_players}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{script.min_players}人</span>
                    <span>{script.max_players}人</span>
                  </div>
                </div>

                <Separator />

                {/* 角色配置 */}
                {playerConfig && (
                  <div className="space-y-3">
                    <Label>角色配置</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <span className="text-green-600">镇民</span>
                        <Badge variant="secondary">{playerConfig.townsfolk}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-blue-600">外来者</span>
                        <Badge variant="secondary">{playerConfig.outsiders}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                        <span className="text-orange-600">爪牙</span>
                        <Badge variant="secondary">{playerConfig.minions}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                        <span className="text-red-600">恶魔</span>
                        <Badge variant="secondary">{playerConfig.demons}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* 特殊规则提示 */}
                {script.special_rules && Object.keys(script.special_rules).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">特殊规则</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {Object.entries(script.special_rules).map(([key, value]) => (
                        <p key={key}>• {String(value)}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Seat Selection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  选择你的座位
                </CardTitle>
                <CardDescription>
                  点击选择你在游戏中的座位号
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SeatSelector
                  playerCount={playerCount}
                  selectedSeat={mySeat}
                  onSelect={setMySeat}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Role Confirmation */}
          {step === 4 && script && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  确认你的角色
                </CardTitle>
                <CardDescription>
                  选择说书人分配给你的角色
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RoleSelector
                  roles={availableRoles.map(r => ({
                    id: r.id,
                    name_zh: r.name_zh,
                    name_en: r.name_en,
                    type: r.type as Role['type'],
                    ability: r.ability,
                    affects_setup: r.affects_setup,
                    setup_modification: r.setup_modification,
                    causes_status: r.causes_status,
                  }))}
                  selectedId={myRole}
                  onSelect={setMyRole}
                />

                {/* Summary */}
                <Separator />
                <div className="space-y-3">
                  <Label className="text-muted-foreground">游戏设置摘要</Label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">剧本:</span>
                      <span className="font-medium">{script.name_zh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">人数:</span>
                      <span className="font-medium">{playerCount}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">座位:</span>
                      <span className="font-medium">{mySeat}号</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">角色:</span>
                      <span className="font-medium">
                        {myRole ? roles.find(r => r.id === myRole)?.name_zh : '未选择'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一步
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={!canProceed()}
              >
                下一步
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleStartGame}
                disabled={!canProceed()}
              >
                开始游戏
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
