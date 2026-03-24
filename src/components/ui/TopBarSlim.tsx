'use client'

import React from 'react'
import { Bell, Menu } from 'lucide-react'
import { NotificationPanel } from './NotificationPanel'
import type { PageType } from '@/app/page'

const PAGE_TITLES: Record<PageType, string> = {
  'dashboard': 'Dashboard',
  'banking': 'Banking',
  'mutual-funds': 'Mutual Funds',
  'shares': 'Shares',
  'income-tax': 'Income Tax',
  'income-expenses': 'Income & Expenses',
  'activity': 'Activity',
  'advisor': 'Advisor',
  'settings': 'Settings',
}

interface TopBarSlimProps {
  currentPage: PageType
  onMenuClick: () => void
}

export function TopBarSlim({ currentPage, onMenuClick }: TopBarSlimProps) {
  const [isNotifOpen, setIsNotifOpen] = React.useState(false)

  return (
    <>
      <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-50 px-4 flex items-center justify-between lg:hidden">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text2)] hover:text-[var(--text)] transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-lg">
              ₹
            </div>
            <span className="text-lg font-playfair font-bold text-[var(--text)]">
              FinanceOS
            </span>
          </div>
        </div>

        {/* Right: Page Title + Notifications */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--text2)]">
            {PAGE_TITLES[currentPage]}
          </span>
          <div className="relative cursor-pointer group" onClick={() => setIsNotifOpen(true)}>
            <div className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
              <Bell size={18} />
            </div>
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--red)] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
              4
            </span>
          </div>
        </div>
      </header>
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  )
}
