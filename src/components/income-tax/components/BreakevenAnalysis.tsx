'use client'

import React from 'react'
import { Calculator } from 'lucide-react'
import { fmt } from '@/lib/utils'

interface BreakevenAnalysisProps {
  currentDeductions: number
  breakevenDeductions: number
  deductionGap: number
}

export function BreakevenAnalysis({ currentDeductions, breakevenDeductions, deductionGap }: BreakevenAnalysisProps) {
  return (
    <div style={{ 
      ...cardStyle, background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Calculator size={16} color="var(--blue)" />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Breakeven Analysis — When does Old Regime win?</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' }}>Estimated values</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <BreakevenRow label="Current deductions" value={fmt(currentDeductions)} />
        <BreakevenRow label="Needed for Old Regime" value={fmt(breakevenDeductions)} color="var(--blue)" />
        <BreakevenRow label="Gap" value={fmt(deductionGap)} color="var(--amber)" />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' }}>How to bridge the gap:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ActionRow label="Additional NPS 80CCD(1B)" amount={fmt(Math.min(35000, deductionGap))} />
        <ActionRow label="Unclaimed 80D Health Ins." amount={fmt(Math.min(17000, Math.max(0, deductionGap - 35000)))} />
      </div>
    </div>
  )
}

function BreakevenRow({ label, value, color = 'var(--text)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: '"JetBrains Mono", monospace' }}>{value}</span>
    </div>
  )
}

function ActionRow({ label, amount }: { label: string; amount: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', fontFamily: '"JetBrains Mono", monospace' }}>{amount}</span>
        <button style={{ 
          background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', 
          padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer'
        }}>+ Add</button>
      </div>
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
