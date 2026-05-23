import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'

/**
 * Динамический sitemap.xml — включает все публичные URL сайта.
 *
 * Статические страницы: /, /services, /prices, /about, /reviews,
 *   /portfolio, /blog, /contacts
 * Динамические страницы: /services/[slug], /blog/[slug]
 *
 * Требования: 15.2
 */

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Статические страницы ─────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/prices`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // ─── Динамические страницы услуг ─────────────────────────────────────────
  let serviceRoutes: MetadataRoute.Sitemap = []
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true, updatedAt: true },
    })
    serviceRoutes = result.docs.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt as string) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    // При ошибке CMS возвращаем пустой массив — sitemap всё равно будет валидным
  }

  // ─── Динамические страницы блога ─────────────────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'blog',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true, updatedAt: true },
    })
    blogRoutes = result.docs.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt as string) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // При ошибке CMS возвращаем пустой массив
  }

  // ─── Динамические страницы портфолио ─────────────────────────────────────
  // Портфолио не имеет отдельных slug-страниц (открывается в лайтбоксе),
  // поэтому в sitemap включается только страница /portfolio целиком.

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes]
}
