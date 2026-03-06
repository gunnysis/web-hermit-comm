'use client'

import { Fragment } from 'react'

/** <<...>> 구분자 텍스트를 <mark>로 렌더링 */
export function HighlightText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/<<(.*?)>>/g)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  )
}
