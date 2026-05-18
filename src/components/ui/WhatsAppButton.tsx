'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { BRAND_CONFIG } from '@/config/brand'
import { QuickContactModal } from './QuickContactModal'

interface WhatsAppButtonProps {
  /** Номер WhatsApp в формате без «+» (например, «70001234567»). По умолчанию берётся из Brand_Config. */
  whatsappNumber?: string
  /** Предзаполненный текст сообщения. По умолчанию берётся из Brand_Config. */
  whatsappMessage?: string
}

/**
 * WhatsAppButton — плавающая кнопка в правом нижнем углу.
 *
 * При нажатии открывает WhatsApp с предзаполненным сообщением.
 * Рядом с кнопкой WhatsApp отображается кнопка быстрой формы связи.
 *
 * Требования: 12.1, 12.2, 12.3, 12.5, 22.4
 */
export function WhatsAppButton({
  whatsappNumber = BRAND_CONFIG.whatsappNumber,
  whatsappMessage = BRAND_CONFIG.whatsappMessage,
}: WhatsAppButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const encodedMessage = encodeURIComponent(whatsappMessage)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

  return (
    <>
      {/* Группа плавающих кнопок */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        role="group"
        aria-label="Быстрая связь"
      >
        {/* Кнопка быстрой формы связи */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
          aria-label="Открыть форму быстрой связи"
          aria-haspopup="dialog"
        >
          <span>Быстрая связь</span>
        </button>

        {/* Кнопка WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:bg-[#20BD5C] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 active:scale-95"
          aria-label="Написать в WhatsApp"
        >
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        </a>
      </div>

      {/* Модальная форма быстрой связи */}
      <QuickContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
