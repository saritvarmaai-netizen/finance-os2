'use client'

import React from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, Toggle, cardStyle, inputStyle } from './ui'

interface NotificationSettingsProps {
  taxReminders: boolean
  setTaxReminders: (v: boolean) => void
  fdAlerts: boolean
  setFdAlerts: (v: boolean) => void
  fdAlertDays: number
  setFdAlertDays: (v: number) => void
  ltcgThreshold: number
  setLtcgThreshold: (v: number) => void
  idleCashAlert: boolean
  setIdleCashAlert: (v: boolean) => void
}

export function NotificationSettings({
  taxReminders, setTaxReminders, fdAlerts, setFdAlerts,
  fdAlertDays, setFdAlertDays, ltcgThreshold, setLtcgThreshold,
  idleCashAlert, setIdleCashAlert
}: NotificationSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Alerts & Notifications</SectionLabel>
      <SettingsRow label="Advance Tax Reminders" desc="15 days before" isLast={false}>
        <Toggle on={taxReminders} onClick={() => setTaxReminders(!taxReminders)} />
      </SettingsRow>
      <SettingsRow label="FD Maturity Alerts" isLast={false}>
        <Toggle on={fdAlerts} onClick={() => setFdAlerts(!fdAlerts)} />
      </SettingsRow>
      <SettingsRow label="FD Alert Days Ahead" isLast={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="number" 
            value={fdAlertDays} 
            onChange={e => setFdAlertDays(Number(e.target.value))} 
            style={{ ...inputStyle, width: 60, textAlign: 'center' }} 
          />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>days before</span>
        </div>
      </SettingsRow>
      <SettingsRow label="LTCG Threshold Warning" isLast={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="number" 
            value={ltcgThreshold} 
            onChange={e => setLtcgThreshold(Number(e.target.value))} 
            style={{ ...inputStyle, width: 60, textAlign: 'center' }} 
          />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>% consumed</span>
        </div>
      </SettingsRow>
      <SettingsRow label="Idle Cash Alert" desc="alert when savings idle" isLast={true}>
        <Toggle on={idleCashAlert} onClick={() => setIdleCashAlert(!idleCashAlert)} />
      </SettingsRow>
    </div>
  )
}
