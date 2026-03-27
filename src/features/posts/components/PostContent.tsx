'use client'
import { useEffect, useState } from 'react'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'img', 'pre', 'code']
const ALLOWED_ATTR = ['href', 'src', 'alt', 'class', 'target', 'rel']

/** 태그 제거 (SSR fallback용) */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function PostContent({ html }: { html: string }) {
  const [sanitized, setSanitized] = useState<string | null>(null)

  useEffect(() => {
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitized(DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }))
    })
  }, [html])

  if (sanitized === null) {
    return <div className="post-content whitespace-pre-wrap">{stripTags(html)}</div>
  }

  return <div className="post-content" dangerouslySetInnerHTML={{ __html: sanitized }} />
}
