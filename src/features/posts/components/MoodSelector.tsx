'use client'

import { useState } from 'react'
import { ALLOWED_EMOTIONS, EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'

interface MoodSelectorProps {
  value: string[]
  onChange: (emotions: string[]) => void
  maxSelect?: number
}

export function MoodSelector({ value, onChange, maxSelect = 3 }: MoodSelectorProps) {
  const toggle = (emotion: string) => {
    if (value.includes(emotion)) {
      onChange(value.filter((e) => e !== emotion))
    } else if (value.length < maxSelect) {
      onChange([...value, emotion])
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-base font-semibold">지금 어떤 마음인가요?</p>
        <p className="text-sm text-muted-foreground mt-1">최대 {maxSelect}개까지 선택할 수 있어요</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ALLOWED_EMOTIONS.map((emotion) => {
          const isSelected = value.includes(emotion)
          const colors = EMOTION_COLOR_MAP[emotion]
          return (
            <button
              key={emotion}
              type="button"
              onClick={() => toggle(emotion)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? 'ring-2 ring-foreground/20 shadow-md scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:scale-102'
              }`}
              style={
                isSelected && colors
                  ? { background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})` }
                  : undefined
              }
            >
              {EMOTION_EMOJI[emotion]} {emotion}
            </button>
          )
        })}
      </div>
    </div>
  )
}
