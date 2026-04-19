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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Claim, Role } from '@/types/game'

interface ClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seat: number | null
  playerCount: number
  roles: Role[]
  existingClaim?: Claim
  onSave: (claim: Claim) => void
}

export function ClaimDialog({
  open,
  onOpenChange,
  seat,
  playerCount,
  roles,
  existingClaim,
  onSave,
}: ClaimDialogProps) {
  const [selectedSeat, setSelectedSeat] = useState<number>(seat || 1)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [info, setInfo] = useState('')

  // 重置表单
  useEffect(() => {
    if (open) {
      setSelectedSeat(seat || 1)
      setSelectedRole(existingClaim?.role || '')
      setInfo(existingClaim?.info || '')
    }
  }, [open, seat, existingClaim])

  const handleSave = () => {
    if (!selectedRole) return

    onSave({
      seat: selectedSeat,
      role: selectedRole,
      info,
    })
  }

  // 按类型分组角色
  const groupedRoles = {
    townsfolk: roles.filter((r) => r.type === 'townsfolk'),
    outsider: roles.filter((r) => r.type === 'outsider'),
    minion: roles.filter((r) => r.type === 'minion'),
    demon: roles.filter((r) => r.type === 'demon'),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {seat ? `${seat}号玩家声称` : '添加玩家声称'}
          </DialogTitle>
          <DialogDescription>
            记录该玩家声称的角色和提供的信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 座位选择（仅当未指定座位时显示） */}
          {!seat && (
            <div className="space-y-2">
              <Label>座位号</Label>
              <Select
                value={String(selectedSeat)}
                onValueChange={(v) => setSelectedSeat(parseInt(v))}
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
          )}

          {/* 角色选择 */}
          <div className="space-y-2">
            <Label>声称角色</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="选择角色..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {groupedRoles.townsfolk.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-green-600">
                      镇民
                    </div>
                    {groupedRoles.townsfolk.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name_zh}
                      </SelectItem>
                    ))}
                  </>
                )}
                {groupedRoles.outsider.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-blue-600">
                      外来者
                    </div>
                    {groupedRoles.outsider.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name_zh}
                      </SelectItem>
                    ))}
                  </>
                )}
                {groupedRoles.minion.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-orange-600">
                      爪牙
                    </div>
                    {groupedRoles.minion.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name_zh}
                      </SelectItem>
                    ))}
                  </>
                )}
                {groupedRoles.demon.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-red-600">
                      恶魔
                    </div>
                    {groupedRoles.demon.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name_zh}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 信息输入 */}
          <div className="space-y-2">
            <Label>声称信息（可选）</Label>
            <Textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="例如：洗衣妇信息显示3号或7号中有占卜师..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!selectedRole}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
