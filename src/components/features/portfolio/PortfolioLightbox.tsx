'use client'

import { useEffect, useRef, useCallback, useId, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface LightboxPhoto {
  url: string
  alt: string
}

export interface LightboxItem {
  id: string
  title: string
  description?: string | null
  beforePhotos: LightboxPhoto[]
  afterPhotos: LightboxPhoto[]
  completedAt?: Date | null
  serviceName?: string | null
}

interface PortfolioLightboxProps {
  item: LightboxItem | null
  onClose: () => void
}

// ─── Вспомогательные функции ─────────────────────────────────────────────────

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
}

// ─── Компонент ───────────────────────────────────────────────────────────────

/**
 * PortfolioLightbox — модальный лайтбокс для просмотра работ портфолио.
 *
 * Отображает фото «до» и «после», описание и дату выполнения.
 *
 * Доступность (Req 22.4):
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Фокус-ловушка: Tab/Shift+Tab циклически обходят элементы внутри диалога
 *   - Закрытие по Escape и по клику на оверлей
 *   - При открытии фокус перемещается на кнопку закрытия
 *   - При закрытии фокус возвращается на элемент, который открыл лайтбокс
 *
 * Требования: 8.3, 22.4
 */
export function PortfolioLightbox({ item, onClose }: PortfolioLightboxProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Активная вкладка: «до» или «после»
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after')
  // Индекс текущего фото в активной вкладке
  const [photoIndex, setPhotoIndex] = useState(0)

  const isOpen = item !== null

  // Сохраняем элемент, который открыл лайтбокс
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Сбрасываем состояние при открытии нового элемента
      setActiveTab('after')
      setPhotoIndex(0)
    }
  }, [isOpen, item?.id])

  // Перемещаем фокус внутрь диалога при открытии; возвращаем при закрытии
  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus()
      return
    }

    const dialog = dialogRef.current
    if (!dialog) return

    const timer = setTimeout(() => {
      const focusable = getFocusableElements(dialog)
      focusable[0]?.focus()
    }, 50)

    return () => clearTimeout(timer)
  }, [isOpen])

  // Блокируем скролл body при открытом лайтбоксе
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Закрытие по Escape + фокус-ловушка
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Навигация по фото стрелками
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
        return
      }

      if (e.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = getFocusableElements(dialog)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose, item, activeTab, photoIndex],
  )

  if (!item) return null

  const photos = activeTab === 'after' ? item.afterPhotos : item.beforePhotos
  const currentPhoto = photos[photoIndex] ?? null
  const hasMultiple = photos.length > 1

  const handlePrev = () => {
    setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1))
  }

  const handleNext = () => {
    setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0))
  }

  const handleTabChange = (tab: 'before' | 'after') => {
    setActiveTab(tab)
    setPhotoIndex(0)
  }

  const formattedDate = item.completedAt
    ? item.completedAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const hasBeforePhotos = item.beforePhotos.length > 0
  const hasAfterPhotos = item.afterPhotos.length > 0

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Диалог */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2',
          'max-h-[90dvh] overflow-y-auto rounded-2xl bg-background shadow-2xl',
          'focus:outline-none',
        )}
      >
        {/* ── Шапка ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background px-6 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-lg font-semibold text-foreground"
            >
              {item.title}
            </h2>
            {item.serviceName && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.serviceName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
              'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            aria-label="Закрыть лайтбокс"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Тело ──────────────────────────────────────────────────── */}
        <div className="p-6">
          {/* Вкладки «До» / «После» */}
          {(hasBeforePhotos || hasAfterPhotos) && (
            <div
              role="tablist"
              aria-label="Фото до и после ремонта"
              className="mb-4 flex gap-2"
            >
              {hasAfterPhotos && (
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'after'}
                  aria-controls="lightbox-photo-panel"
                  onClick={() => handleTabChange('after')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    activeTab === 'after'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  После
                </button>
              )}
              {hasBeforePhotos && (
                <button
                  role="tab"
                  type="button"
                  aria-selected={activeTab === 'before'}
                  aria-controls="lightbox-photo-panel"
                  onClick={() => handleTabChange('before')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    activeTab === 'before'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  До
                </button>
              )}
            </div>
          )}

          {/* Область фото */}
          <div
            id="lightbox-photo-panel"
            role="tabpanel"
            aria-label={activeTab === 'after' ? 'Фото после ремонта' : 'Фото до ремонта'}
            className="relative"
          >
            {currentPhoto ? (
              <div className="relative">
                {/* Фото */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={currentPhoto.url}
                    alt={currentPhoto.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority
                  />
                </div>

                {/* Кнопки навигации (если несколько фото) */}
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Предыдущее фото"
                      className={cn(
                        'absolute left-2 top-1/2 -translate-y-1/2',
                        'inline-flex h-9 w-9 items-center justify-center rounded-full',
                        'bg-background/80 text-foreground shadow-md backdrop-blur-sm',
                        'transition-colors hover:bg-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Следующее фото"
                      className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2',
                        'inline-flex h-9 w-9 items-center justify-center rounded-full',
                        'bg-background/80 text-foreground shadow-md backdrop-blur-sm',
                        'transition-colors hover:bg-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Счётчик фото */}
                    <div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur-sm"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {photoIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Заглушка, если фото нет */
              <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground">Фото недоступно</p>
              </div>
            )}
          </div>

          {/* Описание и дата */}
          {(item.description || formattedDate) && (
            <div className="mt-5 space-y-3">
              {item.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              {formattedDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Выполнено:</span>
                  <time
                    dateTime={item.completedAt!.toISOString()}
                    className="font-medium text-foreground"
                  >
                    {formattedDate}
                  </time>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
