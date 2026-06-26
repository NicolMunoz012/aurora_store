// =============================================================================
// lib/validations/utils.ts
// Validation and sanitization utility functions
// =============================================================================

/**
 * Sanitizes phone input: removes spaces, dashes, parentheses, and other non-digit characters
 * Useful for real-time input formatting
 */
export function sanitizePhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

/**
 * Formats a Colombian phone number for display
 * Input: "3001234567"
 * Output: "300 123 4567"
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = sanitizePhone(phone);
  if (cleaned.length !== 10) return cleaned;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

/**
 * Validates name input character by character
 * Prevents numbers and special symbols from being typed
 */
export function isValidNameCharacter(char: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'\s-]$/.test(char);
}

/**
 * Sanitizes name input by removing invalid characters
 */
export function sanitizeName(value: string): string {
  return value
    .split("")
    .filter((char) => isValidNameCharacter(char))
    .join("");
}

/**
 * Validates address number input character by character
 * Only allows digits, spaces, and hyphens
 */
export function isValidAddressNumberCharacter(char: string): boolean {
  return /^[0-9\s-]$/.test(char);
}

/**
 * Sanitizes address number input
 */
export function sanitizeAddressNumber(value: string): string {
  return value
    .split("")
    .filter((char) => isValidAddressNumberCharacter(char))
    .join("");
}

/**
 * Trims and normalizes whitespace in a string
 */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Validates email format (basic check)
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
