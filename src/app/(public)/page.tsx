import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { HeroSection } from '@/components/sections/HeroSection'
import { AdvantagesSection } from '@/components/sections/AdvantagesSection'
import { ServicesPreview } from '@/components/sections/ServicesPreview'
import { PromotionsSection } from '@/components/sections/PromotionsSection'
import { ReviewsPreview } from '@/components/sections/ReviewsPreview'
import { PortfolioPreview } from '@/components/sections/PortfolioPreview'
import { ContactsSection } from '@/components/sections/ContactsSection'
import type { ServicePreviewItem } from '@/components/sections/ServicesPreview'
import type { PromotionItem } from '@/components/sections/PromotionsSection'
import type { ReviewPreviewItem } from '@/components/sections/ReviewsPreview'
import type { PortfolioPreviewItem } from '@/components/sections/PortfolioPreview'
import { isPromotionActive } from '@/lib/utils'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'

/**
 * ISR: страница обновляется не чаще одного раза в 5 минут.
 * Требования: 3.1, 3.3, 16.3, 16.4
 */
export const revalidate = 300

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.companyName} — ${BRAND_CONFIG.tagline}`,
  description:
    'Профессиональный ремонт смартфонов, ноутбуков, планшетов и другой электроники. Гарантия на все виды работ.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${BRAND_CONFIG.companyName} — ${BRAND_CONFIG.tagline}`,
    description:
      'Профессиональный ремонт смартфонов, ноутбуков, планшетов и другой электроники.',
    type: 'website',
    url: SITE_URL,
  },
}

/**
 * Главная страница сайта.
 *
 * Стратегия рендера:
 * - Hero и Преимущества рендерятся мгновенно (Brand_Config / статика).
 * - Тяжёлые секции (CMS-данные) обёрнуты в <Suspense> и стримятся
 *   независимо — каждая секция появится по мере готовности своего запроса.
 *
 * Требования: 3.1, 3.2, 3.3, 3.4, 3.5, 9.4, 14.1
 */
export default async function HomePage() {
  // SiteSettings нужны для Hero (название/слоган/логотип/контакты).
  // Это самый дешёвый запрос (один глобал), поэтому ждём его до начала рендера.
  const settings = await fetchSiteSettings()

  // Данные для Hero
  const heroTitle = settings?.companyName ?? BRAND_CONFIG.companyName
  const heroSubtitle = settings?.tagline ?? BRAND_CONFIG.tagline
  const heroImageUrl =
    settings?.logo &&
    typeof settings.logo === 'object' &&
    'url' in settings.logo &&
    typeof settings.logo.url === 'string'
      ? settings.logo.url
      : null

  // Данные для Контактов (с fallback на BRAND_CONFIG)
  const contactsData = settings
    ? {
        companyName:
          typeof settings.companyName === 'string'
            ? settings.companyName
            : undefined,
        phones: Array.isArray(settings.phones)
          ? (settings.phones as Array<{ label: string; number: string }>)
          : undefined,
        email:
          typeof settings.email === 'string' ? settings.email : undefined,
        addresses: Array.isArray(settings.addresses)
          ? (settings.addresses as Array<{
              label: string
              address: string
              mapUrl?: string
            }>)
          : undefined,
        workingHours:
          typeof settings.workingHours === 'string'
            ? settings.workingHours
            : undefined,
      }
    : undefined

  return (
    <>
      {/* JSON-LD: LocalBusiness structured data — Req 15.5 */}
      <LocalBusinessJsonLd
        brand={BRAND_CONFIG}
        siteUrl={SITE_URL}
        logoUrl={heroImageUrl}
      />

      {/* Hero и Преимущества — без сетевых запросов, рендерятся мгновенно */}
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImageUrl={heroImageUrl}
      />
      <AdvantagesSection />

      {/*
        Каждая секция, которая зависит от CMS, обёрнута в <Suspense>.
        Next.js включает Streaming SSR — браузер получит HTML шапки сразу,
        а каждая секция дорисуется по мере готовности своего запроса.
      */}
      <Suspense fallback={<SectionSkeleton heading="Услуги" />}>
        <ServicesSectionAsync />
      </Suspense>

      <Suspense fallback={null}>
        <PromotionsSectionAsync />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heading="Отзывы" />}>
        <ReviewsSectionAsync />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heading="Портфолио" />}>
        <PortfolioSectionAsync />
      </Suspense>

      <ContactsSection data={contactsData} />
    </>
  )
}

// ─── Async-обёртки секций для стримминг-рендера ───────────────────────────────

async function ServicesSectionAsync() {
  const services = await fetchServices()
  return <ServicesPreview services={services} />
}

async function PromotionsSectionAsync() {
  const promotions = await fetchPromotions()
  return <PromotionsSection promotions={promotions} />
}

async function ReviewsSectionAsync() {
  const reviews = await fetchReviews()
  return <ReviewsPreview reviews={reviews} />
}

async function PortfolioSectionAsync() {
  const items = await fetchPortfolio()
  return <PortfolioPreview items={items} />
}

/** Простой заголовок-плейсхолдер на время загрузки секции */
function SectionSkeleton({ heading }: { heading: string }) {
  return (
    <section className="py-16 sm:py-20" aria-busy="true">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-xl">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" aria-label={`Загрузка: ${heading}`} />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Вспомогательные функции загрузки данных ─────────────────────────────────

/**
 * Загружает глобальные настройки сайта из Payload CMS.
 * Возвращает null при ошибке (страница отобразится с fallback-данными).
 */
async function fetchSiteSettings() {
  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })
    return settings
  } catch {
    // CMS недоступна — используем статический Brand_Config
    return null
  }
}

/**
 * Загружает опубликованные услуги из Payload CMS (не более 6 для главной).
 * Возвращает пустой массив при ошибке.
 */
async function fetchServices(): Promise<ServicePreviewItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 6,
      sort: 'title',
      depth: 0,
      // Уменьшаем размер ответа: тащим только то, что нужно карточке
      select: {
        title: true,
        shortDescription: true,
        priceFrom: true,
        slug: true,
      },
    })

    return result.docs.map((service) => ({
      id: String(service.id),
      title: String(service.title ?? ''),
      shortDescription: String(service.shortDescription ?? ''),
      priceFrom:
        typeof service.priceFrom === 'number' ? service.priceFrom : null,
      slug: String(service.slug ?? ''),
    }))
  } catch {
    return []
  }
}

/**
 * Загружает активные акции из Payload CMS.
 * Фильтрует по дате: только те, у которых startsAt <= now <= endsAt.
 * Возвращает пустой массив при ошибке.
 */
async function fetchPromotions(): Promise<PromotionItem[]> {
  try {
    const payload = await getPayload()
    const now = new Date()

    const result = await payload.find({
      collection: 'promotions',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 6,
      sort: '-startsAt',
    })

    return result.docs
      .filter((promo) => {
        const startsAt = promo.startsAt ? new Date(promo.startsAt) : null
        const endsAt = promo.endsAt ? new Date(promo.endsAt) : null
        if (!startsAt || !endsAt) return false
        return isPromotionActive({ startsAt, endsAt }, now)
      })
      .map((promo): PromotionItem => ({
        id: String(promo.id),
        title: promo.title,
        description:
          typeof promo.description === 'string' ? promo.description : null,
        startsAt: new Date(promo.startsAt as string),
        endsAt: new Date(promo.endsAt as string),
      }))
  } catch {
    return []
  }
}

/**
 * Загружает последние опубликованные отзывы (не более 5) из Payload CMS.
 * Возвращает пустой массив при ошибке.
 */
async function fetchReviews(): Promise<ReviewPreviewItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'reviews',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 5,
      sort: '-reviewDate',
      depth: 1,
    })

    return result.docs.map((review): ReviewPreviewItem => {
      const photoUrl =
        review.photo &&
        typeof review.photo === 'object' &&
        'url' in review.photo &&
        typeof review.photo.url === 'string'
          ? review.photo.url
          : null

      const photoAlt =
        review.photo &&
        typeof review.photo === 'object' &&
        'alt' in review.photo &&
        typeof review.photo.alt === 'string'
          ? review.photo.alt
          : null

      return {
        id: String(review.id),
        clientName: review.clientName,
        rating: review.rating,
        text: review.text,
        photoUrl,
        photoAlt,
        reviewDate: new Date(review.reviewDate as string),
      }
    })
  } catch {
    return []
  }
}

/**
 * Загружает последние опубликованные работы портфолио (не более 6) из Payload CMS.
 * Возвращает пустой массив при ошибке.
 */
async function fetchPortfolio(): Promise<PortfolioPreviewItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'portfolio',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 6,
      sort: '-completedAt',
      depth: 2,
    })

    return result.docs
      .map((item): PortfolioPreviewItem | null => {
        // Берём первое фото «после» как превью
        const afterPhoto =
          Array.isArray(item.afterPhotos) && item.afterPhotos.length > 0
            ? item.afterPhotos[0]
            : null

        const thumbnailUrl =
          afterPhoto &&
          typeof afterPhoto === 'object' &&
          'image' in afterPhoto &&
          afterPhoto.image &&
          typeof afterPhoto.image === 'object' &&
          'url' in afterPhoto.image &&
          typeof afterPhoto.image.url === 'string'
            ? afterPhoto.image.url
            : null

        const thumbnailAlt =
          afterPhoto &&
          typeof afterPhoto === 'object' &&
          'image' in afterPhoto &&
          afterPhoto.image &&
          typeof afterPhoto.image === 'object' &&
          'alt' in afterPhoto.image &&
          typeof afterPhoto.image.alt === 'string'
            ? afterPhoto.image.alt
            : null

        const serviceName =
          item.service &&
          typeof item.service === 'object' &&
          'title' in item.service &&
          typeof item.service.title === 'string'
            ? item.service.title
            : null

        const completedAt = item.completedAt
          ? new Date(item.completedAt as string)
          : null

        return {
          id: String(item.id),
          title: item.title,
          description:
            typeof item.description === 'string' ? item.description : null,
          thumbnailUrl,
          thumbnailAlt,
          serviceName,
          completedAt,
        }
      })
      .filter((item): item is PortfolioPreviewItem => item !== null)
  } catch {
    return []
  }
}
