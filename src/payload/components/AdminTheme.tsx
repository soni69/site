'use client'

import React, { useEffect } from 'react'

export function AdminTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inject link tag into head on client side
    const existing = document.getElementById('payload-admin-theme')
    if (!existing) {
      const link = document.createElement('link')
      link.id = 'payload-admin-theme'
      link.rel = 'stylesheet'
      link.href = '/admin-theme.css'
      document.head.appendChild(link)
    }
  }, [])

  return <>{children}</>
}
