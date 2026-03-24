// src/components/ui/SectionHeader.tsx
import React from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-[var(--text)]">{title}</h1>
        {subtitle && <p className="text-[var(--text2)] text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
