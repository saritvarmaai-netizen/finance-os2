// src/mutual-funds/components/TaxHarvestingPanel.tsx
import { AIInsightBox } from '@/components/ui/AIInsightBox'
import { formatINR } from '@/lib/format'

export function TaxHarvestingPanel() {
  return (
    <AIInsightBox title="Tax Harvesting Opportunity">
      <div className="space-y-3">
        <p>
          You have <span className="text-[var(--gold)] font-bold">{formatINR(82000, true)}</span> remaining in your ₹1.25L LTCG tax-free exemption limit for this FY.
        </p>
        <div className="p-3 rounded-md bg-[var(--bg)]/50 border border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text2)] uppercase mb-2">Recommendation:</p>
          <p className="text-sm">
            Sell <span className="font-bold">98.4 units</span> of <span className="text-[var(--blue)]">Parag Parikh Flexi Cap</span> to book <span className="text-[var(--green)] font-bold">₹42,500</span> in gains. 
            Re-invest immediately to reset your cost basis and save <span className="text-[var(--gold)] font-bold">₹5,312</span> in future taxes.
          </p>
        </div>
        <button className="w-full py-2 rounded-md bg-[var(--gold)] text-[var(--bg)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--gold-dim)] transition-colors">
          Generate Detailed Plan
        </button>
      </div>
    </AIInsightBox>
  )
}
