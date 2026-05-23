import React from 'react'

/**
 * Layout для группы (payload) — admin и API маршруты.
 * Не рендерит <html>/<body> — это делает Payload RootLayout
 * в (payload)/admin/layout.tsx.
 */
export default function PayloadGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
