import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { SiteSettings } from './globals/SiteSettings'
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

// Google OAuth plugin — activated only when both env vars are set (Requirement 18.2)
function getPlugins() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  const isGoogleOAuthEnabled =
    typeof googleClientId === 'string' &&
    googleClientId.length > 0 &&
    typeof googleClientSecret === 'string' &&
    googleClientSecret.length > 0

  if (!isGoogleOAuthEnabled) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { OAuth2Plugin } = require('payload-oauth2')

  return [
    OAuth2Plugin({
      enabled: true,
      strategyName: 'google',
      useEmailAsIdentity: true,
      serverURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorizePath: '/oauth/google',
      callbackPath: '/oauth/google/callback',
      authCollection: 'users',
      onUserNotFoundBehavior: 'error',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      providerAuthorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      getUserInfo: async (accessToken: string) => {
        const response = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        const user = (await response.json()) as { email: string; sub: string }
        return { email: user.email, sub: user.sub }
      },
    }),
  ]
}

export default buildConfig({
  admin: {
    user: 'users',
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
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? 'default-secret-change-in-production',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },
  db: getDatabaseAdapter(),
  sharp,
  plugins: getPlugins(),
})
