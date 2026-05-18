import {
  Shield,
  Clock,
  Wrench,
  Star,
  ThumbsUp,
  Zap,
  Award,
  HeartHandshake,
} from 'lucide-react'

/** Одна карточка преимущества */
export interface AdvantageItem {
  /** Уникальный идентификатор (для key) */
  id: string
  /** Название иконки из набора lucide-react */
  icon: keyof typeof ICON_MAP
  /** Заголовок преимущества */
  title: string
  /** Описание преимущества */
  description: string
}

/** Карта доступных иконок */
const ICON_MAP = {
  Shield,
  Clock,
  Wrench,
  Star,
  ThumbsUp,
  Zap,
  Award,
  HeartHandshake,
} as const

/** Преимущества по умолчанию (используются, если данные из CMS не переданы) */
const DEFAULT_ADVANTAGES: AdvantageItem[] = [
  {
    id: 'warranty',
    icon: 'Shield',
    title: 'Гарантия на ремонт',
    description: 'Предоставляем гарантию на все виды работ и запасные части.',
  },
  {
    id: 'speed',
    icon: 'Clock',
    title: 'Быстрые сроки',
    description: 'Большинство ремонтов выполняем в день обращения.',
  },
  {
    id: 'masters',
    icon: 'Wrench',
    title: 'Опытные мастера',
    description: 'Сертифицированные специалисты с многолетним опытом работы.',
  },
  {
    id: 'quality',
    icon: 'Star',
    title: 'Оригинальные запчасти',
    description: 'Используем только сертифицированные комплектующие.',
  },
]

interface AdvantagesSectionProps {
  /** Список карточек преимуществ (от 3 до 8). По умолчанию — DEFAULT_ADVANTAGES. */
  advantages?: AdvantageItem[]
  /** Заголовок секции */
  heading?: string
  /** Подзаголовок секции */
  subheading?: string
}

/**
 * AdvantagesSection — секция «Наши преимущества» на главной странице.
 *
 * Отображает от 3 до 8 карточек с иконкой, заголовком и описанием.
 * Требования: 3.1, 3.4
 */
export function AdvantagesSection({
  advantages = DEFAULT_ADVANTAGES,
  heading = 'Почему выбирают нас',
  subheading = 'Мы делаем всё, чтобы ремонт был быстрым, качественным и без лишних хлопот.',
}: AdvantagesSectionProps) {
  // Ограничиваем количество карточек: от 3 до 8 (Req 3.4)
  const items = advantages.slice(0, 8)

  if (items.length < 3) {
    // Если данных меньше 3 — дополняем дефолтными
    const defaults = DEFAULT_ADVANTAGES.filter(
      (d) => !items.some((i) => i.id === d.id),
    )
    items.push(...defaults.slice(0, 3 - items.length))
  }

  return (
    <section
      className="bg-muted/40 py-16 sm:py-20"
      aria-labelledby="advantages-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="advantages-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          )}
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Преимущества сервисного центра"
        >
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] ?? Wrench

            return (
              <li
                key={item.id}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Иконка */}
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Заголовок карточки */}
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>

                {/* Описание */}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
