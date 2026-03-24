'use client'

import React from 'react'
import { fmt } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

interface LTCGUtilisationProps {
  booked: number
  limit: number
}

export function LTCGUtilisation({ booked, limit }: LTCGUtilisationProps) {
  const remaining = Math.max(0, limit - booked)
  const utilisationPct = Math.min(100, (booked / limit) * 100)

  return (
    <div style={cardStyle}>
      <SectionLabel>LTCG Exemption Utilisation — Self</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{fmt(booked)} booked of {fmt(limit)}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{fmt(remaining)} remaining</span>
      </div>
      <div style={{ height: 10, width: '100%', background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ width: `${utilisationPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--green), var(--gold))' }} />
      </div>
      {remaining > 0 && (
        <div style={{ 
          padding: '16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', 
          borderRadius: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6
        }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmt(remaining)} remaining.</span> Sell 62.5 units of Parag Parikh Flexi Cap → book {fmt(remaining)} gain before Mar 31 → saves {fmt(Math.floor(remaining * 0.125))} in tax.
        </div>
      )}
      {remaining === 0 && (
        <div style={{ 
          padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', 
          borderRadius: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6
        }}>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>LTCG exemption limit fully utilised!</span> No additional tax harvesting needed for this FY.
        </div>
      )}
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
