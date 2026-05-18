/**
 * Rate limiter для защиты форм от спама.
 *
 * Алгоритм: скользящее окно (sliding window).
 * Не более 5 запросов с одного IP-адреса за 10 минут.
 *
 * Requirement 7.7 — rate limiting форм
 */

/** Длительность окна в миллисекундах (10 минут). */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

/** Максимальное количество запросов в окне. */
export const RATE_LIMIT_MAX_REQUESTS = 5

/**
 * Запись о запросах с одного IP.
 * `timestamps` — массив меток времени (ms) запросов в текущем окне.
 */
export interface RateLimitEntry {
  timestamps: number[]
}

/**
 * Хранилище состояния rate limiter.
 * Ключ — IP-адрес, значение — запись с метками времени.
 *
 * В production используйте Redis или аналогичное внешнее хранилище.
 * Для тестов и serverless-окружений передавайте Map<string, RateLimitEntry>.
 */
export type RateLimitStore = Map<string, RateLimitEntry>

/**
 * Проверяет, не превышен ли лимит запросов для данного IP.
 *
 * Функция мутирует `store`: добавляет текущую метку времени и удаляет
 * устаревшие записи (старше `RATE_LIMIT_WINDOW_MS`).
 *
 * @param ip    - IP-адрес клиента
 * @param store - Хранилище состояния rate limiter
 * @returns `true`  — запрос разрешён (лимит не превышен)
 *          `false` — запрос заблокирован (лимит превышен)
 *
 * @example
 * ```ts
 * const store: RateLimitStore = new Map()
 * for (let i = 0; i < 5; i++) {
 *   checkRateLimit('1.2.3.4', store) // true
 * }
 * checkRateLimit('1.2.3.4', store) // false — 6-й запрос заблокирован
 * ```
 */
export function checkRateLimit(ip: string, store: RateLimitStore): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Получаем или создаём запись для данного IP
  let entry = store.get(ip)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(ip, entry)
  }

  // Удаляем метки времени, вышедшие за пределы окна
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  // Проверяем лимит
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  // Фиксируем текущий запрос
  entry.timestamps.push(now)
  return true
}
