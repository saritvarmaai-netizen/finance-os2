'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, Toggle, ThemeButton, cardStyle, selectStyle } from './ui'

interface AppearanceSettingsProps {
  compactMode: boolean
  setCompactMode: (v: boolean) => void
  fontSize: string
  setFontSize: (v: string) => void
}

export function AppearanceSettings({ 
  compactMode, setCompactMode, fontSize, setFontSize 
}: AppearanceSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Appearance</SectionLabel>
      <SettingsRow label="Theme" isLast={false}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 4, borderRadius: 8 }}>
          <ThemeButton icon={<Moon size={14} />} label="Dark" active={true} />
          <ThemeButton icon={<Sun size={14} />} label="Light" active={false} />
          <ThemeButton icon={<Monitor size={14} />} label="System" active={false} />
        </div>
      </SettingsRow>
      <SettingsRow label="Compact Mode" isLast={false}>
        <Toggle on={compactMode} onClick={() => setCompactMode(!compactMode)} />
      </SettingsRow>
      <SettingsRow label="Font Size" isLast={true}>
        <select style={selectStyle} value={fontSize} onChange={e => setFontSize(e.target.value)}>
          <option>Medium</option>
          <option>Small</option>
          <option>Large</option>
        </select>
      </SettingsRow>
    </div>
  )
}
