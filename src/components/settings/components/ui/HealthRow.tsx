'use client'

import React from 'react'

interface HealthRowProps {
  label: string
  status: string
}

export function HealthRow({ label, status }: HealthRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ 
        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, 
        color: 'var(--green)', background: 'rgba(16,185,129,0.1)' 
      }}>{status}</span>
    </div>
  )
}
