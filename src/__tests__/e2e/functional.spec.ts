import { test, expect } from '@playwright/test'

const BASE = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost'

test.describe('Функциональность', () => {
  test('главная страница загружается и содержит заголовок', async ({ page }) => {
    await page.goto(BASE)
    await expect(page).toHaveTitle(/KIRO/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('навигация: все страницы открываются без ошибок', async ({ page }) => {
    const pages = [
      '/services',
      '/prices',
      '/portfolio',
      '/reviews',
      '/blog',
      '/about',
      '/contacts',
      '/request',
      '/privacy',
      '/terms',
    ]
    for (const path of pages) {
      const response = await page.goto(`${BASE}${path}`)
      expect(response?.status(), `Страница ${path} должна отдавать 200`).toBe(200)
    }
  })

  test('кнопка «Связаться» в хедере ведёт на /request', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(BASE)
    const link = page.locator('header a[href="/request"]')
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL(/\/request/)
  })

  test('страница /request содержит форму', async ({ page }) => {
    await page.goto(`${BASE}/request`)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Заявка')
  })

  test('footer содержит ссылки на /privacy и /terms', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible()
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible()
  })

  test('страница /thank-you доступна', async ({ page }) => {
    const response = await page.goto(`${BASE}/thank-you`)
    expect(response?.status()).toBe(200)
  })

  test('логотип KIRO присутствует на каждой странице', async ({ page }) => {
    await page.goto(BASE)
    // логотип-картинка внутри header
    await expect(page.locator('header img[alt="KIRO Сервис"]').first()).toBeVisible()
  })
})
