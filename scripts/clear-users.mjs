import Database from 'libsql'
import path from 'path'

const dbPath = path.resolve('database.db')
const db = new Database(dbPath)

const before = db.prepare('SELECT COUNT(*) as c FROM users').get()
console.log(`Users before: ${before.c}`)

db.exec('DELETE FROM users_sessions')
db.exec('DELETE FROM users')

const after = db.prepare('SELECT COUNT(*) as c FROM users').get()
console.log(`Users after: ${after.c}`)

db.close()
