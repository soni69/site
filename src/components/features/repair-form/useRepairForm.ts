'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { repairRequestSchema, type RepairRequestData } from '@/lib/schemas/repair-request.schema'

export type RepairFormValues = RepairRequestData

/**
 * useRepairForm — хук управления формой записи на ремонт.
 *
 * Использует React Hook Form + Zod resolver для валидации.
 * После успешной отправки перенаправляет на `/thank-you`.
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
    mode: 'onChange',
  })

  /**
   * Отправка формы. Если есть файлы — отправляем как multipart/form-data,
   * иначе как JSON (быстрее).
   */
  const submitHandler = async (data: RepairFormValues, files: File[] = []) => {
    if (data.honeypot) return

    let response: Response

    if (files.length > 0) {
      // multipart с файлами
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('phone', data.phone)
      formData.append('serviceId', data.serviceId)
      formData.append('description', data.description ?? '')
      formData.append('honeypot', '')
      files.forEach((file) => formData.append('photos', file))

      response = await fetch('/api/repair-request', {
        method: 'POST',
        body: formData,
      })
    } else {
      // JSON без файлов
      response = await fetch('/api/repair-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          serviceId: data.serviceId,
          description: data.description ?? '',
          honeypot: '',
        }),
      })
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string
        fields?: Record<string, string>
      }

      if (body.fields) {
        for (const [field, message] of Object.entries(body.fields)) {
          form.setError(field as keyof RepairFormValues, { message })
        }
      }

      throw new Error(body.error ?? 'Ошибка отправки формы')
    }

    router.push('/thank-you')
  }

  return {
    ...form,
    onSubmit: (e: React.FormEvent<HTMLFormElement>, files: File[] = []) =>
      form.handleSubmit((data) => submitHandler(data, files))(e),
  }
}
