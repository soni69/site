import Image from 'next/image'
import Link from 'next/link'
import { BRAND_CONFIG } from '@/config/brand'

interface HeroSectionProps {
  /** Заголовок секции Hero. По умолчанию — название компании из Brand_Config. */
  title?: string
  /** Подзаголовок / слоган. По умолчанию — tagline из Brand_Config. */
  subtitle?: string
  /** URL фонового изображения. Если не передан — используется градиентный фон. */
  backgroundImageUrl?: string | null
  /** Alt-текст для фонового изображения. */
  backgroundImageAlt?: string
}

/**
 * HeroSection — главная секция-баннер на главной странице.
 *
 * Отображает заголовок, подзаголовок, CTA-кнопку «Записаться на ремонт»
 * и фоновое изображение (Next.js Image с `priority` для LCP).
 *
 * Требования: 3.2, 3.3, 16.1, 16.2
 */
export function HeroSection({
  title,
  subtitle,
  backgroundImageUrl,
  backgroundImageAlt = 'Сервисный центр по ремонту техники',
}: HeroSectionProps) {
  const displayTitle = title ?? BRAND_CONFIG.companyName
  const displaySubtitle = subtitle ?? BRAND_CONFIG.tagline

  return (
    <section
      className="relative flex min-h-[560px] items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background md:min-h-[640px]"
      aria-labelledby="hero-heading"
    >
      {/* Фоновое изображение */}
      {backgroundImageUrl && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={backgroundImageUrl}
            alt={backgroundImageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Затемняющий оверлей для читаемости текста */}
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        </div>
      )}

      {/* Декоративный градиент (когда нет изображения) */}
      {!backgroundImageUrl && (
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.15)_0%,_transparent_60%)]"
          aria-hidden="true"
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          {/* Заголовок */}
          <h1
            id="hero-heading"
            className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${
              backgroundImageUrl
                ? 'text-white'
                : 'text-foreground'
            }`}
          >
            {displayTitle}
          </h1>

          {/* Подзаголовок */}
          <p
            className={`mt-4 text-lg leading-relaxed sm:text-xl ${
              backgroundImageUrl
                ? 'text-white/90'
                : 'text-muted-foreground'
            }`}
          >
            {displaySubtitle}
          </p>

          {/* CTA-кнопки */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Записаться на ремонт
            </Link>
            <Link
              href="/prices"
              className={`inline-flex items-center justify-center rounded-lg border px-8 py-3.5 text-base font-semibold shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] ${
                backgroundImageUrl
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Узнать цены
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
