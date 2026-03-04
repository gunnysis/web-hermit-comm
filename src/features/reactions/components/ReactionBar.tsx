"use client"

import { cn } from "@/lib/utils"
import { useReactions } from "../hooks/useReactions"
import { REACTION_COLOR_MAP, SHARED_PALETTE } from "@/lib/constants.generated"

/** 반응 타입 정의 — 앱과 동일한 named type 시스템 */
const REACTION_TYPES = [
  { type: "like", emoji: "👍", label: "좋아요" },
  { type: "heart", emoji: "❤️", label: "하트" },
  { type: "laugh", emoji: "😂", label: "웃음" },
  { type: "sad", emoji: "😢", label: "슬픔" },
  { type: "surprise", emoji: "😮", label: "놀람" },
] as const

type PaletteKey = keyof typeof SHARED_PALETTE

/** 반응 타입별 인라인 색상 가져오기 */
function getReactionColors(type: string) {
  const colorKey = REACTION_COLOR_MAP[type as keyof typeof REACTION_COLOR_MAP] ?? "happy"
  const palette = SHARED_PALETTE[colorKey as PaletteKey]
  if (!palette || !("400" in palette)) return { bg: "#FFF9E6", border: "#FFCF33", text: "#997500", shadow: "#FFCF33" }
  const p = palette as Record<string, string>
  return { bg: p["100"], border: p["400"], text: p["700"], shadow: p["400"] }
}

/** 숫자 포맷 */
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return String(n)
}

interface ReactionBarProps {
  postId: number
  userId: string | null
}

export function ReactionBar({ postId, userId }: ReactionBarProps) {
  const { reactions, toggle, isPending } = useReactions(postId, userId)

  const getCount = (type: string) =>
    reactions.find((r) => r.reaction_type === type)?.count ?? 0

  const isActive = (type: string) =>
    reactions.find((r) => r.reaction_type === type)?.user_reacted ?? false

  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0)

  const sortedTypes = [...REACTION_TYPES].sort((a, b) => {
    const countA = getCount(a.type)
    const countB = getCount(b.type)
    if (countA > 0 && countB === 0) return -1
    if (countA === 0 && countB > 0) return 1
    return countB - countA
  })

  return (
    <div aria-label="반응 버튼 목록">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          반응
        </span>
        {totalCount > 0 && (
          <span className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {formatCount(totalCount)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedTypes.map(({ type, emoji, label }) => {
          const count = getCount(type)
          const active = isActive(type)
          const colors = getReactionColors(type)
          const hasCount = count > 0

          return (
            <button
              key={type}
              disabled={isPending || !userId}
              onClick={() => toggle(type)}
              aria-label={`${label} ${count}개, ${active ? "누르면 취소" : "누르면 추가"}`}
              aria-pressed={active}
              style={
                active
                  ? {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      boxShadow: `0 4px 14px ${colors.shadow}40, 0 0 0 2px ${colors.shadow}20`,
                    }
                  : hasCount
                    ? { boxShadow: `0 2px 8px ${colors.shadow}15` }
                    : undefined
              }
              className={cn(
                "inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-2xl border-[1.5px] text-sm font-medium cursor-pointer",
                "transition-all duration-200 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !active && "bg-card border-border hover:bg-accent shadow-sm hover:shadow-md",
              )}
            >
              <span className={hasCount ? "text-lg" : "text-base"}>{emoji}</span>
              {hasCount && (
                <span className="text-[13px] font-bold tabular-nums">
                  {formatCount(count)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
