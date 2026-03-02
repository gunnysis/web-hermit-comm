import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageCircle, ThumbsUp } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PostWithCounts } from '@/types/database'
import { EMOTION_EMOJI } from '@/lib/constants'

interface PostCardProps {
  post: PostWithCounts
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  })

  const preview = post.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140)

  return (
    <Link href={`/post/${post.id}`} className="block group">
      <Card className="card-hover border-border/60 group-hover:border-border">
        <CardHeader className="pb-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{post.display_name}</span>
            <time className="text-xs text-muted-foreground/70 shrink-0">{timeAgo}</time>
          </div>
          <h2 className="font-semibold text-[0.95rem] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        {(preview || post.image_url || post.emotions?.length) ? (
          <CardContent className="pb-2 space-y-2.5">
            {preview && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {preview}
              </p>
            )}
            {post.image_url && (
              <div className="relative w-full h-44 overflow-hidden rounded-md">
                <Image
                  src={post.image_url}
                  alt="게시글 이미지"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              </div>
            )}
            {post.emotions && post.emotions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.emotions.map((emotion) => (
                  <Badge key={emotion} variant="secondary" className="text-xs gap-1 py-0">
                    <span>{EMOTION_EMOJI[emotion] ?? '💬'}</span>
                    {emotion}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        ) : null}

        <CardFooter className="pt-1 gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp size={13} />
            <span className="tabular-nums">{post.like_count ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle size={13} />
            <span className="tabular-nums">{post.comment_count ?? 0}</span>
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
