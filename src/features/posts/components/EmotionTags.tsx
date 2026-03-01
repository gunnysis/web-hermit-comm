import { Badge } from '@/components/ui/badge'
import { EMOTION_EMOJI } from '@/lib/constants'

interface EmotionTagsProps {
  emotions: string[] | null | undefined
  className?: string
}

export function EmotionTags({ emotions, className }: EmotionTagsProps) {
  if (!emotions?.length) return null
  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ''}`}>
      {emotions.map((emotion) => (
        <Badge key={emotion} variant="secondary" className="text-xs gap-1">
          <span>{EMOTION_EMOJI[emotion] ?? '💬'}</span>
          {emotion}
        </Badge>
      ))}
    </div>
  )
}
