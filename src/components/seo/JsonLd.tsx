/**
 * JSON-LD structured data components for SEO.
 *
 * Provides LocalBusiness and Service schema markup as per schema.org spec.
 * Injected via <script type="application/ld+json"> in page <head>.
 *
 * Requirements: 15.5
 */

import type { BrandConfig } from '@/config/brand'

// ─── LocalBusiness JSON-LD ────────────────────────────────────────────────────

interface LocalBusinessJsonLdProps {
  brand: BrandConfig
  /** Canonical URL of the homepage, e.g. "https://kiro-service.ru" */
  siteUrl: string
  /** Optional logo URL */
  logoUrl?: string | null
}

/**
 * Renders a LocalBusiness JSON-LD script tag for the homepage.
 *
 * Schema: https://schema.org/LocalBusiness
 */
export function LocalBusinessJsonLd({
  brand,
  siteUrl,
  logoUrl,
}: LocalBusinessJsonLdProps) {
  const primaryPhone = brand.phones[0]?.number ?? ''
  const primaryAddress = brand.addresses[0]

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.companyName,
    description: brand.tagline,
    url: siteUrl,
    telephone: primaryPhone,
    email: brand.email,
    openingHours: brand.workingHours,
    priceRange: '₽₽',
  }

  if (primaryAddress) {
    jsonLd['address'] = {
      '@type': 'PostalAddress',
      streetAddress: primaryAddress.address,
      addressCountry: 'RU',
    }
  }

  if (logoUrl) {
    jsonLd['logo'] = {
      '@type': 'ImageObject',
      url: logoUrl,
    }
    jsonLd['image'] = logoUrl
  }

  // Multiple addresses as additional locations
  if (brand.addresses.length > 1) {
    jsonLd['location'] = brand.addresses.map((addr) => ({
      '@type': 'Place',
      name: addr.label,
      address: {
        '@type': 'PostalAddress',
        streetAddress: addr.address,
        addressCountry: 'RU',
      },
    }))
  }

  // Social profiles
  const sameAs: string[] = []
  if (brand.socialLinks.vk) sameAs.push(brand.socialLinks.vk)
  if (brand.socialLinks.telegram) sameAs.push(brand.socialLinks.telegram)
  if (brand.socialLinks.instagram) sameAs.push(brand.socialLinks.instagram)
  if (sameAs.length > 0) {
    jsonLd['sameAs'] = sameAs
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ─── Service JSON-LD ──────────────────────────────────────────────────────────

interface ServiceJsonLdProps {
  /** Service name */
  name: string
  /** Service description */
  description: string
  /** Canonical URL of the service page */
  url: string
  /** Provider (business) name */
  providerName: string
  /** Provider URL */
  providerUrl: string
  /** Optional starting price in RUB */
  priceFrom?: number | null
  /** Optional OG image URL */
  imageUrl?: string | null
}

/**
 * Renders a Service JSON-LD script tag for individual service pages.
 *
 * Schema: https://schema.org/Service
 */
export function ServiceJsonLd({
  name,
  description,
  url,
  providerName,
  providerUrl,
  priceFrom,
  imageUrl,
}: ServiceJsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: {
      '@type': 'LocalBusiness',
      name: providerName,
      url: providerUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Russia',
    },
  }

  if (priceFrom !== null && priceFrom !== undefined) {
    jsonLd['offers'] = {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: priceFrom,
      availability: 'https://schema.org/InStock',
    }
  }

  if (imageUrl) {
    jsonLd['image'] = imageUrl
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
