'use client'

import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'
import { useEntity } from '@/lib/entity-context'
import { useData } from '@/lib/DataContext'
import { Entity } from '@/lib/types'
import { motion, AnimatePresence } from 'motion/react'
import { NotificationPanel } from './NotificationPanel'
import type { PageType } from '@/app/page'

const TABS: { name: string; path: PageType }[] = [
  { name: 'Dashboard', path: 'dashboard' },
  { name: 'Banking', path: 'banking' },
  { name: 'Mutual Funds', path: 'mutual-funds' },
  { name: 'Shares', path: 'shares' },
  { name: 'Income Tax', path: 'income-tax' },
  { name: 'Income & Expenses', path: 'income-expenses' },
  { name: 'Activity', path: 'activity' },
  { name: 'Advisor', path: 'advisor' },
  { name: 'Settings', path: 'settings' },
]

interface TopBarProps {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
}

export function TopBar({ currentPage, setCurrentPage }: TopBarProps) {
  const { toggleEntity, isActive } = useEntity()
  const { selectedFY, setSelectedFY } = useData()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  return (
    <>
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-50 px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-xl">
            ₹
          </div>
          <span className="text-xl font-playfair font-bold text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
            FinanceOS
          </span>
        </button>

        {/* Centre: Navigation */}
        <nav className="hidden lg:flex items-center gap-0">
          {TABS.map((tab) => {
            const isCurrent = currentPage === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => setCurrentPage(tab.path)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent 
                    ? 'text-[var(--gold)] bg-[var(--gold)]/10' 
                    : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                {tab.name}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  type="text"
                  placeholder="Ask anything... e.g. How much interest did I earn this FY?"
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--gold)]"
                  autoFocus
                  onBlur={() => setIsSearchExpanded(false)}
                />
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-2 rounded-full transition-colors ${isSearchExpanded ? 'absolute left-0 text-[var(--gold)]' : 'hover:bg-[var(--surface)] text-[var(--text2)]'}`}
            >
              <Search size={18} />
            </button>
          </div>

          {/* FY Selector */}
          <select
            value={selectedFY}
            onChange={e => setSelectedFY(e.target.value)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text2)', fontSize: 12, fontWeight: 700,
              padding: '6px 12px', borderRadius: 20, outline: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
          >
            <option>FY 2025-26</option>
            <option>FY 2024-25</option>
            <option>FY 2023-24</option>
          </select>

          {/* Entity Filters */}
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-full border border-[var(--border)]">
            {(['personal', 'huf', 'firm'] as Entity[]).map((entity) => (
              <button
                key={entity}
                onClick={() => toggleEntity(entity)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                  isActive(entity)
                    ? entity === 'personal' ? 'bg-[var(--personal)] text-white' :
                      entity === 'huf' ? 'bg-[var(--huf)] text-white' :
                      'bg-[var(--firm)] text-white'
                    : 'text-[var(--text3)] hover:text-[var(--text2)]'
                }`}
              >
                {entity === 'personal' ? 'Self' : entity.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="relative cursor-pointer group" onClick={() => setIsNotifOpen(true)}>
            <div className="p-2 rounded-full hover:bg-[var(--surface)] text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
              <Bell size={18} />
            </div>
            <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--red)] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[var(--bg)]">
              4
            </span>
          </div>

          {/* Settings */}
          <button 
            onClick={() => setCurrentPage('settings')} 
            className="p-2 rounded-full hover:bg-[var(--surface)] text-[var(--text2)] hover:text-[var(--text)] transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  )
}
