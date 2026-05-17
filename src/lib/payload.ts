import { getPayload as getPayloadInstance } from 'payload'
import config from '@payload-config'

/**
 * Returns a Payload Local API client instance.
 * Uses the singleton pattern — safe to call multiple times.
 *
 * Usage:
 *   const payload = await getPayload()
 *   const services = await payload.find({ collection: 'services' })
 */
export async function getPayload() {
  return getPayloadInstance({ config })
}
