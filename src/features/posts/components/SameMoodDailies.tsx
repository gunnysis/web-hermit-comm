'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { getSameMoodDailies } from '../api/postsApi'
import { EMOTION_EMOJI } from '@/lib/constants'

interface SameMoodDailiesProps {
  postId: number
  emotions: string[]
  postType?: string
}

export function SameMoodDailies({ postId, emotions, postType }: SameMoodDailiesProps) {
  const { user } = useAuthContext()

  const { data: dailies = [] } = useQuery({
    queryKey: ['sameMoodDailies', postId],
    queryFn: () => getSameMoodDailies(postId, emotions),
    enabled: !!user && postType === 'daily' && emotions.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  if (dailies.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-muted-foreground mb-2">같은 마음의 하루</h4>
      {dailies.map((daily) => {
        const primaryEmotion = daily.emotions?.[0] ?? ''
        return (
          <Link key={daily.id} href={`/post/${daily.id}`}>
            <div className="rounded-lg px-3 py-2 mb-1.5 bg-muted hover:bg-muted/80 transition-colors">
              <p className="text-xs text-muted-foreground line-clamp-1">
                {EMOTION_EMOJI[primaryEmotion]} {daily.content ? `"${daily.content}"` : primaryEmotion}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
