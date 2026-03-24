'use client'

import React from 'react'
import { fmt } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

interface IncomeSummaryProps {
  annualSalary: number
  salaryTransactionCount: number
  bankInterestEstimate: number
  fdInterestTotal: number
  fdCount: number
  dividendIncome: number
  ltcgBooked: number
  firmIncome: number
  totalGrossIncome: number
}

export function IncomeSummary({
  annualSalary,
  salaryTransactionCount,
  bankInterestEstimate,
  fdInterestTotal,
  fdCount,
  dividendIncome,
  ltcgBooked,
  firmIncome,
  totalGrossIncome
}: IncomeSummaryProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Income Summary — All Entities</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <IncomeSummaryRow 
          label="Salary (Annualised)" 
          amount={annualSalary} 
          subtitle={salaryTransactionCount > 0 ? `From ${salaryTransactionCount} transactions` : undefined}
        />
        <IncomeSummaryRow label="Bank Interest (Est.)" amount={bankInterestEstimate} subtitle="~3% on balance" />
        <IncomeSummaryRow label="FD Interest (Maturity)" amount={fdInterestTotal} subtitle={fdCount > 0 ? `${fdCount} FDs` : undefined} />
        <IncomeSummaryRow label="Dividends" amount={dividendIncome} />
        <IncomeSummaryRow label="Capital Gains (Booked)" amount={ltcgBooked} />
        {firmIncome > 0 && (
          <IncomeSummaryRow label="Firm Net Income" amount={firmIncome} badge="Firm" badgeColor="var(--firm)" />
        )}
      </div>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', 
        borderTop: '2px solid var(--border2)' 
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Total Gross</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: '"Playfair Display", serif' }}>
          {fmt(totalGrossIncome)}
        </span>
      </div>
    </div>
  )
}

function IncomeSummaryRow({ label, amount, badge, badgeColor, subtitle }: {
  label: string
  amount: number
  badge?: string
  badgeColor?: string
  subtitle?: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
          {badge && (
            <span style={{ 
              padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
              color: badgeColor, background: `${badgeColor}15`, border: `1px solid ${badgeColor}30` 
            }}>{badge}</span>
          )}
        </div>
        {subtitle && (
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{subtitle}</span>
        )}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(amount)}</span>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
