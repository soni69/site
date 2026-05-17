import { BRAND_CONFIG } from '@/config/brand'

/**
 * Returns the company name from the provided settings object.
 * Falls back to BRAND_CONFIG.companyName if settings.companyName is empty or null.
 */
export function getBrandName(settings: { companyName?: string | null }): string {
  if (settings.companyName && settings.companyName.trim() !== '') {
    return settings.companyName
  }
  return BRAND_CONFIG.companyName
}
