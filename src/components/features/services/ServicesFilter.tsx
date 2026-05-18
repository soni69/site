'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ServiceCategory {
  id: string
  name: string
  slug: string
}

interface ServicesFilterProps {
  categories: ServiceCategory[]
}

/**
 * ServicesFilter — клиентский компонент фильтрации услуг по категории.
 *
 * Обновляет URL search param `?category=slug` без перезагрузки страницы.
 * Требования: 4.2
 */
export function ServicesFilter({ categories }: ServicesFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''

  const handleSelect = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (slug) {
        params.set('category', slug)
      } else {
        params.delete('category')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  if (categories.length === 0) return null

  return (
    <nav aria-label="Фильтр по категориям услуг">
      <ul
        className="flex flex-wrap gap-2"
        role="list"
      >
        {/* Кнопка «Все» */}
        <li>
          <button
            type="button"
            onClick={() => handleSelect('')}
            aria-pressed={activeCategory === ''}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeCategory === ''
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
            )}
          >
            Все
          </button>
        </li>

        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => handleSelect(cat.slug)}
              aria-pressed={activeCategory === cat.slug}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeCategory === cat.slug
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
              )}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
