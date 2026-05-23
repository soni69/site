import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { BRAND_CONFIG } from '@/config/brand'
import { MapEmbed } from '@/components/features/map/MapEmbed'
import type { MapLocation } from '@/components/features/map/MapEmbed'
import { QuickContactForm } from '@/components/features/repair-form/QuickContactForm'

/**
 * ISR: страница обновляется не чаще одного раза в час.
 * Требования: 11.1, 11.2, 11.3, 11.4, 11.5, 16.3, 16.4
 */
export const revalidate = 3600

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Контакты — ${BRAND_CONFIG.companyName}`,
  description:
    'Адрес, телефоны, email и график работы сервисного центра. Запишитесь на ремонт онлайн или позвоните нам.',
  alternates: {
    canonical: `${SITE_URL}/contacts`,
  },
  openGraph: {
    title: `Контакты — ${BRAND_CONFIG.companyName}`,
    description:
      'Адрес, телефоны, email и график работы сервисного центра.',
    type: 'website',
    url: `${SITE_URL}/contacts`,
  },
}

// ─── Типы ────────────────────────────────────────────────────────────────────

interface ContactsData {
  companyName: string
  phones: Array<{ label: string; number: string }>
  email: string
  addresses: Array<{
    label: string
    address: string
    mapUrl?: string
    lat?: number
    lng?: number
  }>
  workingHours: string
}

// ─── Загрузка данных ─────────────────────────────────────────────────────────

async function fetchContactsData(): Promise<ContactsData> {
  try {
    const payload = await getPayload()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await (payload as any).findGlobal({ slug: 'site-settings', depth: 0 })

    if (!settings) return buildFallback()

    const phones: ContactsData['phones'] = Array.isArray(settings.phones)
      ? settings.phones
          .filter(
            (p: unknown): p is { label: string; number: string } =>
              typeof p === 'object' && p !== null && 'number' in p,
          )
          .map((p: { label?: string; number: string }) => ({
            label: p.label ?? '',
            number: p.number,
          }))
      : BRAND_CONFIG.phones

    const addresses: ContactsData['addresses'] = Array.isArray(settings.addresses)
      ? settings.addresses
          .filter(
            (a: unknown): a is { label: string; address: string } =>
              typeof a === 'object' && a !== null && 'address' in a,
          )
          .map(
            (a: {
              label?: string
              address: string
              mapUrl?: string
              lat?: number
              lng?: number
            }) => ({
              label: a.label ?? '',
              address: a.address,
              mapUrl: a.mapUrl,
              lat: a.lat,
              lng: a.lng,
            }),
          )
      : BRAND_CONFIG.addresses

    return {
      companyName:
        typeof settings.companyName === 'string' && settings.companyName.trim()
          ? settings.companyName
          : BRAND_CONFIG.companyName,
      phones: phones.length > 0 ? phones : BRAND_CONFIG.phones,
      email:
        typeof settings.email === 'string' && settings.email.trim()
          ? settings.email
          : BRAND_CONFIG.email,
      addresses: addresses.length > 0 ? addresses : BRAND_CONFIG.addresses,
      workingHours:
        typeof settings.workingHours === 'string' && settings.workingHours.trim()
          ? settings.workingHours
          : BRAND_CONFIG.workingHours,
    }
  } catch {
    return buildFallback()
  }
}

function buildFallback(): ContactsData {
  return {
    companyName: BRAND_CONFIG.companyName,
    phones: BRAND_CONFIG.phones,
    email: BRAND_CONFIG.email,
    addresses: BRAND_CONFIG.addresses,
    workingHours: BRAND_CONFIG.workingHours,
  }
}

/** Нормализует номер телефона для href="tel:" */
function toTelHref(number: string): string {
  const digits = number.replace(/\D/g, '')
  // Российские номера: 8XXXXXXXXXX → +7XXXXXXXXXX
  if (digits.startsWith('8') && digits.length === 11) {
    return `+7${digits.slice(1)}`
  }
  return digits.startsWith('+') ? digits : `+${digits}`
}

// ─── Страница ─────────────────────────────────────────────────────────────────

/**
 * Страница /contacts — контактная информация и форма обратной связи.
 *
 * Отображает: адреса (несколько точек), телефоны с href="tel:", email,
 * график работы, встроенную карту и форму обратной связи.
 *
 * Требования: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export default async function ContactsPage() {
  const data = await fetchContactsData()

  const mapLocations: MapLocation[] = data.addresses.map((addr) => ({
    label: addr.label || addr.address,
    address: addr.address,
    mapUrl: addr.mapUrl,
    lat: addr.lat,
    lng: addr.lng,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* ── Заголовок страницы ─────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Контакты
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Приходите к нам или оставьте заявку онлайн — ответим в течение 15 минут.
        </p>
      </div>

      {/* ── Основная сетка: контакты + форма ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Левая колонка: контактные данные ──────────────────────── */}
        <section aria-labelledby="contact-info-heading">
          <h2
            id="contact-info-heading"
            className="mb-6 text-xl font-bold text-foreground"
          >
            Как нас найти
          </h2>

          <div className="space-y-6">
            {/* Адреса — Req 11.1, 11.5 */}
            {data.addresses.length > 0 && (
              <div className="flex gap-4">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {data.addresses.length > 1 ? 'Адреса' : 'Адрес'}
                  </p>
                  <ul className="mt-1 space-y-2">
                    {data.addresses.map((addr, idx) => (
                      <li key={idx}>
                        {addr.label && (
                          <span className="block text-xs font-medium text-muted-foreground">
                            {addr.label}
                          </span>
                        )}
                        {addr.mapUrl ? (
                          <a
                            href={addr.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                            aria-label={`Открыть карту: ${addr.address}`}
                          >
                            {addr.address}
                          </a>
                        ) : (
                          <span className="text-base text-foreground">{addr.address}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Телефоны — Req 11.1, 11.4 */}
            {data.phones.length > 0 && (
              <div className="flex gap-4">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Телефон
                  </p>
                  <ul className="mt-1 space-y-1">
                    {data.phones.map((phone, idx) => (
                      <li key={idx} className="flex flex-wrap items-baseline gap-2">
                        {/* href="tel:" — Req 11.4 */}
                        <a
                          href={`tel:${toTelHref(phone.number)}`}
                          className="text-base font-medium text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                          aria-label={`Позвонить: ${phone.number}`}
                        >
                          {phone.number}
                        </a>
                        {phone.label && (
                          <span className="text-sm text-muted-foreground">
                            ({phone.label})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Email — Req 11.1 */}
            {data.email && (
              <div className="flex gap-4">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${data.email}`}
                    className="mt-1 block text-base text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label={`Написать на ${data.email}`}
                  >
                    {data.email}
                  </a>
                </div>
              </div>
            )}

            {/* График работы — Req 11.1 */}
            {data.workingHours && (
              <div className="flex gap-4">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Режим работы
                  </p>
                  <p className="mt-1 text-base text-foreground">{data.workingHours}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Правая колонка: форма обратной связи — Req 11.1 ──────── */}
        <section
          aria-labelledby="contact-form-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <h2
            id="contact-form-heading"
            className="mb-2 text-xl font-bold text-foreground"
          >
            Форма обратной связи
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Оставьте заявку — мастер свяжется с вами в течение 15 минут.
          </p>

          <QuickContactForm onSuccessMode="redirect" />
        </section>
      </div>

      {/* ── Карта — Req 11.2, 11.5 ────────────────────────────────────── */}
      {mapLocations.length > 0 && (
        <section aria-labelledby="map-heading" className="mt-12">
          <h2
            id="map-heading"
            className="mb-4 text-xl font-bold text-foreground"
          >
            Мы на карте
          </h2>
          <MapEmbed locations={mapLocations} height={420} />
        </section>
      )}
    </div>
  )
}
