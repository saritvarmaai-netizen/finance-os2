'use client'

import React from 'react'

interface SettingsRowProps {
  label: string
  desc?: string
  children: React.ReactNode
  isLast?: boolean
}

export function SettingsRow({ label, desc, children, isLast = false }: SettingsRowProps) {
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border)'
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
