'use client'

import { useMemo } from 'react'
import { GREETING_MESSAGES } from '@/lib/constants'

function getTimeSlot(): keyof typeof GREETING_MESSAGES {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

export function GreetingBanner() {
  const slot = useMemo(getTimeSlot, [])
  const { greeting, message } = GREETING_MESSAGES[slot]

  return (
    <div className="rounded-xl bg-gradient-to-r from-cream-50 to-happy-50 dark:from-stone-800 dark:to-stone-800/80 px-5 py-4 animate-fade-in">
      <p className="text-base font-semibold text-foreground">{greeting}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
    </div>
  )
}
