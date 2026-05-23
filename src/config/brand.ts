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
  tagline: 'Ремонт смартфонов, ноутбуков и планшетов в день обращения',
  phones: [
    { label: 'Основной', number: '+7 (495) 123-45-67' },
    { label: 'Бесплатно', number: '+7 (800) 555-35-35' },
  ],
  email: 'info@kiro-service.ru',
  addresses: [
    {
      label: 'Главный офис',
      address: 'г. Москва, ул. Тверская, д. 15, стр. 2',
      mapUrl: 'https://yandex.ru/maps/?text=Москва%2C+ул.+Тверская%2C+д.+15',
    },
    {
      label: 'Сервисный центр',
      address: 'г. Москва, ул. Арбат, д. 28',
      mapUrl: 'https://yandex.ru/maps/?text=Москва%2C+ул.+Арбат%2C+д.+28',
    },
  ],
  workingHours: 'Пн–Пт: 9:00–20:00, Сб–Вс: 10:00–18:00',
  whatsappNumber: '74951234567',
  whatsappMessage: 'Здравствуйте! Хочу записаться на ремонт техники.',
  socialLinks: {
    vk: 'https://vk.com/kiro_service',
    telegram: 'https://t.me/kiro_service',
  },
  primaryColor: '#2563eb',
  logoUrl: '/logo-generated-1.png',
}
