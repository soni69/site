import Link from 'next/link'
import { Phone } from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { KiroLogo } from '@/components/ui/KiroLogo'
import { ThemeToggle } from './ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

/**
 * Header — постоянная навигационная панель.
 * Логотип (название из Brand_Config), навигационные ссылки,
 * кнопка быстрой связи, ThemeToggle.
 * Требования: 2.2, 1.3, 17.1
 */
export function Header() {
  const primaryPhone = BRAND_CONFIG.phones[0]

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип / название компании */}
        <KiroLogo asLink size={32} />

        {/* Десктопная навигация — один клиентский компонент для всех ссылок */}
        <nav aria-label="Основная навигация" className="hidden md:flex">
          <ul className="flex items-center gap-1" role="list">
            <NavLinks links={NAV_LINKS} />
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
          <Link
            href="/request"
            className="hidden md:inline-flex items-center rounded-full btn-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.6)] transition-all hover:shadow-[0_10px_28px_-6px_hsl(var(--primary)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            aria-label="Оставить заявку на ремонт"
          >
            Связаться
          </Link>

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
