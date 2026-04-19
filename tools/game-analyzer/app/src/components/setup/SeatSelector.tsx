'use client'

import { cn } from '@/lib/utils'

interface SeatSelectorProps {
  playerCount: number
  selectedSeat: number
  onSelect: (seat: number) => void
}

export function SeatSelector({ playerCount, selectedSeat, onSelect }: SeatSelectorProps) {
  // 计算座位位置（圆形排列）
  const getSeatPosition = (seatNumber: number, total: number) => {
    // 从顶部开始，顺时针排列
    const angle = ((seatNumber - 1) / total) * 2 * Math.PI - Math.PI / 2
    const radius = 40 // 百分比
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      {/* 中心圆 */}
      <div className="absolute inset-[25%] rounded-full border-2 border-dashed border-muted-foreground/20" />

      {/* 座位 */}
      {Array.from({ length: playerCount }, (_, i) => {
        const seatNumber = i + 1
        const pos = getSeatPosition(seatNumber, playerCount)
        const isSelected = selectedSeat === seatNumber

        return (
          <button
            key={seatNumber}
            onClick={() => onSelect(seatNumber)}
            type="button"
            className={cn(
              'absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full z-10',
              'flex items-center justify-center text-sm font-medium',
              'transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
            )}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
          >
            {seatNumber}
          </button>
        )
      })}

      {/* 中心提示 - 添加 pointer-events-none 避免阻挡按钮点击 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{selectedSeat}号</p>
          <p className="text-sm text-muted-foreground">你的座位</p>
        </div>
      </div>
    </div>
  )
}
