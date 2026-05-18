'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { validateRussianPhone } from '@/lib/phone-validation'

// ---------------------------------------------------------------------------
// Схема валидации
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
// Типы пропсов
// ---------------------------------------------------------------------------

interface QuickContactFormProps {
  /**
   * Поведение после успешной отправки:
   *   - 'redirect' (по умолчанию) — переход на /thank-you
   *   - 'inline' — показать сообщение об успехе внутри формы (для модалов)
   */
  onSuccessMode?: 'redirect' | 'inline'
  /** Колбэк при успешной отправке (для режима 'inline') */
  onSuccess?: () => void
  /** Дополнительные CSS-классы */
  className?: string
}

// ---------------------------------------------------------------------------
// Компонент
// ---------------------------------------------------------------------------

/**
 * QuickContactForm — упрощённая форма быстрой связи (имя + телефон).
 *
 * Включает: inline-ошибки, real-time валидацию телефона, honeypot-поле.
 * По умолчанию после успешной отправки перенаправляет на /thank-you.
 *
 * Доступность: <label htmlFor>, aria-describedby, aria-invalid, aria-required.
 *
 * Требования: 7.1, 7.3, 7.5, 7.7, 12.3, 12.4, 22.3, 22.4
 */
export function QuickContactForm({
  onSuccessMode = 'redirect',
  onSuccess,
  className,
}: QuickContactFormProps) {
  const uid = useId()
  const id = (suffix: string) => `quick-contact-form-${uid}-${suffix}`

  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickContactFormData>({
    resolver: zodResolver(quickContactSchema),
    defaultValues: { name: '', phone: '', honeypot: '' },
    mode: 'onChange', // real-time валидация
  })

  const onSubmit = async (data: QuickContactFormData) => {
    // Honeypot: если заполнено — тихо игнорируем (бот)
    if (data.honeypot) return

    setSubmitError(null)

    const response = await fetch('/api/quick-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, phone: data.phone, honeypot: '' }),
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Ошибка отправки формы')
    }

    // Успех
    if (onSuccessMode === 'redirect') {
      router.push('/thank-you')
    } else {
      setIsSuccess(true)
      reset()
      onSuccess?.()
    }
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.')
    }
  })

  // -------------------------------------------------------------------------
  // Успешная отправка (inline-режим)
  // -------------------------------------------------------------------------

  if (isSuccess && onSuccessMode === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-lg bg-green-50 p-4 text-center dark:bg-green-950 ${className ?? ''}`}
      >
        <p className="text-base font-medium text-green-800 dark:text-green-200">
          Заявка отправлена!
        </p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Форма
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className={className}
      aria-label="Форма быстрой связи"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Honeypot — скрытое поле для защиты от спамботов                    */}
      {/* ------------------------------------------------------------------ */}
      <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] overflow-hidden">
        <label htmlFor={id('honeypot')}>Не заполняйте это поле</label>
        <input
          id={id('honeypot')}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('honeypot')}
        />
      </div>

      <div className="space-y-4">
        {/* ---------------------------------------------------------------- */}
        {/* Имя                                                              */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor={id('name')}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Ваше имя{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <input
            id={id('name')}
            type="text"
            autoComplete="name"
            placeholder="Иван Иванов"
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? id('name-error') : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            {...register('name')}
          />
          {errors.name && (
            <p id={id('name-error')} role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Телефон                                                          */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor={id('phone')}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Телефон{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <input
            id={id('phone')}
            type="tel"
            autoComplete="tel"
            placeholder="+7 (000) 000-00-00"
            aria-required="true"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? id('phone-error') : id('phone-hint')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            {...register('phone')}
          />
          {errors.phone ? (
            <p id={id('phone-error')} role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.phone.message}
            </p>
          ) : (
            <p id={id('phone-hint')} className="mt-1.5 text-xs text-muted-foreground">
              Формат: +7XXXXXXXXXX или 8XXXXXXXXXX
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Ошибка отправки                                                  */}
        {/* ---------------------------------------------------------------- */}
        {submitError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Кнопка отправки                                                  */}
        {/* ---------------------------------------------------------------- */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Отправка…
            </span>
          ) : (
            'Отправить заявку'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
        </p>
      </div>
    </form>
  )
}
