'use client'

import React from 'react'

interface ToggleProps {
  on: boolean
  onClick: () => void
}

export function Toggle({ on, onClick }: ToggleProps) {
  return (
    <div onClick={onClick} style={{
      width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer',
      border: `1px solid ${on ? 'var(--gold)' : 'var(--border2)'}`,
      background: on ? 'var(--gold)' : 'var(--surface3)',
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, width: 16, height: 16,
        background: '#fff', borderRadius: '50%',
        transition: 'transform 0.2s',
        transform: on ? 'translateX(20px)' : 'translateX(2px)',
      }} />
    </div>
  )
}
