import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { ru } from '@payloadcms/translations/languages/ru'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { SiteSettings } from './globals/SiteSettings'
import { CalculatorMatrix } from './globals/CalculatorMatrix'
import { Theme } from './globals/Theme'
import { Media } from './collections/Media'
import Users from './collections/Users'
import Blog from './collections/Blog'
import Portfolio from './collections/Portfolio'
import Reviews from './collections/Reviews'
import Promotions from './collections/Promotions'
import RepairRequests from './collections/RepairRequests'
import PriceList from './collections/PriceList'
import TeamMembers from './collections/TeamMembers'
import ServiceCategories from './collections/ServiceCategories'
import Services from './collections/Services'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURL = process.env.DATABASE_URL

function getDatabaseAdapter() {
  // В production ВСЕГДА используем PostgreSQL
  // DATABASE_URL задаётся через docker-compose в runtime
  if (process.env.NODE_ENV === 'production') {
    return postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/payload',
      },
      push: true,
    })
  }

  // Локальная разработка — SQLite или PostgreSQL в зависимости от DATABASE_URL
  if (
    databaseURL?.startsWith('postgresql://') ||
    databaseURL?.startsWith('postgres://')
  ) {
    return postgresAdapter({
      pool: {
        connectionString: databaseURL,
      },
      push: true,
    })
  }

  // SQLite для локальной разработки
  const dbPath = databaseURL ?? `file:${path.resolve(dirname, '../../database.db')}`

  return sqliteAdapter({
    client: {
      url: dbPath,
    },
    push: true,
  })
}

function getPlugins() {
  return []
}

export default buildConfig({
  admin: {
    user: 'users',
    components: {
      providers: [
        '@/payload/components/AdminTheme#AdminTheme',
      ],
    },
  },
  collections: [
    Users,
    Media,
    ServiceCategories,
    Services,
    Blog,
    Portfolio,
    Reviews,
    Promotions,
    RepairRequests,
    PriceList,
    TeamMembers,
  ],
  globals: [
    SiteSettings,
    CalculatorMatrix,
    Theme,
  ],
  editor: lexicalEditor({}),
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  secret: process.env.PAYLOAD_SECRET ?? 'default-secret-change-in-production',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },
  db: getDatabaseAdapter(),
  sharp,
  plugins: getPlugins(),
})
