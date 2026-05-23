import { test, expect } from '@playwright/test'

const BASE = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost'

test.describe('Адаптивность', () => {
  test('мобильное меню (бургер) видно на маленьком экране', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE)
    // Десктопная навигация скрыта
    const desktopNav = page.locator('header nav.hidden')
    // Бургер-кнопка видна
    const burger = page.locator('button[aria-label*="меню"]')
    await expect(burger).toBeVisible()
  })

  test('мобильное меню открывается и закрывается', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE)
    const burger = page.locator('button[aria-label="Открыть меню"]')
    await burger.click()
    await expect(page.locator('[role="dialog"][aria-label="Навигационное меню"]')).toBeVisible()
    // Закрыть
    await page.locator('button[aria-label="Закрыть меню"]').last().click()
    await expect(page.locator('[role="dialog"][aria-label="Навигационное меню"]')).not.toBeVisible()
  })

  test('Hero-секция видна и адаптивна на мобильном', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE)
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
    const box = await hero.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('страница /request отображается корректно на мобильном', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}/request`)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('form')).toBeVisible()
    // Форма не выходит за пределы экрана
    const form = await page.locator('form').boundingBox()
    expect(form?.width).toBeLessThanOrEqual(375)
  })

  test('footer корректно отображается на мобильном', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE)
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    const box = await footer.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('десктопная навигация видна на широком экране', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(BASE)
    const desktopNav = page.locator('header nav[aria-label="Основная навигация"]')
    await expect(desktopNav).toBeVisible()
  })
})
