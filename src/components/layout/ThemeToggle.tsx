'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

/**
 * ThemeToggle — переключатель light/dark темы.
 * Сохраняет выбор в localStorage через next-themes.
 * Требования: 17.1, 17.2, 17.3, 17.4
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Избегаем гидратационного мерцания — рендерим только после монтирования
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Placeholder той же ширины/высоты, чтобы не было layout shift
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md" aria-hidden="true" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
