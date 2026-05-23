'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortfolioLightbox, type LightboxItem, type LightboxPhoto } from './PortfolioLightbox'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface PortfolioGridItem {
  id: string
  title: string
  description?: string | null
  /** URL превью-фото (первое фото «после» или «до») */
  thumbnailUrl?: string | null
  thumbnailAlt?: string | null
  serviceName?: string | null
  serviceId?: string | null
  completedAt?: Date | null
  beforePhotos: LightboxPhoto[]
  afterPhotos: LightboxPhoto[]
}

interface PortfolioGridProps {
  /** Все элементы портфолио (уже отфильтрованные) */
  items: PortfolioGridItem[]
}

// ─── Константы ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// ─── Карточка портфолио ───────────────────────────────────────────────────────

interface PortfolioCardProps {
  item: PortfolioGridItem
  onClick: (item: PortfolioGridItem) => void
}

function PortfolioCard({ item, onClick }: PortfolioCardProps) {
  const formattedDate = item.completedAt
    ? item.completedAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article
      className={cn(
        'group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        'transition-all hover:border-primary/40 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      tabIndex={0}
      role="button"
      aria-label={`Открыть работу: ${item.title}`}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(item)
        }
      }}
    >
      {/* Фото */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.thumbnailAlt ?? item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-hidden="true"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Бейдж услуги */}
        {item.serviceName && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {item.serviceName}
            </span>
          </div>
        )}

        {/* Индикатор наличия фото до/после */}
        {(item.beforePhotos.length > 0 || item.afterPhotos.length > 0) && (
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              До / После
            </span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {formattedDate && (
          <time
            dateTime={item.completedAt!.toISOString()}
            className="mt-2 block text-xs text-muted-foreground"
          >
            {formattedDate}
          </time>
        )}
      </div>
    </article>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

/**
 * PortfolioGrid — сетка карточек портфолио с пагинацией «Загрузить ещё».
 *
 * Отображает не более 12 карточек на странице (PAGE_SIZE).
 * При нажатии на карточку открывает PortfolioLightbox.
 *
 * Требования: 8.1, 8.3, 8.5
 */
export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null)

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [])

  const handleOpenLightbox = useCallback((item: PortfolioGridItem) => {
    setLightboxItem({
      id: item.id,
      title: item.title,
      description: item.description,
      beforePhotos: item.beforePhotos,
      afterPhotos: item.afterPhotos,
      completedAt: item.completedAt,
      serviceName: item.serviceName,
    })
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxItem(null)
  }, [])

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-muted-foreground">
          Работы в этой категории пока не добавлены.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Сетка карточек */}
      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Галерея выполненных работ"
      >
        {visibleItems.map((item) => (
          <li key={item.id}>
            <PortfolioCard item={item} onClick={handleOpenLightbox} />
          </li>
        ))}
      </ul>

      {/* Кнопка «Загрузить ещё» */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3',
              'text-sm font-medium text-foreground shadow-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            aria-label={`Загрузить ещё работы (показано ${visibleCount} из ${items.length})`}
          >
            Загрузить ещё
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ({items.length - visibleCount} осталось)
            </span>
          </button>
        </div>
      )}

      {/* Лайтбокс */}
      <PortfolioLightbox item={lightboxItem} onClose={handleCloseLightbox} />
    </>
  )
}
