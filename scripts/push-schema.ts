import config from '../src/payload/payload.config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  console.log('Schema pushed successfully')
  process.exit(0)
}

main().catch((e) => {
  console.error('Schema push failed:', e)
  process.exit(1)
})
