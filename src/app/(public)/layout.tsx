import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { BRAND_CONFIG } from '@/config/brand'
import '../globals.css'

/**
 * Inter через next/font/google:
 * - Шрифт скачивается при сборке и раздаётся локально (нет запроса к Google)
 * - font-display: swap встроен автоматически
 * - Нет FOUT, нет CLS от шрифта
 */
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://kiro-service.ru'

export const metadata: Metadata = {
  title: {
    default: `${BRAND_CONFIG.companyName} — профессиональный ремонт техники`,
    template: `%s | ${BRAND_CONFIG.companyName}`,
  },
  description: `Сервисный центр по ремонту техники. Ремонт смартфонов, ноутбуков, планшетов и другой электроники.`,
  metadataBase: new URL(SITE_URL),
}

/**
 * Root layout публичного сайта.
 * Рендерит <html>/<body>. Payload админка имеет свой root layout
 * в (payload)/admin/layout.tsx и не конфликтует с этим.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        <ThemeScript />
      </head>
      <body className={`min-h-screen antialiased ${inter.className}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
