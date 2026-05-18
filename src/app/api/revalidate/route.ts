import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/revalidate
 *
 * On-demand ISR revalidation endpoint.
 * Принимает секрет и путь для ревалидации, вызывает `revalidatePath()`.
 *
 * Тело запроса (JSON):
 *   - secret: string — должен совпадать с REVALIDATION_SECRET из env
 *   - path:   string — путь для ревалидации (например, '/services')
 *
 * Альтернативно секрет может быть передан в заголовке `x-revalidation-secret`.
 *
 * Ответы:
 *   - 200 { revalidated: true, path }  — ревалидация выполнена
 *   - 400 { error: '...' }             — отсутствует path
 *   - 401 { error: '...' }             — неверный или отсутствующий секрет
 *   - 500 { error: '...' }             — внутренняя ошибка
 *
 * Requirement 16.4 — on-demand revalidation при изменении контента в CMS
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const expectedSecret = process.env.REVALIDATION_SECRET

  // Если секрет не настроен в окружении — endpoint недоступен
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Revalidation не настроен на сервере.' },
      { status: 401 },
    )
  }

  // Парсим тело запроса
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Некорректный формат запроса. Ожидается JSON.' },
      { status: 400 },
    )
  }

  // Извлекаем секрет из тела или заголовка
  const bodySecret =
    body !== null && typeof body === 'object' && 'secret' in body
      ? (body as Record<string, unknown>).secret
      : undefined

  const headerSecret = request.headers.get('x-revalidation-secret')

  const providedSecret = bodySecret ?? headerSecret

  // Проверяем секрет
  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Неверный секрет. Доступ запрещён.' },
      { status: 401 },
    )
  }

  // Извлекаем путь для ревалидации
  const path =
    body !== null && typeof body === 'object' && 'path' in body
      ? (body as Record<string, unknown>).path
      : undefined

  if (typeof path !== 'string' || path.trim() === '') {
    return NextResponse.json(
      { error: 'Параметр "path" обязателен и должен быть непустой строкой.' },
      { status: 400 },
    )
  }

  // Выполняем ревалидацию
  try {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path }, { status: 200 })
  } catch (error) {
    console.error('[revalidate] Ошибка ревалидации пути:', path, error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при ревалидации.' },
      { status: 500 },
    )
  }
}
