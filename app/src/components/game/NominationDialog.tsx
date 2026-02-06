'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Nomination } from '@/types/game'

interface NominationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playerCount: number
  onSave: (nomination: Nomination) => void
}

export function NominationDialog({
  open,
  onOpenChange,
  playerCount,
  onSave,
}: NominationDialogProps) {
  const [nominator, setNominator] = useState<number>(1)
  const [nominee, setNominee] = useState<number>(2)
  const [voters, setVoters] = useState<number[]>([])

  // 重置表单
  useEffect(() => {
    if (open) {
      setNominator(1)
      setNominee(2)
      setVoters([])
    }
  }, [open])

  const handleSave = () => {
    onSave({
      nominator,
      nominee,
      voters,
    })
  }

  const toggleVoter = (seat: number) => {
    if (voters.includes(seat)) {
      setVoters(voters.filter((v) => v !== seat))
    } else {
      setVoters([...voters, seat])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>记录提名</DialogTitle>
          <DialogDescription>
            记录提名者、被提名者和投票情况
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 提名者 */}
          <div className="space-y-2">
            <Label>提名者</Label>
            <Select
              value={String(nominator)}
              onValueChange={(v) => setNominator(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: playerCount }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}号
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 被提名者 */}
          <div className="space-y-2">
            <Label>被提名者</Label>
            <Select
              value={String(nominee)}
              onValueChange={(v) => setNominee(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: playerCount }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}号
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 投票者 */}
          <div className="space-y-2">
            <Label>投票者</Label>
            <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
              {Array.from({ length: playerCount }, (_, i) => {
                const seat = i + 1
                const isSelected = voters.includes(seat)

                return (
                  <div key={seat} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`voter-${seat}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleVoter(seat)}
                    />
                    <Label htmlFor={`voter-${seat}`} className="text-sm cursor-pointer">
                      {seat}号
                    </Label>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              已选择 {voters.length} 人投票
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
