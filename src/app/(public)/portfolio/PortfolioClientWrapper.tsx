'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortfolioFilter, type PortfolioService } from '@/components/features/portfolio/PortfolioFilter'
import { PortfolioGrid, type PortfolioGridItem } from '@/components/features/portfolio/PortfolioGrid'

interface PortfolioClientWrapperProps {
  items: PortfolioGridItem[]
  services: PortfolioService[]
}

/**
 * PortfolioClientWrapper — клиентский компонент, объединяющий фильтр и сетку.
 *
 * Читает URL search param `?service=id` и фильтрует элементы портфолио
 * без перезагрузки страницы.
 *
 * Требования: 8.1, 8.2, 8.5
 */
export function PortfolioClientWrapper({ items, services }: PortfolioClientWrapperProps) {
  const searchParams = useSearchParams()
  const selectedService = searchParams.get('service') ?? ''

  const filteredItems = useMemo(() => {
    if (!selectedService) return items
    return items.filter((item) => item.serviceId === selectedService)
  }, [items, selectedService])

  return (
    <div className="space-y-8">
      {/* Фильтр по услуге */}
      <PortfolioFilter services={services} />

      {/* Сетка карточек с пагинацией */}
      <PortfolioGrid items={filteredItems} />
    </div>
  )
}
