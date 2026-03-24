// src/components/ui/Card.tsx
import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
  noPadding?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, title, action, noPadding, style }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden transition-all hover:border-[var(--border2)]",
        className
      )}
      style={style}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          {title && <h3 className="text-[11px] uppercase tracking-wider font-bold text-[var(--text2)]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-5")}>
        {children}
      </div>
    </div>
  )
}
