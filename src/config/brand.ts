/**
 * Static fallback Brand_Config.
 * Used when Payload CMS is unavailable or during build time.
 * Override these values via the Admin Panel → Site Settings.
 */

export interface BrandAddress {
  label: string
  address: string
  mapUrl?: string
  lat?: number
  lng?: number
}

export interface BrandPhone {
  label: string
  number: string
}

export interface BrandSocialLinks {
  vk?: string
  telegram?: string
  instagram?: string
}

export interface BrandConfig {
  companyName: string
  tagline: string
  phones: BrandPhone[]
  email: string
  addresses: BrandAddress[]
  workingHours: string
  whatsappNumber: string
  whatsappMessage: string
  socialLinks: BrandSocialLinks
  primaryColor: string
  logoUrl?: string
}

export const BRAND_CONFIG: BrandConfig = {
  companyName: 'KIRO Сервис',
  tagline: 'Профессиональный ремонт техники',
  phones: [
    { label: 'Основной', number: '+7 (000) 000-00-00' },
  ],
  email: 'info@kiro-service.ru',
  addresses: [
    {
      label: 'Главный офис',
      address: 'г. Москва, ул. Примерная, д. 1',
    },
  ],
  workingHours: 'Пн–Пт: 9:00–20:00, Сб–Вс: 10:00–18:00',
  whatsappNumber: '70000000000',
  whatsappMessage: 'Здравствуйте! Хочу записаться на ремонт.',
  socialLinks: {
    vk: '',
    telegram: '',
    instagram: '',
  },
  primaryColor: '#2563eb',
}
