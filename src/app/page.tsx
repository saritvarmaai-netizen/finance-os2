'use client'

import React, { useState } from 'react'
import { DataProvider, useData } from '@/lib/DataContext'
import { EntityProvider } from '@/lib/entity-context'
import { Sidebar, MobileSidebar } from '@/components/ui/Sidebar'
import { TopBarSlim } from '@/components/ui/TopBarSlim'
import DashboardPage from '@/components/dashboard/page'
import BankingPage from '@/components/banking/page'
import MutualFundsPage from '@/components/mutual-funds/page'
import SharesPage from '@/components/shares/page'
import IncomeTaxPage from '@/components/income-tax/page'
import IncomeExpensesPage from '@/components/income-expenses/page'
import ActivityPage from '@/components/activity/page'
import AdvisorPage from '@/components/advisor/page'
import SettingsPage from '@/components/settings/page'

export type PageType = 'dashboard' | 'banking' | 'mutual-funds' | 'shares' | 'income-tax' | 'income-expenses' | 'activity' | 'advisor' | 'settings'

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--gold)] flex items-center justify-center text-[var(--bg)] font-bold text-2xl">
          ₹
        </div>
        <div className="text-xl font-playfair font-bold text-[var(--text)]">
          FinanceOS
        </div>
        <div className="flex gap-1 mt-2">
          <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Main app content - only renders when data is loaded
function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { loading, error } = useData()

  // Show loading screen while data is being fetched
  if (loading) {
    return <LoadingScreen />
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--red)]/20 flex items-center justify-center text-[var(--red)] text-2xl">
            ⚠️
          </div>
          <div className="text-lg font-semibold text-[var(--text)]">Failed to load data</div>
          <div className="text-sm text-[var(--text2)]">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--gold)] text-[var(--bg)] rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'banking':
        return <BankingPage />
      case 'mutual-funds':
        return <MutualFundsPage />
      case 'shares':
        return <SharesPage />
      case 'income-tax':
        return <IncomeTaxPage />
      case 'income-expenses':
        return <IncomeExpensesPage />
      case 'activity':
        return <ActivityPage />
      case 'advisor':
        return <AdvisorPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop Sidebar - Fixed on left */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Mobile Sidebar - Drawer */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Mobile Top Bar */}
      <TopBarSlim
        currentPage={currentPage}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6 pt-[68px] lg:pt-6">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <DataProvider>
      <EntityProvider>
        <AppContent />
      </EntityProvider>
    </DataProvider>
  )
}
