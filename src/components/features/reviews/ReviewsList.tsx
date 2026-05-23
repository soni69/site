'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { StarRating } from './StarRating'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string
  clientName: string
  /** Рейтинг от 1 до 5 */
  rating: number
  text: string
  /** URL фото клиента */
  photoUrl?: string | null
  /** Alt-текст фото */
  photoAlt?: string | null
  reviewDate: string // ISO-строка для сериализации через Server → Client
}

type SortKey = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc'

interface ReviewsListProps {
  reviews: ReviewItem[]
}

// ─── Карточка отзыва ──────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  const date = new Date(review.reviewDate)
  const formattedDate = date.toLocaleDateString('ru-RU', {
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
        <p className="text-sm leading-relaxed text-foreground">
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
            dateTime={date.toISOString()}
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

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Сначала новые' },
  { value: 'date-asc', label: 'Сначала старые' },
  { value: 'rating-desc', label: 'Высокий рейтинг' },
  { value: 'rating-asc', label: 'Низкий рейтинг' },
]

/**
 * ReviewsList — список отзывов с сортировкой по рейтингу/дате.
 *
 * Клиентский компонент: сортировка происходит без перезагрузки страницы.
 * Требования: 9.1, 9.5
 */
export function ReviewsList({ reviews }: ReviewsListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      switch (sortKey) {
        case 'date-desc':
          return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
        case 'date-asc':
          return new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        case 'rating-desc':
          return b.rating - a.rating
        case 'rating-asc':
          return a.rating - b.rating
        default:
          return 0
      }
    })
  }, [reviews, sortKey])

  return (
    <div>
      {/* Панель сортировки */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Сортировать:
        </span>
        <div
          role="group"
          aria-label="Сортировка отзывов"
          className="flex flex-wrap gap-2"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortKey(option.value)}
              aria-pressed={sortKey === option.value}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                sortKey === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список отзывов */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">Отзывы пока не добавлены.</p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Список отзывов"
          aria-live="polite"
          aria-atomic="false"
        >
          {sorted.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
