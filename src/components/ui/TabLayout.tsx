// src/components/ui/TabLayout.tsx
import React from 'react'

interface TabLayoutProps {
  children: React.ReactNode
}

export function TabLayout({ children }: TabLayoutProps) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-8 pt-8 pb-16">
      {children}
    </div>
  )
}
