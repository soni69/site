'use client'

import { useId, useRef, useState } from 'react'
import { Loader2, Paperclip, X } from 'lucide-react'
import { useRepairForm } from './useRepairForm'

// ---------------------------------------------------------------------------
// Типы
// ---------------------------------------------------------------------------

interface ServiceOption {
  id: string
  title: string
}

interface RepairFormProps {
  /** Список услуг для выпадающего списка */
  services?: ServiceOption[]
  /** Предвыбранная услуга (например, из калькулятора) */
  defaultServiceId?: string
  /** Дополнительные CSS-классы для обёртки */
  className?: string
}

// ---------------------------------------------------------------------------
// Константы
// ---------------------------------------------------------------------------

const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = 'JPEG, PNG, WEBP'

// ---------------------------------------------------------------------------
// Компонент
// ---------------------------------------------------------------------------

/**
 * RepairForm — полная форма записи на ремонт.
 *
 * Поля: имя, телефон, услуга, описание, фото (до 5 файлов JPEG/PNG/WEBP, max 10 МБ).
 * Включает: inline-ошибки, real-time валидацию, honeypot, редирект на /thank-you.
 *
 * Доступность: <label htmlFor>, aria-describedby, aria-invalid, aria-required.
 *
 * Требования: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 22.3, 22.4
 */
export function RepairForm({ services = [], defaultServiceId, className }: RepairFormProps) {
  const uid = useId()
  const id = (suffix: string) => `repair-form-${uid}-${suffix}`

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    onSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useRepairForm()

  // Устанавливаем предвыбранную услугу
  if (defaultServiceId) {
    setValue('serviceId', defaultServiceId)
  }

  // -------------------------------------------------------------------------
  // Обработка файлов
  // -------------------------------------------------------------------------

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const files = Array.from(e.target.files ?? [])

    if (files.length === 0) return

    // Проверяем каждый файл
    const invalid = files.find(
      (f) => !ALLOWED_MIME_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE_BYTES,
    )

    if (invalid) {
      if (!ALLOWED_MIME_TYPES.includes(invalid.type)) {
        setFileError(`Файл «${invalid.name}» имеет неподдерживаемый формат. Разрешены: ${ALLOWED_EXTENSIONS}.`)
      } else {
        setFileError(`Файл «${invalid.name}» превышает максимальный размер ${MAX_FILE_SIZE_MB} МБ.`)
      }
      // Сбрасываем input
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const combined = [...selectedFiles, ...files]

    if (combined.length > MAX_FILES) {
      setFileError(`Можно прикрепить не более ${MAX_FILES} файлов.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFiles(combined)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  // -------------------------------------------------------------------------
  // Отправка
  // -------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    try {
      await onSubmit(e, selectedFiles)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.')
    }
  }

  // -------------------------------------------------------------------------
  // Рендер
  // -------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={className}
      aria-label="Форма записи на ремонт"
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

      <div className="space-y-5">
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
        {/* Услуга                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor={id('serviceId')}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Услуга{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <select
            id={id('serviceId')}
            aria-required="true"
            aria-invalid={errors.serviceId ? 'true' : 'false'}
            aria-describedby={errors.serviceId ? id('serviceId-error') : undefined}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            {...register('serviceId')}
          >
            <option value="">— Выберите услугу —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p id={id('serviceId-error')} role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.serviceId.message}
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Описание проблемы                                                */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label
            htmlFor={id('description')}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Описание проблемы{' '}
            <span className="text-muted-foreground">(необязательно)</span>
          </label>
          <textarea
            id={id('description')}
            rows={4}
            placeholder="Опишите неисправность: что случилось, когда появилась проблема…"
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? id('description-error') : id('description-hint')}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            {...register('description')}
          />
          {errors.description ? (
            <p
              id={id('description-error')}
              role="alert"
              className="mt-1.5 text-xs text-destructive"
            >
              {errors.description.message}
            </p>
          ) : (
            <p id={id('description-hint')} className="mt-1.5 text-xs text-muted-foreground">
              До 1000 символов
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Загрузка фото                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">
            Фото устройства{' '}
            <span className="text-muted-foreground">(необязательно)</span>
          </p>

          {/* Кнопка выбора файлов */}
          <label
            htmlFor={id('photos')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-within:ring-2 focus-within:ring-ring"
            aria-describedby={id('photos-hint')}
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Прикрепить фото
            <input
              id={id('photos')}
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Загрузить фото устройства"
            />
          </label>

          <p id={id('photos-hint')} className="mt-1.5 text-xs text-muted-foreground">
            До {MAX_FILES} файлов, форматы {ALLOWED_EXTENSIONS}, не более {MAX_FILE_SIZE_MB} МБ каждый
          </p>

          {/* Ошибка файлов */}
          {fileError && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {fileError}
            </p>
          )}

          {/* Список выбранных файлов */}
          {selectedFiles.length > 0 && (
            <ul className="mt-3 space-y-1.5" aria-label="Выбранные файлы">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs"
                >
                  <span className="truncate text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Удалить файл ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
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
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Отправка…
            </span>
          ) : (
            'Записаться на ремонт'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
        </p>
      </div>
    </form>
  )
}
