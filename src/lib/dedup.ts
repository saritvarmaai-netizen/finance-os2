const HASHES_KEY = 'financeos_import_hashes'

function getHashes(): Record<string, string> {
  try {
    const s = localStorage.getItem(HASHES_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

function saveHashes(hashes: Record<string, string>) {
  try { localStorage.setItem(HASHES_KEY, JSON.stringify(hashes)) } catch {}
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

export const dedup = {
  // Check if a file was already imported
  checkFile: async (fileContent: string, fileName: string): Promise<{
    isDuplicate: boolean
    previousImport?: string
    hash: string
  }> => {
    const hash = await hashString(fileContent)
    const hashes = getHashes()
    if (hashes[hash]) {
      return { isDuplicate: true, previousImport: hashes[hash], hash }
    }
    return { isDuplicate: false, hash }
  },

  // Mark a file as imported
  markImported: (hash: string, fileName: string) => {
    const hashes = getHashes()
    hashes[hash] = `${fileName} on ${new Date().toLocaleDateString('en-IN')}`
    saveHashes(hashes)
  },

  // Check for duplicate transactions by ID
  isDuplicateTransaction: (id: string, existingIds: string[]): boolean => {
    return existingIds.includes(id)
  },

  // Generate deterministic transaction ID
  generateTxnId: (date: string, amount: number, account: string): string => {
    const str = `${date}_${Math.abs(amount)}_${account.replace(/\s/g, '_').toLowerCase()}`
    return `txn_${str}`
  },

  clearHashes: () => localStorage.removeItem(HASHES_KEY),
}
