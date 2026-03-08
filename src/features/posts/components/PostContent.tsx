'use client'
import { useMemo } from 'react'
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'img', 'pre', 'code']
const ALLOWED_ATTR = ['href', 'src', 'alt', 'class', 'target', 'rel']

export function PostContent({ html }: { html: string }) {
  const clean = useMemo(() => {
    if (typeof window === 'undefined') return html
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
  }, [html])

  return <div className="post-content" dangerouslySetInnerHTML={{ __html: clean }} />
}
