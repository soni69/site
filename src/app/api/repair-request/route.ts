import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RateLimitStore } from '@/lib/rate-limiter'
import { repairRequestSchema } from '@/lib/schemas/repair-request.schema'
import { getPayload } from '@/lib/payload'

const rateLimitStore: RateLimitStore = new Map()

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}

/**
 * POST /api/repair-request
 *
 * Принимает либо JSON, либо multipart/form-data (если приложены фото).
 * При наличии фото — загружает их в коллекцию media и связывает с заявкой.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, rateLimitStore)) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Подождите несколько минут.' },
      { status: 429 },
    )
  }

  const contentType = request.headers.get('content-type') ?? ''
  const isMultipart = contentType.includes('multipart/form-data')

  let payloadData: Record<string, unknown> = {}
  let files: File[] = []

  if (isMultipart) {
    try {
      const form = await request.formData()
      payloadData = {
        name: form.get('name'),
        phone: form.get('phone'),
        serviceId: form.get('serviceId'),
        description: form.get('description') ?? '',
        honeypot: form.get('honeypot') ?? '',
      }
      files = form.getAll('photos').filter((v): v is File => v instanceof File)
    } catch {
      return NextResponse.json({ error: 'Некорректный формат запроса.' }, { status: 400 })
    }
  } else {
    try {
      payloadData = (await request.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON.' }, { status: 400 })
    }
  }

  // Honeypot
  if (typeof payloadData.honeypot === 'string' && payloadData.honeypot !== '') {
    return NextResponse.json({ success: true }, { status: 200 })
  }

  // Валидация
  const parseResult = repairRequestSchema.safeParse(payloadData)
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !(field in fieldErrors)) {
        fieldErrors[field] = issue.message
      }
    }
    return NextResponse.json(
      { error: 'Ошибка валидации.', fields: fieldErrors },
      { status: 400 },
    )
  }

  // Валидация файлов
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Можно прикрепить не более ${MAX_FILES} файлов.` },
      { status: 400 },
    )
  }
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Неподдерживаемый формат файла «${file.name}». Разрешены: JPEG, PNG, WEBP.` },
        { status: 400 },
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Файл «${file.name}» превышает максимальный размер 10 МБ.` },
        { status: 400 },
      )
    }
  }

  const { name, phone, serviceId, description } = parseResult.data

  try {
    const payload = await getPayload()

    // 1. Загружаем фото в коллекцию media
    const photoIds: (string | number)[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Фото к заявке от ${name}`,
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      })
      photoIds.push(mediaDoc.id)
    }

    // 2. Создаём заявку с привязкой фото
    await payload.create({
      collection: 'repair-requests',
      data: {
        name,
        phone,
        service: Number.isFinite(Number(serviceId)) ? Number(serviceId) : serviceId,
        description: description ?? '',
        source: 'form',
        status: 'new',
        createdAt: new Date().toISOString(),
        photos: photoIds.map((id) => ({ file: id })),
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[repair-request] Ошибка сохранения:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Попробуйте позже.' },
      { status: 500 },
    )
  }
}
