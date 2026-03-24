import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart as PieIcon,
  Activity,
  Calendar,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
  FileText,
  ShieldAlert,
  Briefcase,
  Calculator,
  Lightbulb,
  ArrowRightCircle,
  Wallet,
  ArrowUp,
  ArrowDown,
  Tag,
  Link as LinkIcon,
  Receipt
} from 'lucide-react'
import { TabLayout } from '@/components/ui/TabLayout'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { fmt } from '@/lib/utils'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { SummaryCardProps, SourceRowProps, StepChipProps, FlowStepType } from '@/lib/types'

// Types for flow data
interface FlowStep {
  label: string
  type: 'date' | 'bank' | 'category' | 'investment' | 'units' | 'tax'
}

interface FlowData {
  steps: FlowStep[]
}

export default function IncomeExpensesPage() {
  const { transactions, monthlyData, mfHoldings, shareHoldings, fds, ltcg, accounts } = useData()
  const { isActive } = useEntity()

  const filteredTransactions = useMemo(() => 
    transactions.filter(t => isActive(t.entity)),
    [transactions, isActive]
  )
  const filteredMFHoldings = useMemo(() => 
    mfHoldings.filter(h => isActive(h.entity)),
    [mfHoldings, isActive]
  )
  const filteredShareHoldings = useMemo(() => 
    shareHoldings.filter(h => isActive(h.entity)),
    [shareHoldings, isActive]
  )
  const filteredFDs = useMemo(() => 
    fds.filter(f => isActive(f.entity)),
    [fds, isActive]
  )
  const filteredAccounts = useMemo(() => 
    accounts.filter(a => isActive(a.entity)),
    [accounts, isActive]
  )

  // Calculate income sources from real transactions
  const incomeSources = useMemo(() => {
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

    const sources = [
      { label: 'Salary / Business', color: 'var(--personal)', amount: annualSalary },
    ]

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

  // Calculate expense categories from real transactions
  const expenseCategories = useMemo(() => {
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

    // If no expense transactions, show placeholder
    if (categories.length === 0) {
      return [
        { label: 'No expense data', color: 'var(--text3)', amount: 0, rawCategory: 'none' }
      ]
    }

    return categories
  }, [filteredTransactions])

  // Generate flow data from real investment transactions
  const flowData = useMemo((): FlowData[] => {
    const flows: FlowData[] = []

    // Find MF/Share purchase transactions
    const investmentTxns = filteredTransactions.filter(t => 
      t.category === 'Investment' && t.debit > 0
    ).slice(0, 3) // Limit to 3 for display

    investmentTxns.forEach(txn => {
      // Try to find matching MF holding based on description
      const matchingMF = filteredMFHoldings.find(h => 
        txn.description.toLowerCase().includes(h.name.toLowerCase().split(' ').slice(0, 2).join(' ').toLowerCase())
      )
      const matchingShare = filteredShareHoldings.find(h => 
        txn.description.toLowerCase().includes(h.symbol.toLowerCase())
      )

      const steps: FlowStep[] = [
        { label: `${txn.date} · −${fmt(txn.debit)}`, type: 'date' },
        { label: `Debited: ${txn.account}`, type: 'bank' },
        { label: txn.category, type: 'category' },
      ]

      if (matchingMF) {
        steps.push(
          { label: matchingMF.name, type: 'investment' },
          { label: `Tax Type: ${matchingMF.taxType}`, type: 'tax' }
        )
      } else if (matchingShare) {
        steps.push(
          { label: `${matchingShare.company} (${matchingShare.symbol})`, type: 'investment' },
          { label: `Tax Type: ${matchingShare.taxType}`, type: 'tax' }
        )
      } else {
        steps.push({ label: txn.description, type: 'investment' })
      }

      flows.push({ steps })
    })

    // Find FD creation transactions
    const fdTxns = filteredTransactions.filter(t => 
      t.category === 'FD Creation' && t.debit > 0
    ).slice(0, 1)

    fdTxns.forEach(txn => {
      const matchingFD = filteredFDs.find(f => txn.account === f.account?.bank)
      const steps: FlowStep[] = [
        { label: `${txn.date} · −${fmt(txn.debit)}`, type: 'date' },
        { label: `Debited: ${txn.account}`, type: 'bank' },
        { label: 'Auto-FD Created', type: 'category' },
      ]
      if (matchingFD) {
        steps.push(
          { label: `${matchingFD.rate}% · ${matchingFD.daysLeft} days left`, type: 'units' },
          { label: `Interest → ${matchingFD.entity} P&L`, type: 'tax' }
        )
      } else {
        steps.push({ label: 'FD Created', type: 'units' })
      }
      flows.push({ steps })
    })

    // Find dividend transactions
    const dividendTxns = filteredTransactions.filter(t => 
      t.category === 'Dividend' && t.credit > 0
    ).slice(0, 1)

    dividendTxns.forEach(txn => {
      const steps: FlowStep[] = [
        { label: `${txn.date} · +${fmt(txn.credit)}`, type: 'date' },
        { label: `Credited: ${txn.account}`, type: 'bank' },
        { label: 'Dividend Received', type: 'category' },
        { label: txn.description, type: 'investment' },
        { label: 'Fully Taxable', type: 'tax' },
      ]
      flows.push({ steps })
    })

    // If no real flows, return empty (will show placeholder)
    return flows
  }, [filteredTransactions, filteredMFHoldings, filteredShareHoldings, filteredFDs])

  const maxIncome = Math.max(...incomeSources.map(s => s.amount), 1)
  const maxExpense = Math.max(...expenseCategories.map(s => s.amount), 1)

  const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0)
  const totalExpense = monthlyData.reduce((sum, d) => sum + d.expense, 0)
  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0'
  
  const totalInvestmentsMade = filteredMFHoldings.reduce((sum, h) => sum + h.invested, 0) + 
    filteredShareHoldings.reduce((sum, h) => sum + h.invested, 0) + 
    filteredFDs.reduce((sum, f) => sum + f.principal, 0)

  const [aiModal, setAiModal] = useState({ open: false, loading: false, response: '', preview: '', mode: 'basic' as const, error: undefined as string | undefined, question: '' })

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { transactions: filteredTransactions.slice(0, 50), incomeSources, expenseCategories }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  const handleAddTransaction = () => {
    console.log('Add Transaction clicked')
    // TODO: Open dialog to add transaction
  }

  // Show empty state when no transactions exist
  if (filteredTransactions.length === 0) {
    return (
      <TabLayout>
        <EmptyState
          icon={Receipt}
          title="No income or expense records"
          description="Start tracking your income and expenses to understand your cash flow and spending patterns."
          actionLabel="Add Transaction"
          onAction={handleAddTransaction}
        />
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Income & Expenses
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            Master Ledger · FY 2025-26 · <span style={{ fontWeight: 600, color: 'var(--text)' }}>All entities combined</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => alert('Exporting data...')} style={ghostButtonStyle}><Download size={16} /> Export</button>
          <button onClick={() => runAIAnalysis('Analyse my cashflow. Identify areas where I can reduce expenses and improve my savings rate.', 'income-expenses/cashflow.md')} style={goldButtonStyle}><Activity size={16} /> Cashflow Analysis</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <SummaryCard label="Total Income" value={fmt(totalIncome)} color="var(--green)" subtitle="All sources · All entities" />
        <SummaryCard label="Total Expenses" value={fmt(totalExpense)} color="var(--red)" subtitle="Living expenses only" />
        <SummaryCard label="Investments Made" value={fmt(totalInvestmentsMade)} color="var(--personal)" subtitle="MF + Shares + FD" />
        <SummaryCard label="Net Savings" value={fmt(netSavings)} color="netSavings >= 0 ? 'var(--gold)' : 'var(--red)'" subtitle={`${savingsRate}% savings rate`} />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Left: Income Sources */}
        <div style={cardStyle}>
          <SectionLabel>Income Sources</SectionLabel>
          {incomeSources.every(s => s.amount === 0) ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              No income data available. Add transactions with Salary category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {incomeSources.filter(s => s.amount > 0).map((s, i) => (
                <SourceRow key={i} item={s} max={maxIncome} />
              ))}
              <div style={{ textAlign: 'right', padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', fontFamily: '"Playfair Display", serif' }}>{fmt(incomeSources.reduce((sum, s) => sum + s.amount, 0))}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Expense Categories */}
        <div style={cardStyle}>
          <SectionLabel>Expense Categories</SectionLabel>
          {expenseCategories.length === 0 || expenseCategories[0].rawCategory === 'none' ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              No expense data available. Add transactions with debit amounts.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {expenseCategories.slice(0, 6).map((s, i) => (
                <SourceRow key={i} item={s} max={maxExpense} />
              ))}
              <div style={{ textAlign: 'right', padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', fontFamily: '"Playfair Display", serif' }}>{fmt(expenseCategories.reduce((sum, s) => sum + s.amount, 0))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Transaction Links Card */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <SectionLabel>Investment Transaction Links</SectionLabel>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Shows the complete money trail from bank → investment → tax impact
          </div>
        </div>
        {flowData.length === 0 ? (
          <div style={{ 
            padding: '24px', 
            background: 'var(--surface2)', 
            borderRadius: 12, 
            border: '1px solid var(--border)',
            textAlign: 'center',
            color: 'var(--text3)',
            fontSize: 13
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Info size={16} />
              <span>No investment transactions yet</span>
            </div>
            <div>Add investment transactions to see the money flow visualization.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {flowData.map((flow, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: '16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                  {flow.steps.map((step, j) => (
                    <React.Fragment key={j}>
                      <StepChip label={step.label} type={step.type} />
                      {j < flow.steps.length - 1 && <span style={{ color: 'var(--text3)', fontSize: 14 }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Transactions Table */}
      <div id="linked-transactions" style={{ ...cardStyle, padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <SectionLabel>All Transactions</SectionLabel>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={tableHeaderStyle}>Account</th>
                <th style={tableHeaderStyle}>Category</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Debit</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Credit</th>
                <th style={tableHeaderStyle}>Entity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, i) => (
                <tr 
                  key={i}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  <td style={tableCellStyle}>{tx.date}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>{tx.description}</td>
                  <td style={tableCellStyle}>{tx.account}</td>
                  <td style={tableCellStyle}><CategoryBadge category={tx.category} /></td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: tx.debit > 0 ? 'var(--red)' : 'var(--text3)' }}>
                    {tx.debit > 0 ? fmt(tx.debit) : '—'}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: tx.credit > 0 ? 'var(--green)' : 'var(--text3)' }}>
                    {tx.credit > 0 ? fmt(tx.credit) : '—'}
                  </td>
                  <td style={tableCellStyle}><EntityBadge entity={tx.entity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AIResponseModal
        isOpen={aiModal.open}
        onClose={() => setAiModal(prev => ({ ...prev, open: false }))}
        loading={aiModal.loading}
        response={aiModal.response}
        sanitisedPreview={aiModal.preview}
        mode={aiModal.mode}
        error={aiModal.error}
        question={aiModal.question}
      />
    </TabLayout>
  )
}

function SummaryCard({ label, value, color, subtitle }: SummaryCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${color}`,
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{subtitle}</div>
    </div>
  )
}

function SourceRow({ item, max }: SourceRowProps) {
  const percentage = max > 0 ? (item.amount / max) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
      <div style={{ flex: '0 0 180px', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{item.label}</div>
      <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: item.color, opacity: 0.6 }} />
      </div>
      <div style={{ flex: '0 0 110px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: 'var(--text)' }}>
        {fmt(item.amount)}
      </div>
    </div>
  )
}

function StepChip({ label, type }: StepChipProps) {
  const styles: Record<FlowStepType, { background: string; color: string }> = {
    date: { background: 'var(--surface3)', color: 'var(--text2)' },
    bank: { background: 'var(--surface3)', color: 'var(--text2)' },
    category: { background: 'var(--surface3)', color: 'var(--text)' },
    investment: { background: 'rgba(129,140,248,0.1)', color: 'var(--personal)' },
    units: { background: 'rgba(16,185,129,0.1)', color: 'var(--green)' },
    tax: { background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' },
  }
  const s = styles[type] || styles.category
  return (
    <span style={{ 
      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, 
      background: s.background, color: s.color, border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {label}
    </span>
  )
}


function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, { color: string; bg: string }> = {
    Investment: { color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
    Salary: { color: 'var(--green)', bg: 'rgba(16,185,129,0.1)' },
    Dividend: { color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
    'FD Interest': { color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
    Utilities: { color: 'var(--amber)', bg: 'rgba(251,191,36,0.1)' },
    Tax: { color: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
    'FD Creation': { color: 'var(--firm)', bg: 'rgba(251,146,60,0.1)' },
    Transfer: { color: 'var(--text3)', bg: 'rgba(255,255,255,0.05)' },
    Other: { color: 'var(--text2)', bg: 'rgba(255,255,255,0.05)' },
  }
  const { color, bg } = styles[category] || styles.Other
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontWeight: 700, color, background: bg
    }}>
      {category}
    </span>
  )
}

// Global Styles
const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  transition: 'border-color 0.2s, box-shadow 0.2s',
}



const tableHeaderStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
  textTransform: 'uppercase', color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface2)', whiteSpace: 'nowrap',
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 13, color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
}

const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', transition: 'all 0.2s'
}

const goldButtonStyle: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
  padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
}
