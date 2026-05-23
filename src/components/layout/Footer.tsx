import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { KiroLogo } from '@/components/ui/KiroLogo'

/**
 * Footer — нижний колонтитул сайта.
 * Контакты, ссылки на разделы, юридическая информация.
 * Требования: 2.3, 1.3
 */
export function Footer() {
  const currentYear = new Date().getFullYear()
  const { companyName, phones, email, addresses, workingHours, socialLinks } = BRAND_CONFIG

  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Колонка 1: О компании */}
          <div className="space-y-4">
            <KiroLogo asLink size={28} />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {BRAND_CONFIG.tagline}
            </p>

            {/* Социальные сети */}
            {(socialLinks.vk || socialLinks.telegram || socialLinks.instagram) && (
              <div className="flex items-center gap-3" aria-label="Социальные сети">
                {socialLinks.vk && (
                  <a
                    href={socialLinks.vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label="ВКонтакте"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z" />
                    </svg>
                  </a>
                )}
                {socialLinks.telegram && (
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label="Telegram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Колонка 2: Навигация */}
          <nav aria-label="Навигация в подвале">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Разделы
            </h2>
            <ul className="space-y-2" role="list">
              {FOOTER_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Колонка 3: Контакты */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Контакты
            </h2>
            <ul className="space-y-3" role="list">
              {phones.map((phone) => (
                <li key={phone.number} className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`tel:${phone.number.replace(/\D/g, '')}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    aria-label={`Позвонить: ${phone.number}`}
                  >
                    {phone.number}
                    {phone.label && (
                      <span className="block text-xs text-muted-foreground/70">{phone.label}</span>
                    )}
                  </a>
                </li>
              ))}
              {email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {email}
                  </a>
                </li>
              )}
              {workingHours && (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">{workingHours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Колонка 4: Адреса */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Адреса
            </h2>
            <ul className="space-y-3" role="list">
              {addresses.map((addr) => (
                <li key={addr.address} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    {addr.mapUrl ? (
                      <a
                        href={addr.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        aria-label={`Открыть на карте: ${addr.address}`}
                      >
                        {addr.address}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{addr.address}</span>
                    )}
                    {addr.label && (
                      <span className="block text-xs text-muted-foreground/70">{addr.label}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя полоса: юридическая информация */}
        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {currentYear} {companyName}. Все права защищены.
            </p>
            <nav aria-label="Юридические ссылки">
              <ul className="flex flex-wrap items-center gap-4" role="list">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

/** Навигационные ссылки в подвале */
const FOOTER_NAV_LINKS = [
  { href: '/',          label: 'Главная' },
  { href: '/services',  label: 'Услуги' },
  { href: '/prices',    label: 'Цены' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/reviews',   label: 'Отзывы' },
  { href: '/blog',      label: 'Блог' },
  { href: '/about',     label: 'О нас' },
  { href: '/contacts',  label: 'Контакты' },
]

/** Юридические ссылки */
const LEGAL_LINKS = [
  { href: '/privacy',  label: 'Политика конфиденциальности' },
  { href: '/terms',    label: 'Пользовательское соглашение' },
]
