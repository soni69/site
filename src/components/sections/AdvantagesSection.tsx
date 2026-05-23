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
      className="relative overflow-hidden py-20 sm:py-24"
      aria-labelledby="advantages-heading"
    >
      {/* Тонкие декоративные пятна */}
      <div
        className="glow-blob h-[360px] w-[360px] -left-32 top-20 bg-[hsl(var(--primary)/0.18)]"
        aria-hidden="true"
      />
      <div
        className="glow-blob h-[300px] w-[300px] right-[-80px] bottom-10 bg-[hsl(280_85%_65%/0.18)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-md">
            Почему мы
          </span>
          <h2
            id="advantages-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          )}
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Преимущества сервисного центра"
        >
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] ?? Wrench

            return (
              <li
                key={item.id}
                className="glass group relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40"
                style={{ willChange: 'transform' }}
              >
                {/* Иконка с glow */}
                <div className="relative mb-5">
                  <div
                    className="absolute inset-0 -z-10 rounded-xl bg-primary/30 blur-xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 text-primary"
                    aria-hidden="true"
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
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
