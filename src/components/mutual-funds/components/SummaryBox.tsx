'use client'

import React from 'react'

interface SummaryBoxProps {
  label: string
  value: string
  color?: string
}

const summaryBoxStyle: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '16px 20px',
  textAlign: 'center',
}

export function SummaryBox({ label, value, color = 'var(--text)' }: SummaryBoxProps) {
  return (
    <div style={summaryBoxStyle}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: '"Playfair Display", serif' }}>
        {value}
      </div>
    </div>
  )
}

interface LTCGSummaryBoxProps {
  booked: number
  limit: number
  formatFn: (val: number, short?: boolean) => string
}

export function LTCGSummaryBox({ booked, limit, formatFn }: LTCGSummaryBoxProps) {
  return (
    <div style={{ ...summaryBoxStyle, textAlign: 'left' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>
        LTCG Booked
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', fontFamily: '"Playfair Display", serif', marginBottom: 8 }}>
        {formatFn(booked)}
      </div>
      <div style={{ height: 4, width: '100%', background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ width: `${(booked / limit) * 100}%`, height: '100%', background: 'var(--gold)' }} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 500 }}>
        {((booked / limit) * 100).toFixed(0)}% of {formatFn(limit, true)} limit
      </div>
    </div>
  )
}
