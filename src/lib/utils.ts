import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx and tailwind-merge for conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Filters an array of items by their `categoryId` field.
 *
 * Returns only those items whose `categoryId` strictly equals `selectedId`.
 * An empty array is returned when no items match.
 *
 * @param items      - Array of items that each carry a `categoryId` string field
 * @param selectedId - The category identifier to filter by
 * @returns Filtered array containing only items with `categoryId === selectedId`
 *
 * Validates: Requirements 4.2, 8.2
 */
export function filterByCategory<T extends { categoryId: string }>(
  items: T[],
  selectedId: string,
): T[] {
  return items.filter((item) => item.categoryId === selectedId)
}

/**
 * Calculates the arithmetic mean of an array of ratings, rounded to 2 decimal places.
 *
 * Returns `0` for an empty array to avoid division-by-zero.
 *
 * @param ratings - Array of numeric rating values (expected range 1–5)
 * @returns Average rating rounded to 2 decimal places, or `0` for an empty array
 *
 * Validates: Requirements 9.2
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, r) => acc + r, 0)
  return Math.round((sum / ratings.length) * 100) / 100
}

/**
 * Determines whether a promotion is currently active.
 *
 * A promotion is considered active when `startsAt <= currentDate <= endsAt`.
 * Both boundary dates are inclusive.
 *
 * @param promotion   - Object with `startsAt` and `endsAt` Date fields
 * @param currentDate - The date to check against the promotion window
 * @returns `true` if the promotion is active on `currentDate`, `false` otherwise
 *
 * Validates: Requirements 14.3, 14.4
 */
export function isPromotionActive(
  promotion: { startsAt: Date; endsAt: Date },
  currentDate: Date,
): boolean {
  return currentDate >= promotion.startsAt && currentDate <= promotion.endsAt
}
