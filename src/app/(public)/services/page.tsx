import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { ServicesClient } from './ServicesClient'
import type { ServiceItem, ServiceCategory } from './ServicesClient'

/**
 * ISR: страница обновляется не чаще одного раза в 10 минут.
 * Требования: 4.1, 4.2, 16.3, 16.4
 */
export const revalidate = 600

export const metadata: Metadata = {
  title: `Услуги — ${BRAND_CONFIG.companyName}`,
  description:
    'Полный список услуг по ремонту техники. Ремонт смартфонов, ноутбуков, планшетов и другой электроники с гарантией.',
  openGraph: {
    title: `Услуги — ${BRAND_CONFIG.companyName}`,
    description:
      'Полный список услуг по ремонту техники с ценами и описанием.',
    type: 'website',
  },
}

/**
 * Страница /services — список всех опубликованных услуг с фильтрацией по категории.
 *
 * Данные загружаются на сервере (ISR), фильтрация выполняется на клиенте
 * через URL search params без перезагрузки страницы.
 * Требования: 4.1, 4.2
 */
export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    fetchServices(),
    fetchCategories(),
  ])

  return (
    <section
      className="py-12 sm:py-16"
      aria-labelledby="services-page-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок страницы */}
        <div className="mb-10">
          <h1
            id="services-page-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Наши услуги
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Профессиональный ремонт любой сложности с гарантией на все виды работ.
          </p>
        </div>

        {/*
          ServicesClient — клиентский компонент с фильтрацией.
          Обёрнут в Suspense, т.к. использует useSearchParams (требование Next.js).
        */}
        <Suspense fallback={<ServicesLoadingSkeleton />}>
          <ServicesClient services={services} categories={categories} />
        </Suspense>
      </div>
    </section>
  )
}

// ─── Скелетон загрузки ────────────────────────────────────────────────────────

function ServicesLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка услуг">
      {/* Заглушки кнопок фильтра */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Вспомогательные функции загрузки данных ─────────────────────────────────

/**
 * Загружает все опубликованные услуги из Payload CMS.
 * Возвращает пустой массив при ошибке.
 */
async function fetchServices(): Promise<ServiceItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 200,
      sort: 'title',
      depth: 2,
    })

    return result.docs.map((service): ServiceItem => {
      // Извлекаем ID категории
      const category = service.category
      const categoryId =
        category && typeof category === 'object' && 'id' in category
          ? String(category.id)
          : typeof category === 'string' || typeof category === 'number'
            ? String(category)
            : ''

      // Извлекаем URL первого фото
      let photoUrl: string | null = null
      let photoAlt = service.title

      if (Array.isArray(service.photos) && service.photos.length > 0) {
        const firstPhoto = service.photos[0]
        if (firstPhoto && typeof firstPhoto === 'object' && 'image' in firstPhoto) {
          const img = firstPhoto.image
          if (img && typeof img === 'object' && 'url' in img && typeof img.url === 'string') {
            photoUrl = img.url
            if ('alt' in img && typeof img.alt === 'string') {
              photoAlt = img.alt || service.title
            }
          }
        }
      }

      return {
        id: String(service.id),
        title: service.title,
        shortDescription: service.shortDescription,
        priceFrom:
          typeof service.priceFrom === 'number' ? service.priceFrom : null,
        slug: service.slug,
        categoryId,
        photoUrl,
        photoAlt,
      }
    })
  } catch {
    return []
  }
}

/**
 * Загружает все категории услуг из Payload CMS, отсортированные по sortOrder.
 * Возвращает пустой массив при ошибке.
 */
async function fetchCategories(): Promise<ServiceCategory[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'service-categories',
      limit: 100,
      sort: 'sortOrder',
    })

    return result.docs.map((cat): ServiceCategory => ({
      id: String(cat.id),
      name: cat.name,
      slug: cat.slug,
    }))
  } catch {
    return []
  }
}
