'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface NightDeathsInputProps {
  playerCount: number
  selectedSeats: number[]
  mySeat: number
  onChange: (seats: number[]) => void
  disabled?: boolean
}

export function NightDeathsInput({
  playerCount,
  selectedSeats,
  mySeat,
  onChange,
  disabled = false,
}: NightDeathsInputProps) {
  const toggleSeat = (seat: number) => {
    if (disabled) return
    if (selectedSeats.includes(seat)) {
      onChange(selectedSeats.filter((s) => s !== seat))
    } else {
      onChange([...selectedSeats, seat])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: playerCount }, (_, i) => {
        const seat = i + 1
        const isSelected = selectedSeats.includes(seat)
        const isMe = seat === mySeat

        return (
          <div key={seat} className="flex items-center gap-1.5">
            <Checkbox
              id={`death-${seat}`}
              checked={isSelected}
              onCheckedChange={() => toggleSeat(seat)}
              disabled={disabled}
            />
            <Label
              htmlFor={`death-${seat}`}
              className={cn(
                'text-sm cursor-pointer',
                isSelected && 'text-red-600 font-medium'
              )}
            >
              {seat}号{isMe ? '(我)' : ''}
            </Label>
          </div>
        )
      })}

      {selectedSeats.length === 0 && (
        <p className="text-sm text-muted-foreground w-full">勾选昨夜死亡的玩家</p>
      )}
    </div>
  )
}
