// src/shares/components/SharesSummaryBar.tsx
// TODO: This component is currently unused but uses DataContext correctly.
// Consider integrating into shares/page.tsx as a reusable component.
'use client'

import { Card } from '@/components/ui/Card'
import { useData } from '@/lib/DataContext'
import { formatINR, formatPercent } from '@/lib/format'

export function SharesSummaryBar() {
  const { shareHoldings, shareTotals, ltcg } = useData()

  // Calculate totals from actual data
  const currentVal = shareTotals.totalCurrentValue
  const invested = shareTotals.totalInvested
  const gain = shareTotals.totalGain
  // Guard against division by zero
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0
  const dividends = shareTotals.totalDividend
  const realisedLtcg = ltcg.booked

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatBox label="Current Value" value={formatINR(currentVal, true)} />
      <StatBox label="Invested" value={formatINR(invested, true)} />
      <StatBox label="Unrealised Gain" value={formatINR(gain, true)} color={gain >= 0 ? "var(--green)" : "var(--red)"} />
      <StatBox label="Realised LTCG" value={formatINR(realisedLtcg, true)} color="var(--text2)" />
      <StatBox label="Dividends FY26" value={formatINR(dividends, true)} color="var(--gold)" />
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
