// src/income-expenses/components/ExpenseBreakdown.tsx
// TODO: This component is currently unused but uses DataContext correctly.
// Consider integrating into income-expenses/page.tsx as a reusable component.
'use client'

import { Card } from '@/components/ui/Card'
import { formatINR } from '@/lib/format'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { useMemo } from 'react'

interface ExpenseCategory {
  label: string
  color: string
  amount: number
  rawCategory: string
}

export function ExpenseBreakdown() {
  const { transactions } = useData()
  const { isActive } = useEntity()

  const filteredTransactions = transactions.filter(t => isActive(t.entity))

  const expenseCategories = useMemo((): ExpenseCategory[] => {
    // Group transactions by category (excluding income categories and transfers)
    const incomeCategories = ['Salary', 'Dividend', 'FD Interest', 'Interest', 'Capital Gains', 'Refund']
    const expenseTxns = filteredTransactions.filter(t => 
      t.debit > 0 && 
      !incomeCategories.includes(t.category) && 
      !t.isTransfer
    )

    const categoryMap: Record<string, number> = {}
    expenseTxns.forEach(t => {
      const cat = t.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + t.debit
    })

    // Map categories to display names and colors
    const categoryConfig: Record<string, { label: string; color: string }> = {
      'Utilities': { label: 'Utilities & Bills', color: 'var(--amber)' },
      'Tax': { label: 'Tax Payments', color: 'var(--red)' },
      'Investment': { label: 'Investments', color: 'var(--blue)' },
      'Insurance': { label: 'Health & Insurance', color: 'var(--huf)' },
      'Education': { label: 'Education', color: 'var(--firm)' },
      'Travel': { label: 'Travel & Dining', color: 'var(--personal)' },
      'Household': { label: 'Household & Groceries', color: 'var(--red)' },
      'Shopping': { label: 'Shopping', color: 'var(--personal)' },
      'Medical': { label: 'Medical & Healthcare', color: 'var(--huf)' },
      'Transfer': { label: 'Transfers', color: 'var(--text3)' },
      'Other': { label: 'Other Expenses', color: 'var(--text3)' },
    }

    const categories = Object.entries(categoryMap)
      .map(([cat, amount]) => {
        const config = categoryConfig[cat] || { label: cat, color: 'var(--text3)' }
        return {
          label: config.label,
          color: config.color,
          amount,
          rawCategory: cat
        }
      })
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    return categories
  }, [filteredTransactions])

  const totalExpenses = expenseCategories.reduce((sum, item) => sum + item.amount, 0)

  if (expenseCategories.length === 0) {
    return (
      <Card title="Expense Categories Breakdown">
        <div className="py-8 text-center text-[var(--text3)] text-sm">
          No expense data available. Add transactions with debit amounts.
        </div>
      </Card>
    )
  }

  return (
    <Card title="Expense Categories Breakdown">
      <div className="space-y-6">
        {expenseCategories.slice(0, 6).map((item, idx) => {
          const pct = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
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
          <span className="text-lg font-bold text-[var(--red)] font-serif">{formatINR(totalExpenses, true)}</span>
        </div>
      </div>
    </Card>
  )
}
