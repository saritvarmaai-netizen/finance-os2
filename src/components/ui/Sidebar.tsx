'use client'

import React from 'react'
import {
  LayoutDashboard,
  Landmark,
  PieChart,
  TrendingUp,
  Receipt,
  Wallet,
  Clock,
  Bot,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useEntity } from '@/lib/entity-context'
import { useData } from '@/lib/DataContext'
import { Entity } from '@/lib/types'
import type { PageType } from '@/app/page'

interface NavItem {
  name: string
  path: PageType
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: 'dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'ASSETS',
    items: [
      { name: 'Banking', path: 'banking', icon: <Landmark size={18} /> },
      { name: 'Mutual Funds', path: 'mutual-funds', icon: <PieChart size={18} /> },
      { name: 'Shares', path: 'shares', icon: <TrendingUp size={18} /> },
    ],
  },
  {
    title: 'TAXES',
    items: [
      { name: 'Income Tax', path: 'income-tax', icon: <Receipt size={18} /> },
    ],
  },
  {
    title: 'TRACKING',
    items: [
      { name: 'Income & Expenses', path: 'income-expenses', icon: <Wallet size={18} /> },
      { name: 'Activity', path: 'activity', icon: <Clock size={18} /> },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { name: 'Advisor', path: 'advisor', icon: <Bot size={18} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Settings', path: 'settings', icon: <Settings size={18} /> },
    ],
  },
]

interface SidebarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { toggleEntity, isActive } = useEntity()
  const { selectedFY, setSelectedFY } = useData()

  return (
    <aside className="w-64 h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-40 hidden lg:flex">
      {/* Logo and FY Selector */}
      <div className="p-4 border-b border-[var(--border)]">
        {/* Logo */}
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-2.5 group mb-4 w-full"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-xl shrink-0">
            ₹
          </div>
          <span className="text-xl font-playfair font-bold text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
            FinanceOS
          </span>
        </button>

        {/* FY Selector */}
        <div className="relative">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text)] appearance-none cursor-pointer focus:outline-none focus:border-[var(--gold)] transition-colors"
          >
            <option>FY 2025-26</option>
            <option>FY 2024-25</option>
            <option>FY 2023-24</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
        </div>
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
                  <span className={isActiveItem ? 'text-[var(--gold)]' : ''}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Entity Toggle - Fixed at Bottom */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="text-[10px] font-bold text-[var(--text3)] tracking-wider mb-2">
          ENTITY FILTER
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
          {(['personal', 'huf', 'firm'] as Entity[]).map((entity) => (
            <button
              key={entity}
              onClick={() => toggleEntity(entity)}
              className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                isActive(entity)
                  ? entity === 'personal'
                    ? 'bg-[var(--personal)] text-white'
                    : entity === 'huf'
                    ? 'bg-[var(--huf)] text-white'
                    : 'bg-[var(--firm)] text-white'
                  : 'text-[var(--text3)] hover:text-[var(--text2)]'
              }`}
            >
              {entity === 'personal' ? 'Self' : entity.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
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
  const { selectedFY, setSelectedFY } = useData()

  const handleNavClick = (path: PageType) => {
    setCurrentPage(path)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-72 p-0 bg-[var(--surface)] border-r border-[var(--border)]">
        <SheetHeader className="p-4 border-b border-[var(--border)]">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-xl">
              ₹
            </div>
            <span className="text-xl font-playfair font-bold text-[var(--text)]">
              FinanceOS
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* FY Selector */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="relative">
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text)] appearance-none cursor-pointer focus:outline-none focus:border-[var(--gold)]"
            >
              <option>FY 2025-26</option>
              <option>FY 2024-25</option>
              <option>FY 2023-24</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none" />
          </div>
        </div>

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
                    <span className={isActiveItem ? 'text-[var(--gold)]' : ''}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Entity Toggle */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="text-[10px] font-bold text-[var(--text3)] tracking-wider mb-2">
            ENTITY FILTER
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
            {(['personal', 'huf', 'firm'] as Entity[]).map((entity) => (
              <button
                key={entity}
                onClick={() => toggleEntity(entity)}
                className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                  isActive(entity)
                    ? entity === 'personal'
                      ? 'bg-[var(--personal)] text-white'
                      : entity === 'huf'
                      ? 'bg-[var(--huf)] text-white'
                      : 'bg-[var(--firm)] text-white'
                    : 'text-[var(--text3)] hover:text-[var(--text2)]'
                }`}
              >
                {entity === 'personal' ? 'Self' : entity.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
