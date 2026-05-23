import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** Карточка услуги для превью на главной странице */
export interface ServicePreviewItem {
  /** Уникальный идентификатор */
  id: string
  /** Название услуги */
  title: string
  /** Краткое описание */
  shortDescription: string
  /** Цена «от» в рублях (null — если не задана) */
  priceFrom: number | null
  /** Slug для ссылки на /services/[slug] */
  slug: string
}

interface ServicesPreviewProps {
  /** Список услуг (не более 6 отображается). */
  services?: ServicePreviewItem[]
  /** Заголовок секции */
  heading?: string
  /** Подзаголовок секции */
  subheading?: string
}

/** Заглушки для отображения, пока данные из CMS не загружены */
const PLACEHOLDER_SERVICES: ServicePreviewItem[] = [
  {
    id: 'placeholder-1',
    title: 'Ремонт смартфонов',
    shortDescription: 'Замена экрана, аккумулятора, разъёма зарядки и другие виды ремонта.',
    priceFrom: 500,
    slug: 'remont-smartfonov',
  },
  {
    id: 'placeholder-2',
    title: 'Ремонт ноутбуков',
    shortDescription: 'Чистка от пыли, замена термопасты, ремонт материнской платы.',
    priceFrom: 800,
    slug: 'remont-noutbukov',
  },
  {
    id: 'placeholder-3',
    title: 'Ремонт планшетов',
    shortDescription: 'Замена стекла, дисплея, кнопок и других компонентов.',
    priceFrom: 600,
    slug: 'remont-planshetov',
  },
]

/**
 * ServicesPreview — секция «Наши услуги» на главной странице.
 *
 * Отображает не более 6 карточек услуг с названием, кратким описанием,
 * ценой «от» и ссылкой на /services/[slug].
 * Требования: 3.1, 3.5
 */
export function ServicesPreview({
  services,
  heading = 'Наши услуги',
  subheading = 'Профессиональный ремонт любой сложности с гарантией.',
}: ServicesPreviewProps) {
  // Не более 6 карточек (Req 3.5)
  const items = (services ?? PLACEHOLDER_SERVICES).slice(0, 6)

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      aria-labelledby="services-preview-heading"
    >
      {/* Декоративный glow */}
      <div
        className="glow-blob h-[400px] w-[400px] left-1/2 -translate-x-1/2 -top-32 bg-[hsl(var(--primary)/0.15)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-md">
              Услуги
            </span>
            <h2
              id="services-preview-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 text-lg text-muted-foreground">{subheading}</p>
            )}
          </div>

          {/* Ссылка «Все услуги» (десктоп) */}
          <Link
            href="/services"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            aria-label="Перейти к полному списку услуг"
          >
            Все услуги
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Сетка карточек */}
        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Список услуг"
        >
          {items.map((service) => (
            <li key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`${service.title}${service.priceFrom ? `, от ${service.priceFrom} ₽` : ''}`}
              >
                {/* Декоративный градиент в углу */}
                <div
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-2xl transition-opacity duration-300 group-hover:opacity-80 opacity-50"
                  aria-hidden="true"
                />

                {/* Название услуги */}
                <h3 className="relative text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {service.title}
                </h3>

                {/* Краткое описание */}
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {service.shortDescription}
                </p>

                {/* Нижняя часть карточки: цена + стрелка */}
                <div className="relative mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                  {service.priceFrom !== null ? (
                    <span className="text-sm font-semibold text-primary">
                      от {service.priceFrom.toLocaleString('ru-RU')} ₽
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Цена по запросу
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Ссылка «Все услуги» (мобильный) */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Все услуги
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
