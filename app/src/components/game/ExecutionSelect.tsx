'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExecutionSelectProps {
  playerCount: number
  selectedSeat: number | null
  mySeat: number
  onChange: (seat: number | null) => void
  disabled?: boolean
}

export function ExecutionSelect({
  playerCount,
  selectedSeat,
  mySeat,
  onChange,
  disabled = false,
}: ExecutionSelectProps) {
  return (
    <Select
      value={selectedSeat === null ? 'none' : String(selectedSeat)}
      onValueChange={(v) => onChange(v === 'none' ? null : parseInt(v))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="选择被处决者..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">无人被处决</SelectItem>
        {Array.from({ length: playerCount }, (_, i) => {
          const seat = i + 1
          return (
            <SelectItem key={seat} value={String(seat)}>
              {seat}号{seat === mySeat ? ' (我)' : ''}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
