'use client'

import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmt } from '@/lib/format'

interface MFWaterfallSectionProps {
  ltcg: {
    booked: number
    limit: number
  }
}

export function MFWaterfallSection({ ltcg }: MFWaterfallSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. AI Insight Box */}
      <div style={aiInsightBoxStyle}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', marginBottom: 10 }}>
          ✨ Tax Harvesting Opportunity
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 16 }}>
          You have {fmt(Math.max(0, ltcg.limit - ltcg.booked))} LTCG exemption remaining this FY. Sell 62.5 units of Parag Parikh Flexi Cap → book {fmt(Math.max(0, ltcg.limit - ltcg.booked))} gain → repurchase next day. Tax saving: {fmt(Math.floor(Math.max(0, ltcg.limit - ltcg.booked) * 0.125))}. No exit load. LTCG clock resets.
        </div>
        <button 
          onClick={() => alert('Detailed tax harvesting plan will be generated...')}
          style={{
            background: 'none', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: 6,
            padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%'
          }}
        >
          Generate Detailed Plan
        </button>
      </div>

      {/* 2. LTCG Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text2)]">
            LTCG Booked This FY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Booked</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: '"JetBrains Mono", monospace' }}>
              {fmt(ltcg.booked)} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>/ {fmt(ltcg.limit)}</span>
            </span>
          </div>
          <div style={{ height: 8, width: '100%', background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: `${(ltcg.booked / ltcg.limit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--green), var(--gold))' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{((ltcg.booked / ltcg.limit) * 100).toFixed(0)}% of {fmt(ltcg.limit)} annual limit used</div>
        </CardContent>
      </Card>

      {/* 3. Portfolio Overlap Card */}
      <Card>
        <CardHeader className="pb-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={14} color="var(--amber)" />
            <CardTitle className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text2)]">
              Portfolio Overlap Warning
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <OverlapRow label="PPFCF ↔ Mirae Large Cap" value="42% amber" percent={42} color="var(--amber)" />
            <OverlapRow label="Mirae Large ↔ HDFC Mid Cap" value="18% green" percent={18} color="var(--green)" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Rebalancing Alert Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text2)]">
            Rebalancing Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Equity: current 72%, target 65%</span>
            </div>
            <div style={{ height: 6, width: '100%', background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '72%', height: '100%', background: 'var(--red)' }} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Debt: current 28%, target 35%</span>
            </div>
            <div style={{ height: 6, width: '100%', background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '28%', height: '100%', background: 'var(--blue)' }} />
            </div>
          </div>
          <div style={{ 
            padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', 
            borderRadius: 8, fontSize: 12, color: 'var(--amber)', lineHeight: 1.5
          }}>
            Equity at 72% vs target 65%. Add ₹2.5L to debt fund to rebalance.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OverlapRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 4, width: '100%', background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color }} />
      </div>
    </div>
  )
}

const aiInsightBoxStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(240,165,0,0.06), rgba(129,140,248,0.06))',
  border: '1px solid rgba(240,165,0,0.25)',
  borderRadius: 'var(--radius)',
  padding: 16,
}
