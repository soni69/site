import { Star } from 'lucide-react'

interface StarRatingProps {
  /** Рейтинг от 1 до 5 */
  rating: number
  /** Размер иконок (Tailwind-класс, например 'h-4 w-4') */
  size?: string
}

/**
 * StarRating — компонент звёздного рейтинга.
 *
 * Отображает от 1 до 5 звёзд с ARIA-разметкой для доступности.
 * Требования: 9.1, 9.2
 */
export function StarRating({ rating, size = 'h-4 w-4' }: StarRatingProps) {
  const clampedRating = Math.min(5, Math.max(1, Math.round(rating)))

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Рейтинг: ${clampedRating} из 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
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
