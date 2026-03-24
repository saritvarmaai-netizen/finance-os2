'use client'

import React, { useMemo } from 'react'
import { 
  Plus, 
  Sparkles, 
  FileText, 
  LineChart,
  RefreshCw
} from 'lucide-react'
import { TabLayout } from '@/components/ui/TabLayout'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { fmt } from '@/lib/utils'
import { useData, ShareHoldingComputed } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { useState } from 'react'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShareHoldingDialog } from './components/ShareHoldingDialog'
import { SharesHoldingsTable } from './components/SharesHoldingsTable'

export default function SharesPage() {
  const { shareHoldings: holdings, shareTotals: totals, refreshAll } = useData()
  const { isActive } = useEntity()

  const filteredHoldings = useMemo(() => 
    holdings.filter(h => isActive(h.entity)),
    [holdings, isActive]
  )
  const filteredTotals = useMemo(() => ({
    totalInvested: filteredHoldings.reduce((sum, h) => sum + h.invested, 0),
    totalCurrentValue: filteredHoldings.reduce((sum, h) => sum + h.currentValue, 0),
    totalGain: filteredHoldings.reduce((sum, h) => sum + h.gain, 0),
    totalDividend: filteredHoldings.reduce((sum, h) => sum + h.dividendFY, 0),
  }), [filteredHoldings])

  const [aiModal, setAiModal] = useState({ open: false, loading: false, response: '', preview: '', mode: 'basic' as const, error: undefined as string | undefined, question: '' })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<ShareHoldingComputed | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { shareHoldings: holdings, shareTotals: totals }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  const handleAddStock = () => {
    setEditingHolding(null)
    setDialogOpen(true)
  }

  const handleEditStock = (holding: ShareHoldingComputed) => {
    setEditingHolding(holding)
    setDialogOpen(true)
  }

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    try {
      // For now, just refresh data (live price fetching can be added later)
      await refreshAll()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show empty state when no holdings exist
  if (filteredHoldings.length === 0) {
    return (
      <TabLayout>
        <EmptyState
          icon={LineChart}
          title="No share holdings"
          description="Add your stock investments to track portfolio performance, dividends, and capital gains."
          actionLabel="Add Stock"
          onAction={handleAddStock}
        />
        <ShareHoldingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editHolding={editingHolding}
        />
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Shares
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {filteredHoldings.length} holdings · <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(filteredTotals.totalCurrentValue)}</span> total value
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleRefreshPrices} 
            disabled={isRefreshing}
            style={{
              background: 'transparent', 
              color: 'var(--text2)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)',
              padding: '10px 20px', 
              fontSize: 13, 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: isRefreshing ? 'wait' : 'pointer', 
              transition: 'all 0.2s',
              opacity: isRefreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button onClick={() => alert('Portfolio sync started...')} style={{
            background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <FileText size={16} />
            Sync Portfolio
          </button>
          <button onClick={handleAddStock} style={{
            background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
          }}>
            <Plus size={16} />
            Add Stock
          </button>
          <button onClick={() => runAIAnalysis('Analyse my share portfolio. Identify tax harvesting opportunities and underperforming stocks.', 'shares/recommendations.md')} style={{
            background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
          }}>
            <Sparkles size={16} />
            Analyse
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <SummaryBox label="Total Invested" value={fmt(filteredTotals.totalInvested)} />
        <SummaryBox label="Current Value" value={fmt(filteredTotals.totalCurrentValue)} />
        <SummaryBox label="Unrealised Gain" value={fmt(filteredTotals.totalGain)} isPositive={filteredTotals.totalGain >= 0} />
        <SummaryBox label="Total Dividend" value={fmt(filteredTotals.totalDividend)} />
      </div>

      {/* Holdings Table */}
      <SharesHoldingsTable 
        holdings={filteredHoldings}
        onEdit={handleEditStock}
      />

      {/* Dialogs */}
      <ShareHoldingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editHolding={editingHolding}
      />

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
    </TabLayout>
  )
}

function SummaryBox({ label, value, isPositive }: { label: string, value: string, isPositive?: boolean }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: isPositive !== undefined ? (isPositive ? 'var(--green)' : 'var(--red)') : 'var(--text)', fontFamily: '"Playfair Display", serif' }}>
        {value}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
