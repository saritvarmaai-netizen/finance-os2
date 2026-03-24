'use client'

import React from 'react'
import { fmt } from '@/lib/utils'

interface RegimeLine {
  label: string
  value: number | string
  color?: string
  isBold?: boolean
  isDimmed?: boolean
}

interface RegimeCardProps {
  title: string
  icon: string
  isBest: boolean
  isActive: boolean
  onSelect: () => void
  lines: RegimeLine[]
  totalTax: number
}

export function RegimeCard({ title, icon, isBest, isActive, onSelect, lines, totalTax }: RegimeCardProps) {
  return (
    <div 
      onClick={onSelect}
      style={{
        flex: 1, position: 'relative', cursor: 'pointer',
        background: isBest ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))' : 'var(--surface)',
        border: `2px solid ${isBest ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: 24, transition: 'all 0.2s',
        boxShadow: isActive ? '0 0 0 2px var(--gold)' : 'none'
      }}
    >
      {isBest && (
        <div style={{ 
          position: 'absolute', top: 0, right: 0, background: 'var(--gold)', color: 'var(--bg)',
          padding: '4px 12px', fontSize: 10, fontWeight: 800, borderRadius: '0 0 0 8px'
        }}>
          ★ SAVES MORE
        </div>
      )}
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: '"Playfair Display", serif', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {lines.map((line: RegimeLine, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: line.isDimmed ? 0.32 : 1 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{line.label}</span>
            <span style={{ 
              fontSize: 12, fontWeight: line.isBold ? 700 : 500, color: line.color || 'var(--text)', 
              fontFamily: '"JetBrains Mono", monospace' 
            }}>
              {typeof line.value === 'number' ? (line.value < 0 ? '−' : '') + fmt(Math.abs(line.value)) : line.value}
            </span>
          </div>
        ))}
      </div>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
        borderTop: `2px solid ${isBest ? 'var(--gold)' : 'var(--border2)'}`, marginBottom: 24
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Total Tax</span>
        <span style={{ 
          fontSize: 26, fontWeight: 700, color: isBest ? 'var(--gold)' : 'var(--text)', 
          fontFamily: '"Playfair Display", serif' 
        }}>
          {fmt(totalTax)}
        </span>
      </div>
      <button style={{
        width: '100%', padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        background: isActive ? 'var(--gold)' : 'transparent',
        color: isActive ? 'var(--bg)' : 'var(--text2)',
        border: isActive ? 'none' : '1px solid var(--border)',
        transition: 'all 0.2s'
      }}>
        {isActive ? '✓ Currently Working in This Regime' : `Work in ${title}`}
      </button>
    </div>
  )
}
