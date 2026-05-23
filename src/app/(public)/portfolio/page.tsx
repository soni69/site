import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import type { PortfolioService } from '@/components/features/portfolio/PortfolioFilter'
import type { PortfolioGridItem } from '@/components/features/portfolio/PortfolioGrid'
import type { LightboxPhoto } from '@/components/features/portfolio/PortfolioLightbox'
import { PortfolioClientWrapper } from './PortfolioClientWrapper'

/**
 * ISR: страница обновляется не чаще одного раза в 5 минут.
 * Требования: 8.1, 8.2, 8.3, 8.5, 16.3, 16.4
 */
export const revalidate = 300

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Портфолио — ${BRAND_CONFIG.companyName}`,
  description:
    'Галерея выполненных работ по ремонту техники. Фото до и после ремонта смартфонов, ноутбуков, планшетов и другой электроники.',
  alternates: {
    canonical: `${SITE_URL}/portfolio`,
  },
  openGraph: {
    title: `Портфолио — ${BRAND_CONFIG.companyName}`,
    description:
      'Примеры выполненных ремонтов с фото до и после. Убедитесь в качестве нашей работы.',
    type: 'website',
    url: `${SITE_URL}/portfolio`,
  },
}

/**
 * Страница /portfolio — галерея выполненных работ с фильтрацией по услуге и пагинацией.
 *
 * Данные загружаются на сервере (ISR revalidate: 300).
 * Фильтрация выполняется на клиенте через URL search params без перезагрузки страницы.
 * Пагинация реализована через кнопку «Загрузить ещё» (не более 12 на странице).
 *
 * Требования: 8.1, 8.2, 8.3, 8.5, 22.4
 */
export default async function PortfolioPage() {
  const [portfolioItems, services] = await Promise.all([
    fetchPortfolioItems(),
    fetchServices(),
  ])

  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="portfolio-page-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок страницы */}
        <div className="mb-10">
          <h1
            id="portfolio-page-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Наши работы
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Примеры выполненных ремонтов — убедитесь в качестве нашей работы.
          </p>
        </div>

        {/*
          PortfolioClientWrapper — клиентский компонент с фильтрацией и сеткой.
          Обёрнут в Suspense, т.к. использует useSearchParams (требование Next.js).
        */}
        <Suspense fallback={<PortfolioLoadingSkeleton />}>
          <PortfolioClientWrapper items={portfolioItems} services={services} />
        </Suspense>
      </div>
    </section>
  )
}

// ─── Скелетон загрузки ────────────────────────────────────────────────────────

function PortfolioLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка портфолио">
      {/* Заглушки кнопок фильтра */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
      {/* Заглушки карточек */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="h-48 animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Вспомогательные функции загрузки данных ─────────────────────────────────

/**
 * Загружает все опубликованные элементы портфолио из Payload CMS.
 * Возвращает пустой массив при ошибке.
 */
async function fetchPortfolioItems(): Promise<PortfolioGridItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'portfolio',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 200,
      sort: '-completedAt',
      depth: 2,
    })

    return result.docs.map((item): PortfolioGridItem => {
      // Извлекаем ID и название связанной услуги
      const service = item.service
      let serviceId: string | null = null
      let serviceName: string | null = null

      if (service && typeof service === 'object' && 'id' in service) {
        serviceId = String(service.id)
        if ('title' in service && typeof service.title === 'string') {
          serviceName = service.title
        }
      } else if (typeof service === 'string' || typeof service === 'number') {
        serviceId = String(service)
      }

      // Извлекаем фото «до»
      const beforePhotos: LightboxPhoto[] = []
      if (Array.isArray(item.beforePhotos)) {
        for (const entry of item.beforePhotos) {
          if (entry && typeof entry === 'object' && 'image' in entry) {
            const img = entry.image
            if (img && typeof img === 'object' && 'url' in img && typeof img.url === 'string') {
              beforePhotos.push({
                url: img.url,
                alt:
                  ('alt' in img && typeof img.alt === 'string' ? img.alt : null) ??
                  item.title,
              })
            }
          }
        }
      }

      // Извлекаем фото «после»
      const afterPhotos: LightboxPhoto[] = []
      if (Array.isArray(item.afterPhotos)) {
        for (const entry of item.afterPhotos) {
          if (entry && typeof entry === 'object' && 'image' in entry) {
            const img = entry.image
            if (img && typeof img === 'object' && 'url' in img && typeof img.url === 'string') {
              afterPhotos.push({
                url: img.url,
                alt:
                  ('alt' in img && typeof img.alt === 'string' ? img.alt : null) ??
                  item.title,
              })
            }
          }
        }
      }

      // Превью: первое фото «после», иначе первое «до»
      const thumbnailPhoto = afterPhotos[0] ?? beforePhotos[0] ?? null

      // Дата выполнения
      const completedAt = item.completedAt ? new Date(item.completedAt) : null

      return {
        id: String(item.id),
        title: item.title,
        description: item.description ?? null,
        thumbnailUrl: thumbnailPhoto?.url ?? null,
        thumbnailAlt: thumbnailPhoto?.alt ?? null,
        serviceName,
        serviceId,
        completedAt,
        beforePhotos,
        afterPhotos,
      }
    })
  } catch {
    return []
  }
}

/**
 * Загружает все опубликованные услуги для фильтра портфолио.
 * Возвращает пустой массив при ошибке.
 */
async function fetchServices(): Promise<PortfolioService[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 100,
      sort: 'title',
      depth: 0,
    })

    return result.docs.map((service): PortfolioService => ({
      id: String(service.id),
      title: service.title,
    }))
  } catch {
    return []
  }
}
