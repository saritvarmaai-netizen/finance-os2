// src/lib/format.ts

/**
 * Format a number as Indian currency (₹)
 * @param amount - The number to format
 * @param compact - If true, use compact format (₹1.2L, ₹1.5Cr)
 * @returns Formatted currency string
 */
export function formatINR(amount: number, compact = false): string {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0'
  if (amount === 0) return '₹0'

  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (compact) {
    if (absAmount >= 10000000) { // 1 Crore
      return `${sign}₹${(absAmount / 10000000).toFixed(1)}Cr`
    }
    if (absAmount >= 100000) { // 1 Lakh
      return `${sign}₹${(absAmount / 100000).toFixed(1)}L`
    }
    if (absAmount >= 1000) {
      return `${sign}₹${(absAmount / 1000).toFixed(1)}K`
    }
  }

  // Indian number formatting: 1,00,000
  const formatted = absAmount.toLocaleString('en-IN')
  return `${sign}₹${formatted}`
}

// Shorthand alias
export const fmt = formatINR

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function getEntityColor(entity: string): string {
  const map: Record<string, string> = {
    personal: 'var(--personal)',
    huf: 'var(--huf)',
    firm: 'var(--firm)',
  }
  return map[entity] || 'var(--text2)'
}
