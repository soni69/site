import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Карта slug коллекций к путям для ревалидации.
 * Используется для on-demand ISR revalidation при изменении контента в CMS.
 */
const collectionPathMap: Record<string, string[]> = {
  services: ['/services', '/'],
  blog: ['/blog', '/'],
  portfolio: ['/portfolio', '/'],
  reviews: ['/reviews', '/'],
  promotions: ['/'],
  'price-list': ['/prices'],
}

/**
 * Hook для on-demand ревалидации страниц Next.js после изменения документа в Payload CMS.
 *
 * Вызывает `/api/revalidate` с секретом и путями для ревалидации.
 * Если переменная REVALIDATION_SECRET не задана или NEXT_PUBLIC_SITE_URL недоступен,
 * hook пропускает ревалидацию без ошибки.
 *
 * Требования: 16.4
 */
export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, collection }) => {
  const secret = process.env.REVALIDATION_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!secret || !siteUrl) {
    return doc
  }

  const paths = collectionPathMap[collection.slug] ?? []

  for (const path of paths) {
    try {
      await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret, path }),
      })
    } catch {
      // Не прерываем сохранение документа при ошибке ревалидации
      console.warn(`[revalidate] Failed to revalidate path "${path}" for collection "${collection.slug}"`)
    }
  }

  return doc
}

/**
 * Hook для on-demand ревалидации страниц Next.js после удаления документа в Payload CMS.
 *
 * Требования: 16.4
 */
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, collection }) => {
  const secret = process.env.REVALIDATION_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!secret || !siteUrl) {
    return doc
  }

  const paths = collectionPathMap[collection.slug] ?? []

  for (const path of paths) {
    try {
      await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret, path }),
      })
    } catch {
      console.warn(`[revalidate] Failed to revalidate path "${path}" for collection "${collection.slug}"`)
    }
  }

  return doc
}
