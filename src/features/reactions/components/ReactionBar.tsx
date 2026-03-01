'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReactions } from '../hooks/useReactions'
import { REACTION_TYPES } from '@/types/database'

interface ReactionBarProps {
  postId: number
  userId: string | null
}

export function ReactionBar({ postId, userId }: ReactionBarProps) {
  const { reactions, userReactions, toggle, isPending } = useReactions(postId, userId)

  const getCount = (type: string) =>
    reactions.find((r) => r.reaction_type === type)?.count ?? 0

  const isActive = (type: string) => userReactions.includes(type)

  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_TYPES.map((type) => {
        const count = getCount(type)
        const active = isActive(type)
        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            disabled={isPending || !userId}
            onClick={() => toggle(type)}
            className={cn(
              'gap-1 text-sm h-8 px-3 transition-all',
              active && 'border-primary bg-primary/10 text-primary reaction-active',
            )}
          >
            <span>{type}</span>
            {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
          </Button>
        )
      })}
    </div>
  )
}
