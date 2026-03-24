// Maps user messages to the right skill file based on keywords
import type { SkillMatch } from './types'

const SKILL_ROUTES: { keywords: string[]; match: SkillMatch }[] = [
  {
    keywords: ['ltcg', 'harvest', 'tax harvest', 'book gain', 'exempt'],
    match: { skillPath: 'mutual-funds/recommendations.md', category: 'mutual_funds', contextKeys: ['mfHoldings', 'mfTotals', 'ltcg'] },
  },
  {
    keywords: ['mutual fund', 'mf', 'nav', 'sip', 'xirr', 'fund', 'overlap', 'rebalance'],
    match: { skillPath: 'mutual-funds/recommendations.md', category: 'mutual_funds', contextKeys: ['mfHoldings', 'mfTotals', 'ltcg'] },
  },
  {
    keywords: ['share', 'stock', 'equity', 'dividend', 'reliance', 'infosys', 'tcs', 'hdfc'],
    match: { skillPath: 'shares/recommendations.md', category: 'shares', contextKeys: ['shareHoldings', 'shareTotals'] },
  },
  {
    keywords: ['advance tax', 'regime', 'old regime', 'new regime', 'income tax', 'itr', '80c', '80d', 'nps', 'deduction', 'huf tax', 'tax saving'],
    match: { skillPath: 'income-tax/optimisation.md', category: 'income_tax', contextKeys: ['mfHoldings', 'shareHoldings', 'fds', 'accounts'] },
  },
  {
    keywords: ['fd', 'fixed deposit', 'maturity', 'interest', 'bank', 'balance', 'account', 'transaction'],
    match: { skillPath: 'banking/analysis.md', category: 'banking', contextKeys: ['accounts', 'fds', 'transactions'] },
  },
  {
    keywords: ['expense', 'income', 'cashflow', 'cash flow', 'spending', 'salary', 'budget', 'saving rate'],
    match: { skillPath: 'income-expenses/cashflow.md', category: 'banking', contextKeys: ['transactions', 'monthlyData'] },
  },
  {
    keywords: ['net worth', 'portfolio', 'overview', 'summary', 'briefing', 'today', 'dashboard', 'action'],
    match: { skillPath: 'dashboard/daily-briefing.md', category: 'system', contextKeys: ['netWorth', 'totalInvestments', 'mfTotals', 'shareTotals', 'totalBankBalance'] },
  },
]

export function routeToSkill(message: string): SkillMatch {
  const lower = message.toLowerCase()
  for (const route of SKILL_ROUTES) {
    if (route.keywords.some(kw => lower.includes(kw))) {
      return route.match
    }
  }
  // Default: use dashboard briefing with all data
  return { skillPath: 'dashboard/daily-briefing.md', category: 'system', contextKeys: ['netWorth', 'mfTotals', 'shareTotals', 'totalBankBalance'] }
}

export function buildContextFromKeys(keys: string[], data: Record<string, unknown>): Record<string, unknown> {
  const ctx: Record<string, unknown> = {}
  keys.forEach(key => {
    if (data[key] !== undefined) ctx[key] = data[key]
  })
  return ctx
}
