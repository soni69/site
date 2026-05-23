'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface MapLocation {
  label: string
  address: string
  /** Прямая ссылка на Яндекс.Карты или Google Maps */
  mapUrl?: string
  /** Широта для iframe-embed */
  lat?: number
  /** Долгота для iframe-embed */
  lng?: number
}

interface MapEmbedProps {
  locations: MapLocation[]
  /** Высота карты в пикселях (по умолчанию 400) */
  height?: number
  className?: string
}

// ─── Вспомогательные функции ─────────────────────────────────────────────────

/**
 * Строит URL для встраивания Яндекс.Карт через iframe.
 * Если координаты не заданы — возвращает null.
 */
function buildYandexEmbedUrl(lat: number, lng: number, label: string): string {
  const params = new URLSearchParams({
    ll: `${lng},${lat}`,
    z: '16',
    l: 'map',
    pt: `${lng},${lat},pm2rdm`,
    text: label,
  })
  return `https://yandex.ru/map-widget/v1/?${params.toString()}`
}

// ─── Компонент ────────────────────────────────────────────────────────────────

/**
 * MapEmbed — встраивание интерактивной карты через iframe.
 *
 * Поддерживает несколько точек присутствия. Если у локации заданы координаты
 * (lat/lng), отображается iframe с Яндекс.Картами. Если координаты не заданы,
 * но есть mapUrl — показывается ссылка на карту. Иначе — заглушка с адресом.
 *
 * Требования: 11.2, 11.5
 */
export function MapEmbed({ locations, height = 400, className }: MapEmbedProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (locations.length === 0) {
    return null
  }

  const activeLocation = locations[activeIndex]

  // Определяем URL для iframe
  const embedUrl =
    activeLocation.lat != null && activeLocation.lng != null
      ? buildYandexEmbedUrl(activeLocation.lat, activeLocation.lng, activeLocation.label)
      : null

  return (
    <div className={className}>
      {/* Переключатель точек (если несколько локаций) */}
      {locations.length > 1 && (
        <div
          className="mb-3 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Выбор точки на карте"
        >
          {locations.map((loc, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-controls="map-panel"
              onClick={() => setActiveIndex(idx)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                idx === activeIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              ].join(' ')}
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {loc.label}
            </button>
          ))}
        </div>
      )}

      {/* Карта */}
      <div
        id="map-panel"
        role="tabpanel"
        aria-label={`Карта: ${activeLocation.label}`}
        className="overflow-hidden rounded-xl border border-border bg-muted"
        style={{ height }}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            title={`Карта: ${activeLocation.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0"
            aria-label={`Интерактивная карта с адресом: ${activeLocation.address}`}
          />
        ) : (
          /* Заглушка, если координаты не заданы */
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">{activeLocation.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activeLocation.address}</p>
            </div>
            {activeLocation.mapUrl && (
              <a
                href={activeLocation.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Открыть карту для адреса: ${activeLocation.address}`}
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Открыть на карте
              </a>
            )}
          </div>
        )}
      </div>

      {/* Ссылка «Открыть в картах» под iframe */}
      {embedUrl && activeLocation.mapUrl && (
        <div className="mt-2 text-right">
          <a
            href={activeLocation.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label={`Открыть карту в новой вкладке: ${activeLocation.address}`}
          >
            Открыть в картах
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </div>
  )
}
