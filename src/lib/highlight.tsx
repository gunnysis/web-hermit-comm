'use client'

import { Fragment, memo } from 'react'
import { useTheme } from 'next-themes'
import { SEARCH_HIGHLIGHT } from '@/lib/constants'

/** <<...>> 구분자 텍스트를 <mark>로 렌더링 */
export const HighlightText = memo(function HighlightText({ text, className }: { text: string; className?: string }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const parts = text.split(/<<(.*?)>>/g)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            style={{ backgroundColor: isDark ? SEARCH_HIGHLIGHT.dark : SEARCH_HIGHLIGHT.light }}
            className="text-inherit rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  )
})
