'use client'

import React from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { fmt } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { AdvanceTaxPayment } from '@/lib/types'

interface AdvanceTaxTimelineProps {
  timeline: AdvanceTaxPayment[]
  totalTaxPaid: number
  hasNoPayments: boolean
}

export function AdvanceTaxTimeline({ timeline, totalTaxPaid, hasNoPayments }: AdvanceTaxTimelineProps) {
  return (
    <div style={{ ...cardStyle, marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionLabel>Advance Tax Timeline — Self + HUF</SectionLabel>
        {totalTaxPaid > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Total Paid: <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(totalTaxPaid)}</span>
          </div>
        )}
      </div>
      {hasNoPayments && (
        <div style={{ 
          padding: '16px', 
          background: 'var(--surface2)', 
          borderRadius: 8, 
          marginBottom: 16,
          fontSize: 13, 
          color: 'var(--text2)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoIcon size={16} color="var(--text3)" />
            <span>No advance tax payments recorded. Add transactions with category "Tax" to track payments.</span>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '20px 0' }}>
        <div style={{ 
          position: 'absolute', top: '50%', left: 40, right: 40, height: 2, 
          background: 'var(--border)', zIndex: 0, transform: 'translateY(-50%)' 
        }} />
        {timeline.map((t, i) => (
          <TimelineNode 
            key={i}
            label={t.label} 
            amount={t.amount} 
            paidAmount={t.paidAmount}
            date={t.dueDate} 
            status={t.status} 
            color={t.status === 'PAID' ? 'var(--green)' : t.status === 'OVERDUE' ? 'var(--red)' : t.status === 'PARTIAL' ? 'var(--amber)' : 'var(--text3)'} 
            isPaid={t.status === 'PAID'} 
          />
        ))}
      </div>
    </div>
  )
}

function TimelineNode({ label, amount, paidAmount, date, status, color, isPaid }: {
  label: string
  amount: number
  paidAmount: number
  date: string
  status: string
  color: string
  isPaid: boolean
}) {
  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
      <div style={{ 
        width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color
      }}>
        {isPaid ? <CheckCircle2 size={20} /> : status === 'PARTIAL' ? <Clock size={20} /> : <AlertCircle size={20} />}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: '"JetBrains Mono", monospace', marginBottom: 4 }}>
        {fmt(amount)}
      </div>
      {paidAmount > 0 && paidAmount !== amount && (
        <div style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 2 }}>
          Paid: {fmt(paidAmount)}
        </div>
      )}
      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>{date}</div>
      <span style={{ 
        padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800, color: '#fff', background: color 
      }}>{status}</span>
    </div>
  )
}

function InfoIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
