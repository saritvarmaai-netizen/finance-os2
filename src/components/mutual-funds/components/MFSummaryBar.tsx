// src/mutual-funds/components/MFSummaryBar.tsx
'use client'

import { Card } from '@/components/ui/Card'
import { useData } from '@/lib/DataContext'
import { formatINR, formatPercent } from '@/lib/format'

export function MFSummaryBar() {
  const { mfHoldings, mfTotals, ltcg } = useData()

  // Calculate totals from actual data
  const currentVal = mfTotals.totalCurrentValue
  const invested = mfTotals.totalInvested
  const gain = mfTotals.totalGain
  // Guard against division by zero
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0
  // Calculate average XIRR from holdings that have it
  const holdingsWithXirr = mfHoldings.filter(h => h.xirr && h.xirr > 0)
  const xirr = holdingsWithXirr.length > 0 
    ? holdingsWithXirr.reduce((sum, h) => sum + h.xirr, 0) / holdingsWithXirr.length 
    : 0
  const ltcgBooked = ltcg.booked
  const ltcgLimit = ltcg.limit

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatBox label="Current Value" value={formatINR(currentVal, true)} />
      <StatBox label="Invested" value={formatINR(invested, true)} />
      <StatBox label="Unrealised Gain" value={formatINR(gain, true)} color={gain >= 0 ? "var(--green)" : "var(--red)"} />
      <StatBox label="Total Return" value={formatPercent(gainPct)} color={gain >= 0 ? "var(--green)" : "var(--red)"} />
      <StatBox label="XIRR" value={formatPercent(xirr)} color="var(--gold)" />
      <Card noPadding className="p-3 flex flex-col justify-between">
        <span className="text-[10px] text-[var(--text3)] uppercase font-bold">LTCG Booked</span>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text)]">{formatINR(ltcgBooked, true)}</span>
            <span className="text-[9px] text-[var(--text3)]">of {formatINR(ltcgLimit, true)}</span>
          </div>
          <div className="h-1 w-full bg-[var(--surface3)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--gold)]" 
              style={{ width: `${ltcgLimit > 0 ? (ltcgBooked / ltcgLimit) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <Card noPadding className="p-3">
      <span className="text-[10px] text-[var(--text3)] uppercase font-bold">{label}</span>
      <p className="text-lg font-bold mt-1" style={{ color: color || 'var(--text)' }}>{value}</p>
    </Card>
  )
}
