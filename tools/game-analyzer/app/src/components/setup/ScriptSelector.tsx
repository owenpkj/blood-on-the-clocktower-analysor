'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Script } from '@/types/game'

interface ScriptSelectorProps {
  scripts: Script[]
  selectedId: string | null
  onSelect: (script: Script) => void
}

const difficultyConfig = {
  beginner: { label: '新手', color: 'bg-green-500' },
  intermediate: { label: '进阶', color: 'bg-yellow-500' },
  advanced: { label: '高级', color: 'bg-red-500' },
} as const

export function ScriptSelector({ scripts, selectedId, onSelect }: ScriptSelectorProps) {
  return (
    <div className="grid gap-4">
      {scripts.map((script) => {
        const difficulty = script.difficulty as keyof typeof difficultyConfig
        const diffConfig = difficultyConfig[difficulty] || difficultyConfig.intermediate

        return (
          <Card
            key={script.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary',
              selectedId === script.id && 'border-primary ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => onSelect(script)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{script.name_zh}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {script.min_players}-{script.max_players}人
                  </Badge>
                  <Badge className={cn('text-xs text-white', diffConfig.color)}>
                    {diffConfig.label}
                  </Badge>
                </div>
              </div>
              {script.name_en && (
                <CardDescription className="text-xs">{script.name_en}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{script.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">
                  包含 {script.role_ids.length} 个角色
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
