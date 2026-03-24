'use client'

import React from 'react'
import { SummaryBox, LTCGSummaryBox } from './SummaryBox'
import type { LTCG } from '@/lib/types'

interface MFSummaryBarProps {
  // Summary values
  currentValue: number
  invested: number
  gain: number
  returnPct: string
  xirr: string
  
  // Live data flag
  hasLiveData: boolean
  
  // LTCG data
  ltcg: LTCG
  
  // Formatter function
  formatFn: (val: number, short?: boolean) => string
}

export function MFSummaryBar({
  currentValue,
  invested,
  gain,
  returnPct,
  xirr,
  hasLiveData,
  ltcg,
  formatFn,
}: MFSummaryBarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
      <SummaryBox label="Current Value" value={formatFn(currentValue)} />
      <SummaryBox label="Invested" value={formatFn(invested)} />
      <SummaryBox label="Unrealised Gain" value={`+${formatFn(gain)}`} color="var(--green)" />
      <SummaryBox label="Total Return" value={`+${returnPct}%`} color="var(--green)" />
      <SummaryBox label="XIRR" value={xirr} color="var(--green)" />
      <LTCGSummaryBox booked={ltcg.booked} limit={ltcg.limit} formatFn={formatFn} />
    </div>
  )
}
