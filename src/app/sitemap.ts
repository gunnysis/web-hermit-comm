import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.eundunmaeul.store'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts_with_like_count')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  const postPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: new Date(post.created_at ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postPages]
}
