'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import type { Role, RoleType } from '@/types/game'

interface RoleSelectorProps {
  roles: Role[]
  selectedId: string | null
  onSelect: (roleId: string) => void
}

const typeConfig: Record<RoleType, { label: string; color: string; bgColor: string }> = {
  townsfolk: { label: '镇民', color: 'text-green-600', bgColor: 'bg-green-500/10' },
  outsider: { label: '外来者', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  minion: { label: '爪牙', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  demon: { label: '恶魔', color: 'text-red-600', bgColor: 'bg-red-500/10' },
}

export function RoleSelector({ roles, selectedId, onSelect }: RoleSelectorProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<RoleType | 'all'>('all')

  // 按类型分组
  const groupedRoles = useMemo(() => {
    const groups: Record<RoleType, Role[]> = {
      townsfolk: [],
      outsider: [],
      minion: [],
      demon: [],
    }
    roles.forEach((role) => {
      groups[role.type].push(role)
    })
    return groups
  }, [roles])

  // 过滤角色
  const filteredRoles = useMemo(() => {
    let result = roles

    // 按类型过滤
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter)
    }

    // 按搜索词过滤
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name_zh.toLowerCase().includes(searchLower) ||
          (r.name_en && r.name_en.toLowerCase().includes(searchLower))
      )
    }

    return result
  }, [roles, typeFilter, search])

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索角色..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 类型筛选 */}
      <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as RoleType | 'all')}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="townsfolk" className="text-green-600">
            镇民
          </TabsTrigger>
          <TabsTrigger value="outsider" className="text-blue-600">
            外来者
          </TabsTrigger>
          <TabsTrigger value="minion" className="text-orange-600">
            爪牙
          </TabsTrigger>
          <TabsTrigger value="demon" className="text-red-600">
            恶魔
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 角色列表 */}
      <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredRoles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">未找到匹配的角色</p>
        ) : (
          filteredRoles.map((role) => {
            const config = typeConfig[role.type]
            const isSelected = selectedId === role.id

            return (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-lg text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  config.bgColor,
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'hover:ring-2 hover:ring-primary/50'
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={cn('font-medium', config.color)}>{role.name_zh}</span>
                  <Badge variant="outline" className={cn('text-xs', config.color)}>
                    {config.label}
                  </Badge>
                  {role.affects_setup && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      影响配置
                    </Badge>
                  )}
                </div>
                {role.ability && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {role.ability}
                  </p>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* 当前选择提示 */}
      {selectedId && (
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-sm">
            <span className="text-muted-foreground">已选择：</span>
            <span className="font-medium ml-1">
              {roles.find((r) => r.id === selectedId)?.name_zh}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
