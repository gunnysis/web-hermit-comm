'use client'

import { ALLOWED_EMOTIONS, EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'

interface EmotionFilterBarProps {
  selected: string | null
  onSelect: (emotion: string | null) => void
}

export function EmotionFilterBar({ selected, onSelect }: EmotionFilterBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          selected === null
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
      >
        전체
      </button>
      {ALLOWED_EMOTIONS.map((emotion) => {
        const isActive = selected === emotion
        const colors = EMOTION_COLOR_MAP[emotion]
        return (
          <button
            key={emotion}
            onClick={() => onSelect(isActive ? null : emotion)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'ring-1 ring-foreground/20 shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
            style={
              isActive && colors
                ? { background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})` }
                : undefined
            }
          >
            {EMOTION_EMOJI[emotion]} {emotion}
          </button>
        )
      })}
    </div>
  )
}
