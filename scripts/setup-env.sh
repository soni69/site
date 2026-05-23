#!/bin/bash
# Скрипт генерации .env для production
# Запускать один раз на сервере: bash scripts/setup-env.sh

set -e

if [ -f .env ]; then
  echo "⚠️  Файл .env уже существует. Удалите его вручную если хотите пересоздать."
  exit 1
fi

# Генерируем случайные секреты
PAYLOAD_SECRET=$(openssl rand -hex 32)
REVALIDATION_SECRET=$(openssl rand -hex 24)
POSTGRES_PASSWORD=$(openssl rand -hex 16)

cat > .env << EOF
# ─── Database ────────────────────────────────────────────────────────────────
POSTGRES_DB=site_db
POSTGRES_USER=site_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# ─── Payload CMS ─────────────────────────────────────────────────────────────
PAYLOAD_SECRET=${PAYLOAD_SECRET}

# ─── Next.js ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://stop-lyst.ru

# ─── On-demand revalidation ──────────────────────────────────────────────────
REVALIDATION_SECRET=${REVALIDATION_SECRET}

# ─── Google OAuth (optional) ─────────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Maps (optional) ─────────────────────────────────────────────────────────
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
EOF

echo "✅ Файл .env создан с безопасными случайными секретами"
echo ""
echo "POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}"
echo "PAYLOAD_SECRET:    ${PAYLOAD_SECRET}"
echo "REVALIDATION_SECRET: ${REVALIDATION_SECRET}"
echo ""
echo "⚠️  Сохрани эти значения в надёжном месте!"
