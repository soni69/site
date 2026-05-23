import type { SVGProps } from 'react'

/**
 * Список «типов техники» для главной страницы (Hero) и страницы /prices.
 * Каждый тип имеет:
 *  - key — стабильный идентификатор (используется в href-якоре `#device-${key}`)
 *  - label — отображаемая подпись
 *  - keywords — слова, по которым мы определяем, что текстовая категория
 *    в CMS относится к этому типу техники (case-insensitive substring match)
 *  - Icon — компонент SVG-иконки
 */

const baseSvg: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function PCIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <circle cx="9" cy="11" r="0.6" fill="currentColor" />
      <circle cx="11" cy="11" r="0.6" fill="currentColor" />
      <line x1="9" y1="14" x2="15" y2="14" />
      <line x1="9" y1="16.5" x2="15" y2="16.5" />
    </svg>
  )
}

export function SmartphoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <line x1="11" y1="18.5" x2="13" y2="18.5" />
      <line x1="10" y1="4.5" x2="14" y2="4.5" />
    </svg>
  )
}

export function IPhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10 2.5 h4 a1 1 0 0 1 1 1 v0.4 a1 1 0 0 1 -1 1 h-4 a1 1 0 0 1 -1 -1 v-0.4 a1 1 0 0 1 1 -1 z" />
      <line x1="11" y1="19" x2="13" y2="19" />
    </svg>
  )
}

export function AllInOneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="2.5" y="3" width="19" height="13" rx="1.5" />
      <line x1="5" y1="14" x2="19" y2="14" />
      <path d="M10 16 v2" />
      <path d="M14 16 v2" />
      <line x1="7" y1="20.5" x2="17" y2="20.5" />
    </svg>
  )
}

export function TVIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
      <line x1="9" y1="20.5" x2="15" y2="20.5" />
      <line x1="9" y1="20.5" x2="9" y2="17" />
      <line x1="15" y1="20.5" x2="15" y2="17" />
    </svg>
  )
}

export function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <rect x="3" y="3.5" width="18" height="12" rx="1.5" />
      <line x1="12" y1="15.5" x2="12" y2="19" />
      <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
    </svg>
  )
}

export function PrinterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvg} {...props}>
      <path d="M7 3.5 h10 v5 h-10 z" />
      <path d="M5 8.5 h14 a1.5 1.5 0 0 1 1.5 1.5 v5 a1.5 1.5 0 0 1 -1.5 1.5 h-2 v3 h-10 v-3 h-2 a1.5 1.5 0 0 1 -1.5 -1.5 v-5 a1.5 1.5 0 0 1 1.5 -1.5 z" />
      <circle cx="17.5" cy="11.5" r="0.6" fill="currentColor" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  )
}

export type DeviceKey =
  | 'smartphone'
  | 'iphone'
  | 'pc'
  | 'all-in-one'
  | 'monitor'
  | 'tv'
  | 'printer'

export interface DeviceCategory {
  key: DeviceKey
  label: string
  keywords: string[]
  Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

/**
 * Порядок отображения иконок в Hero. Расположен «логически»: сначала
 * мобильные, затем компьютеры, мониторы, медиа, периферия.
 *
 * ВАЖНО: порядок keyword-проверки внутри matchDeviceCategory имеет значение —
 * iPhone проверяется ДО смартфонов, чтобы категория «Ремонт iPhone» не
 * матчилась как обычный смартфон.
 */
export const DEVICE_CATEGORIES: readonly DeviceCategory[] = [
  {
    key: 'smartphone',
    label: 'Смартфоны',
    keywords: ['смартфон', 'телефон', 'android', 'samsung', 'xiaomi', 'huawei', 'honor'],
    Icon: SmartphoneIcon,
  },
  {
    key: 'iphone',
    label: 'iPhone',
    keywords: ['iphone', 'айфон'],
    Icon: IPhoneIcon,
  },
  {
    key: 'pc',
    label: 'ПК',
    keywords: ['пк', 'компьютер', 'desktop', 'системный блок', 'системник'],
    Icon: PCIcon,
  },
  {
    key: 'all-in-one',
    label: 'Моноблоки',
    keywords: ['моноблок', 'all-in-one', 'all in one'],
    Icon: AllInOneIcon,
  },
  {
    key: 'monitor',
    label: 'Мониторы',
    keywords: ['монитор', 'дисплей'],
    Icon: MonitorIcon,
  },
  {
    key: 'tv',
    label: 'Телевизоры',
    keywords: ['телевизор', ' тв', 'tv', 'тв-'],
    Icon: TVIcon,
  },
  {
    key: 'printer',
    label: 'Принтеры',
    keywords: ['принтер', 'мфу', 'printer'],
    Icon: PrinterIcon,
  },
] as const

/**
 * Сопоставляет произвольное название категории прайс-листа с типом техники.
 * Возвращает DeviceCategory либо null, если категория не относится
 * ни к одному из известных типов техники.
 *
 * Порядок проверки важен: специализированные категории (iPhone) проверяются
 * раньше общих (смартфон), чтобы корректно матчиться.
 */
export function matchDeviceCategory(
  categoryName: string,
): DeviceCategory | null {
  const normalized = categoryName.toLowerCase()

  // Специализированные сначала
  const specializedOrder: DeviceKey[] = [
    'iphone',
    'all-in-one',
    'tv',
    'monitor',
    'printer',
    'pc',
    'smartphone',
  ]

  for (const key of specializedOrder) {
    const cat = DEVICE_CATEGORIES.find((c) => c.key === key)
    if (!cat) continue
    if (cat.keywords.some((kw) => normalized.includes(kw))) {
      return cat
    }
  }

  return null
}
