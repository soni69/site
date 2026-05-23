import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, RateLimitStore } from '@/lib/rate-limiter'
import { getPayload } from '@/lib/payload'

/**
 * Zod-схема для формы быстрой связи.
 * Поля: name, phone, honeypot (без serviceId и description).
 *
 * Requirement 12.4 — сохранение заявки из формы быстрой связи
 */
const quickContactSchema = z.object({
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

  // Honeypot: должно быть пустым — боты заполняют скрытые поля
  honeypot: z
    .string()
    .max(0, 'Обнаружена подозрительная активность')
    .optional()
    .default(''),
})

/**
 * In-memory хранилище rate limiter для формы быстрой связи.
 * Глобальная переменная модуля — сохраняется между запросами в рамках одного процесса.
 *
 * Requirement 12.4 — защита от спама
 */
const rateLimitStore: RateLimitStore = new Map()

/**
 * Извлекает IP-адрес клиента из заголовков запроса.
 * Учитывает прокси (X-Forwarded-For) и Vercel (x-real-ip).
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}

/**
 * POST /api/quick-contact
 *
 * Обрабатывает заявку из формы быстрой связи (имя + телефон):
 *   1. Rate limiting по IP (не более 5 запросов за 10 минут)
 *   2. Проверка honeypot-поля (защита от ботов)
 *   3. Zod-валидация входных данных
 *   4. Сохранение через Payload Local API в коллекцию repair-requests с source='quick-contact'
 *
 * Requirement 12.4 — сохранение заявки из формы быстрой связи в CMS
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting по IP
  const ip = getClientIp(request)
  const allowed = checkRateLimit(ip, rateLimitStore)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Слишком много запросов. Пожалуйста, подождите несколько минут и попробуйте снова.',
      },
      { status: 429 },
    )
  }

  // 2. Парсим тело запроса
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Некорректный формат запроса. Ожидается JSON.' },
      { status: 400 },
    )
  }

  // 3. Проверка honeypot — если поле заполнено, это бот
  if (
    body !== null &&
    typeof body === 'object' &&
    'honeypot' in body &&
    typeof (body as Record<string, unknown>).honeypot === 'string' &&
    (body as Record<string, unknown>).honeypot !== ''
  ) {
    // Возвращаем 200, чтобы не раскрывать механизм защиты ботам
    return NextResponse.json({ success: true }, { status: 200 })
  }

  // 4. Zod-валидация
  const parseResult = quickContactSchema.safeParse(body)

  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !(field in fieldErrors)) {
        fieldErrors[field] = issue.message
      }
    }
    return NextResponse.json(
      { error: 'Ошибка валидации данных.', fields: fieldErrors },
      { status: 400 },
    )
  }

  const { name, phone } = parseResult.data

  // 5. Сохранение через Payload Local API с source='quick-contact'
  try {
    const payload = await getPayload()

    await payload.create({
      collection: 'repair-requests',
      data: {
        name,
        phone,
        description: '',
        source: 'quick-contact',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[quick-contact] Ошибка сохранения заявки:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.' },
      { status: 500 },
    )
  }
}
