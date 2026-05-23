'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkItem {
  href: string
  label: string
}

/**
 * NavLinks — все навигационные ссылки в одном клиентском компоненте.
 * Один usePathname() вместо N — меньше re-renders, лучше INP.
 * Рендерит <li> элементы для вставки в <ul> родителя.
 */
export function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname()

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </>
  )
}
