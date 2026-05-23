/**
 * Удаляет всех пользователей и создаёт нового админа с известным паролем.
 * Использует Payload API чтобы пароль захешировался правильно.
 *
 * Usage: node scripts/reset-admin.mjs <username> <password>
 */
import { getPayload } from 'payload'
import config from '../src/payload/payload.config.ts'

const username = process.argv[2] ?? 'admin'
const password = process.argv[3] ?? 'admin12345'

const payload = await getPayload({ config })

// Удаляем всех существующих пользователей
const existing = await payload.find({ collection: 'users', limit: 1000 })
for (const user of existing.docs) {
  await payload.delete({ collection: 'users', id: user.id })
  console.log(`Deleted user ${user.id}`)
}

// Создаём нового админа
const newUser = await payload.create({
  collection: 'users',
  data: {
    username,
    password,
    role: 'admin',
  },
})

console.log(`\n✅ Created admin user:`)
console.log(`   Username: ${username}`)
console.log(`   Password: ${password}`)
console.log(`   ID: ${newUser.id}`)

process.exit(0)
