'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, Brain, Sun, Moon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useGameStore } from '@/lib/store/gameStore'
import { roles } from '@/data/roles'
import { SeatCircle } from '@/components/game/SeatCircle'
import { NightDeathsInput } from '@/components/game/NightDeathsInput'
import { ClaimDialog } from '@/components/game/ClaimDialog'
import { NominationDialog } from '@/components/game/NominationDialog'
import { ExecutionSelect } from '@/components/game/ExecutionSelect'
import { MyInfoInput } from '@/components/game/MyInfoInput'
import type { Claim, Nomination, WorldModel, DayRecordForAPI, NightInfo, PlayerInfo, Role } from '@/types/game'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const {
    script,
    playerCount,
    mySeat,
    myRole,
    currentDay,
    gameData,
    setNightDeaths,
    addClaim,
    removeClaim,
    addNomination,
    removeNomination,
    setExecution,
    setMyInfo,
    nextDay,
  } = useGameStore()

  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [claimDialogSeat, setClaimDialogSeat] = useState<number | null>(null)
  const [nominationDialogOpen, setNominationDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(String(currentDay))
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    world_models: WorldModel[]
    key_insights: string[]
    recommended_actions: string[]
  } | null>(null)

  // 获取当天的记录
  const currentDayRecord = gameData.days.find((d) => d.day === currentDay)
  const selectedDayRecord = gameData.days.find((d) => d.day === parseInt(activeTab))

  // 获取我的角色信息
  const myRoleInfo = roles.find((r) => r.id === myRole)

  // 获取可用的角色列表（当前剧本）
  const availableRoles = script
    ? roles.filter((r) => script.role_ids.includes(r.id))
    : []

  // 如果没有游戏数据，重定向到新游戏页面
  useEffect(() => {
    if (!script || !myRole) {
      router.push('/game/new')
    }
  }, [script, myRole, router])

  if (!script || !myRole) {
    return null
  }

  // 打开声称对话框
  const handleSeatClick = (seat: number) => {
    if (seat === mySeat) return // 不能编辑自己的声称
    setClaimDialogSeat(seat)
    setClaimDialogOpen(true)
  }

  // 保存声称
  const handleSaveClaim = (claim: Claim) => {
    addClaim(currentDay, claim)
    setClaimDialogOpen(false)
    setClaimDialogSeat(null)
  }

  // 删除声称
  const handleRemoveClaim = (seat: number) => {
    removeClaim(currentDay, seat)
  }

  // 保存提名
  const handleSaveNomination = (nomination: Nomination) => {
    addNomination(currentDay, nomination)
    setNominationDialogOpen(false)
  }

  // 获取座位的声称角色
  const getSeatClaim = (seat: number) => {
    if (seat === mySeat) {
      return myRoleInfo?.name_zh || ''
    }
    const claim = currentDayRecord?.claims.find((c) => c.seat === seat)
    return claim ? roles.find((r) => r.id === claim.role)?.name_zh || '' : ''
  }

  // 获取座位状态
  const getSeatStatus = (seat: number): 'alive' | 'dead' | 'executed' => {
    // 检查之前所有天的死亡和处决
    for (const day of gameData.days) {
      if (day.day > currentDay) continue
      if (day.night_deaths.includes(seat)) return 'dead'
      if (day.execution === seat) return 'executed'
    }
    return 'alive'
  }

  // 执行推理分析（双 Agent 模式）
  const handleAnalyze = async () => {
    if (!script || !myRole) {
      toast.error('游戏数据不完整')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    toast.loading('正在进行推理分析（双 Agent 模式）...')

    try {
      // 转换数据格式
      const dayRecordsForAPI: DayRecordForAPI[] = gameData.days.map(day => ({
        day: day.day,
        speeches: day.claims.map(c => ({
          seatNumber: c.seat,
          content: `声称${roles.find(r => r.id === c.role)?.name_zh || c.role}${c.info ? `，信息：${c.info}` : ''}`
        })),
        nominations: day.nominations.map(n => ({
          nominatorSeat: n.nominator,
          nominatedSeat: n.nominee,
          votes: n.voters.length,
          executed: day.execution === n.nominee
        })),
        deaths: [
          ...day.night_deaths.map(seat => ({ seatNumber: seat, cause: 'night_kill' })),
          ...(day.execution ? [{ seatNumber: day.execution, cause: 'execution' }] : [])
        ]
      }))

      // 提取我的夜间信息
      const nightInfos: NightInfo[] = gameData.days
        .filter(d => d.my_info)
        .map(d => ({ night: d.day, info: d.my_info }))

      // 生成玩家信息
      const players: PlayerInfo[] = Array.from({ length: playerCount }, (_, i) => {
        const seatNumber = i + 1
        const claim = gameData.days
          .flatMap(d => d.claims)
          .find(c => c.seat === seatNumber)
        return {
          seatNumber,
          isAlive: getSeatStatus(seatNumber) === 'alive',
          claimedRole: claim ? roles.find(r => r.id === claim.role)?.name_zh || null : null,
          notes: ''
        }
      })

      // 获取当前剧本的角色列表
      const scriptRoles: Role[] = roles
        .filter(r => script.role_ids.includes(r.id))
        .map(r => ({
          id: r.id,
          name_zh: r.name_zh,
          name_en: r.name_en,
          type: r.type as Role['type'],
          ability: r.ability,
          affects_setup: r.affects_setup,
          setup_modification: r.setup_modification,
          causes_status: r.causes_status
        }))

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          roles: scriptRoles,
          playerCount,
          mySeat,
          myRole,
          currentDay,
          dayRecords: dayRecordsForAPI,
          nightInfos,
          players
        })
      })

      const data = await response.json()
      toast.dismiss()

      if (data.success && data.result) {
        setAnalysisResult(data.result)
        toast.success('推理分析完成')
      } else {
        toast.error(data.error || '分析失败')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.dismiss()
      toast.error('推理分析失败，请检查网络连接')
    } finally {
      setIsAnalyzing(false)
    }
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
            <span>结束游戏</span>
          </Link>
          <div className="flex-1 text-center">
            <span className="font-semibold">{script.name_zh}</span>
            <Badge variant="outline" className="ml-2">
              {playerCount}人
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {mySeat}号 · {myRoleInfo?.name_zh}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Seat Circle */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  第 {currentDay} 天
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SeatCircle
                  playerCount={playerCount}
                  mySeat={mySeat}
                  claims={currentDayRecord?.claims || []}
                  nightDeaths={currentDayRecord?.night_deaths || []}
                  execution={currentDayRecord?.execution || null}
                  onSeatClick={handleSeatClick}
                  getSeatStatus={getSeatStatus}
                  getSeatClaim={getSeatClaim}
                />

                <Separator className="my-4" />

                {/* Day Controls */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    当前第 {currentDay} 天
                  </span>
                  <Button size="sm" onClick={nextDay}>
                    进入下一天
                    <Moon className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Inference Button */}
                {currentDay >= 3 && (
                  <>
                    <Separator className="my-4" />
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          生成推理分析
                        </>
                      )}
                    </Button>
                  </>
                )}

              </CardContent>
            </Card>

            {/* Analysis Result */}
            {analysisResult && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    推理分析结果
                  </CardTitle>
                  <CardDescription>
                    基于当前游戏信息的分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* World Models */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">可能的世界模型</h4>
                    {analysisResult.world_models.map((wm, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-muted/50 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">模型 {idx + 1}</Badge>
                          <Badge
                            variant={wm.confidence > 0.5 ? 'default' : 'secondary'}
                          >
                            置信度: {(wm.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {/* Role Assignments */}
                        <div className="flex flex-wrap gap-1 text-xs">
                          {Object.entries(wm.roles).map(([seat, role]) => (
                            <span
                              key={seat}
                              className={`px-2 py-0.5 rounded ${
                                wm.alignments[Number(seat)] === '邪恶'
                                  ? 'bg-red-500/20 text-red-600'
                                  : 'bg-green-500/20 text-green-600'
                              }`}
                            >
                              {seat}号: {role}
                            </span>
                          ))}
                        </div>
                        {/* Status Effects */}
                        {Object.keys(wm.status_effects || {}).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">状态效果: </span>
                            {Object.entries(wm.status_effects).map(
                              ([seat, effect]) => (
                                <span key={seat} className="mr-2">
                                  {seat}号{effect.type === 'drunk' ? '醉酒' : '中毒'}
                                  ({effect.source})
                                </span>
                              )
                            )}
                          </div>
                        )}
                        {/* Reasoning */}
                        {wm.reasoning.length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {wm.reasoning.slice(0, 3).map((r, i) => (
                              <p key={i}>• {r}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Key Insights */}
                  {analysisResult.key_insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">关键洞察</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysisResult.key_insights.map((insight, idx) => (
                          <li key={idx}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {analysisResult.recommended_actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">建议行动</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.recommended_actions.map((action, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-primary"
                          >
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Day Records */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                {gameData.days.map((day) => (
                  <TabsTrigger key={day.day} value={String(day.day)}>
                    第 {day.day} 天
                  </TabsTrigger>
                ))}
              </TabsList>

              {gameData.days.map((dayRecord) => (
                <TabsContent key={dayRecord.day} value={String(dayRecord.day)}>
                  <div className="grid gap-4">
                    {/* Night Deaths - 第一夜不会有人死亡 */}
                    {dayRecord.day > 1 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            昨夜死亡
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NightDeathsInput
                            playerCount={playerCount}
                            selectedSeats={dayRecord.night_deaths}
                            mySeat={mySeat}
                            onChange={(deaths) => setNightDeaths(dayRecord.day, deaths)}
                            disabled={dayRecord.day !== currentDay}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Claims */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">玩家声称</CardTitle>
                          {dayRecord.day === currentDay && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setClaimDialogSeat(null)
                                setClaimDialogOpen(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              添加声称
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {dayRecord.claims.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            暂无声称记录
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {dayRecord.claims.map((claim) => {
                              const roleInfo = roles.find((r) => r.id === claim.role)
                              return (
                                <div
                                  key={claim.seat}
                                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                                >
                                  <Badge variant="outline">{claim.seat}号</Badge>
                                  <div className="flex-1">
                                    <p className="font-medium">{roleInfo?.name_zh}</p>
                                    {claim.info && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {claim.info}
                                      </p>
                                    )}
                                  </div>
                                  {dayRecord.day === currentDay && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveClaim(claim.seat)}
                                    >
                                      删除
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Nominations */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">提名记录</CardTitle>
                          {dayRecord.day === currentDay && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNominationDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              添加提名
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {dayRecord.nominations.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            暂无提名记录
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {dayRecord.nominations.map((nom, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{nom.nominator}号</Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge variant="secondary">{nom.nominee}号</Badge>
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm text-muted-foreground">
                                    投票: {nom.voters.length > 0 ? nom.voters.join(', ') : '无'}
                                  </span>
                                </div>
                                {dayRecord.day === currentDay && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeNomination(dayRecord.day, idx)}
                                  >
                                    删除
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Execution */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">处决结果</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ExecutionSelect
                          playerCount={playerCount}
                          selectedSeat={dayRecord.execution}
                          mySeat={mySeat}
                          onChange={(seat) => setExecution(dayRecord.day, seat)}
                          disabled={dayRecord.day !== currentDay}
                        />
                      </CardContent>
                    </Card>

                    {/* My Info */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">我获得的信息</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MyInfoInput
                          value={dayRecord.my_info}
                          onChange={(info) => setMyInfo(dayRecord.day, info)}
                          disabled={dayRecord.day !== currentDay}
                          placeholder={`记录你作为${myRoleInfo?.name_zh}在第${dayRecord.day}天获得的信息...`}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ClaimDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        seat={claimDialogSeat}
        playerCount={playerCount}
        roles={availableRoles}
        existingClaim={
          claimDialogSeat
            ? currentDayRecord?.claims.find((c) => c.seat === claimDialogSeat)
            : undefined
        }
        onSave={handleSaveClaim}
      />

      <NominationDialog
        open={nominationDialogOpen}
        onOpenChange={setNominationDialogOpen}
        playerCount={playerCount}
        onSave={handleSaveNomination}
      />
    </div>
  )
}
