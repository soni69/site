import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

/**
 * Public layout — обёртка для всех публичных страниц сайта.
 * Включает ThemeProvider (next-themes), Header, Footer и WhatsAppButton.
 * suppressHydrationWarning задан на <html> в корневом layout.tsx (req 17.4).
 * Требования: 2.2, 2.3, 2.5, 17.1, 17.2, 17.3, 17.4
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </ThemeProvider>
  )
}
