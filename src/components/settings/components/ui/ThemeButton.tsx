'use client'

import React from 'react'

interface ThemeButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick?: () => void
}

export function ThemeButton({ icon, label, active, onClick }: ThemeButtonProps) {
  return (
    <button 
      onClick={onClick}
      style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
      background: active ? 'var(--gold)' : 'transparent',
      color: active ? 'var(--bg)' : 'var(--text2)',
      border: 'none'
    }}>
      {icon} {label}
    </button>
  )
}
