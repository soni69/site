import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { RepairForm } from '@/components/features/repair-form/RepairForm'
import { ServiceJsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

/**
 * SSG + ISR: страницы генерируются при сборке, обновляются раз в час.
 * Требования: 4.3, 4.4, 4.5, 16.3, 16.4
 */
export const revalidate = 3600

// ─── Типы ────────────────────────────────────────────────────────────────────

interface PriceTableRow {
  id?: string | null
  name: string
  price: string
  note?: string | null
}

interface PhotoItem {
  id?: string | undefined
  url: string
  alt: string
}

interface RelatedService {
  id: string
  title: string
  slug: string
  shortDescription: string
  priceFrom: number | null
}

interface ServiceDetail {
  id: string
  title: string
  shortDescription: string
  fullDescription: unknown // richText (Lexical JSON)
  priceFrom: number | null
  priceTable: PriceTableRow[]
  photos: PhotoItem[]
  relatedServices: RelatedService[]
  seo: {
    title?: string | null
    description?: string | null
    ogImageUrl?: string | null
  }
}

// ─── generateStaticParams ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true },
    })
    return result.docs.map((service) => ({ slug: service.slug }))
  } catch {
    return []
  }
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await fetchServiceBySlug(slug)

  if (!service) {
    return { title: 'Услуга не найдена' }
  }

  const seoTitle = service.seo.title ?? `${service.title} — ${BRAND_CONFIG.companyName}`
  const seoDescription =
    service.seo.description ?? service.shortDescription
  const canonicalUrl = `${SITE_URL}/services/${slug}`

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'website',
      url: canonicalUrl,
      ...(service.seo.ogImageUrl
        ? { images: [{ url: service.seo.ogImageUrl }] }
        : {}),
    },
  }
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1,
      depth: 2,
    })

    if (result.docs.length === 0) return null

    const doc = result.docs[0]!

    // Фотографии
    const photos: PhotoItem[] = (
      Array.isArray(doc.photos) ? doc.photos : []
    )
      .reduce<PhotoItem[]>((acc, p) => {
        const img =
          p && typeof p === 'object' && 'image' in p && p.image
            ? (p.image as { url?: string; alt?: string; id?: unknown })
            : null
        if (!img?.url) return acc
        acc.push({
          id: img.id ? String(img.id) : undefined,
          url: img.url,
          alt: img.alt ?? doc.title,
        })
        return acc
      }, [])

    // Таблица цен
    const priceTable: PriceTableRow[] = (
      Array.isArray(doc.priceTable) ? doc.priceTable : []
    ).map((row) => ({
      id: row && typeof row === 'object' && 'id' in row ? String((row as { id: unknown }).id) : undefined,
      name: (row as { name: string }).name,
      price: (row as { price: string }).price,
      note: (row as { note?: string | null }).note ?? null,
    }))

    // Похожие услуги (не более 3)
    const relatedRaw = Array.isArray(doc.relatedServices)
      ? doc.relatedServices.slice(0, 3)
      : []
    const relatedServices: RelatedService[] = relatedRaw
      .map((rel) => {
        if (!rel || typeof rel !== 'object') return null
        const r = rel as {
          id?: unknown
          title?: string
          slug?: string
          shortDescription?: string
          priceFrom?: number | null
        }
        if (!r.id || !r.title || !r.slug) return null
        return {
          id: String(r.id),
          title: r.title,
          slug: r.slug,
          shortDescription: r.shortDescription ?? '',
          priceFrom: typeof r.priceFrom === 'number' ? r.priceFrom : null,
        }
      })
      .filter((r): r is RelatedService => r !== null)

    // SEO
    const seoGroup = doc.seo as
      | {
          title?: string | null
          description?: string | null
          ogImage?: { url?: string } | null
        }
      | null
      | undefined

    return {
      id: String(doc.id),
      title: doc.title,
      shortDescription: doc.shortDescription,
      fullDescription: doc.fullDescription ?? null,
      priceFrom: typeof doc.priceFrom === 'number' ? doc.priceFrom : null,
      priceTable,
      photos,
      relatedServices,
      seo: {
        title: seoGroup?.title ?? null,
        description: seoGroup?.description ?? null,
        ogImageUrl:
          seoGroup?.ogImage && typeof seoGroup.ogImage === 'object'
            ? (seoGroup.ogImage.url ?? null)
            : null,
      },
    }
  } catch {
    return null
  }
}

/**
 * Загружает список всех опубликованных услуг для выпадающего списка формы записи.
 * Возвращает пустой массив при ошибке.
 */
async function fetchAllServicesForForm(): Promise<Array<{ id: string; title: string }>> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      limit: 200,
      sort: 'title',
      select: { title: true },
    })
    return result.docs.map((s) => ({ id: String(s.id), title: String(s.title ?? '') }))
  } catch {
    return []
  }
}

// ─── Компоненты ───────────────────────────────────────────────────────────────

/** Рендер richText (Lexical JSON) — упрощённый вариант */
function RichTextRenderer({ content }: { content: unknown }) {
  if (!content) return null

  // Если это объект Lexical — рендерим как JSON-строку в <pre> для отладки,
  // в реальном проекте здесь будет @payloadcms/richtext-lexical/react
  // Для MVP отображаем сериализованный текст
  const text = extractTextFromLexical(content)
  if (!text) return null

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {text.split('\n').map((paragraph, i) =>
        paragraph.trim() ? (
          <p key={i}>{paragraph}</p>
        ) : null,
      )}
    </div>
  )
}

/** Рекурсивно извлекает текст из Lexical JSON */
function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>

  if (typeof n['text'] === 'string') return n['text']

  const children = n['children'] ?? n['root']
  if (Array.isArray(children)) {
    return children
      .map((child) => extractTextFromLexical(child))
      .filter(Boolean)
      .join('\n')
  }
  return ''
}

/** Галерея фотографий */
function PhotoGallery({ photos }: { photos: PhotoItem[] }) {
  if (photos.length === 0) return null

  return (
    <section aria-labelledby="gallery-heading" className="mt-12">
      <h2
        id="gallery-heading"
        className="mb-4 text-xl font-semibold text-foreground"
      >
        Фотографии
      </h2>
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
        aria-label="Галерея фотографий услуги"
      >
        {photos.map((photo, index) => (
          <li key={photo.id ?? index}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Таблица цен */
function PriceTable({ rows }: { rows: PriceTableRow[] }) {
  if (rows.length === 0) return null

  return (
    <section aria-labelledby="price-table-heading" className="mt-12">
      <h2
        id="price-table-heading"
        className="mb-4 text-xl font-semibold text-foreground"
      >
        Стоимость работ
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-foreground"
              >
                Вид работы
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold text-foreground"
              >
                Цена
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left font-semibold text-foreground sm:table-cell"
              >
                Примечание
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-foreground">{row.name}</td>
                <td className="px-4 py-3 font-medium text-primary">
                  {row.price}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {row.note ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Секция формы записи на ремонт */
interface BookingFormSectionProps {
  serviceId: string
  services: Array<{ id: string; title: string }>
}

function BookingFormSection({ serviceId, services }: BookingFormSectionProps) {
  return (
    <section
      aria-labelledby="booking-heading"
      className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
    >
      <h2
        id="booking-heading"
        className="mb-6 text-xl font-semibold text-foreground"
      >
        Записаться на ремонт
      </h2>
      <RepairForm
        services={services}
        defaultServiceId={serviceId}
      />
    </section>
  )
}

/** Секция «Похожие услуги» */
function RelatedServices({ services }: { services: RelatedService[] }) {
  if (services.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2
        id="related-heading"
        className="mb-6 text-xl font-semibold text-foreground"
      >
        Похожие услуги
      </h2>
      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {services.map((service) => (
          <li key={service.id}>
            <Link
              href={`/services/${service.slug}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {service.title}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {service.shortDescription}
              </p>
              <div className="mt-3 flex items-center justify-between">
                {service.priceFrom !== null ? (
                  <span className="text-xs font-semibold text-primary">
                    от {service.priceFrom.toLocaleString('ru-RU')} ₽
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Цена по запросу
                  </span>
                )}
                <ArrowRight
                  className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Страница ─────────────────────────────────────────────────────────────────

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Динамическая страница услуги /services/[slug].
 * Требования: 4.3, 4.4, 4.5
 */
export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([
    fetchServiceBySlug(slug),
    fetchAllServicesForForm(),
  ])

  if (!service) {
    notFound()
  }

  // notFound() throws — service is guaranteed non-null here
  const svc: ServiceDetail = service as unknown as ServiceDetail
  const {
    title: svcTitle,
    shortDescription: svcShortDesc,
    fullDescription: svcFullDesc,
    priceFrom: svcPriceFrom,
    priceTable: svcPriceTable,
    photos: svcPhotos,
    relatedServices: svcRelated,
  } = svc

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* JSON-LD: Service structured data — Req 15.5 */}
      <ServiceJsonLd
        name={String(svcTitle)}
        description={svcShortDesc}
        url={`${SITE_URL}/services/${svc.id}`}
        providerName={BRAND_CONFIG.companyName}
        providerUrl={SITE_URL}
        priceFrom={svcPriceFrom}
        imageUrl={svcPhotos[0]?.url ?? null}
      />

      {/* Хлебные крошки */}
      <nav aria-label="Хлебные крошки" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/services"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Услуги
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            {String(svcTitle)}
          </li>
        </ol>
      </nav>

      {/* Кнопка «Назад» */}
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Все услуги
      </Link>

      {/* Заголовок */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {String(svcTitle)}
      </h1>

      {/* Цена «от» */}
      {svcPriceFrom !== null && (
        <p className="mt-3 text-lg font-semibold text-primary">
          от {svcPriceFrom.toLocaleString('ru-RU')} ₽
        </p>
      )}

      {/* Краткое описание */}
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {svcShortDesc}
      </p>

      {/* Полное описание (richText) */}
      {!!svcFullDesc && (
        <section aria-labelledby="description-heading" className="mt-10">
          <h2
            id="description-heading"
            className="mb-4 text-xl font-semibold text-foreground"
          >
            Подробнее об услуге
          </h2>
          <RichTextRenderer content={svcFullDesc} />
        </section>
      )}

      {/* Галерея фотографий */}
      <PhotoGallery photos={svcPhotos} />

      {/* Таблица цен */}
      <PriceTable rows={svcPriceTable} />

      {/* Форма записи на ремонт */}
      <BookingFormSection serviceId={svc.id} services={allServices} />

      {/* Похожие услуги */}
      <RelatedServices services={svcRelated} />
    </div>
  )
}
