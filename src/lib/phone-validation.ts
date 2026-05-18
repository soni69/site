/**
 * Validates a Russian phone number.
 *
 * Accepted formats (before normalization):
 *   +7 (XXX) XXX-XX-XX
 *   8 (XXX) XXX-XX-XX
 *   +7XXXXXXXXXX
 *   8XXXXXXXXXX
 *   and any combination with spaces, dashes, or parentheses
 *
 * The function normalizes the input by stripping spaces, dashes, and
 * parentheses, then checks that the result matches either:
 *   +7 followed by exactly 10 digits, or
 *   8  followed by exactly 10 digits
 *
 * @param phone - Raw phone string provided by the user
 * @returns `true` if the phone is a valid Russian mobile number, `false` otherwise
 */
export function validateRussianPhone(phone: string): boolean {
  // Normalize: remove spaces, dashes, and parentheses
  const normalized = phone.replace(/[\s\-()]/g, '')

  // Match +7XXXXXXXXXX or 8XXXXXXXXXX (exactly 10 digits after the prefix)
  return /^(\+7|8)\d{10}$/.test(normalized)
}
