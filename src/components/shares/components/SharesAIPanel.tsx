// src/shares/components/SharesAIPanel.tsx
// TODO: This component is currently unused.
// Consider integrating into shares/page.tsx for AI-powered insights.
import { AIInsightBox } from '@/components/ui/AIInsightBox'

export function SharesAIPanel() {
  return (
    <AIInsightBox title="Portfolio Optimization">
      <div className="space-y-3">
        <p className="text-sm">
          Your holding in <span className="font-bold text-[var(--text)]">Reliance Industries</span> has crossed the 1-year mark. 
          It is now eligible for <span className="text-[var(--green)] font-bold">LTCG</span> taxation (12.5%) instead of STCG (20%).
        </p>
        <div className="p-3 rounded-md bg-[var(--bg)]/50 border border-[var(--border)]">
          <p className="text-xs font-bold text-[var(--text2)] uppercase mb-1">Estimated Tax Saving:</p>
          <p className="text-lg font-playfair font-bold text-[var(--gold)]">₹1,238</p>
          <p className="text-[10px] text-[var(--text3)] mt-1">If sold today vs 1 month ago.</p>
        </div>
      </div>
    </AIInsightBox>
  )
}
