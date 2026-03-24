'use client'

import React, { useState } from 'react'
import { ChevronDown, Bell } from 'lucide-react'
import { useEntity } from '@/lib/entity-context'
import { useData } from '@/lib/DataContext'
import { Entity } from '@/lib/types'
import type { PageType } from '@/app/page'
import { NotificationPanel } from './NotificationPanel'

interface NavItem {
  name: string
  path: PageType
  icon: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: 'dashboard', icon: '📊' },
      { name: 'Advisor', path: 'advisor', icon: '🤖' },
    ],
  },
  {
    title: 'FINANCES',
    items: [
      { name: 'Banking', path: 'banking', icon: '🏦' },
      { name: 'Mutual Funds', path: 'mutual-funds', icon: '📈' },
      { name: 'Shares', path: 'shares', icon: '📉' },
      { name: 'Income Tax', path: 'income-tax', icon: '🧾' },
      { name: 'Income & Expenses', path: 'income-expenses', icon: '💸' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Activity', path: 'activity', icon: '📋' },
      { name: 'Settings', path: 'settings', icon: '⚙️' },
    ],
  },
]

// Format currency in compact Indian format
function fmt(n: number, currency = false): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  
  if (abs >= 10000000) {
    return `${sign}${currency ? '₹' : ''}${(abs / 10000000).toFixed(2)}Cr`
  } else if (abs >= 100000) {
    return `${sign}${currency ? '₹' : ''}${(abs / 100000).toFixed(2)}L`
  } else if (abs >= 1000) {
    return `${sign}${currency ? '₹' : ''}${(abs / 1000).toFixed(1)}K`
  }
  return `${sign}${currency ? '₹' : ''}${abs.toLocaleString('en-IN')}`
}

interface SidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { toggleEntity, isActive } = useEntity()
  const { selectedFY, setSelectedFY, netWorth } = useData()
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  return (
    <aside className="w-64 h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-40 hidden lg:flex">
      {/* Logo section with Net Worth */}
      <div className="p-5 pb-4 border-b border-[var(--border)]">
        {/* Logo */}
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-2.5 group w-full"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-base shrink-0">
            ₹
          </div>
          <span className="text-lg font-playfair font-bold text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
            FinanceOS
          </span>
        </button>

        {/* Net Worth pill */}
        {netWorth > 0 && (
          <div className="mt-2.5 px-2.5 py-1.5 bg-[var(--surface2)] rounded-lg border border-[var(--border)]">
            <div className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider mb-0.5">
              Net Worth
            </div>
            <div className="text-[15px] font-playfair font-bold text-[var(--gold)]">
              {fmt(netWorth, true)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            {/* Section Title */}
            <div className="px-4 py-2">
              <span className="text-[10px] font-bold text-[var(--text3)] tracking-wider">
                {section.title}
              </span>
            </div>
            {/* Section Items */}
            {section.items.map((item) => {
              const isActiveItem = currentPage === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => setCurrentPage(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                    isActiveItem
                      ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-r-2 border-[var(--gold)]'
                      : 'text-[var(--text2)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section with Entity Toggle, FY Selector, and Bell */}
      <div className="p-3 border-t border-[var(--border)] flex flex-col gap-2.5">
        {/* Entity toggle */}
        <div>
          <div className="text-[10px] font-bold text-[var(--text3)] tracking-wider mb-1.5 px-1">
            ENTITY
          </div>
          <div className="flex items-center gap-1">
            {(['personal', 'huf', 'firm'] as Entity[]).map((entity) => {
              const active = isActive(entity)
              return (
                <button
                  key={entity}
                  onClick={() => toggleEntity(entity)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                    active
                      ? entity === 'personal'
                        ? 'bg-[var(--personal)] text-white'
                        : entity === 'huf'
                        ? 'bg-[var(--huf)] text-white'
                        : 'bg-[var(--firm)] text-white'
                      : 'bg-[var(--bg)] text-[var(--text3)] hover:text-[var(--text2)] border border-[var(--border)]'
                  }`}
                >
                  {entity === 'personal' ? 'Self' : entity.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>

        {/* FY selector */}
        <div className="relative">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-semibold text-[var(--text)] appearance-none cursor-pointer focus:outline-none focus:border-[var(--gold)] transition-colors"
          >
            <option>FY 2025-26</option>
            <option>FY 2024-25</option>
            <option>FY 2023-24</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
        </div>

        {/* Bell + version */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative bg-none p-1.5 rounded-md hover:bg-[var(--bg)] transition-colors text-[var(--text2)]"
          >
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[var(--red)] rounded-full border-2 border-[var(--surface)]" />
          </button>
          <span className="text-[10px] text-[var(--text3)]">v1.0</span>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </aside>
  )
}

// Mobile Sidebar - uses Sheet component for drawer
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function MobileSidebar({ isOpen, onClose, currentPage, setCurrentPage }: MobileSidebarProps) {
  const { toggleEntity, isActive } = useEntity()
  const { selectedFY, setSelectedFY, netWorth } = useData()
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const handleNavClick = (path: PageType) => {
    setCurrentPage(path)
    onClose()
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="w-72 p-0 bg-[var(--surface)] border-r border-[var(--border)]">
          {/* Logo section with Net Worth */}
          <SheetHeader className="p-5 pb-4 border-b border-[var(--border)]">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-base">
                ₹
              </div>
              <span className="text-lg font-playfair font-bold text-[var(--text)]">
                FinanceOS
              </span>
            </SheetTitle>

            {/* Net Worth pill */}
            {netWorth > 0 && (
              <div className="mt-2.5 px-2.5 py-1.5 bg-[var(--surface2)] rounded-lg border border-[var(--border)]">
                <div className="text-[9px] font-semibold text-[var(--text3)] uppercase tracking-wider mb-0.5">
                  Net Worth
                </div>
                <div className="text-[15px] font-playfair font-bold text-[var(--gold)]">
                  {fmt(netWorth, true)}
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 max-h-[calc(100vh-280px)]">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-2">
                <div className="px-4 py-2">
                  <span className="text-[10px] font-bold text-[var(--text3)] tracking-wider">
                    {section.title}
                  </span>
                </div>
                {section.items.map((item) => {
                  const isActiveItem = currentPage === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                        isActiveItem
                          ? 'bg-[var(--gold)]/10 text-[var(--gold)]'
                          : 'text-[var(--text2)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2.5">
            {/* Entity toggle */}
            <div>
              <div className="text-[10px] font-bold text-[var(--text3)] tracking-wider mb-1.5 px-1">
                ENTITY
              </div>
              <div className="flex items-center gap-1">
                {(['personal', 'huf', 'firm'] as Entity[]).map((entity) => {
                  const active = isActive(entity)
                  return (
                    <button
                      key={entity}
                      onClick={() => toggleEntity(entity)}
                      className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                        active
                          ? entity === 'personal'
                            ? 'bg-[var(--personal)] text-white'
                            : entity === 'huf'
                            ? 'bg-[var(--huf)] text-white'
                            : 'bg-[var(--firm)] text-white'
                          : 'bg-[var(--bg)] text-[var(--text3)] hover:text-[var(--text2)] border border-[var(--border)]'
                      }`}
                    >
                      {entity === 'personal' ? 'Self' : entity.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* FY selector */}
            <div className="relative">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-semibold text-[var(--text)] appearance-none cursor-pointer focus:outline-none focus:border-[var(--gold)]"
              >
                <option>FY 2025-26</option>
                <option>FY 2024-25</option>
                <option>FY 2023-24</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
            </div>

            {/* Bell + version */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative bg-none p-1.5 rounded-md hover:bg-[var(--bg)] transition-colors text-[var(--text2)]"
              >
                <Bell size={16} />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[var(--red)] rounded-full border-2 border-[var(--surface)]" />
              </button>
              <span className="text-[10px] text-[var(--text3)]">v1.0</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notification Panel for Mobile */}
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  )
}
