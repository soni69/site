import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RateLimitStore } from '@/lib/rate-limiter'
import { repairRequestSchema } from '@/lib/schemas/repair-request.schema'
import { getPayload } from '@/lib/payload'

/**
 * In-memory хранилище rate limiter.
 * Глобальная переменная модуля — сохраняется между запросами в рамках одного процесса.
 *
 * Requirement 7.7 — rate limiting форм
 */
const rateLimitStore: RateLimitStore = new Map()

/**
 * Извлекает IP-адрес клиента из заголовков запроса.
 * Учитывает прокси (X-Forwarded-For) и Vercel (x-real-ip).
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For может содержать список IP через запятую — берём первый
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}

/**
 * POST /api/repair-request
 *
 * Обрабатывает заявку на ремонт:
 *   1. Rate limiting по IP (не более 5 запросов за 10 минут)
 *   2. Проверка honeypot-поля (защита от ботов)
 *   3. Zod-валидация входных данных
 *   4. Сохранение через Payload Local API
 *
 * Requirement 7.4 — сохранение заявки в CMS
 * Requirement 7.7 — rate limiting и honeypot
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
  const parseResult = repairRequestSchema.safeParse(body)

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

  const { name, phone, serviceId, description } = parseResult.data

  // 5. Сохранение через Payload Local API
  try {
    const payload = await getPayload()

    await payload.create({
      collection: 'repair-requests',
      data: {
        name,
        phone,
        service: serviceId,
        description: description ?? '',
        source: 'form',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[repair-request] Ошибка сохранения заявки:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.' },
      { status: 500 },
    )
  }
}
