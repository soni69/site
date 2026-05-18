import { BRAND_CONFIG } from '@/config/brand'

/**
 * Minimal shape of SiteSettings required by brand utilities.
 * Compatible with the Payload-generated SiteSettings type (payload-types.ts).
 */
export interface SiteSettingsInput {
  companyName?: string | null
  tagline?: string | null
  whatsappNumber?: string | null
  whatsappMessage?: string | null
  primaryColor?: string | null
}

/**
 * Returns the company name from the provided SiteSettings object.
 *
 * Per Requirement 1.3: the website must read the company name exclusively
 * from Brand_Config and must not hard-code it in components.
 *
 * Per Property 1: for any non-empty companyName stored in SiteSettings,
 * this function returns that exact string — without modification, trimming,
 * or substituting a default value.
 *
 * Falls back to BRAND_CONFIG.companyName only when settings.companyName is
 * absent, null, or an empty/whitespace-only string.
 */
export function getBrandName(settings: SiteSettingsInput): string {
  if (settings.companyName && settings.companyName.trim() !== '') {
    return settings.companyName
  }
  return BRAND_CONFIG.companyName
}

/**
 * Returns the tagline from SiteSettings, falling back to BRAND_CONFIG.tagline.
 */
export function getBrandTagline(settings: SiteSettingsInput): string {
  if (settings.tagline && settings.tagline.trim() !== '') {
    return settings.tagline
  }
  return BRAND_CONFIG.tagline
}

/**
 * Returns the WhatsApp number from SiteSettings, falling back to BRAND_CONFIG.
 */
export function getWhatsAppNumber(settings: SiteSettingsInput): string {
  if (settings.whatsappNumber && settings.whatsappNumber.trim() !== '') {
    return settings.whatsappNumber
  }
  return BRAND_CONFIG.whatsappNumber
}

/**
 * Returns the WhatsApp pre-filled message from SiteSettings, falling back to BRAND_CONFIG.
 */
export function getWhatsAppMessage(settings: SiteSettingsInput): string {
  if (settings.whatsappMessage && settings.whatsappMessage.trim() !== '') {
    return settings.whatsappMessage
  }
  return BRAND_CONFIG.whatsappMessage
}

/**
 * Returns the primary brand color from SiteSettings, falling back to BRAND_CONFIG.
 */
export function getPrimaryColor(settings: SiteSettingsInput): string {
  if (settings.primaryColor && settings.primaryColor.trim() !== '') {
    return settings.primaryColor
  }
  return BRAND_CONFIG.primaryColor
}
