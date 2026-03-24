export interface AuditEntry {
  id: string
  timestamp: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'RESET' | 'AI_CALL'
  category: 'banking' | 'mutual_funds' | 'shares' | 'income_tax' | 'settings' | 'system'
  description: string
  before?: Record<string, any>
  after?: Record<string, any>
  impact?: string
  source: 'manual' | 'live_api' | 'import' | 'ai' | 'system'
}

const STORAGE_KEY = 'financeos_audit_log'

function getLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveLog(entries: AuditEntry[]) {
  try {
    // Keep last 500 entries only
    const trimmed = entries.slice(0, 500)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {}
}

export const audit = {
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const entries = getLog()
    const newEntry: AuditEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }),
    }
    entries.unshift(newEntry)
    saveLog(entries)
    return newEntry
  },

  getAll: () => getLog(),

  getByCategory: (category: AuditEntry['category']) =>
    getLog().filter(e => e.category === category),

  getRecent: (hours = 24) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000
    return getLog().filter(e => new Date(e.timestamp).getTime() > cutoff)
  },

  clear: () => localStorage.removeItem(STORAGE_KEY),
}
