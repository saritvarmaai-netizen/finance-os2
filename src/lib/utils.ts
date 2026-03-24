// src/lib/utils.ts

/**
 * Formats a number as Indian Rupee (INR) currency.
 * @param n The number to format.
 * @param compact Whether to use compact notation (e.g., 1.2L, 1.5Cr).
 * @returns The formatted currency string.
 */
export function fmt(n: number, compact = false): string {
  // Handle edge cases
  if (n === undefined || n === null || isNaN(n)) return '₹0'
  if (n === 0) return '₹0'

  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (compact) {
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`
    return `${sign}₹${abs}`
  }

  // Indian number formatting: 1,00,000
  const formatted = abs.toLocaleString('en-IN')
  return `${sign}₹${formatted}`
}

/**
 * Alias for fmt (backward compatibility)
 */
export const formatINR = fmt

/**
 * Format a percentage with sign
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Format a date string
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Get entity color variable
 */
export function getEntityColor(entity: string): string {
  const map: Record<string, string> = {
    personal: 'var(--personal)',
    huf: 'var(--huf)',
    firm: 'var(--firm)',
  }
  return map[entity] || 'var(--text2)'
}

/**
 * Combines multiple class names into a single string.
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
