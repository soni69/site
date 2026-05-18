'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface PortfolioService {
  id: string
  title: string
}

interface PortfolioFilterProps {
  services: PortfolioService[]
}

// ─── Компонент ───────────────────────────────────────────────────────────────

/**
 * PortfolioFilter — клиентский компонент фильтрации портфолио по услуге.
 *
 * Обновляет URL search param `?service=id` без перезагрузки страницы.
 * Требования: 8.2
 */
export function PortfolioFilter({ services }: PortfolioFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeService = searchParams.get('service') ?? ''

  const handleSelect = useCallback(
    (serviceId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (serviceId) {
        params.set('service', serviceId)
      } else {
        params.delete('service')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  if (services.length === 0) return null

  return (
    <nav aria-label="Фильтр портфолио по услуге">
      <ul className="flex flex-wrap gap-2" role="list">
        {/* Кнопка «Все» */}
        <li>
          <button
            type="button"
            onClick={() => handleSelect('')}
            aria-pressed={activeService === ''}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              activeService === ''
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
            )}
          >
            Все работы
          </button>
        </li>

        {services.map((service) => (
          <li key={service.id}>
            <button
              type="button"
              onClick={() => handleSelect(service.id)}
              aria-pressed={activeService === service.id}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeService === service.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
              )}
            >
              {service.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
