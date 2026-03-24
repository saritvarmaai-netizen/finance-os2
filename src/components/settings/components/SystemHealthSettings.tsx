'use client'

import React from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { HealthRow, cardStyle, ghostButtonStyle } from './ui'

export function SystemHealthSettings() {
  return (
    <div style={cardStyle}>
      <SectionLabel>System Health</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <HealthRow label="Database" status="Connected" />
        <HealthRow label="AI Gateway" status="Gemini · OK" />
        <HealthRow label="File Watcher" status="Running" />
        <HealthRow label="MFAPI" status="Reachable" />
        <HealthRow label="Last AI Call" status="2 mins ago" />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ ...ghostButtonStyle, flex: 1, justifyContent: 'center' }}>Run Health Check</button>
        <button style={{ ...ghostButtonStyle, flex: 1, justifyContent: 'center' }}>View Skills Status</button>
      </div>
    </div>
  )
}
