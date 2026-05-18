import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'KIRO Сервис — профессиональный ремонт техники',
    template: '%s | KIRO Сервис',
  },
  description: 'Сервисный центр по ремонту техники. Ремонт смартфонов, ноутбуков, планшетов и другой электроники.',
}

/**
 * Root layout — корневой layout приложения.
 * Устанавливает lang, suppressHydrationWarning для поддержки next-themes.
 * ThemeProvider вынесен в (public)/layout.tsx, чтобы не влиять на Payload Admin.
 * Требования: 17.1, 17.4
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
