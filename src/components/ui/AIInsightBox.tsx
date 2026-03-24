// src/components/ui/AIInsightBox.tsx
import React from 'react'
import { Sparkles } from 'lucide-react'

interface AIInsightBoxProps {
  title: string
  children: React.ReactNode
}

export function AIInsightBox({ title, children }: AIInsightBoxProps) {
  return (
    <div className="relative p-4 rounded-[var(--radius)] bg-[var(--surface2)] border border-[var(--gold-dim)]/30 overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Sparkles size={48} className="text-[var(--gold)]" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-[var(--gold)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">AI Insight: {title}</span>
      </div>
      <div className="text-[var(--text)] text-sm leading-relaxed">
        {children}
      </div>
    </div>
  )
}
