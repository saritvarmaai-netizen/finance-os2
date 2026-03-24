// src/income-expenses/components/IncomeBreakdown.tsx
// TODO: This component is currently unused but uses DataContext correctly.
// Consider integrating into income-expenses/page.tsx as a reusable component.
'use client'

import { Card } from '@/components/ui/Card'
import { formatINR } from '@/lib/format'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { useMemo } from 'react'

interface IncomeSource {
  label: string
  color: string
  amount: number
}

export function IncomeBreakdown() {
  const { transactions, fds, shareHoldings, ltcg } = useData()
  const { isActive } = useEntity()

  const filteredTransactions = transactions.filter(t => isActive(t.entity))
  const filteredFDs = fds.filter(f => isActive(f.entity))
  const filteredShareHoldings = shareHoldings.filter(h => isActive(h.entity))

  const incomeBreakdown = useMemo((): IncomeSource[] => {
    // Salary - annualise from monthly transactions
    const salaryTransactions = filteredTransactions.filter(t => t.category === 'Salary')
    const monthlySalary = salaryTransactions.reduce((sum, t) => sum + t.credit, 0)
    const annualSalary = monthlySalary * 12

    // FD Interest - from FD maturity amounts
    const fdInterest = filteredFDs.reduce((sum, f) => sum + (f.maturityAmount - f.principal), 0)

    // Dividend income from share holdings
    const dividends = filteredShareHoldings.reduce((sum, s) => sum + s.dividendFY, 0)

    // Capital gains from LTCG settings
    const capitalGains = ltcg.booked

    // Firm income - from transactions with entity='firm'
    const firmTransactions = transactions.filter(t => t.entity === 'firm' && t.credit > 0)
    const firmIncome = firmTransactions.reduce((sum, t) => sum + t.credit, 0)

    // Other income from transactions not categorized above
    const otherIncomeCategories = ['Dividend', 'FD Interest', 'Interest', 'Refund', 'Other']
    const otherIncome = filteredTransactions
      .filter(t => otherIncomeCategories.includes(t.category) && t.credit > 0)
      .reduce((sum, t) => sum + t.credit, 0)

    const sources: IncomeSource[] = []

    if (annualSalary > 0) {
      sources.push({ label: 'Salary / Business', color: 'var(--personal)', amount: annualSalary })
    }

    if (fdInterest > 0) {
      sources.push({ label: 'FD Interest Income', color: 'var(--huf)', amount: fdInterest })
    }

    if (capitalGains > 0) {
      sources.push({ label: 'Capital Gains', color: 'var(--gold)', amount: capitalGains })
    }

    if (dividends > 0) {
      sources.push({ label: 'Dividends', color: 'var(--blue)', amount: dividends })
    }

    if (firmIncome > 0) {
      sources.push({ label: 'Firm Net Income', color: 'var(--firm)', amount: firmIncome })
    }

    if (otherIncome > 0) {
      sources.push({ label: 'Other Income', color: 'var(--amber)', amount: otherIncome })
    }

    return sources
  }, [filteredTransactions, filteredFDs, filteredShareHoldings, ltcg, transactions])

  const totalIncome = incomeBreakdown.reduce((sum, item) => sum + item.amount, 0)

  if (incomeBreakdown.length === 0) {
    return (
      <Card title="Income Sources Breakdown">
        <div className="py-8 text-center text-[var(--text3)] text-sm">
          No income data available. Add transactions with Salary category.
        </div>
      </Card>
    )
  }

  return (
    <Card title="Income Sources Breakdown">
      <div className="space-y-6">
        {incomeBreakdown.map((item, idx) => {
          const pct = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text2)]">{item.label}</span>
                </div>
                <span className="font-mono font-bold text-[var(--text)]">{formatINR(item.amount, true)}</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--surface3)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          )
        })}
        <div className="pt-3 border-t border-[var(--border)] text-right">
          <span className="text-lg font-bold text-[var(--green)] font-serif">{formatINR(totalIncome, true)}</span>
        </div>
      </div>
    </Card>
  )
}
