import type { MetadataRoute } from 'next'

/**
 * robots.txt — запрещает индексацию /admin, разрешает всё остальное.
 *
 * Требования: 15.3
 */

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
