import Image from 'next/image'
import Link from 'next/link'
import { BRAND_CONFIG } from '@/config/brand'
import { HeroDeviceIcons } from '@/components/sections/HeroDeviceIcons'

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
      className="relative flex min-h-[640px] items-center overflow-hidden bg-mesh bg-grain md:min-h-[720px]"
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
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        </div>
      )}

      {/* Декоративные glow-blob (только когда нет фонового фото) */}
      {!backgroundImageUrl && (
        <>
          <div
            className="glow-blob animate-blob h-[420px] w-[420px] -left-32 top-10 bg-[hsl(var(--primary)/0.55)]"
            aria-hidden="true"
          />
          <div
            className="glow-blob animate-blob h-[360px] w-[360px] right-[-80px] top-[-60px] bg-[hsl(280_85%_65%/0.45)]"
            style={{ animationDelay: '-7s' }}
            aria-hidden="true"
          />
          <div
            className="glow-blob animate-blob h-[300px] w-[300px] left-1/3 bottom-[-120px] bg-[hsl(195_90%_60%/0.35)]"
            style={{ animationDelay: '-3s' }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          {/* Бейдж-эyebrow над заголовком */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${
              backgroundImageUrl
                ? 'border-white/30 bg-white/10 text-white/90'
                : 'border-border bg-background/40 text-muted-foreground'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Принимаем заявки прямо сейчас
          </div>

          {/* Заголовок */}
          <h1
            id="hero-heading"
            className={`mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${
              backgroundImageUrl ? 'text-white' : 'text-foreground'
            }`}
          >
            {displayTitle}
          </h1>

          {/* Подзаголовок */}
          <p
            className={`mt-5 max-w-xl text-lg leading-relaxed sm:text-xl ${
              backgroundImageUrl ? 'text-white/90' : 'text-muted-foreground'
            }`}
          >
            {displaySubtitle}
          </p>

          {/* CTA-кнопки */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/services"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full btn-gradient px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] transition-all hover:shadow-[0_18px_40px_-10px_hsl(var(--primary)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <span className="relative z-10">Записаться на ремонт</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
            </Link>
            <Link
              href="/prices"
              className={`inline-flex items-center justify-center rounded-full border px-8 py-3.5 text-base font-semibold backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] ${
                backgroundImageUrl
                  ? 'border-white/40 bg-white/5 text-white hover:bg-white/15'
                  : 'border-border bg-background/40 text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Узнать цены
            </Link>
          </div>
        </div>

        {/* Полоса с иконками техники, которую ремонтируем — на всю ширину контейнера */}
        <HeroDeviceIcons
          onDark={Boolean(backgroundImageUrl)}
          className="mt-12 sm:mt-14"
        />
      </div>
    </section>
  )
}
