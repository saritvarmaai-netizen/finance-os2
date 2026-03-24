// src/lib/utils.ts

/**
 * Formats a number as Indian Rupee (INR) currency.
 * @param n The number to format.
 * @param compact Whether to use compact notation (e.g., 1.25L, 2.5Cr).
 * @returns The formatted currency string.
 */
export function fmt(n: number, compact = false) {
  const abs = Math.abs(n)
  if (compact) {
    if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(2)}Cr`
    if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)}L`
    if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(n))
}

/**
 * Combines multiple class names into a single string.
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
