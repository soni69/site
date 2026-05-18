'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { repairRequestSchema, type RepairRequestData } from '@/lib/schemas/repair-request.schema'

/**
 * Расширенный тип данных формы — включает загружаемые фото.
 * Поле `photos` не входит в Zod-схему (файлы отправляются через FormData),
 * поэтому добавляем его отдельно.
 */
export interface RepairFormValues extends RepairRequestData {
  photos?: FileList
}

/**
 * useRepairForm — хук управления формой записи на ремонт.
 *
 * Использует React Hook Form + Zod resolver для валидации.
 * После успешной отправки перенаправляет на `/thank-you`.
 *
 * Требования: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7
 */
export function useRepairForm() {
  const router = useRouter()

  const form = useForm<RepairFormValues>({
    resolver: zodResolver(repairRequestSchema),
    defaultValues: {
      name: '',
      phone: '',
      serviceId: '',
      description: '',
      honeypot: '',
    },
    mode: 'onChange', // real-time валидация при изменении полей
  })

  const onSubmit = async (data: RepairFormValues) => {
    // Honeypot: если заполнено — тихо игнорируем (бот)
    if (data.honeypot) return

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('phone', data.phone)
    formData.append('serviceId', data.serviceId)
    if (data.description) {
      formData.append('description', data.description)
    }

    // Прикрепляем фото, если выбраны
    if (data.photos && data.photos.length > 0) {
      Array.from(data.photos).forEach((file) => {
        formData.append('photos', file)
      })
    }

    // Отправляем как JSON (без файлов) — API принимает JSON
    const payload: Record<string, unknown> = {
      name: data.name,
      phone: data.phone,
      serviceId: data.serviceId,
      description: data.description ?? '',
      honeypot: '',
    }

    const response = await fetch('/api/repair-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string
        fields?: Record<string, string>
      }

      // Если сервер вернул ошибки по полям — устанавливаем их в форму
      if (body.fields) {
        for (const [field, message] of Object.entries(body.fields)) {
          form.setError(field as keyof RepairFormValues, { message })
        }
      }

      throw new Error(body.error ?? 'Ошибка отправки формы')
    }

    // Успешная отправка — редирект на страницу благодарности
    router.push('/thank-you')
  }

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
