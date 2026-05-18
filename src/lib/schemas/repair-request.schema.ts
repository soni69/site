import { z } from 'zod'

/**
 * Zod-схема для валидации формы записи на ремонт.
 *
 * Поля:
 *   - name:        имя клиента (2–100 символов, обязательное)
 *   - phone:       российский номер телефона (+7XXXXXXXXXX или 8XXXXXXXXXX)
 *   - serviceId:   идентификатор услуги (UUID, обязательное)
 *   - description: описание проблемы (до 1000 символов, необязательное)
 *   - honeypot:    скрытое поле для защиты от спама (должно быть пустым)
 *
 * Requirement 7.5 — валидация обязательных полей формы
 * Requirement 7.7 — защита от спама (honeypot)
 */
export const repairRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(100, 'Имя не должно превышать 100 символов'),

  phone: z
    .string()
    .regex(
      /^(\+7|8)\d{10}$/,
      'Введите корректный российский номер телефона (+7XXXXXXXXXX или 8XXXXXXXXXX)',
    ),

  serviceId: z.string().uuid('Выберите услугу из списка'),

  description: z
    .string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),

  // Honeypot: должно быть пустым — боты заполняют скрытые поля
  honeypot: z
    .string()
    .max(0, 'Обнаружена подозрительная активность')
    .optional()
    .default(''),
})

/** Тип данных формы, выведенный из схемы. */
export type RepairRequestData = z.infer<typeof repairRequestSchema>

/**
 * Валидирует данные формы и возвращает объект ошибок по полям.
 *
 * @param data - Произвольный объект с данными формы
 * @returns Объект `{ fieldName: errorMessage }` — пустой при успешной валидации
 *
 * @example
 * ```ts
 * const errors = validateRepairForm({ name: '', phone: '123', serviceId: '' })
 * // errors: { name: '...', phone: '...', serviceId: '...' }
 * ```
 */
export function validateRepairForm(
  data: unknown,
): Record<string, string> {
  const result = repairRequestSchema.safeParse(data)

  if (result.success) {
    return {}
  }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in errors)) {
      errors[field] = issue.message
    }
  }
  return errors
}
