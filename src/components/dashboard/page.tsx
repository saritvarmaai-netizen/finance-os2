'use client'

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
  Wallet,
  CreditCard,
  Building2,
  Briefcase
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { TabLayout } from '@/components/ui/TabLayout'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { fmt } from '@/lib/utils'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { WelcomeEmptyState } from '@/components/ui/EmptyState'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { InvestmentRowProps, ActionItemProps } from '@/lib/types'

export default function DashboardPage() {
  const { 
    accounts, 
    transactions, 
    totalBankBalance, 
    netWorth, 
    totalInvestments, 
    entityNetWorth,
    assetAllocation,
    monthlyData,
    selectedFY,
    fds,
    mfHoldings,
    shareHoldings,
    ltcg
  } = useData()
  const { isActive } = useEntity()

  const filteredTransactions = transactions.filter(t => isActive(t.entity))
  const filteredAccounts = accounts.filter(a => isActive(a.entity))
  const filteredFDs = fds.filter(f => isActive(f.entity))
  const filteredShareHoldings = shareHoldings.filter(h => isActive(h.entity))

  const salaryTxns = filteredTransactions.filter(t => t.category === 'Salary')
  const monthlySalary = salaryTxns.length > 0 ? (salaryTxns.reduce((sum, t) => sum + t.credit, 0) / salaryTxns.length) : 150000
  
  const totalGrossIncome = (monthlySalary * 12) +
    filteredAccounts.reduce((sum, a) => sum + (a.balance * 0.03), 0) +
    filteredFDs.reduce((sum, f) => sum + (f.maturityAmount - f.principal), 0) +
    filteredShareHoldings.reduce((sum, s) => sum + s.dividendFY, 0) +
    ltcg.booked + 
    (filteredTransactions.filter(t => t.entity === 'firm' && t.category === 'Salary').reduce((sum, t) => sum + t.credit, 0) * 12 || 420000)

  const newRegimeTaxable = totalGrossIncome - 75000
  const newRegimeTax = newRegimeTaxable > 700000 ? (newRegimeTaxable * 0.2) : 0 // Simplified
  const totalTaxLiability = newRegimeTax * 1.04

  const tdsDeducted = filteredFDs.reduce((sum, f) => sum + f.tdsExpected, 0) + 
    filteredTransactions.filter(t => t.description.toLowerCase().includes('tds')).reduce((sum, t) => sum + t.debit, 0) +
    (monthlySalary * 0.1 * 12) // Estimate 10% TDS on salary

  const advanceTaxPaid = filteredTransactions
    .filter(t => t.description.toLowerCase().includes('advance tax'))
    .reduce((sum, t) => sum + t.debit, 0)

  const balanceDue = Math.max(0, totalTaxLiability - tdsDeducted - advanceTaxPaid)
  const taxCoveredPercent = totalTaxLiability > 0 
    ? Math.min(100, ((tdsDeducted + advanceTaxPaid) / totalTaxLiability) * 100).toFixed(0)
    : '0'

  const nextMaturingFD = filteredFDs.filter(f => f.status === 'maturing').sort((a, b) => a.daysLeft - b.daysLeft)[0]

  const highestBalanceAccount = [...filteredAccounts].sort((a, b) => b.balance - a.balance)[0]

  const urgentCount = (balanceDue > 50000 ? 1 : 0) + 
                      (nextMaturingFD ? 1 : 0) + 
                      (ltcg.limit - ltcg.booked > 50000 ? 1 : 0)

  // Compute derived values with proper guards for empty data
  const derivedValues = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0)
    const totalExpense = monthlyData.reduce((sum, d) => sum + d.expense, 0)
    const netSavings = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0
    
    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: savingsRate.toFixed(savingsRate % 1 === 0 ? 0 : 1)
    }
  }, [monthlyData])

  const [aiModal, setAiModal] = useState({ open: false, loading: false, response: '', preview: '', mode: 'basic' as const, error: undefined as string | undefined, question: '' })

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { netWorth, totalInvestments, assetAllocation, monthlyData }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  const handleGetStarted = () => {
    console.log('Get Started clicked')
    // TODO: Navigate to banking or show onboarding
  }

  // Check if there's any data at all
  const hasNoData = filteredAccounts.length === 0 && 
                    filteredFDs.length === 0 && 
                    filteredTransactions.length === 0 &&
                    mfHoldings.length === 0 && 
                    shareHoldings.length === 0

  // Show welcome state for new users
  if (hasNoData) {
    return (
      <TabLayout>
        <WelcomeEmptyState onGetStarted={handleGetStarted} />
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Good morning! ☀️
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text2)' }}>
              Saturday, 21 March 2026 · {selectedFY} ·
            </span>
            <span style={{ 
              display: 'inline-flex', padding: '3px 10px', borderRadius: 20, 
              fontSize: 11, fontWeight: 700, color: 'var(--amber)', 
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)'
            }}>
              10 days left in financial year
            </span>
          </div>
        </div>
        <button 
          onClick={() => runAIAnalysis('Provide a daily financial briefing based on my current portfolio and recent activity.', 'dashboard/daily-briefing.md')}
          style={{
            background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
          }}
        >
          <Sparkles size={16} />
          Run AI Analysis
        </button>
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 1fr 1fr', gap: 20 }}>
        {/* Card 1: Financial Health */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Financial Health</SectionLabel>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '16px auto 24px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="8" 
                strokeDasharray={`${76 * 2.76} 276`} strokeLinecap="round" />
            </svg>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
            }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)', fontFamily: '"JetBrains Mono", monospace' }}>76</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MetricRow label="Savings Rate" value={`${derivedValues.savingsRate}%`} color="var(--green)" />
            <MetricRow label="Tax Efficiency" value="72%" color="var(--gold)" />
            <MetricRow label="Diversification" value="85%" color="var(--green)" />
            <MetricRow label="Advance Tax" value={`${taxCoveredPercent}%`} color={Number(taxCoveredPercent) > 80 ? 'var(--green)' : 'var(--red)'} />
          </div>
        </div>

        {/* Card 2: Net Worth */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Net Worth</SectionLabel>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--gold)', fontFamily: '"Playfair Display", serif', marginBottom: 8 }}>
            {fmt(netWorth)}
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ 
              display: 'inline-flex', padding: '3px 9px', borderRadius: 20, 
              fontSize: 10, fontWeight: 700, color: 'var(--green)', 
              background: 'rgba(34,197,94,0.15)'
            }}>
              ▲ Active Portfolio
            </span>
          </div>
          <div style={{ height: 12, width: '100%', display: 'flex', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: `${netWorth > 0 ? (entityNetWorth.personal / netWorth) * 100 : 33}%`, background: 'var(--personal)' }} />
            <div style={{ width: `${netWorth > 0 ? (entityNetWorth.huf / netWorth) * 100 : 33}%`, background: 'var(--huf)' }} />
            <div style={{ width: `${netWorth > 0 ? (entityNetWorth.firm / netWorth) * 100 : 34}%`, background: 'var(--firm)' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <LegendItem color="var(--personal)" label="Self" value={fmt(entityNetWorth.personal)} />
            <LegendItem color="var(--huf)" label="HUF" value={fmt(entityNetWorth.huf)} />
            <LegendItem color="var(--firm)" label="Firm" value={fmt(entityNetWorth.firm)} />
          </div>
        </div>

        {/* Card 3: Total Investments */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Total Investments</SectionLabel>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--personal)', fontFamily: '"Playfair Display", serif', marginBottom: 2 }}>
            {fmt(totalInvestments)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Current Market Value</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {assetAllocation.filter(a => a.name !== 'Savings').map((a, i) => (
              <InvestmentRow key={i} label={a.name} value={fmt(a.amount)} />
            ))}
          </div>
          <span style={{ 
            display: 'inline-flex', padding: '3px 9px', borderRadius: 20, 
            fontSize: 10, fontWeight: 700, color: 'var(--green)', 
            background: 'rgba(34,197,94,0.15)'
          }}>
            ▲ Active Portfolio
          </span>
        </div>

        {/* Card 4: Tax Position FY26 */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Tax Position {selectedFY}</SectionLabel>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)', fontFamily: '"Playfair Display", serif', marginBottom: 20 }}>
            {fmt(totalTaxLiability)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <InvestmentRow label="TDS Deducted" value={fmt(tdsDeducted)} />
            <InvestmentRow label="Advance Tax Paid" value={fmt(advanceTaxPaid)} />
            <InvestmentRow label="Balance Due" value={fmt(balanceDue)} color="var(--red)" />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, width: '100%', background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Number(taxCoveredPercent) || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--amber), var(--gold))' }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{taxCoveredPercent}% of liability covered</div>
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.55fr', gap: 20, marginBottom: 24 }}>
        {/* Card 1: Action Queue */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionLabel>Action Queue</SectionLabel>
            {urgentCount > 0 && (
              <span style={{ 
                display: 'inline-flex', padding: '2px 8px', borderRadius: 4, 
                fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--red)'
              }}>
                {urgentCount} Urgent
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {balanceDue > 0 && (
              <ActionItem 
                icon="⚠️" iconBg="rgba(239,68,68,0.1)" iconColor="var(--red)"
                title="Advance Tax Due" desc="Q4 payment deadline approaching"
                priority="HIGH" impact={fmt(balanceDue)} date="Mar 15"
              />
            )}
            {nextMaturingFD && (
              <ActionItem 
                icon="🏦" iconBg="rgba(59,130,246,0.1)" iconColor="var(--blue)"
                title={`${nextMaturingFD.accountId.split('_')[0].toUpperCase()} FD Matures`} desc="Reinvestment plan recommended"
                priority="MEDIUM" impact={fmt(nextMaturingFD.maturityAmount)} date={nextMaturingFD.maturityDate.slice(0, 6)}
              />
            )}
            {ltcg.limit - ltcg.booked > 0 && (
              <ActionItem 
                icon="💡" iconBg="rgba(245,158,11,0.1)" iconColor="var(--amber)"
                title="Harvest LTCG" desc={`Utilize ${fmt(ltcg.limit)} annual exemption`}
                priority="OPPORTUNITY" impact={`Save ${fmt(Math.floor(Math.max(0, ltcg.limit - ltcg.booked) * 0.125))}`} date="Before Mar 31"
              />
            )}
            {highestBalanceAccount && highestBalanceAccount.balance > 100000 && (
              <ActionItem 
                icon="📊" iconBg="rgba(16,185,129,0.1)" iconColor="var(--green)"
                title={`${highestBalanceAccount.bank} Idle Cash`} desc="Move to liquid fund for better yield"
                priority="LOW" impact={`~${fmt(Math.floor(highestBalanceAccount.balance * 0.04 / 12))}/mo`} date="Ongoing"
              />
            )}
          </div>
        </div>

        {/* Card 2: Income vs Expenses Chart */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Income vs Expenses</SectionLabel>
          <div style={{ height: 280, width: '100%', marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text3)', fontSize: 11, fontWeight: 500 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: '"JetBrains Mono", monospace' }}
                  tickFormatter={(v) => `₹${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8 }}
                  itemStyle={{ fontSize: 12, fontFamily: '"JetBrains Mono", monospace' }}
                  labelStyle={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="income" fill="var(--green)" radius={[4, 4, 0, 0]} fillOpacity={0.75} barSize={12} />
                <Bar dataKey="expense" fill="var(--red)" radius={[4, 4, 0, 0]} fillOpacity={0.72} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatItem label="Total Income" value={fmt(derivedValues.totalIncome)} color="var(--green)" />
            <StatItem label="Total Expenses" value={fmt(derivedValues.totalExpense)} color="var(--red)" />
            <StatItem label="Net Savings" value={fmt(derivedValues.netSavings)} color="var(--gold)" />
            <StatItem label="Savings Rate" value={`${derivedValues.savingsRate}%`} color="var(--green)" />
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 20 }}>
        {/* Card 1: Asset Allocation */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <SectionLabel>Asset Allocation</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
              }}>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Equity</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', fontFamily: '"Playfair Display", serif' }}>
                  {assetAllocation.filter(a => a.name.includes('Equity')).reduce((sum, a) => sum + a.value, 0)}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {assetAllocation.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(item.amount, true)}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Recent Transactions */}
        <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionLabel>Recent Transactions</SectionLabel>
            <span style={{ 
              fontSize: 12, fontWeight: 700, color: 'var(--gold)', 
              display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'
            }}>
              View All <ArrowRight size={14} />
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={tableHeaderStyle}>Account</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Amount</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Entity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 6).map((tx, i) => (
                <tr 
                  key={i}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  <td style={tableCellStyle}>{tx.date}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>{tx.description}</td>
                  <td style={tableCellStyle}>{tx.account}</td>
                  <td style={{ 
                    ...tableCellStyle, textAlign: 'right', fontWeight: 700, 
                    fontFamily: '"JetBrains Mono", monospace',
                    color: (tx.credit - tx.debit) > 0 ? 'var(--green)' : 'var(--red)'
                  }}>
                    {(tx.credit - tx.debit) > 0 ? '+' : '−'}{fmt(Math.abs(tx.credit - tx.debit))}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                    <EntityBadge entity={tx.entity} />
                  </td>
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

// Sub-components and Styles
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

function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  el.style.borderColor = 'var(--border2)'
  el.style.boxShadow = '0 4px 28px rgba(0,0,0,0.38)'
}

function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  el.style.borderColor = 'var(--border)'
  el.style.boxShadow = 'none'
}

function MetricRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string, label: string, value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function InvestmentRow({ label, value, color = 'var(--text)' }: InvestmentRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: '"JetBrains Mono", monospace' }}>{value}</span>
    </div>
  )
}

function ActionItem({ icon, iconBg, iconColor, title, desc, priority, impact, date }: ActionItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        display: 'flex', gap: 12, padding: 12, borderRadius: 8, cursor: 'pointer',
        background: isHovered ? 'var(--surface3)' : 'transparent',
        border: `1px solid ${isHovered ? 'var(--border2)' : 'transparent'}`,
        transition: 'all 0.2s'
      }}
    >
      <div style={{ 
        width: 36, height: 36, borderRadius: '50%', background: iconBg, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{impact}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{desc}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: iconColor }}>{priority}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: '"Playfair Display", serif' }}>{value}</div>
    </div>
  )
}
