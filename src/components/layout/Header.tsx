import Link from 'next/link'
import { Phone } from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { ThemeToggle } from './ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './nav-links'

/**
 * Header — постоянная навигационная панель.
 * Логотип (название из Brand_Config), навигационные ссылки,
 * кнопка быстрой связи, ThemeToggle.
 * Требования: 2.2, 1.3, 17.1
 */
export function Header() {
  const companyName = BRAND_CONFIG.companyName
  const primaryPhone = BRAND_CONFIG.phones[0]

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип / название компании */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          aria-label={`${companyName} — перейти на главную`}
        >
          <span className="text-primary">KIRO</span>
          <span className="text-foreground">Сервис</span>
        </Link>

        {/* Десктопная навигация */}
        <nav aria-label="Основная навигация" className="hidden md:flex">
          <ul className="flex items-center gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Правая часть: телефон + кнопка связи + тема + бургер */}
        <div className="flex items-center gap-2">
          {/* Телефон (только на десктопе) */}
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone.number.replace(/\D/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              aria-label={`Позвонить: ${primaryPhone.number}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{primaryPhone.number}</span>
            </a>
          )}

          {/* Кнопка быстрой связи (десктоп) */}
          <button
            type="button"
            className="hidden md:inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Открыть форму быстрой связи"
            id="quick-contact-trigger"
          >
            Связаться
          </button>

          {/* Переключатель темы (десктоп) */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Мобильное меню */}
          <MobileMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  )
}

/** Навигационные ссылки на все разделы сайта */
export const NAV_LINKS = [
  { href: '/',          label: 'Главная' },
  { href: '/services',  label: 'Услуги' },
  { href: '/prices',    label: 'Цены' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/reviews',   label: 'Отзывы' },
  { href: '/blog',      label: 'Блог' },
  { href: '/about',     label: 'О нас' },
  { href: '/contacts',  label: 'Контакты' },
]
