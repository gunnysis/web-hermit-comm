import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/login', '/my', '/create', '/notifications'],
    },
    sitemap: 'https://www.eundunmaeul.store/sitemap.xml',
  }
}
