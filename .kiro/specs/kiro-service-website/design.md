# Design Document — KIRO Service Website

## Overview

KIRO Service Website — production-ready веб-сайт для сервисного центра по ремонту техники. Проект объединяет публичный сайт на Next.js 15+ (App Router) и административную панель на Payload CMS 3.x в единый монорепозиторий. Владелец бизнеса управляет всем контентом через визуальный интерфейс CMS без написания кода.

### Ключевые цели

- **Конверсия**: форма записи на ремонт, онлайн-калькулятор, WhatsApp-кнопка и всплывающая форма быстрой связи снижают барьер для обращения.
- **SEO**: статическая и инкрементальная генерация страниц, JSON-LD, sitemap, Open Graph обеспечивают органический трафик.
- **Управляемость**: весь контент (тексты, цены, акции, отзывы, портфолио) редактируется через Admin Panel без деплоя.
- **Масштабируемость**: SQLite для старта, PostgreSQL для роста — переключение одной переменной окружения.
- **Производительность**: LCP < 2.5 с на мобильных, Next.js Image, ISR, Data Cache.

### Технологический стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15+ (App Router, React 19) |
| Язык | TypeScript 5.x (strict mode) |
| Стили | Tailwind CSS 3.x + shadcn/ui |
| CMS | Payload CMS 3.x |
| БД (default) | SQLite (через `@payloadcms/db-sqlite`) |
| БД (prod) | PostgreSQL (через `@payloadcms/db-postgres`) |
| Авторизация | Payload built-in (email+password) + Google OAuth |
| Темизация | next-themes |
| Деплой | Vercel (Next.js) + Railway (Payload + DB) / Docker |
| Тестирование | Vitest + fast-check (PBT) + Playwright (E2E) |

---

## Architecture

### Монорепозиторий: Next.js + Payload CMS

Payload CMS 3.x работает **внутри** Next.js App Router как набор API-маршрутов (`/api/[...payload]`). Это позволяет держать весь стек в одном репозитории и деплоить на одну платформу.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐   │
│  │  Public Routes   │    │   Payload CMS Routes     │   │
│  │  /               │    │   /admin  (Admin UI)     │   │
│  │  /services/[slug]│    │   /api/[...payload]      │   │
│  │  /blog/[slug]    │    │   (REST + GraphQL API)   │   │
│  │  /portfolio      │    └──────────────────────────┘   │
│  │  /contacts       │                                   │
│  └──────────────────┘                                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Payload CMS Core                    │   │
│  │  Collections: Services, Blog, Portfolio,         │   │
│  │  Reviews, Promotions, RepairRequests, Media,     │   │
│  │  Pages, PriceList, TeamMembers, Settings         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Database Adapter                    │   │
│  │  SQLite (dev/default) ←→ PostgreSQL (prod)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Стратегия рендеринга

| Страница | Стратегия | Обоснование |
|---|---|---|
| `/` | ISR (revalidate: 300) | Контент меняется редко, нужна свежесть акций |
| `/services` | ISR (revalidate: 600) | Список услуг стабилен |
| `/services/[slug]` | SSG + ISR (revalidate: 3600) | Генерация при сборке, обновление по запросу |
| `/prices` | ISR (revalidate: 600) | Цены меняются редко |
| `/portfolio` | ISR (revalidate: 300) | Новые работы добавляются регулярно |
| `/blog` | ISR (revalidate: 300) | Список статей |
| `/blog/[slug]` | SSG + ISR (revalidate: 3600) | Статьи не меняются часто |
| `/reviews` | ISR (revalidate: 300) | Новые отзывы |
| `/about` | ISR (revalidate: 3600) | Редко меняется |
| `/contacts` | ISR (revalidate: 3600) | Редко меняется |
| `/thank-you` | SSG | Статическая страница |
| `/admin/*` | SSR (Payload) | Динамический интерфейс CMS |

### Схема деплоя

#### Вариант A: Vercel + Railway

```
┌──────────────┐     HTTPS      ┌──────────────────────┐
│   Vercel     │◄──────────────►│   Railway            │
│              │                │                      │
│  Next.js App │  Internal API  │  Payload CMS Server  │
│  (публичный  │◄──────────────►│  (Node.js process)   │
│   сайт)      │                │                      │
│              │                │  ┌────────────────┐  │
│  Edge CDN    │                │  │  PostgreSQL DB │  │
│  Functions   │                │  └────────────────┘  │
└──────────────┘                └──────────────────────┘
```

> В монорепо-режиме Payload встроен в Next.js, поэтому оба деплоятся вместе на Vercel. Railway используется только для PostgreSQL.

#### Вариант B: Docker Compose

```yaml
services:
  app:       # Next.js + Payload CMS (единый контейнер)
  postgres:  # PostgreSQL 16
  nginx:     # Reverse proxy + SSL termination
```

### Стратегия кэширования

```
Browser Cache (статические ассеты: 1 год)
    ↓
Vercel Edge Cache (HTML страниц: ISR TTL)
    ↓
Next.js Data Cache (fetch с revalidate)
    ↓
Payload CMS Local API (in-process, без HTTP)
    ↓
SQLite / PostgreSQL
```

- **Next.js Data Cache**: все запросы к Payload через Local API кэшируются с `{ next: { revalidate: N } }`.
- **On-demand revalidation**: при публикации контента в CMS вызывается `revalidatePath()` через webhook.
- **Static assets**: изображения через Next.js Image с CDN-кэшированием.

---

## Components and Interfaces

### Структура директорий

```
kiro-service-website/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Route group: публичный сайт
│   │   │   ├── layout.tsx            # Root layout (header, footer, theme)
│   │   │   ├── page.tsx              # / — главная страница
│   │   │   ├── services/
│   │   │   │   ├── page.tsx          # /services
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # /services/[slug]
│   │   │   ├── prices/
│   │   │   │   └── page.tsx          # /prices
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # /about
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx          # /reviews
│   │   │   ├── portfolio/
│   │   │   │   └── page.tsx          # /portfolio
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # /blog
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # /blog/[slug]
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx          # /contacts
│   │   │   └── thank-you/
│   │   │       └── page.tsx          # /thank-you
│   │   ├── (payload)/                # Route group: Payload CMS
│   │   │   ├── admin/
│   │   │   │   └── [[...segments]]/
│   │   │   │       └── page.tsx      # /admin — Payload Admin UI
│   │   │   └── api/
│   │   │       └── [...payload]/
│   │   │           └── route.ts      # /api/[...payload] — Payload REST API
│   │   ├── sitemap.ts                # Динамический sitemap.xml
│   │   ├── robots.ts                 # robots.txt
│   │   └── not-found.tsx             # Кастомная 404
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── sections/                 # Секции главной страницы
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AdvantagesSection.tsx
│   │   │   ├── ServicesPreview.tsx
│   │   │   ├── PromotionsSection.tsx
│   │   │   ├── ReviewsPreview.tsx
│   │   │   ├── PortfolioPreview.tsx
│   │   │   └── ContactsSection.tsx
│   │   ├── features/
│   │   │   ├── calculator/
│   │   │   │   ├── Calculator.tsx    # Клиентский компонент
│   │   │   │   ├── useCalculator.ts  # Хук с логикой расчёта
│   │   │   │   └── types.ts
│   │   │   ├── repair-form/
│   │   │   │   ├── RepairForm.tsx
│   │   │   │   ├── QuickContactForm.tsx
│   │   │   │   └── useRepairForm.ts
│   │   │   ├── portfolio/
│   │   │   │   ├── PortfolioGrid.tsx
│   │   │   │   ├── PortfolioFilter.tsx
│   │   │   │   └── PortfolioLightbox.tsx
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewsList.tsx
│   │   │   │   └── StarRating.tsx
│   │   │   ├── promotions/
│   │   │   │   └── CountdownTimer.tsx
│   │   │   └── map/
│   │   │       └── MapEmbed.tsx
│   │   ├── ui/                       # shadcn/ui + кастомные примитивы
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── WhatsAppButton.tsx    # Плавающая кнопка
│   │   │   ├── QuickContactModal.tsx # Всплывающая форма
│   │   │   └── AnimatedCounter.tsx   # Счётчик с анимацией
│   │   └── seo/
│   │       ├── JsonLd.tsx            # JSON-LD структурированные данные
│   │       └── OpenGraphImage.tsx
│   │
│   ├── payload/                      # Payload CMS конфигурация
│   │   ├── payload.config.ts         # Главный конфиг Payload
│   │   ├── collections/
│   │   │   ├── Services.ts
│   │   │   ├── Blog.ts
│   │   │   ├── Portfolio.ts
│   │   │   ├── Reviews.ts
│   │   │   ├── Promotions.ts
│   │   │   ├── RepairRequests.ts
│   │   │   ├── Media.ts
│   │   │   ├── Pages.ts
│   │   │   ├── PriceList.ts
│   │   │   ├── TeamMembers.ts
│   │   │   └── Users.ts
│   │   ├── globals/
│   │   │   ├── SiteSettings.ts       # Brand_Config
│   │   │   └── CalculatorMatrix.ts   # Матрица калькулятора
│   │   └── hooks/
│   │       └── revalidate.ts         # On-demand revalidation hook
│   │
│   ├── lib/
│   │   ├── payload.ts                # Payload Local API клиент
│   │   ├── brand-config.ts           # Утилиты для Brand_Config
│   │   ├── calculator.ts             # Чистая функция расчёта стоимости
│   │   ├── phone-validation.ts       # Валидация телефона
│   │   ├── rate-limiter.ts           # Rate limiting для форм
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── payload-types.ts          # Авто-генерируемые Payload типы
│   │   └── index.ts
│   │
│   └── config/
│       └── brand.ts                  # Статический Brand_Config (fallback)
│
├── public/
│   ├── favicon.ico
│   └── og-default.jpg
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### Ключевые интерфейсы компонентов

```typescript
// Калькулятор
interface CalculatorParams {
  deviceType: string;
  faultType: string;
}

interface CalculatorResult {
  minPrice: number;
  maxPrice: number;
  currency: 'RUB';
  disclaimer: string;
}

// Форма записи
interface RepairFormData {
  name: string;
  phone: string;
  serviceId: string;
  description?: string;
  photos?: File[];
}

// Фильтрация портфолио
interface PortfolioFilterState {
  serviceId: string | null;
  page: number;
}
```

---

## Data Models

### Payload CMS Collections

#### Collection: `services` (Услуги)

```typescript
{
  slug: 'services',
  fields: [
    { name: 'title',            type: 'text',        required: true },
    { name: 'slug',             type: 'text',        required: true, unique: true },
    { name: 'category',         type: 'relationship', relationTo: 'service-categories' },
    { name: 'shortDescription', type: 'textarea',    required: true },
    { name: 'fullDescription',  type: 'richText' },
    { name: 'priceFrom',        type: 'number' },
    { name: 'priceTable',       type: 'array', fields: [
        { name: 'name',  type: 'text' },
        { name: 'price', type: 'text' },  // диапазон: "500–1500"
        { name: 'note',  type: 'text' },
    ]},
    { name: 'photos',           type: 'array', fields: [
        { name: 'image', type: 'upload', relationTo: 'media' }
    ]},
    { name: 'relatedServices',  type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'seo',              type: 'group', fields: [
        { name: 'title',       type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage',     type: 'upload', relationTo: 'media' },
    ]},
    { name: '_status',          type: 'select', options: ['draft', 'published'] },
  ],
  versions: { drafts: true },
}
```

#### Collection: `blog` (Статьи)

```typescript
{
  slug: 'blog',
  fields: [
    { name: 'title',            type: 'text',     required: true },
    { name: 'slug',             type: 'text',     required: true, unique: true },
    { name: 'previewImage',     type: 'upload',   relationTo: 'media' },
    { name: 'excerpt',          type: 'textarea' },
    { name: 'content',          type: 'richText', required: true },
    { name: 'tags',             type: 'array', fields: [
        { name: 'tag', type: 'text' }
    ]},
    { name: 'publishedAt',      type: 'date' },
    { name: 'seo',              type: 'group', fields: [
        { name: 'title',       type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage',     type: 'upload', relationTo: 'media' },
    ]},
    { name: '_status',          type: 'select', options: ['draft', 'published'] },
  ],
  versions: { drafts: true },
}
```

#### Collection: `portfolio` (Портфолио)

```typescript
{
  slug: 'portfolio',
  fields: [
    { name: 'title',          type: 'text',         required: true },
    { name: 'description',    type: 'textarea' },
    { name: 'beforePhotos',   type: 'array', fields: [
        { name: 'image', type: 'upload', relationTo: 'media' }
    ]},
    { name: 'afterPhotos',    type: 'array', fields: [
        { name: 'image', type: 'upload', relationTo: 'media' }
    ]},
    { name: 'service',        type: 'relationship', relationTo: 'services' },
    { name: 'completedAt',    type: 'date' },
    { name: '_status',        type: 'select', options: ['draft', 'published'] },
  ],
}
```

#### Collection: `reviews` (Отзывы)

```typescript
{
  slug: 'reviews',
  fields: [
    { name: 'clientName',  type: 'text',   required: true },
    { name: 'rating',      type: 'number', required: true, min: 1, max: 5 },
    { name: 'text',        type: 'textarea', required: true },
    { name: 'photo',       type: 'upload', relationTo: 'media' },
    { name: 'reviewDate',  type: 'date',   required: true },
    { name: '_status',     type: 'select', options: ['draft', 'published'] },
  ],
}
```

#### Collection: `promotions` (Акции)

```typescript
{
  slug: 'promotions',
  fields: [
    { name: 'title',       type: 'text',   required: true },
    { name: 'description', type: 'richText' },
    { name: 'image',       type: 'upload', relationTo: 'media' },
    { name: 'startsAt',    type: 'date',   required: true },
    { name: 'endsAt',      type: 'date',   required: true },
    { name: '_status',     type: 'select', options: ['draft', 'published'] },
  ],
}
```

#### Collection: `repair-requests` (Заявки на ремонт)

```typescript
{
  slug: 'repair-requests',
  fields: [
    { name: 'name',        type: 'text',         required: true },
    { name: 'phone',       type: 'text',         required: true },
    { name: 'service',     type: 'relationship', relationTo: 'services', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'photos',      type: 'array', fields: [
        { name: 'file', type: 'upload', relationTo: 'media' }
    ]},
    { name: 'source',      type: 'select', options: ['form', 'calculator', 'quick-contact'] },
    { name: 'createdAt',   type: 'date',   admin: { readOnly: true } },
    { name: 'status',      type: 'select', options: ['new', 'in-progress', 'done', 'cancelled'] },
    // Honeypot (скрытое поле, не отображается в форме)
    { name: 'honeypot',    type: 'text',   admin: { hidden: true } },
  ],
  access: {
    create: () => true,   // публичное создание
    read:   isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
```

#### Collection: `media` (Медиафайлы)

```typescript
{
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 150,  height: 150, crop: 'centre' },
      { name: 'medium',    width: 800,  height: null },
      { name: 'large',     width: 1920, height: null },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
  ],
}
```

#### Collection: `price-list` (Прайс-лист)

```typescript
{
  slug: 'price-list',
  fields: [
    { name: 'category',  type: 'text',  required: true },
    { name: 'sortOrder', type: 'number' },
    { name: 'items',     type: 'array', fields: [
        { name: 'name',  type: 'text' },
        { name: 'price', type: 'text' },  // "от 500 ₽" или "500–1500 ₽"
        { name: 'note',  type: 'text' },
    ]},
  ],
}
```

#### Collection: `team-members` (Команда)

```typescript
{
  slug: 'team-members',
  fields: [
    { name: 'name',       type: 'text',   required: true },
    { name: 'position',   type: 'text',   required: true },
    { name: 'photo',      type: 'upload', relationTo: 'media' },
    { name: 'sortOrder',  type: 'number' },
    { name: '_status',    type: 'select', options: ['draft', 'published'] },
  ],
}
```

#### Collection: `users` (Пользователи Admin Panel)

```typescript
{
  slug: 'users',
  auth: {
    tokenExpiration: 28800,  // 8 часов
    useAPIKey: false,
  },
  fields: [
    { name: 'name',  type: 'text', required: true },
    { name: 'role',  type: 'select', options: ['admin', 'editor'], required: true },
  ],
}
```

### Payload CMS Globals

#### Global: `site-settings` (Brand_Config)

```typescript
{
  slug: 'site-settings',
  fields: [
    { name: 'companyName',   type: 'text',  required: true },
    { name: 'tagline',       type: 'text' },
    { name: 'phones',        type: 'array', fields: [
        { name: 'label',  type: 'text' },
        { name: 'number', type: 'text' },
    ]},
    { name: 'email',         type: 'email' },
    { name: 'addresses',     type: 'array', fields: [
        { name: 'label',     type: 'text' },
        { name: 'address',   type: 'text' },
        { name: 'mapUrl',    type: 'text' },
        { name: 'lat',       type: 'number' },
        { name: 'lng',       type: 'number' },
    ]},
    { name: 'workingHours',  type: 'textarea' },
    { name: 'whatsappNumber',type: 'text' },
    { name: 'whatsappMessage',type: 'text' },
    { name: 'socialLinks',   type: 'group', fields: [
        { name: 'vk',        type: 'text' },
        { name: 'telegram',  type: 'text' },
        { name: 'instagram', type: 'text' },
    ]},
    { name: 'primaryColor',  type: 'text', defaultValue: '#2563eb' },
    { name: 'logo',          type: 'upload', relationTo: 'media' },
  ],
}
```

#### Global: `calculator-matrix` (Матрица калькулятора)

```typescript
{
  slug: 'calculator-matrix',
  fields: [
    { name: 'deviceTypes', type: 'array', fields: [
        { name: 'id',    type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'faults', type: 'array', fields: [
            { name: 'id',       type: 'text',   required: true },
            { name: 'label',    type: 'text',   required: true },
            { name: 'minPrice', type: 'number', required: true },
            { name: 'maxPrice', type: 'number', required: true },
        ]},
    ]},
    { name: 'disclaimer', type: 'text', defaultValue: 'Цены ориентировочные. Точная стоимость определяется после диагностики.' },
  ],
}
```

### API-маршруты (Next.js Route Handlers)

| Метод | Маршрут | Описание |
|---|---|---|
| `POST` | `/api/repair-request` | Создание заявки на ремонт (с rate limiting, honeypot) |
| `POST` | `/api/quick-contact` | Быстрая форма связи |
| `POST` | `/api/revalidate` | On-demand ISR revalidation (webhook от Payload) |
| `GET` | `/api/[...payload]` | Payload REST API (проксируется Payload) |

```typescript
// src/app/api/repair-request/route.ts
export async function POST(request: Request): Promise<Response> {
  // 1. Rate limiting по IP
  // 2. Проверка honeypot
  // 3. Валидация данных (zod schema)
  // 4. Сохранение через Payload Local API
  // 5. Возврат результата
}
```

---

## Correctness Properties

*Свойство — это характеристика или поведение, которое должно выполняться при всех допустимых выполнениях системы. По сути, это формальное утверждение о том, что система должна делать. Свойства служат мостом между читаемыми человеком спецификациями и машинно-верифицируемыми гарантиями корректности.*

Для тестирования свойств используется библиотека **fast-check** (TypeScript). Каждый тест запускается минимум **100 итераций**.

---

### Property 1: Чтение названия компании из Brand_Config

*Для любой* строки `companyName`, записанной в объект `SiteSettings`, функция `getBrandName(settings)` должна возвращать именно эту строку — без изменений, обрезки или подстановки значений по умолчанию, если значение непустое.

**Validates: Requirements 1.3**

---

### Property 2: Фильтрация элементов по полю категории

*Для любого* массива элементов (услуг или портфолио), каждый из которых имеет поле `categoryId`, и *для любого* значения фильтра `selectedId`, результат функции `filterByCategory(items, selectedId)` должен содержать только те элементы, у которых `categoryId === selectedId`. Ни один элемент с другим `categoryId` не должен попасть в результат.

**Validates: Requirements 4.2, 8.2**

---

### Property 3: Калькулятор возвращает валидный диапазон цен для корректных параметров

*Для любой* валидной пары `(deviceTypeId, faultTypeId)`, существующей в матрице калькулятора, функция `calculateRepairCost(matrix, params)` должна возвращать объект `CalculatorResult`, в котором `minPrice > 0`, `maxPrice > 0` и `minPrice <= maxPrice`.

**Validates: Requirements 6.1**

---

### Property 4: Калькулятор отказывает при неполных параметрах

*Для любого* объекта `CalculatorParams`, в котором отсутствует хотя бы одно из обязательных полей (`deviceTypeId` или `faultTypeId` равно `null`, `undefined` или пустой строке), функция `calculateRepairCost(matrix, params)` должна возвращать `null` или выбрасывать ошибку валидации — и никогда не возвращать числовой результат.

**Validates: Requirements 6.5**

---

### Property 5: Валидация российского номера телефона

*Для любой* строки `phone`, функция `validateRussianPhone(phone)` должна возвращать `true` тогда и только тогда, когда строка соответствует формату российского мобильного номера: начинается с `+7` или `8`, за которыми следуют ровно 10 цифр (итого 11 цифр). Пробелы, дефисы и скобки в номере должны быть нормализованы перед проверкой. Любая другая строка должна возвращать `false`.

**Validates: Requirements 7.3**

---

### Property 6: Валидация формы записи на ремонт

*Для любого* объекта `RepairFormData`, в котором хотя бы одно из обязательных полей (`name`, `phone`, `serviceId`) является пустой строкой или отсутствует, функция `validateRepairForm(data)` должна возвращать объект ошибок, содержащий ключ для каждого незаполненного обязательного поля. Для полностью заполненной формы с валидными данными функция должна возвращать пустой объект ошибок.

**Validates: Requirements 7.5**

---

### Property 7: Rate limiting форм

*Для любой* последовательности из более чем 5 запросов с одного IP-адреса в течение 10-минутного окна, функция `checkRateLimit(ip, store)` должна возвращать `false` (запрос заблокирован) для каждого запроса, начиная с шестого. Для последовательности из 5 и менее запросов функция должна возвращать `true` (запрос разрешён).

**Validates: Requirements 7.7**

---

### Property 8: Корректность среднего рейтинга отзывов

*Для любого* непустого массива рейтингов `ratings: number[]`, где каждый элемент находится в диапазоне `[1, 5]`, функция `calculateAverageRating(ratings)` должна возвращать значение, которое: (а) не меньше минимального рейтинга в массиве, (б) не больше максимального рейтинга в массиве, (в) равно математическому среднему арифметическому с точностью до двух знаков после запятой.

**Validates: Requirements 9.2**

---

### Property 9: Корректность определения активности акции по дате

*Для любой* акции с полями `startsAt: Date` и `endsAt: Date` (где `startsAt <= endsAt`) и *для любой* даты `currentDate`, функция `isPromotionActive(promotion, currentDate)` должна возвращать `true` тогда и только тогда, когда `startsAt <= currentDate <= endsAt`. Для любой даты за пределами этого диапазона функция должна возвращать `false`.

**Validates: Requirements 14.3, 14.4**

---

## Error Handling

### Стратегия обработки ошибок

#### Публичный сайт

| Сценарий | Обработка |
|---|---|
| Несуществующий slug (`/services/[slug]`) | `notFound()` → кастомная 404 |
| Ошибка запроса к Payload Local API | `try/catch` → fallback UI с сообщением об ошибке |
| Ошибка отправки формы | Отображение inline-ошибки, сохранение данных формы |
| Превышение rate limit | HTTP 429 с сообщением «Слишком много запросов» |
| Невалидные данные формы | Zod validation errors → inline сообщения у полей |
| Ошибка загрузки изображения | Next.js Image fallback + alt-текст |

#### Admin Panel (Payload CMS)

| Сценарий | Обработка |
|---|---|
| Неавторизованный доступ | Редирект на `/admin/login` |
| Загрузка файла неверного формата | Сообщение об ошибке в Media Manager |
| Превышение лимита размера файла | Сообщение об ошибке до загрузки |
| Конфликт slug | Валидационная ошибка с предложением альтернативы |

#### Глобальный Error Boundary

```typescript
// src/app/(public)/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // Логирование в Sentry (опционально)
  // Отображение дружественного сообщения
  // Кнопка «Попробовать снова»
}
```

### Валидация данных

Все входящие данные форм валидируются через **Zod** на сервере (Route Handler) и на клиенте (React Hook Form + Zod resolver):

```typescript
// src/lib/schemas/repair-request.schema.ts
import { z } from 'zod';

export const repairRequestSchema = z.object({
  name:        z.string().min(2).max(100),
  phone:       z.string().regex(/^(\+7|8)\d{10}$/),
  serviceId:   z.string().uuid(),
  description: z.string().max(1000).optional(),
  honeypot:    z.string().max(0),  // должно быть пустым
});
```

---

## Testing Strategy

### Обзор подхода

Проект использует **двойную стратегию тестирования**:
- **Unit/Property тесты** (Vitest + fast-check): чистые функции, валидация, бизнес-логика
- **Integration тесты** (Vitest + Payload test utils): API маршруты, CMS операции
- **E2E тесты** (Playwright): критические пользовательские сценарии

### Конфигурация Property-Based тестов

Библиотека: **fast-check** (TypeScript-first, активно поддерживается)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

```typescript
// Пример property-теста
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { calculateRepairCost } from '@/lib/calculator';

// Feature: kiro-service-website, Property 3: Calculator returns valid price range
describe('Calculator', () => {
  it('возвращает валидный диапазон цен для любых корректных параметров', () => {
    fc.assert(
      fc.property(
        fc.record({
          deviceTypeId: fc.constantFrom('smartphone', 'laptop', 'tablet'),
          faultTypeId:  fc.constantFrom('screen', 'battery', 'charging'),
        }),
        (params) => {
          const result = calculateRepairCost(testMatrix, params);
          return (
            result !== null &&
            result.minPrice > 0 &&
            result.maxPrice > 0 &&
            result.minPrice <= result.maxPrice
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Структура тестов

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── calculator.test.ts          # Property 3, 4
│   │   ├── phone-validation.test.ts    # Property 5
│   │   ├── repair-form.test.ts         # Property 6
│   │   ├── rate-limiter.test.ts        # Property 7
│   │   ├── reviews.test.ts             # Property 8
│   │   ├── promotions.test.ts          # Property 9
│   │   ├── brand-config.test.ts        # Property 1
│   │   └── filter.test.ts              # Property 2
│   ├── integration/
│   │   ├── repair-request-api.test.ts
│   │   ├── payload-collections.test.ts
│   │   └── revalidation.test.ts
│   └── e2e/
│       ├── homepage.spec.ts
│       ├── repair-form.spec.ts
│       ├── calculator.spec.ts
│       └── admin-auth.spec.ts
```

### Покрытие по требованиям

| Требование | Тип теста | Файл |
|---|---|---|
| 1.3 Brand_Config | Property (P1) | `brand-config.test.ts` |
| 4.2 Фильтрация услуг | Property (P2) | `filter.test.ts` |
| 6.1 Калькулятор (валидный результат) | Property (P3) | `calculator.test.ts` |
| 6.5 Калькулятор (неполные параметры) | Property (P4) | `calculator.test.ts` |
| 7.3 Валидация телефона | Property (P5) | `phone-validation.test.ts` |
| 7.5 Валидация формы | Property (P6) | `repair-form.test.ts` |
| 7.7 Rate limiting | Property (P7) | `rate-limiter.test.ts` |
| 8.2 Фильтрация портфолио | Property (P2) | `filter.test.ts` |
| 9.2 Средний рейтинг | Property (P8) | `reviews.test.ts` |
| 14.3–14.4 Активность акции | Property (P9) | `promotions.test.ts` |
| 2.x Навигация | E2E | `homepage.spec.ts` |
| 7.4 Отправка формы | Integration | `repair-request-api.test.ts` |
| 18.x Авторизация | E2E | `admin-auth.spec.ts` |
| 15.x SEO | Integration | `payload-collections.test.ts` |

### Конфигурация fast-check

- **numRuns**: минимум 100 итераций для каждого property-теста
- **seed**: фиксированный seed для воспроизводимости при CI-сбоях
- **Тег формата**: каждый тест содержит комментарий `// Feature: kiro-service-website, Property N: <текст свойства>`

### Unit тесты (примеры)

```typescript
// Feature: kiro-service-website, Property 5: Russian phone validation
describe('validateRussianPhone', () => {
  it('принимает любой валидный российский номер', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom('+7', '8'),
          fc.stringOf(fc.digit(), { minLength: 10, maxLength: 10 })
        ),
        ([prefix, digits]) => validateRussianPhone(`${prefix}${digits}`) === true
      ),
      { numRuns: 100 }
    );
  });

  it('отклоняет любую невалидную строку', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !/^(\+7|8)\d{10}$/.test(s.replace(/[\s\-()]/g, ''))),
        (phone) => validateRussianPhone(phone) === false
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// Feature: kiro-service-website, Property 9: Promotion active date range
describe('isPromotionActive', () => {
  it('активна тогда и только тогда, когда дата в диапазоне', () => {
    fc.assert(
      fc.property(
        fc.record({
          startsAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
          endsAt:   fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          current:  fc.date({ min: new Date('2019-01-01'), max: new Date('2031-12-31') }),
        }).filter(({ startsAt, endsAt }) => startsAt <= endsAt),
        ({ startsAt, endsAt, current }) => {
          const expected = current >= startsAt && current <= endsAt;
          return isPromotionActive({ startsAt, endsAt }, current) === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### E2E тесты (Playwright)

Критические сценарии:
1. Посетитель заполняет и отправляет форму записи → редирект на `/thank-you`
2. Посетитель использует калькулятор → видит диапазон цен → нажимает «Записаться»
3. Посетитель фильтрует портфолио по услуге → видит только релевантные работы
4. Редактор входит в Admin Panel → создаёт услугу → публикует → видит на сайте
5. Переключение темы → сохранение в localStorage → применение при следующем визите

---

## Deployment

### Переменные окружения

```bash
# .env.example

# База данных
DATABASE_URL=                    # Пусто = SQLite; postgresql://... = PostgreSQL

# Payload CMS
PAYLOAD_SECRET=                  # Случайная строка 32+ символа
NEXT_PUBLIC_SITE_URL=            # https://kiro-service.ru

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Карты (одно из двух)
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Revalidation
REVALIDATION_SECRET=             # Секрет для webhook on-demand revalidation
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.9'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/kiro
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kiro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Vercel + Railway

1. **Railway**: деплой PostgreSQL → получить `DATABASE_URL`
2. **Vercel**: импорт репозитория → добавить переменные окружения → деплой
3. **On-demand revalidation**: настроить Payload webhook → `POST /api/revalidate` при публикации

### Переключение SQLite → PostgreSQL

```bash
# Только изменить одну переменную:
DATABASE_URL=postgresql://user:pass@host:5432/kiro

# Запустить миграцию Payload:
npx payload migrate
```

---

## Дополнительные технические решения

### Темизация (next-themes)

```typescript
// src/app/(public)/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` предотвращает FOUC (flash of unstyled content) при гидратации.

### JSON-LD структурированные данные

```typescript
// src/components/seo/JsonLd.tsx
export function LocalBusinessJsonLd({ settings }: { settings: SiteSettings }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.companyName,
    telephone: settings.phones?.[0]?.number,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.addresses?.[0]?.address,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
```

### On-demand ISR Revalidation

```typescript
// src/payload/hooks/revalidate.ts
import { revalidatePath } from 'next/cache';

export const revalidateAfterChange = async ({ doc, collection }: AfterChangeHookArgs) => {
  switch (collection.slug) {
    case 'services':
      revalidatePath('/services');
      revalidatePath(`/services/${doc.slug}`);
      break;
    case 'blog':
      revalidatePath('/blog');
      revalidatePath(`/blog/${doc.slug}`);
      break;
    // ...
  }
};
```

### Роли пользователей Payload

```typescript
// src/payload/collections/Users.ts
const isAdmin = ({ req: { user } }: AccessArgs) => user?.role === 'admin';
const isAdminOrEditor = ({ req: { user } }: AccessArgs) =>
  user?.role === 'admin' || user?.role === 'editor';

// Редактор не может управлять пользователями
access: {
  read:   isAdminOrEditor,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}
```
