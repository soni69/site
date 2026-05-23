import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { calculateAverageRating } from '@/lib/utils'
import { ReviewsList } from '@/components/features/reviews/ReviewsList'
import type { ReviewItem } from '@/components/features/reviews/ReviewsList'
import { StarRating } from '@/components/features/reviews/StarRating'

/**
 * ISR: страница обновляется не чаще одного раза в 5 минут.
 * Требования: 9.1, 9.2, 9.5, 16.3, 16.4
 */
export const revalidate = 300

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Отзывы клиентов — ${BRAND_CONFIG.companyName}`,
  description:
    'Читайте отзывы реальных клиентов о качестве ремонта техники. Рейтинг и мнения о нашем сервисном центре.',
  alternates: {
    canonical: `${SITE_URL}/reviews`,
  },
  openGraph: {
    title: `Отзывы клиентов — ${BRAND_CONFIG.companyName}`,
    description:
      'Отзывы реальных клиентов о качестве ремонта техники в нашем сервисном центре.',
    type: 'website',
    url: `${SITE_URL}/reviews`,
  },
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchReviews(): Promise<ReviewItem[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'reviews',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 200,
      sort: '-reviewDate',
      depth: 1,
    })

    return result.docs.map((doc): ReviewItem => {
      const photoUrl =
        doc.photo &&
        typeof doc.photo === 'object' &&
        'url' in doc.photo &&
        typeof doc.photo.url === 'string'
          ? doc.photo.url
          : null

      const photoAlt =
        doc.photo &&
        typeof doc.photo === 'object' &&
        'alt' in doc.photo &&
        typeof doc.photo.alt === 'string'
          ? doc.photo.alt
          : null

      return {
        id: String(doc.id),
        clientName: doc.clientName,
        rating: doc.rating,
        text: doc.text,
        photoUrl,
        photoAlt,
        reviewDate:
          typeof doc.reviewDate === 'string'
            ? doc.reviewDate
            : new Date(doc.reviewDate as string | number | Date).toISOString(),
      }
    })
  } catch {
    return []
  }
}

// ─── Страница ─────────────────────────────────────────────────────────────────

/**
 * Страница /reviews — список отзывов клиентов с сортировкой.
 *
 * Отображает средний рейтинг в заголовке, вычисленный через calculateAverageRating.
 * Требования: 9.1, 9.2, 9.5
 */
export default async function ReviewsPage() {
  const reviews = await fetchReviews()

  const ratings = reviews.map((r) => r.rating)
  const averageRating = calculateAverageRating(ratings)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* ── Заголовок страницы ─────────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Отзывы клиентов
        </h1>

        {/* Средний рейтинг — Req 9.2 */}
        {reviews.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StarRating rating={Math.round(averageRating)} size="h-6 w-6" />
            <span className="text-2xl font-bold text-foreground">
              {averageRating.toFixed(2)}
            </span>
            <span className="text-muted-foreground">
              из 5 — на основе {reviews.length}{' '}
              {reviews.length === 1
                ? 'отзыва'
                : reviews.length >= 2 && reviews.length <= 4
                  ? 'отзывов'
                  : 'отзывов'}
            </span>
          </div>
        )}

        <p className="mt-3 text-lg text-muted-foreground">
          Нам доверяют сотни клиентов. Вот что они говорят о нашей работе.
        </p>
      </div>

      {/* ── Список отзывов с сортировкой — Req 9.1, 9.5 ──────────────── */}
      <ReviewsList reviews={reviews} />
    </div>
  )
}
