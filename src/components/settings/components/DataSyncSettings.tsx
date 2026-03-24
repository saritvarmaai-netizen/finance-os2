'use client'

import React from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, Toggle, cardStyle, selectStyle, greenPillStyle } from './ui'

interface DataSyncSettingsProps {
  autoImport: boolean
  setAutoImport: (v: boolean) => void
  mfRefresh: string
  setMfRefresh: (v: string) => void
  shareRefresh: string
  setShareRefresh: (v: string) => void
  selectedFYSetting: string
  setSelectedFYSetting: (v: string) => void
}

export function DataSyncSettings({
  autoImport, setAutoImport, mfRefresh, setMfRefresh,
  shareRefresh, setShareRefresh, selectedFYSetting, setSelectedFYSetting
}: DataSyncSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Data & Sync</SectionLabel>
      <SettingsRow label="Auto-Import Watcher" desc="detects new files" isLast={false}>
        <Toggle on={autoImport} onClick={() => setAutoImport(!autoImport)} />
      </SettingsRow>
      <SettingsRow label="MF Price Refresh" isLast={false}>
        <select style={selectStyle} value={mfRefresh} onChange={e => setMfRefresh(e.target.value)}>
          <option>Weekly</option>
          <option>Daily</option>
          <option>Manual</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Share Price Refresh" isLast={false}>
        <select style={selectStyle} value={shareRefresh} onChange={e => setShareRefresh(e.target.value)}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Manual</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Financial Year" desc="Indian FY: April to March" isLast={true}>
        <select style={selectStyle} value={selectedFYSetting} onChange={e => setSelectedFYSetting(e.target.value)}>
          <option>FY 2025-26</option>
          <option>FY 2024-25</option>
        </select>
      </SettingsRow>
      <div style={{ marginTop: 16, padding: '16px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' }}>Import Folders</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: '"JetBrains Mono", monospace', marginBottom: 12 }}>~/finance-os/imports/</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={greenPillStyle}>banking/ watching</span>
          <span style={greenPillStyle}>mf/ watching</span>
          <span style={greenPillStyle}>shares/ watching</span>
        </div>
      </div>
    </div>
  )
}
