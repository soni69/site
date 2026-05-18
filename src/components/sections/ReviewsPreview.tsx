import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface ReviewPreviewItem {
  id: string
  clientName: string
  /** Рейтинг от 1 до 5 */
  rating: number
  text: string
  /** URL фото клиента */
  photoUrl?: string | null
  /** Alt-текст фото */
  photoAlt?: string | null
  reviewDate: Date
}

interface ReviewsPreviewProps {
  reviews?: ReviewPreviewItem[]
  heading?: string
  subheading?: string
}

// ─── Заглушки ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_REVIEWS: ReviewPreviewItem[] = [
  {
    id: 'placeholder-1',
    clientName: 'Александр М.',
    rating: 5,
    text: 'Отличный сервис! Починили телефон за 2 часа, всё работает как новое. Мастера вежливые и профессиональные.',
    photoUrl: null,
    reviewDate: new Date('2024-11-15'),
  },
  {
    id: 'placeholder-2',
    clientName: 'Елена К.',
    rating: 5,
    text: 'Обратилась с ноутбуком — не включался. Диагностика бесплатная, ремонт сделали быстро и качественно. Рекомендую!',
    photoUrl: null,
    reviewDate: new Date('2024-11-20'),
  },
  {
    id: 'placeholder-3',
    clientName: 'Дмитрий В.',
    rating: 4,
    text: 'Заменили экран на планшете. Цена адекватная, работа аккуратная. Дали гарантию 3 месяца.',
    photoUrl: null,
    reviewDate: new Date('2024-12-01'),
  },
]

// ─── Звёздный рейтинг ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const clampedRating = Math.min(5, Math.max(1, Math.round(rating)))

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Рейтинг: ${clampedRating} из 5 звёзд`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < clampedRating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted-foreground/30'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// ─── Карточка отзыва ──────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewPreviewItem }) {
  const formattedDate = review.reviewDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article
      className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
      aria-label={`Отзыв от ${review.clientName}`}
    >
      {/* Рейтинг */}
      <StarRating rating={review.rating} />

      {/* Текст отзыва */}
      <blockquote className="mt-3 flex-1">
        <p className="text-sm leading-relaxed text-foreground line-clamp-4">
          &ldquo;{review.text}&rdquo;
        </p>
      </blockquote>

      {/* Автор */}
      <footer className="mt-4 flex items-center gap-3">
        {/* Аватар */}
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10"
          aria-hidden="true"
        >
          {review.photoUrl ? (
            <Image
              src={review.photoUrl}
              alt={review.photoAlt ?? review.clientName}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
              {review.clientName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Имя и дата */}
        <div>
          <p className="text-sm font-semibold text-foreground">{review.clientName}</p>
          <time
            dateTime={review.reviewDate.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formattedDate}
          </time>
        </div>
      </footer>
    </article>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

/**
 * ReviewsPreview — секция «Отзывы» на главной странице.
 *
 * Отображает 3–5 последних отзывов со звёздным рейтингом.
 * Ссылка «Все отзывы» ведёт на /reviews.
 *
 * Требования: 3.1, 9.4
 */
export function ReviewsPreview({
  reviews,
  heading = 'Отзывы клиентов',
  subheading = 'Нам доверяют сотни клиентов. Вот что они говорят о нашей работе.',
}: ReviewsPreviewProps) {
  // Показываем от 3 до 5 отзывов (Req 9.4)
  const items = (reviews ?? PLACEHOLDER_REVIEWS).slice(0, 5)

  return (
    <section
      className="py-16 sm:py-20"
      aria-labelledby="reviews-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2
              id="reviews-preview-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 text-lg text-muted-foreground">{subheading}</p>
            )}
          </div>

          {/* Ссылка «Все отзывы» (десктоп) */}
          <Link
            href="/reviews"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm sm:flex"
            aria-label="Перейти ко всем отзывам"
          >
            Все отзывы
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Отзывы клиентов"
        >
          {items.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>

        {/* Ссылка «Все отзывы» (мобильный) */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Все отзывы
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
