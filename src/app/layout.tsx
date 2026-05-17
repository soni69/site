import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KIRO Service',
  description: 'Сервисный центр по ремонту техники',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
