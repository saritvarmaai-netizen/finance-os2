'use client'

import React from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, cardStyle, selectStyle, ghostButtonStyle } from './ui'

interface BackupSettingsProps {
  autoBackup: string
  setAutoBackup: (v: string) => void
}

export function BackupSettings({ autoBackup, setAutoBackup }: BackupSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Backup & Privacy</SectionLabel>
      <div style={{ 
        padding: '12px 16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', 
        borderRadius: 8, marginBottom: 20
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>✓ All data stored locally</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>finance-system/database/finance.db · 2.4 MB</div>
      </div>
      <SettingsRow label="Last Backup" desc="Mar 20, 2026 · 11:30 PM" isLast={false}>
        <button style={ghostButtonStyle}>Backup Now</button>
      </SettingsRow>
      <SettingsRow label="Auto Backup" isLast={true}>
        <select style={selectStyle} value={autoBackup} onChange={e => setAutoBackup(e.target.value)}>
          <option>Weekly</option>
          <option>Daily</option>
          <option>Manual</option>
        </select>
      </SettingsRow>
    </div>
  )
}
