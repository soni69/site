import type { Metadata } from 'next'
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

/**
 * ISR: страница обновляется не чаще одного раза в 5 минут.
 * Требования: 3.1, 3.3, 16.3, 16.4
 */
export const revalidate = 300

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.companyName} — ${BRAND_CONFIG.tagline}`,
  description:
    'Профессиональный ремонт смартфонов, ноутбуков, планшетов и другой электроники. Гарантия на все виды работ.',
  openGraph: {
    title: `${BRAND_CONFIG.companyName} — ${BRAND_CONFIG.tagline}`,
    description:
      'Профессиональный ремонт смартфонов, ноутбуков, планшетов и другой электроники.',
    type: 'website',
  },
}

/**
 * Главная страница сайта.
 *
 * Загружает данные через Payload Local API (без HTTP-запросов, in-process).
 * Секции: Hero, Преимущества, Услуги, Акции, Отзывы, Портфолио, Контакты.
 * Требования: 3.1, 3.2, 3.3, 3.4, 3.5, 9.4, 14.1
 */
export default async function HomePage() {
  // Загружаем данные из CMS параллельно
  const [
    siteSettings,
    servicesResult,
    promotionsResult,
    reviewsResult,
    portfolioResult,
  ] = await Promise.allSettled([
    fetchSiteSettings(),
    fetchServices(),
    fetchPromotions(),
    fetchReviews(),
    fetchPortfolio(),
  ])

  const settings =
    siteSettings.status === 'fulfilled' ? siteSettings.value : null
  const services =
    servicesResult.status === 'fulfilled' ? servicesResult.value : []
  const promotions =
    promotionsResult.status === 'fulfilled' ? promotionsResult.value : []
  const reviews =
    reviewsResult.status === 'fulfilled' ? reviewsResult.value : []
  const portfolioItems =
    portfolioResult.status === 'fulfilled' ? portfolioResult.value : []

  // Данные для Hero из SiteSettings (с fallback на Brand_Config)
  const heroTitle = settings?.companyName ?? BRAND_CONFIG.companyName
  const heroSubtitle = settings?.tagline ?? BRAND_CONFIG.tagline

  // Фоновое изображение логотипа/баннера из SiteSettings (если есть)
  const heroImageUrl =
    settings?.logo &&
    typeof settings.logo === 'object' &&
    'url' in settings.logo &&
    typeof settings.logo.url === 'string'
      ? settings.logo.url
      : null

  // Данные контактов из SiteSettings (с fallback на Brand_Config)
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
      {/* Секция Hero */}
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImageUrl={heroImageUrl}
      />

      {/* Секция «Преимущества» */}
      <AdvantagesSection />

      {/* Секция «Услуги» (не более 6 карточек) */}
      <ServicesPreview services={services} />

      {/* Секция «Акции» (скрывается, если нет активных акций) */}
      <PromotionsSection promotions={promotions} />

      {/* Секция «Отзывы» (3–5 последних) */}
      <ReviewsPreview reviews={reviews} />

      {/* Секция «Портфолио» (не более 6 карточек) */}
      <PortfolioPreview items={portfolioItems} />

      {/* Секция «Контакты» */}
      <ContactsSection data={contactsData} />
    </>
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
    })

    return result.docs.map((service) => ({
      id: String(service.id),
      title: service.title,
      shortDescription: service.shortDescription,
      priceFrom:
        typeof service.priceFrom === 'number' ? service.priceFrom : null,
      slug: service.slug,
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
