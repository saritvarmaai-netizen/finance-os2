// src/mutual-funds/components/OverlapAnalysis.tsx
import { Card } from '@/components/ui/Card'

export function OverlapAnalysis() {
  return (
    <Card title="Portfolio Overlap Analysis">
      <div className="space-y-6 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text2)]">PPFCF ↔ Mirae Large Cap</span>
            <span className="font-mono font-bold text-[var(--amber)]">42% Overlap</span>
          </div>
          <div className="h-2 w-full bg-[var(--surface3)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--amber)]" style={{ width: '42%' }} />
          </div>
          <p className="text-[10px] text-[var(--text3)]">High overlap in HDFC Bank & Reliance Industries.</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text2)]">Mirae Large Cap ↔ HDFC Mid Cap</span>
            <span className="font-mono font-bold text-[var(--green)]">18% Overlap</span>
          </div>
          <div className="h-2 w-full bg-[var(--surface3)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--green)]" style={{ width: '18%' }} />
          </div>
          <p className="text-[10px] text-[var(--text3)]">Healthy diversification across market caps.</p>
        </div>
      </div>
    </Card>
  )
}
