'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { filterByCategory } from '@/lib/utils'

/** Категория услуги для кнопок фильтра */
export interface ServiceCategory {
  id: string
  name: string
  slug: string
}

/** Карточка услуги для страницы /services */
export interface ServiceItem {
  id: string
  title: string
  shortDescription: string
  priceFrom: number | null
  slug: string
  /** ID категории (для фильтрации) */
  categoryId: string
  /** URL первого фото (или null) */
  photoUrl: string | null
  /** Alt-текст фото */
  photoAlt: string
}

interface ServicesClientProps {
  services: ServiceItem[]
  categories: ServiceCategory[]
}

/**
 * ServicesClient — клиентский компонент страницы /services.
 *
 * Реализует фильтрацию по категории через URL search params без перезагрузки страницы.
 * Требования: 4.1, 4.2
 */
export function ServicesClient({ services, categories }: ServicesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''

  /** Обновляет URL search param ?category= без перезагрузки страницы */
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (categoryId) {
        params.set('category', categoryId)
      } else {
        params.delete('category')
      }
      router.replace(`/services?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  // Фильтруем услуги по выбранной категории (Req 4.2)
  const filteredServices = selectedCategory
    ? filterByCategory(services, selectedCategory)
    : services

  return (
    <div>
      {/* ── Кнопки фильтра по категориям ── */}
      {categories.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Фильтр по категориям услуг"
        >
          {/* Кнопка «Все» */}
          <button
            type="button"
            onClick={() => handleCategorySelect('')}
            aria-pressed={selectedCategory === ''}
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selectedCategory === ''
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/60 hover:bg-accent',
            ].join(' ')}
          >
            Все
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={[
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/60 hover:bg-accent',
              ].join(' ')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Сетка карточек услуг ── */}
      {filteredServices.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          Услуги в этой категории не найдены.
        </p>
      ) : (
        <ul
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Список услуг"
        >
          {filteredServices.map((service) => (
            <li key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className={[
                  'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
                  'transition-all hover:border-primary/40 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                ].join(' ')}
                aria-label={`${service.title}${service.priceFrom ? `, от ${service.priceFrom.toLocaleString('ru-RU')} ₽` : ''}`}
              >
                {/* Фото услуги (Next.js Image) */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {service.photoUrl ? (
                    <Image
                      src={service.photoUrl}
                      alt={service.photoAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    /* Заглушка, если фото нет */
                    <div
                      className="flex h-full w-full items-center justify-center"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-12 w-12 text-muted-foreground/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Текстовая часть карточки */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Название */}
                  <h2 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                    {service.title}
                  </h2>

                  {/* Краткое описание */}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {service.shortDescription}
                  </p>

                  {/* Цена + стрелка */}
                  <div className="mt-4 flex items-center justify-between">
                    {service.priceFrom !== null ? (
                      <span className="text-sm font-semibold text-primary">
                        от {service.priceFrom.toLocaleString('ru-RU')} ₽
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Цена по запросу
                      </span>
                    )}
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
