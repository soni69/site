'use client'

import { useEffect, useRef, useCallback, useId } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validateRussianPhone } from '@/lib/phone-validation'

// ---------------------------------------------------------------------------
// Схема валидации формы быстрой связи
// ---------------------------------------------------------------------------

const quickContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(100, 'Имя не должно превышать 100 символов'),
  phone: z
    .string()
    .refine(validateRussianPhone, {
      message: 'Введите корректный российский номер (+7XXXXXXXXXX или 8XXXXXXXXXX)',
    }),
  /** Honeypot — скрытое поле для защиты от спамботов */
  honeypot: z.string().max(0).optional().default(''),
})

type QuickContactFormData = z.infer<typeof quickContactSchema>

// ---------------------------------------------------------------------------
// Вспомогательная функция: получить все фокусируемые элементы внутри контейнера
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
}

// ---------------------------------------------------------------------------
// Типы пропсов
// ---------------------------------------------------------------------------

interface QuickContactModalProps {
  isOpen: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Компонент
// ---------------------------------------------------------------------------

/**
 * QuickContactModal — модальное окно с формой быстрой связи (имя + телефон).
 *
 * Доступность:
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Фокус-ловушка: Tab/Shift+Tab циклически обходят элементы внутри модала
 *   - Закрытие по Escape и по клику на оверлей
 *   - При открытии фокус перемещается на первый интерактивный элемент
 *   - При закрытии фокус возвращается на элемент, который открыл модал
 *
 * Требования: 12.3, 12.4, 22.4
 */
export function QuickContactModal({ isOpen, onClose }: QuickContactModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<QuickContactFormData>({
    resolver: zodResolver(quickContactSchema),
    defaultValues: { name: '', phone: '', honeypot: '' },
  })

  // Сохраняем элемент, который открыл модал, чтобы вернуть на него фокус
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Перемещаем фокус внутрь модала при открытии; возвращаем при закрытии
  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus()
      return
    }

    const dialog = dialogRef.current
    if (!dialog) return

    // Небольшая задержка, чтобы DOM успел отрисоваться
    const timer = setTimeout(() => {
      const focusable = getFocusableElements(dialog)
      focusable[0]?.focus()
    }, 50)

    return () => clearTimeout(timer)
  }, [isOpen])

  // Блокируем скролл body при открытом модале
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

  // Закрытие по Escape + фокус-ловушка
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = getFocusableElements(dialog)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab: если фокус на первом элементе — переходим на последний
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: если фокус на последнем элементе — переходим на первый
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose],
  )

  // Отправка формы
  const onSubmit = async (data: QuickContactFormData) => {
    // Honeypot: если заполнено — тихо игнорируем
    if (data.honeypot) return

    try {
      const response = await fetch('/api/quick-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, phone: data.phone }),
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки')
      }
    } catch {
      // Ошибка обрабатывается через isSubmitSuccessful === false
    }
  }

  // Сбрасываем форму при закрытии
  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Диалог */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-2xl focus:outline-none"
        tabIndex={-1}
      >
        {/* Заголовок + кнопка закрытия */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-xl font-semibold leading-tight text-foreground"
          >
            Быстрая связь
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Закрыть форму"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Успешная отправка */}
        {isSubmitSuccessful ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950"
          >
            <p className="text-base font-medium text-green-800 dark:text-green-200">
              Заявка отправлена!
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Мы свяжемся с вами в ближайшее время.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Honeypot — скрытое поле, невидимое для пользователей */}
            <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px]">
              <label htmlFor="quick-contact-honeypot">Не заполняйте это поле</label>
              <input
                id="quick-contact-honeypot"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register('honeypot')}
              />
            </div>

            <div className="space-y-4">
              {/* Поле: Имя */}
              <div>
                <label
                  htmlFor="quick-contact-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Ваше имя <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <input
                  id="quick-contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Иван Иванов"
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'quick-contact-name-error' : undefined}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
                  {...register('name')}
                />
                {errors.name && (
                  <p
                    id="quick-contact-name-error"
                    role="alert"
                    className="mt-1.5 text-xs text-destructive"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Поле: Телефон */}
              <div>
                <label
                  htmlFor="quick-contact-phone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Телефон <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <input
                  id="quick-contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 (000) 000-00-00"
                  aria-required="true"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'quick-contact-phone-error' : undefined}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p
                    id="quick-contact-phone-error"
                    role="alert"
                    className="mt-1.5 text-xs text-destructive"
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Отправка…' : 'Отправить заявку'}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </form>
        )}
      </div>
    </>
  )
}
