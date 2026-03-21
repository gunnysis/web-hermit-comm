import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const baseUrl = 'https://www.eundunmaeul.store'
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts_with_like_count')
    .select('id, title, content, created_at, emotions, post_type')
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (posts ?? [])
    .map((post) => {
      const plainText = (post.content ?? '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 200)
      const pubDate = new Date(post.created_at ?? Date.now()).toUTCString()
      const title = post.post_type === 'daily'
        ? `오늘의 하루 — ${(post.emotions ?? []).join(', ') || '기록'}`
        : (post.title ?? '무제')
      const categories = (post.emotions ?? [])
        .map((e: string) => `      <category>${e}</category>`)
        .join('\n')

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${baseUrl}/post/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/post/${post.id}</guid>
      <description><![CDATA[${plainText}]]></description>
      <pubDate>${pubDate}</pubDate>
${categories}
    </item>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>은둔마을</title>
    <link>${baseUrl}</link>
    <description>마음이 쉬어갈 수 있는 익명 커뮤니티</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
