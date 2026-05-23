import Link from 'next/link'
import type { Metadata } from 'next'
import { BRAND_CONFIG } from '@/config/brand'

export const metadata: Metadata = {
  title: `Страница не найдена — ${BRAND_CONFIG.companyName}`,
  description: 'Запрашиваемая страница не существует. Вернитесь на главную страницу.',
}

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-extrabold text-primary" aria-hidden="true">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Страница не найдена
        </h1>
        <p className="mt-3 text-muted-foreground">
          К сожалению, запрашиваемая страница не существует или была перемещена.
          Проверьте адрес или вернитесь на главную.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
