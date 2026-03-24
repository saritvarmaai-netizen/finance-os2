'use client'

import React, { useState } from 'react'
import { Calculator, Lightbulb } from 'lucide-react'
import { fmt } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { RegimeCard } from './RegimeCard'
import type { RegimeCardLine } from '@/lib/types'

interface RegimeComparisonProps {
  totalGrossIncome: number
  oldRegimeTaxable: number
  oldRegimeTax: number
  oldRegimeTotalTax: number
  newRegimeTaxable: number
  newRegimeTax: number
  newRegimeTotalTax: number
  isNewRegimeBetter: boolean
  taxDifference: number
}

export function RegimeComparison({
  totalGrossIncome,
  oldRegimeTaxable,
  oldRegimeTax,
  oldRegimeTotalTax,
  newRegimeTaxable,
  newRegimeTax,
  newRegimeTotalTax,
  isNewRegimeBetter,
  taxDifference
}: RegimeComparisonProps) {
  const [activeRegime, setActiveRegime] = useState<'old' | 'new'>('new')

  const oldRegimeLines: RegimeCardLine[] = [
    { label: 'Gross Income', value: totalGrossIncome },
    { label: 'Standard Deduction', value: -50000, color: 'var(--red)' },
    { label: '80C Deductions', value: -150000, color: 'var(--red)' },
    { label: '80D Health Ins.', value: -25000, color: 'var(--red)' },
    { label: 'NPS 80CCD(1B)', value: -35000, color: 'var(--red)' },
    { label: 'Taxable Income', value: oldRegimeTaxable, isBold: true },
    { label: 'Tax + Surcharge', value: oldRegimeTax },
    { label: 'Cess (4%)', value: oldRegimeTax * 0.04 },
  ]

  const newRegimeLines: RegimeCardLine[] = [
    { label: 'Gross Income', value: totalGrossIncome },
    { label: 'Standard Deduction', value: -75000, color: 'var(--red)' },
    { label: '80C Deductions', value: 'No other deductions', isDimmed: true },
    { label: '80D Health Ins.', value: 'No other deductions', isDimmed: true },
    { label: 'NPS 80CCD(1B)', value: 'No other deductions', isDimmed: true },
    { label: 'Taxable Income', value: newRegimeTaxable, isBold: true },
    { label: 'Tax + Surcharge', value: newRegimeTax },
    { label: 'Cess (4%)', value: newRegimeTax * 0.04 },
  ]

  return (
    <div style={{ marginBottom: 40 }}>
      <SectionLabel>
        <Calculator size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        Tax Regime Comparison — Self
      </SectionLabel>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <RegimeCard 
          title="Old Regime" 
          icon="🏛️"
          isBest={!isNewRegimeBetter}
          isActive={activeRegime === 'old'}
          onSelect={() => setActiveRegime('old')}
          lines={oldRegimeLines}
          totalTax={oldRegimeTotalTax}
        />
        <RegimeCard 
          title="New Regime" 
          icon="⚡"
          isBest={isNewRegimeBetter}
          isActive={activeRegime === 'new'}
          onSelect={() => setActiveRegime('new')}
          lines={newRegimeLines}
          totalTax={newRegimeTotalTax}
        />
      </div>

      {/* Saving Banner */}
      <div style={{ 
        padding: '16px 24px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', 
        borderRadius: 'var(--radius)', marginBottom: 32 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Lightbulb size={18} color="var(--green)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{isNewRegimeBetter ? 'New' : 'Old'} Regime saves {fmt(taxDifference)} this year</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 30 }}>
          {isNewRegimeBetter ? `However, if you invest ₹50,000 more in NPS 80CCD(1B), Old Regime becomes better by ${fmt(Math.abs(taxDifference - 15000))}.` : `You are already saving maximum tax with the Old Regime.`}
        </div>
      </div>
    </div>
  )
}
