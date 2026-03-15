'use client'

import { useState } from 'react'
import { ACTIVITY_PRESETS, DAILY_CONFIG } from '@/lib/constants'
import { Input } from '@/components/ui/input'

interface ActivityTagSelectorProps {
  selected: string[]
  onSelect: (activities: string[]) => void
}

export function ActivityTagSelector({ selected, onSelect }: ActivityTagSelectorProps) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id))
    } else if (selected.length < DAILY_CONFIG.MAX_ACTIVITIES) {
      onSelect([...selected, id])
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim().slice(0, DAILY_CONFIG.MAX_CUSTOM_ACTIVITY_LENGTH)
    if (trimmed && !selected.includes(trimmed) && selected.length < DAILY_CONFIG.MAX_ACTIVITIES) {
      onSelect([...selected, trimmed])
      setCustomInput('')
      setShowCustom(false)
    }
  }

  return (
    <div>
      <p className="text-sm mb-2 text-muted-foreground">
        오늘 한 것 있나요? <span className="text-muted-foreground/60">없어도 괜찮아요</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_PRESETS.map((preset) => {
          const isActive = selected.includes(preset.id)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => toggle(preset.id)}
              className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                isActive
                  ? 'border-foreground/30 bg-muted font-medium'
                  : 'border-border hover:bg-muted/50'
              }`}
              aria-label={`${preset.name} ${isActive ? '선택됨' : '선택'}`}
              aria-pressed={isActive}
            >
              {preset.icon}{isActive ? ` ${preset.name}` : ''}
            </button>
          )
        })}
        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="rounded-full px-2.5 py-1 text-xs border border-border text-muted-foreground hover:bg-muted/50"
          >
            + 직접입력
          </button>
        ) : (
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            maxLength={DAILY_CONFIG.MAX_CUSTOM_ACTIVITY_LENGTH}
            placeholder="활동 입력"
            className="h-7 w-24 text-xs rounded-full px-3"
            autoFocus
          />
        )}
      </div>
      {selected.filter((s) => !ACTIVITY_PRESETS.some((p) => p.id === s)).map((custom) => (
        <button key={custom} type="button" onClick={() => toggle(custom)} className="text-xs text-muted-foreground mt-1 mr-2">
          ✕ {custom}
        </button>
      ))}
    </div>
  )
}
