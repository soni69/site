import Link from 'next/link'
import type { Metadata } from 'next'
import { BRAND_CONFIG } from '@/config/brand'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Заявка принята — ${BRAND_CONFIG.companyName}`,
  description: 'Ваша заявка на ремонт успешно отправлена. Мы свяжемся с вами в ближайшее время.',
  alternates: {
    canonical: `${SITE_URL}/thank-you`,
  },
}

// Static page — no dynamic data needed
export const dynamic = 'force-static'

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        {/* Success icon */}
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          aria-hidden="true"
        >
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
          Заявка принята!
        </h1>

        {/* Description */}
        <p className="mt-3 text-muted-foreground">
          Спасибо за обращение в KIRO Сервис. Мы получили вашу заявку и свяжемся
          с вами в ближайшее время для уточнения деталей.
        </p>

        {/* Working hours hint */}
        <p className="mt-2 text-sm text-muted-foreground">
          Время работы: Пн–Пт 9:00–20:00, Сб–Вс 10:00–18:00
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            На главную
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Наши услуги
          </Link>
        </div>
      </div>
    </main>
  )
}
