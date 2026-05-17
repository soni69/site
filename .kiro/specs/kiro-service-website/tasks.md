# Implementation Plan: KIRO Service Website

## Overview

Production-ready сайт для сервисного центра по ремонту техники на Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui и Payload CMS 3.x. Монорепозиторий: публичный сайт и CMS в одном проекте. База данных — SQLite по умолчанию, PostgreSQL для production.

## Tasks

- [x] 1. Инициализация проекта и базовая конфигурация
  - [x] 1.1 Создать монорепозиторий Next.js 15 + Payload CMS 3.x
    - Инициализировать проект командой `npx create-next-app@latest` с App Router и TypeScript strict mode
    - Установить зависимости: `payload`, `@payloadcms/next`, `@payloadcms/db-sqlite`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
    - Установить UI-зависимости: `tailwindcss`, `shadcn/ui`, `next-themes`, `react-hook-form`, `zod`, `lucide-react`
    - Установить тестовые зависимости: `vitest`, `fast-check`, `@playwright/test`, `@vitejs/plugin-react`
    - Настроить `tsconfig.json` с `strict: true`, path aliases (`@/`)
    - Настроить `tailwind.config.ts` с кастомными цветами бренда и dark mode через `class`
    - Создать `.env.example` со всеми переменными окружения из design.md
    - _Требования: 20.1, 20.3, 21.4, 23.1_
  - [x] 1.2 Настроить Payload CMS и базовый конфиг
    - Создать `src/payload/payload.config.ts` с подключением SQLite/PostgreSQL через `DATABASE_URL`
    - Настроить `next.config.ts` с `withPayload()` wrapper
    - Создать маршруты Payload: `src/app/(payload)/admin/[[...segments]]/page.tsx` и `src/app/(payload)/api/[...payload]/route.ts`
    - Настроить `src/lib/payload.ts` — Payload Local API клиент
    - _Требования: 20.1, 20.2, 20.3_

- [ ] 2. Brand_Config и конфигурация сайта
  - [-] 2.1 Создать Global `site-settings` и утилиты Brand_Config
    - Создать `src/payload/globals/SiteSettings.ts` со всеми полями из design.md (companyName, tagline, phones, email, addresses, workingHours, whatsappNumber, whatsappMessage, socialLinks, primaryColor, logo)
    - Создать `src/config/brand.ts` — статический fallback Brand_Config
    - Создать `src/lib/brand-config.ts` с функцией `getBrandName(settings: SiteSettings): string`
    - _Требования: 1.1, 1.2, 1.3_
  - [ ]* 2.2 Написать property-тест для getBrandName (Property 1)
    - **Property 1: Чтение названия компании из Brand_Config**
    - Для любой непустой строки `companyName` функция `getBrandName(settings)` возвращает её без изменений
    - Файл: `src/__tests__/unit/brand-config.test.ts`
    - **Validates: Requirements 1.3**

- [ ] 3. Коллекции Payload CMS
  - [-] 3.1 Создать коллекцию `users` с ролями и авторизацией
    - Создать `src/payload/collections/Users.ts` с полями `name`, `role` (admin/editor)
    - Настроить `auth: { tokenExpiration: 28800 }` (8 часов)
    - Реализовать access-функции `isAdmin` и `isAdminOrEditor`
    - _Требования: 18.1, 18.4, 18.5, 18.6_
  - [-] 3.2 Создать коллекцию `media` с оптимизацией изображений
    - Создать `src/payload/collections/Media.ts` с upload-конфигурацией
    - Настроить mimeTypes: JPEG, PNG, WebP, AVIF; лимит 20 МБ
    - Настроить imageSizes: thumbnail (150×150), medium (800px), large (1920px)
    - Добавить обязательное поле `alt`
    - _Требования: 16.5, 19.1, 19.2, 19.3, 19.4, 19.5_
  - [ ] 3.3 Создать коллекцию `services` (Услуги)
    - Создать `src/payload/collections/Services.ts` со всеми полями из design.md
    - Настроить `versions: { drafts: true }`, поле `_status`
    - Добавить поля: title, slug (unique), category, shortDescription, fullDescription (richText), priceFrom, priceTable (array), photos (array), relatedServices (relationship), seo (group)
    - _Требования: 4.1, 4.3, 4.6_
  - [ ] 3.4 Создать коллекции `blog`, `portfolio`, `reviews`, `promotions`
    - Создать `src/payload/collections/Blog.ts` с полями: title, slug, previewImage, excerpt, content (richText), tags, publishedAt, seo, _status; `versions: { drafts: true }`
    - Создать `src/payload/collections/Portfolio.ts` с полями: title, description, beforePhotos, afterPhotos, service (relationship), completedAt, _status
    - Создать `src/payload/collections/Reviews.ts` с полями: clientName, rating (1–5), text, photo, reviewDate, _status
    - Создать `src/payload/collections/Promotions.ts` с полями: title, description (richText), image, startsAt, endsAt, _status
    - _Требования: 8.4, 9.3, 13.3, 14.2_
  - [ ] 3.5 Создать коллекции `repair-requests`, `price-list`, `team-members`
    - Создать `src/payload/collections/RepairRequests.ts` с полями: name, phone, service, description, photos, source, createdAt (readOnly), status, honeypot (hidden)
    - Настроить access: create — публичный, read/update/delete — только admin
    - Создать `src/payload/collections/PriceList.ts` с полями: category, sortOrder, items (array: name, price, note)
    - Создать `src/payload/collections/TeamMembers.ts` с полями: name, position, photo, sortOrder, _status
    - _Требования: 5.2, 7.4, 7.6, 10.2_
  - [ ] 3.6 Создать Global `calculator-matrix` и on-demand revalidation hook
    - Создать `src/payload/globals/CalculatorMatrix.ts` с полями: deviceTypes (array с вложенными faults и ценами), disclaimer
    - Создать `src/payload/hooks/revalidate.ts` с функцией `revalidateAfterChange` для всех коллекций
    - Подключить hook к коллекциям services, blog, portfolio, reviews, promotions, price-list
    - _Требования: 6.3, 16.4_

- [ ] 4. Чистые функции бизнес-логики
  - [ ] 4.1 Реализовать функцию валидации российского телефона
    - Создать `src/lib/phone-validation.ts` с функцией `validateRussianPhone(phone: string): boolean`
    - Нормализовать пробелы, дефисы, скобки перед проверкой
    - Принимать форматы: `+7XXXXXXXXXX`, `8XXXXXXXXXX`
    - _Требования: 7.3_
  - [ ]* 4.2 Написать property-тест для validateRussianPhone (Property 5)
    - **Property 5: Валидация российского номера телефона**
    - Файл: `src/__tests__/unit/phone-validation.test.ts`
    - **Validates: Requirements 7.3**
  - [ ] 4.3 Реализовать функцию расчёта стоимости ремонта
    - Создать `src/lib/calculator.ts` с функцией `calculateRepairCost(matrix: CalculatorMatrix, params: CalculatorParams): CalculatorResult | null`
    - Возвращать `null` при отсутствии обязательных параметров
    - Возвращать `{ minPrice, maxPrice, currency: 'RUB', disclaimer }` для валидных параметров
    - _Требования: 6.1, 6.5_
  - [ ]* 4.4 Написать property-тесты для calculator (Property 3 и Property 4)
    - **Property 3: Калькулятор возвращает валидный диапазон цен для корректных параметров**
    - **Property 4: Калькулятор отказывает при неполных параметрах**
    - Файл: `src/__tests__/unit/calculator.test.ts`
    - **Validates: Requirements 6.1, 6.5**
  - [ ] 4.5 Реализовать функции фильтрации, среднего рейтинга и активности акции
    - Создать `src/lib/utils.ts` с функцией `filterByCategory<T extends { categoryId: string }>(items: T[], selectedId: string): T[]`
    - Добавить функцию `calculateAverageRating(ratings: number[]): number` — среднее арифметическое с округлением до 2 знаков
    - Добавить функцию `isPromotionActive(promotion: { startsAt: Date; endsAt: Date }, currentDate: Date): boolean`
    - _Требования: 4.2, 8.2, 9.2, 14.3, 14.4_
  - [ ]* 4.6 Написать property-тесты для filterByCategory, calculateAverageRating, isPromotionActive (Property 2, 8, 9)
    - **Property 2: Фильтрация элементов по полю категории**
    - **Property 8: Корректность среднего рейтинга отзывов**
    - **Property 9: Корректность определения активности акции по дате**
    - Файлы: `src/__tests__/unit/filter.test.ts`, `src/__tests__/unit/reviews.test.ts`, `src/__tests__/unit/promotions.test.ts`
    - **Validates: Requirements 4.2, 8.2, 9.2, 14.3, 14.4**
  - [ ] 4.7 Реализовать валидацию формы и rate limiter
    - Создать `src/lib/schemas/repair-request.schema.ts` с Zod-схемой (name, phone, serviceId, description, honeypot)
    - Создать `src/lib/rate-limiter.ts` с функцией `checkRateLimit(ip: string, store: RateLimitStore): boolean` — не более 5 запросов с одного IP за 10 минут
    - _Требования: 7.5, 7.7_
  - [ ]* 4.8 Написать property-тесты для validateRepairForm и checkRateLimit (Property 6 и Property 7)
    - **Property 6: Валидация формы записи на ремонт**
    - **Property 7: Rate limiting форм**
    - Файлы: `src/__tests__/unit/repair-form.test.ts`, `src/__tests__/unit/rate-limiter.test.ts`
    - **Validates: Requirements 7.5, 7.7**

- [ ] 5. Контрольная точка — базовая логика
  - Убедиться, что все unit/property-тесты проходят: `npx vitest --run`
  - Убедиться, что TypeScript компилируется без ошибок: `npx tsc --noEmit`
  - Задать вопросы пользователю при необходимости.

- [ ] 6. Layout, навигация и темизация
  - [ ] 6.1 Создать корневой layout с Header, Footer и ThemeProvider
    - Создать `src/app/(public)/layout.tsx` с `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`, `suppressHydrationWarning`)
    - Создать `src/components/layout/Header.tsx` — логотип, навигационные ссылки, кнопка быстрой связи, ThemeToggle
    - Создать `src/components/layout/Footer.tsx` — контакты, ссылки на разделы, юридическая информация
    - Создать `src/components/layout/MobileMenu.tsx` — бургер-меню для viewport < 768px
    - Создать `src/components/layout/ThemeToggle.tsx` — переключатель light/dark
    - _Требования: 2.2, 2.3, 2.5, 17.1, 17.2, 17.3, 17.4_
  - [ ] 6.2 Создать кастомную страницу 404 и страницу `/thank-you`
    - Создать `src/app/not-found.tsx` с предложением вернуться на главную
    - Создать `src/app/(public)/thank-you/page.tsx` — статическая страница подтверждения
    - _Требования: 2.4, 7.4_
  - [ ] 6.3 Создать плавающую кнопку WhatsApp и модальную форму быстрой связи
    - Создать `src/components/ui/WhatsAppButton.tsx` — плавающая кнопка в правом нижнем углу, ссылка `https://wa.me/{number}?text={message}`
    - Создать `src/components/ui/QuickContactModal.tsx` — модальное окно с полями имя + телефон, ARIA-атрибуты
    - _Требования: 12.1, 12.2, 12.3, 12.4, 12.5, 22.4_

- [ ] 7. API-маршруты
  - [ ] 7.1 Создать Route Handler для заявки на ремонт
    - Создать `src/app/api/repair-request/route.ts`
    - Реализовать: rate limiting по IP, проверку honeypot, Zod-валидацию, сохранение через Payload Local API
    - Возвращать HTTP 429 при превышении rate limit, HTTP 400 при ошибках валидации
    - _Требования: 7.4, 7.7_
  - [ ] 7.2 Создать Route Handler для быстрой формы связи и on-demand revalidation
    - Создать `src/app/api/quick-contact/route.ts` — аналогично repair-request, без поля service
    - Создать `src/app/api/revalidate/route.ts` — проверка `REVALIDATION_SECRET`, вызов `revalidatePath()`
    - _Требования: 12.4, 16.4_

- [ ] 8. Главная страница и её секции
  - [ ] 8.1 Создать секции главной страницы
    - Создать `src/app/(public)/page.tsx` с ISR `revalidate: 300`, загрузкой данных через Payload Local API
    - Создать `src/components/sections/HeroSection.tsx` — заголовок, подзаголовок, CTA-кнопка, фоновое изображение (Next.js Image)
    - Создать `src/components/sections/AdvantagesSection.tsx` — от 3 до 8 карточек с иконкой, заголовком, описанием
    - Создать `src/components/sections/ServicesPreview.tsx` — не более 6 карточек услуг
    - _Требования: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 8.2 Создать секции акций, отзывов, портфолио и контактов на главной
    - Создать `src/components/sections/PromotionsSection.tsx` — активные акции с таймером обратного отсчёта
    - Создать `src/components/sections/ReviewsPreview.tsx` — 3–5 последних отзывов
    - Создать `src/components/sections/PortfolioPreview.tsx` — превью портфолио
    - Создать `src/components/sections/ContactsSection.tsx` — адрес, телефон, форма записи
    - _Требования: 3.1, 9.4, 14.1_

- [ ] 9. Страницы услуг и цен
  - [ ] 9.1 Создать страницу `/services` с фильтрацией по категории
    - Создать `src/app/(public)/services/page.tsx` с ISR `revalidate: 600`
    - Реализовать клиентскую фильтрацию по категории без перезагрузки страницы (URL search params)
    - Отображать карточки: название, краткое описание, цена «от», фото (Next.js Image)
    - _Требования: 4.1, 4.2_
  - [ ] 9.2 Создать динамическую страницу `/services/[slug]`
    - Создать `src/app/(public)/services/[slug]/page.tsx` с SSG + ISR `revalidate: 3600`
    - Реализовать `generateStaticParams()` для всех опубликованных услуг
    - Вызывать `notFound()` для несуществующего slug
    - Отображать: полное описание, таблицу цен, фото, форму записи, секцию «Похожие услуги» (не более 3)
    - _Требования: 4.3, 4.4, 4.5_
  - [ ] 9.3 Создать страницу `/prices`
    - Создать `src/app/(public)/prices/page.tsx` с ISR `revalidate: 600`
    - Отображать таблицу цен, сгруппированную по категориям (sortOrder)
    - Для каждой позиции: название, цена/диапазон, примечание
    - _Требования: 5.1, 5.3, 5.4_

- [ ] 10. Калькулятор стоимости ремонта
  - [ ] 10.1 Реализовать клиентский компонент Calculator
    - Создать `src/components/features/calculator/types.ts` с интерфейсами `CalculatorParams`, `CalculatorResult`
    - Создать `src/components/features/calculator/useCalculator.ts` — хук с логикой выбора параметров и вызовом `calculateRepairCost`
    - Создать `src/components/features/calculator/Calculator.tsx` — клиентский компонент (`'use client'`)
    - Реализовать: выбор типа устройства → выбор неисправности → отображение диапазона цен без перезагрузки
    - Показывать подсказку при незаполненных обязательных полях
    - Кнопка «Записаться на ремонт» с предзаполненными данными после расчёта
    - _Требования: 6.1, 6.2, 6.4, 6.5_

- [ ] 11. Форма записи на ремонт
  - [ ] 11.1 Реализовать компоненты форм записи
    - Создать `src/components/features/repair-form/useRepairForm.ts` — хук с React Hook Form + Zod resolver
    - Создать `src/components/features/repair-form/RepairForm.tsx` — полная форма (имя, телефон, услуга, описание, фото до 5 файлов JPEG/PNG/WEBP, max 10 МБ)
    - Создать `src/components/features/repair-form/QuickContactForm.tsx` — упрощённая форма (имя + телефон)
    - Реализовать: inline-ошибки у полей, real-time валидацию телефона, honeypot-поле (скрытое), редирект на `/thank-you` после успешной отправки
    - _Требования: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12. Портфолио
  - [ ] 12.1 Создать страницу `/portfolio` с фильтрацией и пагинацией
    - Создать `src/app/(public)/portfolio/page.tsx` с ISR `revalidate: 300`
    - Создать `src/components/features/portfolio/PortfolioFilter.tsx` — фильтр по услуге (URL search params)
    - Создать `src/components/features/portfolio/PortfolioGrid.tsx` — сетка карточек, не более 12 на странице, кнопка «Загрузить ещё»
    - Создать `src/components/features/portfolio/PortfolioLightbox.tsx` — лайтбокс с фото до/после, описанием, датой; ARIA-атрибуты
    - _Требования: 8.1, 8.2, 8.3, 8.5, 22.4_

- [ ] 13. Отзывы, акции и страница «О нас»
  - [ ] 13.1 Создать страницу `/reviews`
    - Создать `src/app/(public)/reviews/page.tsx` с ISR `revalidate: 300`
    - Создать `src/components/features/reviews/StarRating.tsx` — компонент звёздного рейтинга (ARIA: `role="img"`, `aria-label`)
    - Создать `src/components/features/reviews/ReviewsList.tsx` — список с сортировкой по рейтингу/дате без перезагрузки
    - Отображать средний рейтинг в заголовке страницы (вычислять через `calculateAverageRating`)
    - _Требования: 9.1, 9.2, 9.5_
  - [ ] 13.2 Создать компонент таймера обратного отсчёта для акций
    - Создать `src/components/features/promotions/CountdownTimer.tsx` — клиентский компонент (`'use client'`)
    - Отображать дни/часы/минуты/секунды до окончания акции
    - Скрывать таймер, если акция завершилась (использовать `isPromotionActive`)
    - _Требования: 14.3, 14.4, 14.5_
  - [ ] 13.3 Создать страницу `/about`
    - Создать `src/app/(public)/about/page.tsx` с ISR `revalidate: 3600`
    - Создать `src/components/ui/AnimatedCounter.tsx` — счётчик с анимацией при появлении в viewport (Intersection Observer)
    - Отображать секции: история, миссия, команда (фото + имя + должность), сертификаты, ключевые показатели с анимацией
    - _Требования: 10.1, 10.2, 10.3_

- [ ] 14. Страница контактов и карта
  - [ ] 14.1 Создать страницу `/contacts`
    - Создать `src/app/(public)/contacts/page.tsx` с ISR `revalidate: 3600`
    - Создать `src/components/features/map/MapEmbed.tsx` — встраивание Яндекс.Карт или Google Maps через iframe/API
    - Отображать: адреса (несколько точек), телефоны с `href="tel:"`, email, график работы, карту, форму обратной связи
    - _Требования: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 15. Блог
  - [ ] 15.1 Создать страницы блога
    - Создать `src/app/(public)/blog/page.tsx` с ISR `revalidate: 300`, пагинацией (9 статей на странице)
    - Создать `src/app/(public)/blog/[slug]/page.tsx` с SSG + ISR `revalidate: 3600`
    - Реализовать `generateStaticParams()` для всех опубликованных статей
    - Отображать блок «Читайте также» с 3 связанными статьями по тегам
    - _Требования: 13.1, 13.2, 13.4, 13.5_

- [ ] 16. SEO, sitemap и структурированные данные
  - [ ] 16.1 Реализовать SEO-метаданные и JSON-LD
    - Создать `src/components/seo/JsonLd.tsx` с компонентами `LocalBusinessJsonLd` и `ServiceJsonLd`
    - Добавить `generateMetadata()` во все страницы (title, description, Open Graph, canonical URL)
    - Обеспечить один `<h1>` на страницу, корректную иерархию заголовков, `alt` для всех изображений
    - _Требования: 15.1, 15.4, 15.5, 15.6_
  - [ ] 16.2 Создать динамический sitemap и robots.txt
    - Создать `src/app/sitemap.ts` — включить все публичные URL: статические страницы + динамические (services, blog, portfolio)
    - Создать `src/app/robots.ts` — запретить `/admin`, разрешить всё остальное
    - _Требования: 15.2, 15.3_

- [ ] 17. Контрольная точка — публичный сайт
  - Убедиться, что все страницы рендерятся без ошибок: `npm run build`
  - Убедиться, что TypeScript компилируется без ошибок: `npx tsc --noEmit`
  - Убедиться, что ESLint не выдаёт предупреждений: `npx eslint src/`
  - Задать вопросы пользователю при необходимости.

- [ ] 18. Интеграционные тесты
  - [ ]* 18.1 Написать интеграционные тесты для API заявки на ремонт
    - Тестировать: успешное создание заявки, rate limiting (HTTP 429), honeypot (HTTP 400), невалидные данные (HTTP 400)
    - Файл: `src/__tests__/integration/repair-request-api.test.ts`
    - _Требования: 7.4, 7.7_
  - [ ]* 18.2 Написать интеграционные тесты для Payload-коллекций
    - Тестировать: создание/чтение/обновление/удаление для services, blog, portfolio, reviews
    - Проверить генерацию TypeScript-типов из Payload
    - Файл: `src/__tests__/integration/payload-collections.test.ts`
    - _Требования: 23.2_
  - [ ]* 18.3 Написать интеграционный тест для on-demand revalidation
    - Тестировать: вызов `/api/revalidate` с корректным секретом → успех; без секрета → HTTP 401
    - Файл: `src/__tests__/integration/revalidation.test.ts`
    - _Требования: 16.4_

- [ ] 19. E2E тесты (Playwright)
  - [ ]* 19.1 Написать E2E тест: отправка формы записи на ремонт
    - Сценарий: заполнить форму → отправить → проверить редирект на `/thank-you`
    - Файл: `src/__tests__/e2e/repair-form.spec.ts`
    - _Требования: 7.4_
  - [ ]* 19.2 Написать E2E тест: калькулятор стоимости
    - Сценарий: выбрать тип устройства → выбрать неисправность → проверить отображение диапазона цен → нажать «Записаться»
    - Файл: `src/__tests__/e2e/calculator.spec.ts`
    - _Требования: 6.1, 6.2, 6.4_
  - [ ]* 19.3 Написать E2E тест: навигация и главная страница
    - Сценарий: проверить все ссылки навигации, бургер-меню на мобильном, переключение темы
    - Файл: `src/__tests__/e2e/homepage.spec.ts`
    - _Требования: 2.1, 2.2, 2.5, 17.3_
  - [ ]* 19.4 Написать E2E тест: авторизация в Admin Panel
    - Сценарий: попытка доступа без авторизации → редирект на `/admin/login`; вход с корректными данными → доступ к панели
    - Файл: `src/__tests__/e2e/admin-auth.spec.ts`
    - _Требования: 18.1, 18.3_

- [ ] 20. Деплой и документация
  - [ ] 20.1 Создать Dockerfile и docker-compose.yml
    - Создать `Dockerfile` с multi-stage build (deps → builder → runner) на базе `node:20-alpine`
    - Создать `docker-compose.yml` с сервисами: app (Next.js + Payload), postgres (PostgreSQL 16), nginx (reverse proxy)
    - Настроить healthcheck для postgres
    - _Требования: 21.1_
  - [ ] 20.2 Написать README.md
    - Создать `README.md` с разделами:
      - Описание проекта и технологический стек
      - Локальный запуск (клонирование, установка зависимостей, настройка `.env`, `npm run dev`)
      - Настройка переменных окружения (описание каждой переменной из `.env.example`)
      - Первый вход в Admin Panel (создание первого пользователя)
      - Деплой на Vercel + Railway (пошаговая инструкция)
      - Деплой через Docker Compose
      - Переключение SQLite → PostgreSQL
      - Запуск тестов (`npx vitest --run`, `npx playwright test`)
    - _Требования: 21.3_

- [ ] 21. Финальная контрольная точка
  - Убедиться, что `npm run build` проходит без ошибок TypeScript и предупреждений ESLint
  - Убедиться, что все unit/property-тесты проходят: `npx vitest --run`
  - Убедиться, что Docker-образ собирается: `docker build .`
  - Задать вопросы пользователю при необходимости.

## Notes

- Задачи, отмеченные `*`, являются необязательными и могут быть пропущены для ускоренного MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Контрольные точки (задачи 5, 17, 21) обеспечивают инкрементальную валидацию
- Property-тесты (fast-check, минимум 100 итераций) покрывают все 9 свойств из design.md
- Все компоненты используют TypeScript strict mode без `any` в production-коде
- Все интерактивные компоненты должны иметь ARIA-атрибуты и поддержку клавиатурной навигации

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 3, "tasks": ["3.6", "4.2", "4.3", "4.5"] },
    { "id": 4, "tasks": ["4.4", "4.6", "4.7"] },
    { "id": 5, "tasks": ["4.8", "6.1", "7.1"] },
    { "id": 6, "tasks": ["6.2", "6.3", "7.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1", "10.1", "11.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "12.1", "13.1", "13.2", "13.3"] },
    { "id": 9, "tasks": ["14.1", "15.1", "16.1"] },
    { "id": 10, "tasks": ["16.2", "18.1", "18.2", "18.3"] },
    { "id": 11, "tasks": ["19.1", "19.2", "19.3", "19.4"] },
    { "id": 12, "tasks": ["20.1", "20.2"] }
  ]
}
```
