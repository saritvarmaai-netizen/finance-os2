import type { SanitiseOptions } from './types'

export function sanitiseForLLM(data: unknown, opts: SanitiseOptions = {}): unknown {
  const {
    replaceNames     = true,
    replaceBanks     = true,
    replaceFunds     = true,
    replaceCompanies = true,
  } = opts

  // Map real names to anonymous labels (consistent within one call)
  const nameMap = new Map<string, string>()
  let counter = { entity: 0, bank: 0, fund: 0, company: 0, account: 0 }

  function anonymise(value: string, type: 'entity' | 'bank' | 'fund' | 'company' | 'account'): string {
    if (!nameMap.has(value)) {
      counter[type]++
      const labels = {
        entity: `Entity_${counter.entity}`,
        bank: `Bank_${counter.bank}`,
        fund: `Fund_${counter.fund}`,
        company: `Company_${counter.company}`,
        account: `Account_${counter.account}`,
      }
      nameMap.set(value, labels[type])
    }
    return nameMap.get(value)!
  }

  function processValue(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(processValue)
    if (obj === null || typeof obj !== 'object') return obj

    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Strip these fields entirely — never send to LLM
      if (['id', 'pan', 'aadhar', 'accountNumber', 'folio'].includes(key)) {
        continue
      }
      // Anonymise name fields
      if (replaceNames && key === 'name' && typeof value === 'string') {
        result[key] = anonymise(value, 'fund')
      } else if (replaceBanks && key === 'bank' && typeof value === 'string') {
        result[key] = anonymise(value, 'bank')
      } else if (replaceCompanies && key === 'company' && typeof value === 'string') {
        result[key] = anonymise(value, 'company')
      } else if (replaceNames && key === 'entity' && typeof value === 'string') {
        result[key] = anonymise(value, 'entity')
      } else if (key === 'description' && typeof value === 'string') {
        // Strip description text, keep only category info
        result[key] = '[transaction]'
      } else {
        result[key] = processValue(value)
      }
    }
    return result
  }

  return processValue(data)
}

// Generate a human-readable preview of what will be sent
export function previewSanitised(data: unknown): string {
  const sanitised = sanitiseForLLM(data)
  return JSON.stringify(sanitised, null, 2)
}
