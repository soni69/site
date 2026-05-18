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
      className="py-16 sm:py-20"
      aria-labelledby="services-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2
              id="services-preview-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
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
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm sm:flex"
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
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`${service.title}${service.priceFrom ? `, от ${service.priceFrom} ₽` : ''}`}
              >
                {/* Название услуги */}
                <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                  {service.title}
                </h3>

                {/* Краткое описание */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {service.shortDescription}
                </p>

                {/* Нижняя часть карточки: цена + стрелка */}
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
