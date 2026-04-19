'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Claim } from '@/types/game'

interface SeatCircleProps {
  playerCount: number
  mySeat: number
  claims: Claim[]
  nightDeaths: number[]
  execution: number | null
  onSeatClick: (seat: number) => void
  getSeatStatus: (seat: number) => 'alive' | 'dead' | 'executed'
  getSeatClaim: (seat: number) => string
}

export function SeatCircle({
  playerCount,
  mySeat,
  claims,
  nightDeaths,
  execution,
  onSeatClick,
  getSeatStatus,
  getSeatClaim,
}: SeatCircleProps) {
  // 计算座位位置（圆形排列）
  const getSeatPosition = (seatNumber: number, total: number) => {
    const angle = ((seatNumber - 1) / total) * 2 * Math.PI - Math.PI / 2
    const radius = 38
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <TooltipProvider>
      <div className="relative aspect-square w-full max-w-xs mx-auto">
        {/* 中心圆 */}
        <div className="absolute inset-[30%] rounded-full border-2 border-dashed border-muted-foreground/20" />

        {/* 座位 */}
        {Array.from({ length: playerCount }, (_, i) => {
          const seatNumber = i + 1
          const pos = getSeatPosition(seatNumber, playerCount)
          const status = getSeatStatus(seatNumber)
          const claim = getSeatClaim(seatNumber)
          const isMe = seatNumber === mySeat

          return (
            <Tooltip key={seatNumber}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSeatClick(seatNumber)}
                  disabled={isMe}
                  className={cn(
                    'absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    'flex flex-col items-center justify-center text-xs',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    // 状态颜色
                    status === 'alive' && !isMe && 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
                    status === 'dead' && 'bg-gray-300 text-gray-500',
                    status === 'executed' && 'bg-red-500/20 text-red-700',
                    // 自己的座位
                    isMe && 'ring-2 ring-blue-500 bg-blue-500/20 text-blue-700',
                    // 禁用状态
                    isMe && 'cursor-default'
                  )}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                >
                  <span className="font-bold">{seatNumber}</span>
                  {claim && (
                    <span className="text-[8px] truncate max-w-full px-0.5">
                      {claim.slice(0, 2)}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-center">
                  <p className="font-medium">{seatNumber}号{isMe ? ' (我)' : ''}</p>
                  {claim && <p className="text-xs text-muted-foreground">{claim}</p>}
                  <p className="text-xs">
                    {status === 'alive' && '存活'}
                    {status === 'dead' && '夜晚死亡'}
                    {status === 'executed' && '被处决'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {/* 中心信息 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{mySeat}号</p>
            <p className="text-xs text-muted-foreground">我的座位</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
