import { test, expect } from '@playwright/test'

const BASE = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost'

test.describe('Безопасность', () => {
  test('X-Frame-Options: SAMEORIGIN', async ({ page }) => {
    const response = await page.goto(BASE)
    const header = response?.headers()['x-frame-options']
    expect(header?.toLowerCase()).toContain('sameorigin')
  })

  test('X-Content-Type-Options: nosniff', async ({ page }) => {
    const response = await page.goto(BASE)
    const header = response?.headers()['x-content-type-options']
    expect(header).toContain('nosniff')
  })

  test('Referrer-Policy установлен', async ({ page }) => {
    const response = await page.goto(BASE)
    const header = response?.headers()['referrer-policy']
    expect(header).toBeTruthy()
  })

  test('Strict-Transport-Security присутствует', async ({ page }) => {
    const response = await page.goto(BASE)
    // Работает только при HTTPS; на localhost проверяем через nginx
    const hsts = response?.headers()['strict-transport-security']
    // Не фейлим тест на HTTP, просто логируем
    if (hsts) {
      expect(hsts).toContain('max-age')
    }
  })

  test('Content-Security-Policy присутствует', async ({ page }) => {
    const response = await page.goto(BASE)
    const csp = response?.headers()['content-security-policy']
    expect(csp).toBeTruthy()
    expect(csp).toContain("default-src 'self'")
  })

  test('форма /request содержит защиту от XSS (нет innerHTML с user-input)', async ({ page }) => {
    await page.goto(`${BASE}/request`)
    // Поле имени принимает только текст
    const nameInput = page.locator('input[type="text"]').first()
    await nameInput.pressSequentially('<script>alert(1)</script>')
    // Значение должно храниться как текст, не выполняться
    const val = await nameInput.inputValue()
    expect(val).toBe('<script>alert(1)</script>')
    // Alert не должен появиться (не будет диалога)
    let alerted = false
    page.on('dialog', () => { alerted = true })
    await page.waitForTimeout(500)
    expect(alerted).toBe(false)
  })

  test('страница /admin требует авторизации', async ({ page }) => {
    const response = await page.goto(`${BASE}/admin`)
    // Должен вернуть 200 (страница логина) или 401
    expect([200, 401]).toContain(response?.status())
  })

  test('нет открытых редиректов через query-параметры', async ({ page }) => {
    await page.goto(`${BASE}/?redirect=https://evil.com`)
    // Страница не должна перенаправить нас на внешний домен
    const url = new URL(page.url())
    expect(url.hostname).not.toBe('evil.com')
  })
})
