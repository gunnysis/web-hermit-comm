"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { EMOTION_EMOJI } from "@/lib/constants"
import { getEmotionClassName } from "@/lib/emotion-category"

interface EmotionTagsProps {
  emotions: string[] | null | undefined
  className?: string
  clickable?: boolean
  /** 로딩 중 스켈레톤 표시 */
  loading?: boolean
  /** 섹션 헤더 표시 여부 */
  showHeader?: boolean
  /** 최대 표시 개수 (0=전체) */
  maxVisible?: number
}

function SkeletonChip() {
  return (
    <span className="inline-block h-7 w-16 rounded-full bg-muted animate-pulse" />
  )
}

export function EmotionTags({
  emotions,
  className,
  clickable,
  loading,
  showHeader,
  maxVisible = 0,
}: EmotionTagsProps) {
  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {showHeader && (
          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            이 글의 감정
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <SkeletonChip />
          <SkeletonChip />
          <SkeletonChip />
        </div>
      </div>
    )
  }

  if (!emotions?.length) return null

  const visible = maxVisible > 0 ? emotions.slice(0, maxVisible) : emotions
  const remaining = maxVisible > 0 ? emotions.length - maxVisible : 0

  return (
    <div className={cn("space-y-2", className)}>
      {showHeader && (
        <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          이 글의 감정
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((emotion) => {
          const emoji = EMOTION_EMOJI[emotion] ?? "💬"
          const chip = (
            <span
              key={emotion}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                getEmotionClassName(emotion),
                "transition-colors duration-150",
                clickable && "cursor-pointer hover:bg-accent active:scale-95",
              )}
            >
              <span>{emoji}</span>
              {emotion}
            </span>
          )

          if (clickable) {
            return (
              <Link key={emotion} href={`/search?emotion=${encodeURIComponent(emotion)}`}>
                {chip}
              </Link>
            )
          }
          return chip
        })}
        {remaining > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-muted-foreground">
            +{remaining}
          </span>
        )}
      </div>
    </div>
  )
}
