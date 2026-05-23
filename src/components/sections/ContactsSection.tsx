import Link from 'next/link'
import { MapPin, Phone, Clock, ArrowRight, Mail } from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface ContactsSectionData {
  companyName?: string
  phones?: Array<{ label: string; number: string }>
  email?: string
  addresses?: Array<{ label: string; address: string; mapUrl?: string }>
  workingHours?: string
}

interface ContactsSectionProps {
  data?: ContactsSectionData
  heading?: string
  subheading?: string
}

// ─── Основной компонент ───────────────────────────────────────────────────────

/**
 * ContactsSection — секция «Контакты» на главной странице.
 *
 * Отображает адрес, телефон, email, часы работы и CTA-ссылку на /contacts
 * с формой записи.
 *
 * Требования: 3.1, 11.4
 */
export function ContactsSection({
  data,
  heading = 'Контакты',
  subheading = 'Приходите к нам или оставьте заявку онлайн — ответим в течение 15 минут.',
}: ContactsSectionProps) {
  const phones = data?.phones ?? BRAND_CONFIG.phones
  const email = data?.email ?? BRAND_CONFIG.email
  const addresses = data?.addresses ?? BRAND_CONFIG.addresses
  const workingHours = data?.workingHours ?? BRAND_CONFIG.workingHours

  return (
    <section
      className="py-16 sm:py-20"
      aria-labelledby="contacts-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="contacts-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          )}
        </div>

        {/* Контентная область */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Левая колонка: контактные данные */}
          <div className="space-y-6">
            {/* Адреса */}
            {addresses.length > 0 && (
              <div className="flex gap-4">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Адрес
                  </p>
                  <ul className="mt-1 space-y-1">
                    {addresses.map((addr, idx) => (
                      <li key={idx}>
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

            {/* Телефоны */}
            {phones.length > 0 && (
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
                    {phones.map((phone, idx) => (
                      <li key={idx}>
                        <a
                          href={`tel:${phone.number.replace(/\D/g, '').replace(/^8/, '+7')}`}
                          className="text-base font-medium text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                          aria-label={`Позвонить: ${phone.number}`}
                        >
                          {phone.number}
                        </a>
                        {phone.label && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({phone.label})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
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
                    href={`mailto:${email}`}
                    className="mt-1 block text-base text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label={`Написать на ${email}`}
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Часы работы */}
            {workingHours && (
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
                  <p className="mt-1 text-base text-foreground">{workingHours}</p>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка: CTA-блок записи */}
          <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground">
              Запишитесь на ремонт
            </h3>
            <p className="mt-2 text-muted-foreground">
              Оставьте заявку онлайн — мастер свяжется с вами в течение 15 минут
              и согласует удобное время.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Бесплатная диагностика
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Гарантия на все виды работ
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Ремонт в день обращения
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Записаться на ремонт
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {phones.length > 0 && (
                <a
                  href={`tel:${phones[0].number.replace(/\D/g, '').replace(/^8/, '+7')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Позвонить: ${phones[0].number}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Позвонить
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
