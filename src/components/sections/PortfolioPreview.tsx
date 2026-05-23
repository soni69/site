import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ImageIcon } from 'lucide-react'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface PortfolioPreviewItem {
  id: string
  title: string
  description?: string | null
  /** URL первого фото «после» (или «до», если «после» нет) */
  thumbnailUrl?: string | null
  /** Alt-текст для фото */
  thumbnailAlt?: string | null
  /** Название связанной услуги */
  serviceName?: string | null
  completedAt?: Date | null
}

interface PortfolioPreviewProps {
  items?: PortfolioPreviewItem[]
  heading?: string
  subheading?: string
}

// ─── Заглушки ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_ITEMS: PortfolioPreviewItem[] = [
  {
    id: 'placeholder-1',
    title: 'Замена экрана iPhone 14',
    description: 'Полная замена дисплейного модуля с сохранением Face ID.',
    thumbnailUrl: null,
    serviceName: 'Ремонт смартфонов',
    completedAt: new Date('2024-11-10'),
  },
  {
    id: 'placeholder-2',
    title: 'Чистка ноутбука Lenovo',
    description: 'Чистка от пыли, замена термопасты, устранение перегрева.',
    thumbnailUrl: null,
    serviceName: 'Ремонт ноутбуков',
    completedAt: new Date('2024-11-18'),
  },
  {
    id: 'placeholder-3',
    title: 'Замена аккумулятора Samsung',
    description: 'Замена оригинального аккумулятора, восстановление ёмкости.',
    thumbnailUrl: null,
    serviceName: 'Ремонт смартфонов',
    completedAt: new Date('2024-11-25'),
  },
  {
    id: 'placeholder-4',
    title: 'Ремонт разъёма зарядки',
    description: 'Замена разъёма USB-C на планшете Xiaomi Pad.',
    thumbnailUrl: null,
    serviceName: 'Ремонт планшетов',
    completedAt: new Date('2024-12-02'),
  },
  {
    id: 'placeholder-5',
    title: 'Восстановление после воды',
    description: 'Ультразвуковая чистка платы, замена повреждённых компонентов.',
    thumbnailUrl: null,
    serviceName: 'Ремонт смартфонов',
    completedAt: new Date('2024-12-05'),
  },
  {
    id: 'placeholder-6',
    title: 'Замена матрицы ноутбука',
    description: 'Замена матрицы 15.6" Full HD на Asus VivoBook.',
    thumbnailUrl: null,
    serviceName: 'Ремонт ноутбуков',
    completedAt: new Date('2024-12-08'),
  },
]

// ─── Карточка портфолио ───────────────────────────────────────────────────────

function PortfolioCard({ item }: { item: PortfolioPreviewItem }) {
  const formattedDate = item.completedAt
    ? item.completedAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
      aria-label={item.title}
    >
      {/* Фото */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.thumbnailAlt ?? item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
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
 * PortfolioPreview — секция «Портфолио» на главной странице.
 *
 * Отображает сетку карточек с фото выполненных работ (не более 6).
 * Ссылка «Все работы» ведёт на /portfolio.
 *
 * Требования: 3.1, 8.1
 */
export function PortfolioPreview({
  items,
  heading = 'Наши работы',
  subheading = 'Примеры выполненных ремонтов — убедитесь в качестве нашей работы.',
}: PortfolioPreviewProps) {
  // Не более 6 карточек на главной
  const displayItems = (items ?? PLACEHOLDER_ITEMS).slice(0, 6)

  return (
    <section
      className="bg-muted/40 py-16 sm:py-20"
      aria-labelledby="portfolio-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2
              id="portfolio-preview-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 text-lg text-muted-foreground">{subheading}</p>
            )}
          </div>

          {/* Ссылка «Все работы» (десктоп) */}
          <Link
            href="/portfolio"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm sm:flex"
            aria-label="Перейти ко всем работам портфолио"
          >
            Все работы
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Портфолио выполненных работ"
        >
          {displayItems.map((item) => (
            <li key={item.id}>
              <PortfolioCard item={item} />
            </li>
          ))}
        </ul>

        {/* Ссылка «Все работы» (мобильный) */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Все работы
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
