import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn(
      "text-[11px] font-semibold tracking-widest uppercase",
      "text-[var(--text2)] mb-3.5",
      className
    )}>
      {children}
    </div>
  )
}
