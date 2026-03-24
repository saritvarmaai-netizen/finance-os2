'use client'

import React, { useState } from 'react'
import { DataProvider } from '@/lib/DataContext'
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

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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
    <DataProvider>
      <EntityProvider>
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
      </EntityProvider>
    </DataProvider>
  )
}
