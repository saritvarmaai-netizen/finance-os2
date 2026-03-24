'use client'

import React, { useState, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'

import { TabLayout } from '@/components/ui/TabLayout'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { audit } from '@/lib/audit'
import { EmptyState } from '@/components/ui/EmptyState'
import { fmt } from '@/lib/format'

// Extracted components
import { MFPageHeader } from './components/MFPageHeader'
import { MFSummaryBar } from './components/MFSummaryBarNew'
import { MFHoldingsSection } from './components/MFHoldingsSection'
import { MFLiveStatusIndicator } from './components/MFLiveStatusIndicator'
import { MFWaterfallSection } from './components/MFWaterfallSection'
import { MFDialogManager, type MFEditData } from './components/MFDialogManager'

export default function MutualFundsPage() {
  // State
  const [navLoading, setNavLoading] = useState(false)
  const [liveNAV, setLiveNAV] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [aiModal, setAiModal] = useState({ 
    open: false, 
    loading: false, 
    response: '', 
    preview: '', 
    mode: 'basic' as const, 
    error: undefined as string | undefined, 
    question: '' 
  })
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<MFEditData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ 
    open: false, 
    id: '', 
    name: '' 
  })

  // Data hooks
  const { mfHoldings: holdings, mfTotals: totals, updateMFNav, ltcg, deleteMFHolding } = useData()
  const { isActive } = useEntity()

  // Filtered holdings based on entity
  const filteredHoldings = useMemo(() => 
    holdings.filter(h => isActive(h.entity)),
    [holdings, isActive]
  )
  
  // Filtered totals
  const filteredTotals = useMemo(() => ({
    totalInvested: filteredHoldings.reduce((sum, h) => sum + h.invested, 0),
    totalCurrentValue: filteredHoldings.reduce((sum, h) => sum + h.currentValue, 0),
    totalGain: filteredHoldings.reduce((sum, h) => sum + h.gain, 0),
    total1DChange: filteredHoldings.reduce((sum, h) => sum + h.change1D, 0),
    totalReturn: filteredHoldings.reduce((sum, h) => sum + h.invested, 0) > 0 
      ? ((filteredHoldings.reduce((sum, h) => sum + h.gain, 0) / filteredHoldings.reduce((sum, h) => sum + h.invested, 0)) * 100).toFixed(1)
      : '0.0'
  }), [filteredHoldings])

  // AI Analysis
  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { mfHoldings: holdings, mfTotals: totals }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  // Handlers
  const handleAddFund = () => {
    setEditData(null)
    setDialogOpen(true)
  }

  const handleEditFund = (holding: typeof holdings[0]) => {
    setEditData({
      id: holding.id,
      name: holding.name,
      amc: holding.amc,
      category: holding.category,
      entity: holding.entity,
      units: holding.units,
      avgNAV: holding.avgNAV,
      currentNAV: holding.currentNAV,
      xirr: holding.xirr,
      taxType: holding.taxType,
    })
    setDialogOpen(true)
  }

  const handleDeleteFund = async () => {
    if (deleteConfirm.id) {
      await deleteMFHolding(deleteConfirm.id)
      setDeleteConfirm({ open: false, id: '', name: '' })
    }
  }

  // Live NAV fetch
  const fetchLiveNAV = async () => {
    setNavLoading(true)
    try {
      const schemeCodes: Record<string, string> = {
        'Parag Parikh Flexi Cap Fund': '122639',
        'Mirae Asset Large Cap Fund':  '118989',
        'SBI Small Cap Fund':          '125497',
        'HDFC Mid Cap Opportunities':  '118778',
      }
      const results: Record<string, number> = {}
      
      await Promise.all(
        Object.entries(schemeCodes).map(async ([name, code]) => {
          try {
            const res = await fetch(`https://api.mfapi.in/mf/${code}`)
            const data = await res.json()
            if (data?.data?.[0]?.nav) {
              results[name] = parseFloat(data.data[0].nav)
            }
          } catch {
            // silently skip this fund if fetch fails
          }
        })
      )
      
      setLiveNAV(results)
      
      // Save to db
      Object.entries(results).forEach(([name, nav]) => {
        const h = holdings.find(h => h.name === name)
        if (h) {
          const oldNav = h.currentNAV
          updateMFNav(h.id, nav)
          audit.log({
            action: 'UPDATE',
            category: 'mutual_funds',
            description: `Live NAV refreshed — ${name}`,
            before: { nav: oldNav },
            after:  { nav },
            impact: oldNav ? `NAV changed by ${((nav - oldNav) / oldNav * 100).toFixed(2)}%` : undefined,
            source: 'live_api',
          })
        }
      })

      const now = new Date()
      setLastUpdated(
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      )
    } catch (err) {
      console.error('NAV fetch failed:', err)
    } finally {
      setNavLoading(false)
    }
  }

  // Calculate live totals
  const liveTotalValue = filteredHoldings.reduce((sum, h) => {
    const nav = liveNAV[h.name] ?? h.currentNAV
    return sum + Math.round(nav * h.units)
  }, 0)
  const liveTotalGain = liveTotalValue - filteredTotals.totalInvested
  const liveTotalReturn = filteredTotals.totalInvested > 0 
    ? ((liveTotalGain / filteredTotals.totalInvested) * 100).toFixed(1) 
    : '0.0'

  const hasLiveData = Object.keys(liveNAV).length > 0

  // Show empty state when no holdings exist
  if (filteredHoldings.length === 0) {
    return (
      <TabLayout>
        <EmptyState
          icon={BarChart3}
          title="No mutual fund holdings"
          description="Add your mutual fund investments to track performance, XIRR, and tax harvesting opportunities."
          actionLabel="Add Fund"
          onAction={handleAddFund}
        />
        <MFDialogManager
          dialogOpen={dialogOpen}
          deleteConfirmOpen={false}
          editData={editData}
          deleteConfirm={deleteConfirm}
          setDialogOpen={setDialogOpen}
          setEditData={setEditData}
          setDeleteConfirm={setDeleteConfirm}
          onDeleteConfirm={handleDeleteFund}
        />
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      {/* Header */}
      <MFPageHeader
        holdingsCount={filteredHoldings.length}
        lastUpdated={lastUpdated}
        navLoading={navLoading}
        onAddFund={handleAddFund}
        onImportCAS={() => alert('CAS Import process started...')}
        onRefreshNAV={fetchLiveNAV}
        onAIRecommendations={() => runAIAnalysis(
          'Analyse my mutual fund portfolio. Identify tax harvesting opportunities, portfolio overlap, and rebalancing recommendations.',
          'mutual-funds/recommendations.md'
        )}
      />

      {/* Summary Bar */}
      <MFSummaryBar
        currentValue={hasLiveData ? liveTotalValue : filteredTotals.totalCurrentValue}
        invested={filteredTotals.totalInvested}
        gain={hasLiveData ? liveTotalGain : filteredTotals.totalGain}
        returnPct={hasLiveData ? liveTotalReturn : filteredTotals.totalReturn}
        xirr="+18.1%"
        hasLiveData={hasLiveData}
        ltcg={ltcg}
        formatFn={fmt}
      />
      
      {/* Live Status Indicator */}
      <MFLiveStatusIndicator hasLiveData={hasLiveData} lastUpdated={lastUpdated} />

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }}>
        {/* Left: Holdings Table */}
        <MFHoldingsSection
          holdings={filteredHoldings}
          liveNAV={liveNAV}
          onEdit={handleEditFund}
          onDelete={(id, name) => setDeleteConfirm({ open: true, id, name })}
          formatFn={fmt}
        />

        {/* Right: Waterfall Section */}
        <MFWaterfallSection ltcg={ltcg} />
      </div>

      {/* AI Response Modal */}
      <AIResponseModal
        isOpen={aiModal.open}
        onClose={() => setAiModal(prev => ({ ...prev, open: false }))}
        loading={aiModal.loading}
        response={aiModal.response}
        sanitisedPreview={aiModal.preview}
        mode={aiModal.mode}
        error={aiModal.error}
        question={aiModal.question}
      />
      
      {/* Dialog Manager */}
      <MFDialogManager
        dialogOpen={dialogOpen}
        deleteConfirmOpen={deleteConfirm.open}
        editData={editData}
        deleteConfirm={deleteConfirm}
        setDialogOpen={setDialogOpen}
        setEditData={setEditData}
        setDeleteConfirm={setDeleteConfirm}
        onDeleteConfirm={handleDeleteFund}
      />
    </TabLayout>
  )
}
