// src/mutual-funds/components/AIInsightPanel.tsx
import { Card } from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'

export function AIInsightPanel() {
  return (
    <Card noPadding className="border-l-4 border-l-[var(--gold)]">
      <div className="p-5 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text)] mb-1">Rebalancing Alert</h3>
          <p className="text-xs text-[var(--text2)] leading-relaxed mb-3">
            Your current equity allocation is <span className="text-[var(--gold)] font-bold">58%</span>, which is above your target of <span className="font-bold">50%</span>. 
            Consider shifting <span className="text-[var(--gold)] font-bold">₹8.4L</span> to Debt or Liquid funds to maintain your risk profile.
          </p>
          <div className="flex items-center gap-2">
            <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] hover:underline">View Rebalancing Plan</button>
            <span className="text-[var(--text3)]">•</span>
            <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--text3)] hover:text-[var(--text2)]">Dismiss</button>
          </div>
        </div>
      </div>
    </Card>
  )
}
