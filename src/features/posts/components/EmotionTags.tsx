'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { EMOTION_EMOJI } from '@/lib/constants'

interface EmotionTagsProps {
  emotions: string[] | null | undefined
  className?: string
  clickable?: boolean
}

export function EmotionTags({ emotions, className, clickable }: EmotionTagsProps) {
  if (!emotions?.length) return null
  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ''}`}>
      {emotions.map((emotion) => {
        const badge = (
          <Badge key={emotion} variant="secondary" className={`text-xs gap-1${clickable ? ' cursor-pointer hover:bg-accent' : ''}`}>
            <span>{EMOTION_EMOJI[emotion] ?? '💬'}</span>
            {emotion}
          </Badge>
        )
        if (clickable) {
          return (
            <Link key={emotion} href={`/search?emotion=${encodeURIComponent(emotion)}`}>
              {badge}
            </Link>
          )
        }
        return badge
      })}
    </div>
  )
}
