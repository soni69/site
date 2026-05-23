'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { BRAND_CONFIG } from '@/config/brand'

interface NavLink {
  href: string
  label: string
}

interface MobileMenuProps {
  links: NavLink[]
  onQuickContact?: () => void
}

/**
 * MobileMenu — бургер-меню для viewport < 768px.
 *
 * Панель рендерится через Portal прямо в <body>, чтобы избежать
 * проблемы с fixed-позиционированием внутри элементов с transform
 * (backdrop-blur в Header ломает fixed на iOS Safari).
 */
export function MobileMenu({ links, onQuickContact }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Portal работает только на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  // Закрываем меню при смене маршрута
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Закрываем меню по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Блокируем скролл body при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const panel = isOpen ? (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Панель меню — рендерится в body через Portal, не внутри Header */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Навигационное меню"
        className="fixed inset-y-0 right-0 z-50 w-72 bg-background shadow-xl"
      >
        <div className="flex h-full flex-col">
          {/* Шапка панели */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <span className="text-sm font-medium text-muted-foreground">Меню</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть меню"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Навигационные ссылки */}
          <nav aria-label="Мобильная навигация" className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1" role="list">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-md px-3 py-2.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Нижняя часть: кнопка связи + телефон + переключатель темы */}
          <div className="border-t border-border px-4 py-4 space-y-3">
            <Link
              href="/request"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Записаться на ремонт
            </Link>
            {BRAND_CONFIG.phones[0] && (
              <a
                href={`tel:${BRAND_CONFIG.phones[0].number.replace(/\D/g, '')}`}
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {BRAND_CONFIG.phones[0].number}
              </a>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-muted-foreground">Тема оформления</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null

  return (
    <div className="md:hidden">
      {/* Кнопка-бургер */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Панель через Portal — вне Header, прямо в body */}
      {mounted && createPortal(panel, document.body)}
    </div>
  )
}
