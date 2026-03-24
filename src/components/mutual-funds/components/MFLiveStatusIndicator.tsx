'use client'

import React from 'react'

interface MFLiveStatusIndicatorProps {
  hasLiveData: boolean
  lastUpdated: string | null
}

export function MFLiveStatusIndicator({ hasLiveData, lastUpdated }: MFLiveStatusIndicatorProps) {
  if (!hasLiveData || !lastUpdated) {
    return null
  }
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: 'var(--green)', marginTop: -8, marginBottom: 24
    }}>
      <span style={{ fontSize: 14 }}>●</span>
      All values recalculated from live NAV · Last updated {lastUpdated}
    </div>
  )
}
