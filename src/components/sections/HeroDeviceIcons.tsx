import Link from 'next/link'
import type { SVGProps } from 'react'
import { DEVICE_CATEGORIES, type DeviceKey } from './device-categories'

/**
 * HeroDeviceIcons — горизонтальная полоса с мини-иконками техники,
 * которую ремонтирует сервис. Отображается в HeroSection под CTA-кнопками.
 *
 * Каждая иконка — ссылка на страницу /prices с якорем `#device-${key}`,
 * который указывает на соответствующую группу прайса.
 */

interface DeviceIconProps {
  label: string
  href: string
  Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
  /** Тёмный фон (есть backgroundImage) — нужны светлые контуры */
  onDark?: boolean
  /** Индекс элемента (0..6). Используется для центрирования последней строки на мобиле. */
  mobileIndex?: number
}

function DeviceIcon({ label, href, Icon, onDark, mobileIndex }: DeviceIconProps) {
  const iconColor = onDark
    ? 'text-white/85 group-hover:text-white'
    : 'text-foreground/70 group-hover:text-primary'
  const labelColor = onDark
    ? 'text-white/80 group-hover:text-white'
    : 'text-muted-foreground group-hover:text-foreground'

  // Мобильная сетка: 8 колонок × col-span-2.
  const isFirstOfSecondRow = mobileIndex === 4

  return (
    <li
      className={`col-span-2 ${
        isFirstOfSecondRow ? 'col-start-2 sm:col-start-auto' : ''
      }`}
    >
      <Link
        href={href}
        className="group flex flex-col items-center gap-2 rounded-xl px-1 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-20 sm:shrink-0"
      >
        <Icon
          className={`h-8 w-8 transition-transform duration-200 group-hover:scale-110 sm:h-10 sm:w-10 ${iconColor}`}
          aria-hidden="true"
        />
        <span
          className={`text-center text-[10px] font-medium uppercase tracking-wide transition-colors sm:text-xs ${labelColor}`}
        >
          {label}
        </span>
      </Link>
    </li>
  )
}

interface HeroDeviceIconsProps {
  /** true — Hero на тёмном фоновом изображении, светлые иконки */
  onDark?: boolean
  className?: string
}

export function HeroDeviceIcons({ onDark, className }: HeroDeviceIconsProps) {
  return (
    <div
      className={className}
      role="region"
      aria-label="Виды техники, которую мы ремонтируем"
    >
      {/* Стеклянная плашка-обёртка делает блок самостоятельным элементом */}
      <div
        className={`rounded-2xl border px-4 py-5 backdrop-blur-md sm:px-6 sm:py-6 ${
          onDark
            ? 'border-white/15 bg-white/5'
            : 'border-border bg-background/40'
        }`}
      >
        {/*
          Мобильная версия (<sm): сетка из 8 колонок, каждая иконка col-span-2.
          Первая строка: 4 × 2 = 8. Вторая строка: 3 × 2 = 6, пятая иконка
          получает col-start-2 → 1 пустая + 6 занятых + 1 пустая = центр.
          От sm и выше: одна горизонтальная строка через flex.
        */}
        <ul className="grid grid-cols-8 gap-x-2 gap-y-5 sm:flex sm:flex-nowrap sm:items-start sm:justify-between sm:gap-x-5 md:gap-x-6 lg:gap-x-8">
          {DEVICE_CATEGORIES.map((d, i) => (
            <DeviceIcon
              key={d.key}
              label={d.label}
              href={hrefForDevice(d.key)}
              Icon={d.Icon}
              onDark={onDark}
              mobileIndex={i}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function hrefForDevice(key: DeviceKey): string {
  return `/prices#device-${key}`
}
