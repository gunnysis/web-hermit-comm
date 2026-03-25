"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { PostWithCounts } from "@/types/database"
import { EMOTION_EMOJI, EMOTION_COLOR_MAP } from "@/lib/constants"
import { getEmotionClassName } from "@/lib/emotion-category"
import { startViewTransition } from "@/lib/view-transition"

interface PostCardProps {
  post: PostWithCounts
}

/** 숫자 포맷 */
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return String(n)
}

export function PostCard({ post }: PostCardProps) {

  const router = useRouter()
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  })

  const preview = (post.content ?? '')
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140)

  const likeCount = post.like_count ?? 0
  const commentCount = post.comment_count ?? 0
  const visibleEmotions = post.emotions?.slice(0, 2) ?? []
  const moreEmotions = (post.emotions?.length ?? 0) - 2
  const primaryEmotion = post.emotions?.[0]
  const stripeColors = primaryEmotion ? EMOTION_COLOR_MAP[primaryEmotion] : null

  const handleClick = () => {
    startViewTransition(() => {
      router.push(`/post/${post.id}`)
    })
  }

  return (
    <div onClick={handleClick} className="block group cursor-pointer" role="link" aria-label={post.title}>
      <Card className="card-hover border-border/60 group-hover:border-border transition-all duration-200 active:scale-[0.98] relative overflow-hidden">
        {stripeColors && (
          <div
            className="emotion-stripe"
            style={{ background: `linear-gradient(to bottom, ${stripeColors.gradient[0]}, ${stripeColors.gradient[1]})` }}
          />
        )}
        <CardHeader className="pb-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-happy-50 text-happy-700 dark:bg-happy-900/40 dark:text-happy-300 truncate max-w-[60%]">
              {post.display_name}
            </span>
            <time className="text-xs text-muted-foreground/70 shrink-0">{timeAgo}</time>
          </div>
          <h2 className="font-semibold text-[0.95rem] leading-snug line-clamp-2 group-hover:text-happy-600 dark:group-hover:text-happy-400 transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        {(preview || visibleEmotions.length > 0) && (
          <CardContent className="pb-2 space-y-2.5">
            {preview && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {preview}
              </p>
            )}
            {visibleEmotions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {visibleEmotions.map((emotion) => (
                  <span
                    key={emotion}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEmotionClassName(emotion)}`}
                  >
                    <span>{EMOTION_EMOJI[emotion] ?? "💬"}</span>
                    {emotion}
                  </span>
                ))}
                {moreEmotions > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-muted-foreground">
                    +{moreEmotions}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className="pt-1 gap-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-happy-50 text-happy-700 dark:bg-happy-900/40 dark:text-happy-300 tabular-nums ${likeCount === 0 ? 'opacity-40' : ''}`}>
            👍 {formatCount(likeCount)}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-lavender-50 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300 tabular-nums ${commentCount === 0 ? 'opacity-40' : ''}`}>
            💬 {formatCount(commentCount)}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
