import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface KiroLogoProps {
  className?: string
  /** Размер иконки в пикселях */
  size?: number
  /** Показывать только иконку без текста */
  iconOnly?: boolean
  /** Обернуть в ссылку на главную */
  asLink?: boolean
}

/**
 * KiroLogo — логотип сервисного центра KIRO.
 * Иконка: сгенерированный логотип (гаечный ключ + молния).
 */
export function KiroLogo({ className, size = 32, iconOnly = false, asLink = false }: KiroLogoProps) {
  const icon = (
    <Image
      src="/logo-generated-1.png"
      alt="KIRO Сервис"
      width={size}
      height={size}
      className="rounded-lg object-contain"
      aria-hidden="true"
    />
  )

  const text = !iconOnly && (
    <span className="flex items-baseline gap-0.5 font-bold tracking-tight" aria-hidden="true">
      <span className="text-primary">KIRO</span>
      <span className="text-foreground"> Сервис</span>
    </span>
  )

  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {icon}
      {text}
    </span>
  )

  if (asLink) {
    return (
      <Link
        href="/"
        className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        aria-label="KIRO Сервис — перейти на главную"
      >
        {icon}
        {text}
      </Link>
    )
  }

  return content
}
