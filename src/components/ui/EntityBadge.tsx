// src/components/ui/EntityBadge.tsx
import React from 'react'
import { Entity } from '@/lib/types'

interface EntityBadgeProps {
  entity: Entity | string
}

export function EntityBadge({ entity }: EntityBadgeProps) {
  const colors: Record<string, { color: string, bg: string }> = {
    personal: { color: 'var(--personal)', bg: 'rgba(129,140,248,0.15)' },
    huf: { color: 'var(--huf)', bg: 'rgba(52,211,153,0.15)' },
    firm: { color: 'var(--firm)', bg: 'rgba(251,146,60,0.15)' },
  }
  
  const { color, bg } = colors[entity] || colors.personal
  
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, color, background: bg, textTransform: 'uppercase'
    }}>
      {entity === 'personal' ? 'Self' : entity}
    </span>
  )
}
