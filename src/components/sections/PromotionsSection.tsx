'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Tag, Clock } from 'lucide-react'
import { isPromotionActive } from '@/lib/utils'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface PromotionItem {
  id: string
  title: string
  /** Описание акции (plain text) */
  description?: string | null
  /** URL изображения акции */
  imageUrl?: string | null
  /** Alt-текст изображения */
  imageAlt?: string | null
  startsAt: Date
  endsAt: Date
}

interface PromotionsSectionProps {
  promotions?: PromotionItem[]
  heading?: string
}

// ─── Заглушки ─────────────────────────────────────────────────────────────────

const now = new Date()
const PLACEHOLDER_PROMOTIONS: PromotionItem[] = [
  {
    id: 'placeholder-1',
    title: 'Скидка 20% на замену экрана',
    description: 'Замените экран смартфона со скидкой 20%. Только оригинальные запчасти.',
    imageUrl: null,
    imageAlt: null,
    startsAt: new Date(now.getFullYear(), now.getMonth(), 1),
    endsAt: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  },
  {
    id: 'placeholder-2',
    title: 'Бесплатная диагностика',
    description: 'Диагностика любого устройства бесплатно при последующем ремонте.',
    imageUrl: null,
    imageAlt: null,
    startsAt: new Date(now.getFullYear(), now.getMonth(), 1),
    endsAt: new Date(now.getFullYear(), now.getMonth() + 2, 0),
  },
]

// ─── Таймер обратного отсчёта ─────────────────────────────────────────────────

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(endsAt: Date): TimeLeft {
  const diff = Math.max(0, endsAt.getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(endsAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      className="mt-4 flex items-center gap-1.5 text-sm"
      aria-label={`До конца акции: ${timeLeft.days} дней ${pad(timeLeft.hours)} часов ${pad(timeLeft.minutes)} минут`}
    >
      <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-muted-foreground">До конца:</span>
      <span className="font-mono font-semibold text-foreground">
        {timeLeft.days > 0 && <>{timeLeft.days}д </>}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  )
}

// ─── Карточка акции ───────────────────────────────────────────────────────────

function PromotionCard({ promotion }: { promotion: PromotionItem }) {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      aria-label={`Акция: ${promotion.title}`}
    >
      {/* Изображение */}
      {promotion.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={promotion.imageUrl}
            alt={promotion.imageAlt ?? promotion.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Контент */}
      <div className="flex flex-1 flex-col p-5">
        {/* Бейдж */}
        <div className="mb-3 flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Акция
          </span>
        </div>

        {/* Заголовок */}
        <h3 className="text-lg font-bold text-foreground">{promotion.title}</h3>

        {/* Описание */}
        {promotion.description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {promotion.description}
          </p>
        )}

        {/* Таймер */}
        <CountdownTimer endsAt={promotion.endsAt} />
      </div>
    </article>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

/**
 * PromotionsSection — секция «Акции» на главной странице.
 *
 * Отображает только активные акции (isPromotionActive из utils.ts).
 * Каждая карточка содержит таймер обратного отсчёта до конца акции.
 *
 * Требования: 3.1, 14.1, 14.5
 */
export function PromotionsSection({
  promotions,
  heading = 'Акции и спецпредложения',
}: PromotionsSectionProps) {
  const now = new Date()
  const source = promotions ?? PLACEHOLDER_PROMOTIONS

  // Фильтруем только активные акции (Req 14.3, 14.4)
  const activePromotions = source.filter((p) =>
    isPromotionActive({ startsAt: p.startsAt, endsAt: p.endsAt }, now),
  )

  // Если нет активных акций — секцию не отображаем
  if (activePromotions.length === 0) return null

  return (
    <section
      className="bg-muted/30 py-16 sm:py-20"
      aria-labelledby="promotions-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="promotions-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {heading}
          </h2>
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Список акций"
        >
          {activePromotions.map((promotion) => (
            <li key={promotion.id}>
              <PromotionCard promotion={promotion} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
