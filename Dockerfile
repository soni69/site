# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:22-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# NEXT_PUBLIC_ переменные вшиваются в бандл при сборке
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# DATABASE_URL нужен при сборке чтобы Payload выбрал PostgreSQL адаптер
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}

RUN npm run build

# ─── Stage 3: runner (full mode — не standalone) ─────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Копируем всё необходимое для запуска (не standalone)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/postcss.config.js ./postcss.config.js

RUN mkdir -p public/media && chown nextjs:nodejs public/media
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
