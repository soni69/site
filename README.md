# KIRO Service Website

Production-ready сайт для сервисного центра по ремонту техники. Монорепозиторий: публичный сайт на **Next.js 15+** (App Router) и административная панель на **Payload CMS 3.x** в одном проекте. Владелец бизнеса управляет всем контентом через визуальный интерфейс без написания кода.

## Технологический стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15+ (App Router, React 19) |
| Язык | TypeScript 5.x (strict mode) |
| Стили | Tailwind CSS 3.x + shadcn/ui |
| CMS | Payload CMS 3.x |
| БД (по умолчанию) | SQLite (`@payloadcms/db-sqlite`) |
| БД (production) | PostgreSQL (`@payloadcms/db-postgres`) |
| Авторизация | Payload built-in (email + password) + Google OAuth (опционально) |
| Темизация | next-themes |
| Деплой | Vercel + Railway / Docker Compose |
| Тестирование | Vitest + fast-check (PBT) + Playwright (E2E) |

---

## Локальный запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd site
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

```bash
cp .env.example .env
```

Откройте `.env` и заполните необходимые переменные (см. раздел [Переменные окружения](#переменные-окружения) ниже). Для локального запуска достаточно задать `PAYLOAD_SECRET` и `REVALIDATION_SECRET`.

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу:
- Публичный сайт: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`

---

## Переменные окружения

Все переменные описаны в `.env.example`. Скопируйте файл в `.env` и заполните значения.

### `DATABASE_URL`

Строка подключения к базе данных.

- **SQLite (по умолчанию):** оставьте пустым или укажите путь к файлу: `file:./database.db`
- **PostgreSQL:** `postgresql://user:password@host:5432/dbname`

Если переменная не задана, используется SQLite с файлом `database.db` в корне проекта.

### `PAYLOAD_SECRET`

Секретный ключ для подписи JWT-токенов Payload CMS. Должен быть длинной случайной строкой (32+ символа). Обязателен.

```
PAYLOAD_SECRET=your-very-long-random-secret-string-here
```

### `NEXT_PUBLIC_SITE_URL`

Публичный URL сайта. Используется для формирования канонических URL, Open Graph-тегов и sitemap.

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

В production укажите реальный домен: `https://your-domain.com`

### `REVALIDATION_SECRET`

Секретный токен для webhook-эндпоинта `/api/revalidate`. Payload CMS вызывает этот эндпоинт при публикации контента для инвалидации ISR-кэша. Обязателен.

```
REVALIDATION_SECRET=another-random-secret-string
```

### `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`

Учётные данные OAuth 2.0 для входа через Google в Admin Panel. Опциональны — если не заданы, кнопка «Войти через Google» не отображается.

Для получения: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID.

Authorized redirect URI: `{NEXT_PUBLIC_SITE_URL}/api/users/oauth/google/callback`

### `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`

API-ключ Яндекс.Карт для встраивания карты на странице контактов. Опционален.

### `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

API-ключ Google Maps для встраивания карты на странице контактов. Опционален.

---

## Первый вход в Admin Panel

При первом запуске база данных пуста и пользователей нет. Payload CMS автоматически предложит создать первого администратора.

1. Запустите приложение: `npm run dev`
2. Откройте `http://localhost:3000/admin`
3. Payload CMS покажет форму создания первого пользователя — заполните имя, email и пароль
4. После создания вы будете автоматически авторизованы

Первый созданный пользователь получает роль `admin` с полным доступом ко всем коллекциям.

---

## Деплой на Vercel + Railway

В монорепо-режиме Payload CMS встроен в Next.js, поэтому оба деплоятся вместе на Vercel. Railway используется только для PostgreSQL.

### Шаг 1: Создать базу данных на Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый проект: **New Project → Provision PostgreSQL**
3. Перейдите в настройки базы данных → вкладка **Connect**
4. Скопируйте строку подключения в формате `postgresql://...`

### Шаг 2: Задеплоить приложение на Vercel

1. Зарегистрируйтесь на [vercel.com](https://vercel.com) и подключите репозиторий
2. Создайте новый проект: **Add New → Project → Import Git Repository**
3. Vercel автоматически определит Next.js — нажмите **Deploy**

### Шаг 3: Настроить переменные окружения на Vercel

В настройках проекта Vercel → **Settings → Environment Variables** добавьте:

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | Строка подключения PostgreSQL с Railway |
| `PAYLOAD_SECRET` | Случайная строка 32+ символа |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |
| `REVALIDATION_SECRET` | Случайная строка |
| `GOOGLE_CLIENT_ID` | (опционально) |
| `GOOGLE_CLIENT_SECRET` | (опционально) |

### Шаг 4: Применить миграции и передеплоить

После добавления переменных запустите повторный деплой — Payload CMS автоматически применит миграции при старте.

### Шаг 5: Создать первого пользователя

Откройте `https://your-project.vercel.app/admin` и создайте первого администратора (см. раздел [Первый вход в Admin Panel](#первый-вход-в-admin-panel)).

---

## Деплой через Docker Compose

### Предварительные требования

- Docker 24+
- Docker Compose v2

### Шаг 1: Подготовить переменные окружения

```bash
cp .env.example .env
```

Заполните в `.env`:

```dotenv
PAYLOAD_SECRET=your-very-long-random-secret
REVALIDATION_SECRET=another-random-secret
NEXT_PUBLIC_SITE_URL=http://your-server-ip-or-domain

# PostgreSQL (используется docker-compose автоматически)
POSTGRES_DB=kiro_db
POSTGRES_USER=kiro_user
POSTGRES_PASSWORD=your-secure-db-password
```

### Шаг 2: Собрать и запустить контейнеры

```bash
docker compose up -d --build
```

Это запустит три сервиса:
- `postgres` — PostgreSQL 16
- `app` — Next.js + Payload CMS (порт 3000, внутренний)
- `nginx` — Reverse proxy (порты 80 и 443)

### Шаг 3: Проверить статус

```bash
docker compose ps
docker compose logs app
```

### Шаг 4: Настроить Nginx

Скопируйте конфигурацию Nginx в `./nginx/conf.d/` и перезапустите:

```bash
docker compose restart nginx
```

Для HTTPS смонтируйте SSL-сертификаты в `./nginx/certs/` и обновите конфигурацию Nginx.

### Шаг 5: Создать первого пользователя

Откройте `http://your-server-ip/admin` и создайте первого администратора.

### Полезные команды

```bash
# Остановить контейнеры
docker compose down

# Остановить и удалить тома (ВНИМАНИЕ: удалит данные БД)
docker compose down -v

# Пересобрать образ после изменений кода
docker compose up -d --build app

# Просмотр логов в реальном времени
docker compose logs -f app
```

---

## Переключение SQLite → PostgreSQL

По умолчанию проект использует SQLite — удобно для разработки и небольших нагрузок. Для production рекомендуется PostgreSQL.

### Шаг 1: Обновить `DATABASE_URL`

В файле `.env` замените значение переменной:

```dotenv
# Было (SQLite):
DATABASE_URL=file:./database.db

# Стало (PostgreSQL):
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Шаг 2: Применить миграции

```bash
npx payload migrate
```

Payload CMS автоматически определит адаптер по формату `DATABASE_URL` и создаст все необходимые таблицы.

### Шаг 3: Перезапустить приложение

```bash
npm run dev
# или в production:
npm run build && npm start
```

> Данные из SQLite не переносятся автоматически. Если нужна миграция данных, используйте Payload Local API для экспорта/импорта или pg_dump/pg_restore.

---

## Запуск тестов

### Unit и property-based тесты (Vitest + fast-check)

```bash
# Однократный запуск всех тестов
npx vitest --run

# Или через npm-скрипт
npm test

# Режим наблюдения (перезапуск при изменениях)
npm run test:watch
```

Тесты находятся в `src/__tests__/unit/` и `src/__tests__/integration/`.

### E2E тесты (Playwright)

```bash
# Установить браузеры (один раз)
npx playwright install

# Запустить все E2E тесты
npx playwright test

# Или через npm-скрипт
npm run test:e2e

# Запустить с UI-режимом для отладки
npx playwright test --ui
```

E2E тесты находятся в `src/__tests__/e2e/`. Перед запуском убедитесь, что приложение запущено (`npm run dev`) или настройте `baseURL` в `playwright.config.ts`.

### Проверка типов и линтинг

```bash
# TypeScript
npx tsc --noEmit

# ESLint
npx eslint src/
```
