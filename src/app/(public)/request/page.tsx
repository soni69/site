import type { Metadata } from 'next'
import { BRAND_CONFIG } from '@/config/brand'
import { RepairForm } from '@/components/features/repair-form/RepairForm'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: `Заявка на ремонт — ${BRAND_CONFIG.companyName}`,
  description:
    'Оставьте заявку на ремонт смартфона, ноутбука или планшета. Мы свяжемся с вами в течение 15 минут.',
  alternates: { canonical: `${SITE_URL}/request` },
  openGraph: {
    title: `Заявка на ремонт — ${BRAND_CONFIG.companyName}`,
    description: 'Оставьте заявку на ремонт — мы свяжемся в течение 15 минут.',
    type: 'website',
    url: `${SITE_URL}/request`,
  },
}

const ADVANTAGES = [
  { icon: '⚡', title: 'Быстрый ответ', desc: 'Перезвоним в течение 15 минут' },
  { icon: '🔧', title: 'Бесплатная диагностика', desc: 'Определим проблему без оплаты' },
  { icon: '🛡️', title: 'Гарантия', desc: 'До 6 месяцев на все виды работ' },
  { icon: '📍', title: 'Удобное расположение', desc: 'В центре города, рядом с метро' },
]

export default function RequestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Заголовок */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Заявка на ремонт
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Заполните форму — мы свяжемся с вами в течение 15 минут и согласуем удобное время
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Форма */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Опишите проблему</h2>
          <RepairForm />
        </div>

        {/* Преимущества */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Почему выбирают нас</h2>

          <ul className="space-y-4" role="list">
            {ADVANTAGES.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Контакты */}
          <div className="rounded-xl bg-primary/5 p-6 ring-1 ring-primary/15">
            <p className="text-sm font-medium text-foreground">Предпочитаете позвонить?</p>
            {BRAND_CONFIG.phones[0] && (
              <a
                href={`tel:${BRAND_CONFIG.phones[0].number.replace(/\D/g, '')}`}
                className="mt-2 block text-2xl font-bold text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                aria-label={`Позвонить: ${BRAND_CONFIG.phones[0].number}`}
              >
                {BRAND_CONFIG.phones[0].number}
              </a>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{BRAND_CONFIG.workingHours}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
