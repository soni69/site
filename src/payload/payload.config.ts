import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { SiteSettings } from './globals/SiteSettings'
import { Media } from './collections/Media'
import Users from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Determine database adapter based on DATABASE_URL
const databaseURL = process.env.DATABASE_URL

function getDatabaseAdapter() {
  if (
    databaseURL?.startsWith('postgresql://') ||
    databaseURL?.startsWith('postgres://')
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { postgresAdapter } = require('@payloadcms/db-postgres')
    return postgresAdapter({
      pool: {
        connectionString: databaseURL,
      },
    })
  }

  // Default: SQLite (when DATABASE_URL is not set or starts with "file:")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { sqliteAdapter } = require('@payloadcms/db-sqlite')
  return sqliteAdapter({
    client: {
      url: databaseURL ?? `file:${path.resolve(dirname, '../../database.db')}`,
    },
  })
}

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Users,
    Media,
  ],
  globals: [
    SiteSettings,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? 'default-secret-change-in-production',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },
  db: getDatabaseAdapter(),
  sharp: undefined,
})
